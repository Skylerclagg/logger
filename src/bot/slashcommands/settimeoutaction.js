const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('settimeoutaction')
    .setDescription('Set action on timeout: kick, restrict, or remind.')
    .addStringOption(option =>
      option.setName('action')
        .setDescription('Action to take on timeout')
        .setRequired(true)
        .addChoices(
          { name: 'kick', value: 'kick' },
          { name: 'restrict', value: 'restrict' },
          { name: 'remind', value: 'remind' }
        )),
  async execute(interaction, { redisClient }) {
    let config;
    try {
      const data = await redisClient.get(`guild_config:${interaction.guild.id}`);
      config = data ? JSON.parse(data) : {};
    } catch (err) {
      console.error(err);
      return interaction.reply({ content: 'Failed to retrieve configuration.', ephemeral: true });
    }
    config.timeout_action = interaction.options.getString('action');
    try {
      await redisClient.set(`guild_config:${interaction.guild.id}`, JSON.stringify(config));
    } catch (err) {
      console.error(err);
      return interaction.reply({ content: 'Failed to save configuration.', ephemeral: true });
    }
    await interaction.reply({ content: `Timeout action set to **${config.timeout_action}**.`, ephemeral: true });
  },
  quickHelp: 'Sets the action to take on verification timeout (kick, restrict, or remind).',
  examples: `\`${process.env.GLOBAL_BOT_PREFIX}settimeoutaction remind\``,
  category: 'Configuration'
};
