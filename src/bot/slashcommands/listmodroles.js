const Eris = require('eris');
module.exports = {
  name: 'listmodroles',
  userPerms: [],
  botPerms: [],
  noThread: false,
  quickHelp: 'Lists all mod roles.',
  examples: '!listmodroles',
  category: 'Management',
  func: async interaction => {
    let config;
    try {
      const data = await global.redisClient.get(`guild_config:${interaction.guildID}`);
      config = data ? JSON.parse(data) : {};
    } catch (err) {
      console.error(err);
      return interaction.createMessage({ content: 'Failed to retrieve configuration.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
    const modRoles = config.mod_roles || [];
    if (modRoles.length === 0) return interaction.createMessage({ content: 'No mod roles have been set.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    const rolesText = modRoles.map(id => `<@&${id}>`).join(', ');
    return interaction.createMessage({ content: `Mod roles: ${rolesText}`, flags: Eris.Constants.MessageFlags.EPHEMERAL });
  }
};
