const Eris = require('eris');

module.exports = {
  name: 'setrolegiven',
  quickHelp: 'Sets the verified role to assign to new users.',
  examples: `!setrolegiven @Verified`,
  category: 'Configuration',
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
    config.role_given = roleId;
    try {
      await global.redisClient.set(`guild_config:${interaction.guildID}`, JSON.stringify(config));
    } catch (err) {
      console.error(err);
      return interaction.createMessage({ content: 'Failed to save configuration.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
    if (global.bot.guildSettingsCache && global.bot.guildSettingsCache[interaction.guildID]) {
      global.bot.guildSettingsCache[interaction.guildID].updateCustomSettings({ role_given: roleId });
    }
    return interaction.createMessage({ content: `Verified role set to: <@&${roleId}>`, flags: Eris.Constants.MessageFlags.EPHEMERAL });
  }
};
