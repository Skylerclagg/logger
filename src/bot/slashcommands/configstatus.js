const Eris = require('eris');
module.exports = {
  name: 'configstatus',
  userPerms: [],
  botPerms: [],
  noThread: false,
  quickHelp: 'Displays current server configuration settings.',
  examples: '!configstatus',
  category: 'Utility',
  func: async interaction => {
    let config;
    try {
      const data = await global.redisClient.get(`guild_config:${interaction.guildID}`);
      config = data ? JSON.parse(data) : {};
    } catch (err) {
      console.error(err);
      return interaction.createMessage({ content: 'Failed to retrieve configuration.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
    const embed = {
      title: 'Server Configuration',
      color: 3447003,
      timestamp: new Date(),
      fields: [
        { name: 'Welcome Message', value: config.welcome_message || 'Not set', inline: false },
        { name: 'Welcome Channel', value: config.welcome_channel ? `<#${config.welcome_channel}>` : 'Not set', inline: true },
        { name: 'Verified Role', value: config.role_given ? `<@&${config.role_given}>` : 'Not set', inline: true },
        { name: 'DM Verification', value: config.dm_enabled ? 'Enabled' : 'Disabled', inline: true },
        { name: 'DM Welcome Message', value: config.dm_welcome_message || 'Not set', inline: false },
        { name: 'Reminder Message', value: config.reminder_message || 'Not set', inline: false },
        { name: 'Timeout Action', value: config.timeout_action || 'remind', inline: true },
        { name: 'Timeout Limit', value: config.timeout_limit ? `${config.timeout_limit} seconds` : 'Not set', inline: true },
        { name: 'Reminder Interval', value: config.reminder_interval ? `${config.reminder_interval} seconds` : 'Not set', inline: true }
      ]
    };
    return interaction.createMessage({ embed, flags: Eris.Constants.MessageFlags.EPHEMERAL });
  }
};
