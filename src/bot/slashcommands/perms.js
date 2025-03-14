const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('perms')
    .setDescription('Manage permissions for role and channel commands.')
    .addStringOption(option =>
      option.setName('action')
        .setDescription('Allow or deny')
        .setRequired(true)
        .addChoices(
          { name: 'allow', value: 'allow' },
          { name: 'deny', value: 'deny' }
        ))
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to modify permissions for')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('command')
        .setDescription('Command: giverole, removerole, addusertochannel, or removeuserfromchannel')
        .setRequired(true)
        .addChoices(
          { name: 'giverole', value: 'giverole' },
          { name: 'removerole', value: 'removerole' },
          { name: 'addusertochannel', value: 'addusertochannel' },
          { name: 'removeuserfromchannel', value: 'removeuserfromchannel' }
        ))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Role (for giverole/removerole)'))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel (for addusertochannel/removeuserfromchannel)')),
  async execute(interaction, { redisClient }) {
    let config;
    try {
      const data = await redisClient.get(`guild_config:${interaction.guild.id}`);
      config = data ? JSON.parse(data) : { command_permissions: {} };
    } catch (err) {
      console.error(err);
      return interaction.reply({ content: 'Failed to retrieve configuration.', ephemeral: true });
    }
    const action = interaction.options.getString('action');
    const target = interaction.options.getMember('user');
    const command = interaction.options.getString('command');
    const roleOption = interaction.options.getRole('role');
    const channelOption = interaction.options.getChannel('channel');
    let permissionValue;
    if (command === 'giverole' || command === 'removerole') {
      if (!roleOption) return interaction.reply({ content: 'You must specify a role for this command.', ephemeral: true });
      permissionValue = roleOption.id;
    } else {
      permissionValue = channelOption ? channelOption.id : 0;
    }
    config.command_permissions = config.command_permissions || {};
    config.command_permissions[command] = config.command_permissions[command] || {};
    const userPerms = config.command_permissions[command][target.id] || [];
    if (action === 'allow') {
      if (!userPerms.includes(permissionValue)) userPerms.push(permissionValue);
      config.command_permissions[command][target.id] = userPerms;
      try {
        await redisClient.set(`guild_config:${interaction.guild.id}`, JSON.stringify(config));
      } catch (err) {
        console.error(err);
        return interaction.reply({ content: 'Failed to save configuration.', ephemeral: true });
      }
      const valueDisplay = (roleOption && roleOption.toString()) || (channelOption && channelOption.toString()) || 'all channels';
      await interaction.reply({ content: `Granted permission: ${target} can now ${command} ${valueDisplay}.`, ephemeral: true });
    } else {
      if (userPerms.includes(permissionValue)) {
        const index = userPerms.indexOf(permissionValue);
        if (index > -1) userPerms.splice(index, 1);
        config.command_permissions[command][target.id] = userPerms;
        try {
          await redisClient.set(`guild_config:${interaction.guild.id}`, JSON.stringify(config));
        } catch (err) {
          console.error(err);
          return interaction.reply({ content: 'Failed to save configuration.', ephemeral: true });
        }
        const valueDisplay = (roleOption && roleOption.toString()) || (channelOption && channelOption.toString()) || 'all channels';
        await interaction.reply({ content: `Revoked permission: ${target} can no longer ${command} ${valueDisplay}.`, ephemeral: true });
      } else {
        await interaction.reply({ content: 'That permission was not set for the user.', ephemeral: true });
      }
    }
  },
  quickHelp: 'Manages permissions for role/channel commands.',
  examples: `\`${process.env.GLOBAL_BOT_PREFIX}perms allow @User giverole @Role\``,
  category: 'Management'
};
