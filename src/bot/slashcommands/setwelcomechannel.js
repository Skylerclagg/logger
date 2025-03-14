const Eris = require('eris');

module.exports = {
  name: 'setwelcomechannel',
  quickHelp: 'Sets the channel for welcome messages.',
  examples: `!setwelcomechannel #welcome`,
  category: 'Configuration',
  func: async interaction => {
    const option = interaction.data.options.find(o => o.name === 'channel');
    if (!option) return interaction.createMessage({ content: 'You must specify a channel.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    const channelId = option.value;
    let config;
    try {
      const data = await global.redisClient.get(`guild_config:${interaction.guildID}`);
      config = data ? JSON.parse(data) : {};
    } catch (err) {
      console.error(err);
      return interaction.createMessage({ content: 'Failed to retrieve configuration.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
    config.welcome_channel = channelId;
    try {
      await global.redisClient.set(`guild_config:${interaction.guildID}`, JSON.stringify(config));
    } catch (err) {
      console.error(err);
      return interaction.createMessage({ content: 'Failed to save configuration.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
    if (global.bot.guildSettingsCache && global.bot.guildSettingsCache[interaction.guildID]) {
      global.bot.guildSettingsCache[interaction.guildID].updateCustomSettings({ welcome_channel: channelId });
    }
    return interaction.createMessage({ content: `Welcome channel set to: <#${channelId}>`, flags: Eris.Constants.MessageFlags.EPHEMERAL });
  }
};
