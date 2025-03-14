const Eris = require('eris');

module.exports = {
  name: 'setdm',
  quickHelp: 'Enables or disables DM verification.',
  examples: `!setdm true`,
  category: 'Configuration',
  func: async interaction => {
    const option = interaction.data.options.find(o => o.name === 'enabled');
    if (option === undefined) {
      return interaction.createMessage({ content: 'Please provide true or false.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
    const enabled = option.value === true;
    let config;
    try {
      const data = await global.redisClient.get(`guild_config:${interaction.guildID}`);
      config = data ? JSON.parse(data) : {};
    } catch (err) {
      console.error(err);
      return interaction.createMessage({ content: 'Failed to retrieve configuration.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
    config.dm_enabled = enabled;
    try {
      await global.redisClient.set(`guild_config:${interaction.guildID}`, JSON.stringify(config));
    } catch (err) {
      console.error(err);
      return interaction.createMessage({ content: 'Failed to save configuration.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
    if (global.bot.guildSettingsCache && global.bot.guildSettingsCache[interaction.guildID]) {
      global.bot.guildSettingsCache[interaction.guildID].updateCustomSettings({ dm_enabled: enabled });
    }
    return interaction.createMessage({ content: `DM verification has been ${enabled ? 'enabled' : 'disabled'}.`, flags: Eris.Constants.MessageFlags.EPHEMERAL });
  }
};
