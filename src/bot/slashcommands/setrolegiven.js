const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setrolegiven')
    .setDescription('Set role to assign to new users.')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to assign')
        .setRequired(true)),
  async execute(interaction, { redisClient }) {
    let config;
    try {
      const data = await redisClient.get(`guild_config:${interaction.guild.id}`);
      config = data ? JSON.parse(data) : {};
    } catch (err) {
      console.error(err);
      return interaction.reply({ content: 'Failed to retrieve configuration.', ephemeral: true });
    }
    config.role_given = interaction.options.getRole('role').id;
    try {
      await redisClient.set(`guild_config:${interaction.guild.id}`, JSON.stringify(config));
    } catch (err) {
      console.error(err);
      return interaction.reply({ content: 'Failed to save configuration.', ephemeral: true });
    }
    await interaction.reply({ content: `Verification role set to: ${interaction.options.getRole('role').toString()}`, ephemeral: true });
  },
  quickHelp: 'Sets the verified role (assigned upon successful verification).',
  examples: `\`${process.env.GLOBAL_BOT_PREFIX}setrolegiven @Verified\``,
  category: 'Configuration'
};
