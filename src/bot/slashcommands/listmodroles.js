const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listmodroles')
    .setDescription('List mod roles.'),
  async execute(interaction, { redisClient }) {
    let config;
    try {
      const data = await redisClient.get(`guild_config:${interaction.guild.id}`);
      config = data ? JSON.parse(data) : {};
    } catch (err) {
      console.error(err);
      return interaction.reply({ content: 'Failed to retrieve configuration.', ephemeral: true });
    }
    const modRoles = config.mod_roles || [];
    if (modRoles.length === 0) {
      return interaction.reply({ content: 'No mod roles have been set.', ephemeral: true });
    }
    const roles = modRoles.map(id => interaction.guild.roles.cache.get(id)?.toString() || id);
    await interaction.reply({ content: `Mod roles: ${roles.join(', ')}`, ephemeral: true });
  },
  quickHelp: 'Lists all mod roles.',
  examples: `\`${process.env.GLOBAL_BOT_PREFIX}listmodroles\``,
  category: 'Management'
};
