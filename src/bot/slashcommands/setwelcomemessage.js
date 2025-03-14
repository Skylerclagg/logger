const Eris = require('eris');

module.exports = {
  name: 'setwelcomemessage',
  quickHelp: 'Sets the welcome message (use {user} for mention).',
  examples: `!setwelcomemessage Welcome {user}! Please verify.`,
  category: 'Configuration',
  func: async interaction => {
    const option = interaction.data.options.find(o => o.name === 'message');
    if (!option) {
      return interaction.createMessage({ content: 'You must provide a message.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
    const newMessage = option.value;
    let config;
    try {
      const data = await global.redisClient.get(`guild_config:${interaction.guildID}`);
      config = data ? JSON.parse(data) : {};
    } catch (err) {
      console.error(err);
      return interaction.createMessage({ content: 'Failed to retrieve configuration from Redis.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
    config.welcome_message = newMessage;
    try {
      await global.redisClient.set(`guild_config:${interaction.guildID}`, JSON.stringify(config));
    } catch (err) {
      console.error(err);
      return interaction.createMessage({ content: 'Failed to save configuration.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
    if (global.bot.guildSettingsCache && global.bot.guildSettingsCache[interaction.guildID]) {
      global.bot.guildSettingsCache[interaction.guildID].updateCustomSettings({ welcome_message: newMessage });
    }
    return interaction.createMessage({ content: `Welcome message set to:\n${newMessage}`, flags: Eris.Constants.MessageFlags.EPHEMERAL });
  }
};
