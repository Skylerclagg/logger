const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removemodrole')
    .setDescription('Remove a mod role.')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Role to remove from mod roles')
        .setRequired(true)),
  async execute(interaction, { redisClient }) {
    const role = interaction.options.getRole('role').id;
    let config;
    try {
      const data = await global.redisClient.get(`guild_config:${interaction.guildID}`);
      config = data ? JSON.parse(data) : {};
    } catch (err) {
      console.error(err);
      return interaction.createMessage({ content: 'Failed to retrieve configuration.', flags: 64 });
    }
    config.mod_roles = config.mod_roles || [];
    if (!config.mod_roles.includes(role)) {
      return interaction.createMessage({ content: 'This role is not in the mod roles list.', flags: 64 });
    }
    config.mod_roles = config.mod_roles.filter(id => id !== role);
    try {
      await global.redisClient.set(`guild_config:${interaction.guildID}`, JSON.stringify(config));
    } catch (err) {
      console.error(err);
      return interaction.createMessage({ content: 'Failed to save configuration.', flags: 64 });
    }
    return interaction.createMessage({ content: `Removed mod role: <@&${role}>`, flags: 64 });
  },
  quickHelp: 'Removes a mod role.',
  examples: `\`${process.env.GLOBAL_BOT_PREFIX}removemodrole @ModRole\``,
  category: 'Management'
};
