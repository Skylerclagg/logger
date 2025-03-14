const { SlashCommandBuilder } = require('@discordjs/builders');

function parseTimeLimit(input) {
  // Very simple parser: extract number and unit (d, h, m, s)
  const num = parseInt(input.replace(/\D/g, ''));
  if (isNaN(num)) return null;
  if (input.endsWith('d')) return num * 86400;
  if (input.endsWith('h')) return num * 3600;
  if (input.endsWith('m')) return num * 60;
  return num; // default seconds
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('settimeoutlimit')
    .setDescription('Set overall verification timeout (e.g., 1d, 1h, 1m, 30s).')
    .addStringOption(option =>
      option.setName('time')
        .setDescription('Time limit (formats: 1d, 1h, 1m, 30s)')
        .setRequired(true)),
  async execute(interaction, { redisClient }) {
    const input = interaction.options.getString('time');
    const seconds = parseTimeLimit(input);
    if (!seconds) return interaction.reply({ content: 'Invalid time format.', ephemeral: true });
    let config;
    try {
      const data = await redisClient.get(`guild_config:${interaction.guild.id}`);
      config = data ? JSON.parse(data) : {};
    } catch (err) {
      console.error(err);
      return interaction.reply({ content: 'Failed to retrieve configuration.', ephemeral: true });
    }
    config.timeout_limit = seconds;
    try {
      await redisClient.set(`guild_config:${interaction.guild.id}`, JSON.stringify(config));
    } catch (err) {
      console.error(err);
      return interaction.reply({ content: 'Failed to save configuration.', ephemeral: true });
    }
    await interaction.reply({ content: `Timeout limit set to ${seconds} seconds.`, ephemeral: true });
  },
  quickHelp: 'Sets the overall verification timeout limit.',
  examples: `\`${process.env.GLOBAL_BOT_PREFIX}settimeoutlimit 1h\``,
  category: 'Configuration'
};
