const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addmodrole')
    .setDescription('Add a mod role.')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Role to add as a mod role')
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
    config.mod_roles = config.mod_roles || [];
    const role = interaction.options.getRole('role');
    if (!config.mod_roles.includes(role.id)) {
      config.mod_roles.push(role.id);
    }
    try {
      await redisClient.set(`guild_config:${interaction.guild.id}`, JSON.stringify(config));
    } catch (err) {
      console.error(err);
      return interaction.reply({ content: 'Failed to save configuration.', ephemeral: true });
    }
    await interaction.reply({ content: `Added mod role: ${role.toString()}`, ephemeral: true });
  },
  quickHelp: 'Adds a mod role.',
  examples: `\`${process.env.GLOBAL_BOT_PREFIX}addmodrole @Mod\``,
  category: 'Management'
};
