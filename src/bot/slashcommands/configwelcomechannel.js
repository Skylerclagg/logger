const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('configwelcomechannel')
    .setDescription('Configure welcome channel permissions.')
    .addRoleOption(option =>
      option.setName('negativerole')
        .setDescription('Role to be denied view outside the welcome channel')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('positiverole')
        .setDescription('Role to be allowed view in the welcome channel')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('welcomechannel')
        .setDescription('The welcome channel')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('excludechannels')
        .setDescription('Comma-separated list of channels to exclude')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('excludecategories')
        .setDescription('Comma-separated list of category IDs to exclude')
        .setRequired(false)),
  async execute(interaction, { redisClient }) {
    await interaction.deferReply({ ephemeral: true });
    let config;
    try {
      const data = await redisClient.get(`guild_config:${interaction.guild.id}`);
      config = data ? JSON.parse(data) : {};
    } catch (err) {
      console.error(err);
      return interaction.followUp({ content: 'Failed to retrieve configuration.', ephemeral: true });
    }
    config.welcome_channel = interaction.options.getChannel('welcomechannel').id;
    config.exclude_channels = interaction.options.getString('excludechannels') || "";
    config.exclude_categories = interaction.options.getString('excludecategories') || "";
    try {
      await redisClient.set(`guild_config:${interaction.guild.id}`, JSON.stringify(config));
    } catch (err) {
      console.error(err);
      return interaction.followUp({ content: 'Failed to save configuration.', ephemeral: true });
    }
    await interaction.followUp({ content: 'Welcome channel configuration updated.', ephemeral: true });
  },
  quickHelp: 'Configures welcome channel permissions (excludes certain channels/categories).',
  examples: `\`${process.env.GLOBAL_BOT_PREFIX}configwelcomechannel @NegRole @PosRole #welcome\``,
  category: 'Configuration'
};
