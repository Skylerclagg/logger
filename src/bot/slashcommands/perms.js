const Eris = require('eris');

module.exports = {
  name: 'perms',
  userPerms: ['manageChannels'],
  botPerms: ['sendMessages'],
  noThread: false,
  quickHelp: 'Manages permissions for role and channel commands.',
  examples: `!perms allow @User giverole @Role`,
  category: 'Management',
  func: async interaction => {
    const action = interaction.data.options.find(o => o.name === 'action')?.value?.toLowerCase();
    const userOption = interaction.data.options.find(o => o.name === 'user');
    const commandOption = interaction.data.options.find(o => o.name === 'command');
    if (!action || !userOption || !commandOption) {
      return interaction.createMessage({ content: 'Missing required options.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
    const targetId = userOption.value;
    const commandName = commandOption.value.toLowerCase();
    let permValue;
    if (['giverole', 'removerole'].includes(commandName)) {
      const roleOption = interaction.data.options.find(o => o.name === 'role');
      if (!roleOption) return interaction.createMessage({ content: 'You must specify a role for this command.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
      permValue = roleOption.value;
    } else {
      const channelOption = interaction.data.options.find(o => o.name === 'channel');
      permValue = channelOption ? channelOption.value : 0;
    }
    let config;
    try {
      const data = await global.redisClient.get(`guild_config:${interaction.guildID}`);
      config = data ? JSON.parse(data) : { command_permissions: {} };
    } catch (err) {
      console.error(err);
      return interaction.createMessage({ content: 'Failed to retrieve configuration.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
    config.command_permissions = config.command_permissions || {};
    config.command_permissions[commandName] = config.command_permissions[commandName] || {};
    let userPerms = config.command_permissions[commandName][targetId] || [];
    if (action === 'allow') {
      if (!userPerms.includes(permValue)) userPerms.push(permValue);
      config.command_permissions[commandName][targetId] = userPerms;
      try {
        await global.redisClient.set(`guild_config:${interaction.guildID}`, JSON.stringify(config));
      } catch (err) {
        console.error(err);
        return interaction.createMessage({ content: 'Failed to save configuration.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
      }
      const valueDisplay = permValue === 0 ? 'all channels' : `<@&${permValue}>`;
      return interaction.createMessage({ content: `Granted permission: <@${targetId}> can now ${commandName} ${valueDisplay}.`, flags: Eris.Constants.MessageFlags.EPHEMERAL });
    } else if (action === 'deny') {
      if (userPerms.includes(permValue)) {
        userPerms = userPerms.filter(id => id !== permValue);
        config.command_permissions[commandName][targetId] = userPerms;
        try {
          await global.redisClient.set(`guild_config:${interaction.guildID}`, JSON.stringify(config));
        } catch (err) {
          console.error(err);
          return interaction.createMessage({ content: 'Failed to save configuration.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
        }
        const valueDisplay = permValue === 0 ? 'all channels' : `<@&${permValue}>`;
        return interaction.createMessage({ content: `Revoked permission: <@${targetId}> can no longer ${commandName} ${valueDisplay}.`, flags: Eris.Constants.MessageFlags.EPHEMERAL });
      } else {
        return interaction.createMessage({ content: 'That permission was not set for the user.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
      }
    } else {
      return interaction.createMessage({ content: 'Invalid action. Use allow or deny.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
  }
};
