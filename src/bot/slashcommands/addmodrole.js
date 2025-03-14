const Eris = require('eris');
module.exports = {
  name: 'addmodrole',
  userPerms: ['manageChannels'],
  botPerms: ['manageRoles'],
  noThread: false,
  quickHelp: 'Adds a mod role.',
  examples: '!addmodrole @ModRole',
  category: 'Management',
  func: async interaction => {
    const option = interaction.data.options.find(o => o.name === 'role');
    if (!option) return interaction.createMessage({ content: 'You must specify a role.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    const roleId = option.value;
    let config;
    try {
      const data = await global.redisClient.get(`guild_config:${interaction.guildID}`);
      config = data ? JSON.parse(data) : {};
    } catch (err) {
      console.error(err);
      return interaction.createMessage({ content: 'Failed to retrieve configuration.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
    config.mod_roles = config.mod_roles || [];
    if (!config.mod_roles.includes(roleId)) config.mod_roles.push(roleId);
    try {
      await global.redisClient.set(`guild_config:${interaction.guildID}`, JSON.stringify(config));
    } catch (err) {
      console.error(err);
      return interaction.createMessage({ content: 'Failed to save configuration.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
    return interaction.createMessage({ content: `Added mod role: <@&${roleId}>`, flags: Eris.Constants.MessageFlags.EPHEMERAL });
  }
};
