const Eris = require('eris');
function parseTime(input) {
  const num = parseInt(input.replace(/\D/g, ''));
  if (isNaN(num)) return null;
  if (input.endsWith('d')) return num * 86400;
  if (input.endsWith('h')) return num * 3600;
  if (input.endsWith('m')) return num * 60;
  return num;
}
module.exports = {
  name: 'settimeoutlimit',
  quickHelp: 'Sets the overall verification timeout limit.',
  examples: `!settimeoutlimit 1h`,
  category: 'Configuration',
  func: async interaction => {
    const option = interaction.data.options.find(o => o.name === 'time');
    if (!option) return interaction.createMessage({ content: 'You must provide a time limit.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    const seconds = parseTime(option.value);
    if (!seconds) return interaction.createMessage({ content: 'Invalid time format.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    let config;
    try {
      const data = await global.redisClient.get(`guild_config:${interaction.guildID}`);
      config = data ? JSON.parse(data) : {};
    } catch (err) {
      console.error(err);
      return interaction.createMessage({ content: 'Failed to retrieve configuration.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
    config.timeout_limit = seconds;
    try {
      await global.redisClient.set(`guild_config:${interaction.guildID}`, JSON.stringify(config));
    } catch (err) {
      console.error(err);
      return interaction.createMessage({ content: 'Failed to save configuration.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
    if (global.bot.guildSettingsCache && global.bot.guildSettingsCache[interaction.guildID]) {
      global.bot.guildSettingsCache[interaction.guildID].updateCustomSettings({ timeout_limit: seconds });
    }
    return interaction.createMessage({ content: `Timeout limit set to ${seconds} seconds.`, flags: Eris.Constants.MessageFlags.EPHEMERAL });
  }
};
