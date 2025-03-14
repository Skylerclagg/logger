const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('configstatus')
    .setDescription('Show current server configuration settings.'),
  async execute(interaction, { redisClient }) {
    let config;
    try {
      const data = await redisClient.get(`guild_config:${interaction.guild.id}`);
      config = data ? JSON.parse(data) : {};
    } catch (err) {
      console.error(err);
      return interaction.reply({ content: 'Failed to retrieve configuration.', ephemeral: true });
    }
    const embed = {
      title: 'Server Configuration',
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
      ],
      color: 3447003,
      timestamp: new Date()
    };
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
  quickHelp: 'Displays current configuration for the server.',
  examples: `\`${process.env.GLOBAL_BOT_PREFIX}configstatus\``,
  category: 'Utility'
};
