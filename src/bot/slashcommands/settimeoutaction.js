const Eris = require('eris');

module.exports = {
  name: 'settimeoutaction',
  quickHelp: 'Sets the action on verification timeout (kick, restrict, or remind).',
  examples: `!settimeoutaction remind`,
  category: 'Configuration',
  func: async interaction => {
    const option = interaction.data.options.find(o => o.name === 'action');
    if (!option) return interaction.createMessage({ content: 'You must provide an action.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    const action = option.value.toLowerCase();
    if (!['kick', 'restrict', 'remind'].includes(action)) {
      return interaction.createMessage({ content: 'Invalid action. Use kick, restrict, or remind.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
    let config;
    try {
      const data = await global.redisClient.get(`guild_config:${interaction.guildID}`);
      config = data ? JSON.parse(data) : {};
    } catch (err) {
      console.error(err);
      return interaction.createMessage({ content: 'Failed to retrieve configuration.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
    config.timeout_action = action;
    try {
      await global.redisClient.set(`guild_config:${interaction.guildID}`, JSON.stringify(config));
    } catch (err) {
      console.error(err);
      return interaction.createMessage({ content: 'Failed to save configuration.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
    if (global.bot.guildSettingsCache && global.bot.guildSettingsCache[interaction.guildID]) {
      global.bot.guildSettingsCache[interaction.guildID].updateCustomSettings({ timeout_action: action });
    }
    return interaction.createMessage({ content: `Timeout action set to **${action}**.`, flags: Eris.Constants.MessageFlags.EPHEMERAL });
  }
};
