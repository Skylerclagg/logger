const { SlashCommandBuilder } = require('@discordjs/builders');

function parseTime(input) {
  const num = parseInt(input.replace(/\D/g, ''));
  if (isNaN(num)) return null;
  if (input.endsWith('d')) return num * 86400;
  if (input.endsWith('h')) return num * 3600;
  if (input.endsWith('m')) return num * 60;
  return num;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setreminderinterval')
    .setDescription('Set reminder interval (e.g., 1d, 1h, 1m, 30s).')
    .addStringOption(option =>
      option.setName('interval')
        .setDescription('Reminder interval (formats: 1d, 1h, 1m, 30s)')
        .setRequired(true)),
  async execute(interaction, { redisClient }) {
    const input = interaction.options.getString('interval');
    const seconds = parseTime(input);
    if (!seconds) return interaction.reply({ content: 'Invalid interval format.', ephemeral: true });
    let config;
    try {
      const data = await redisClient.get(`guild_config:${interaction.guild.id}`);
      config = data ? JSON.parse(data) : {};
    } catch (err) {
      console.error(err);
      return interaction.reply({ content: 'Failed to retrieve configuration.', ephemeral: true });
    }
    config.reminder_interval = seconds;
    try {
      await redisClient.set(`guild_config:${interaction.guild.id}`, JSON.stringify(config));
    } catch (err) {
      console.error(err);
      return interaction.reply({ content: 'Failed to save configuration.', ephemeral: true });
    }
    await interaction.reply({ content: `Reminder interval set to ${seconds} seconds.`, ephemeral: true });
  },
  quickHelp: 'Sets the interval between reminder messages.',
  examples: `\`${process.env.GLOBAL_BOT_PREFIX}setreminderinterval 30m\``,
  category: 'Configuration'
};
