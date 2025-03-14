const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removemodrole')
    .setDescription('Remove a mod role.')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Role to remove from mod roles')
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
      return interaction.reply({ content: 'This role is not in the mod roles list.', ephemeral: true });
    }
    config.mod_roles = config.mod_roles.filter(rid => rid !== role.id);
    try {
      await redisClient.set(`guild_config:${interaction.guild.id}`, JSON.stringify(config));
    } catch (err) {
      console.error(err);
      return interaction.reply({ content: 'Failed to save configuration.', ephemeral: true });
    }
    await interaction.reply({ content: `Removed mod role: ${role.toString()}`, ephemeral: true });
  },
  quickHelp: 'Removes a mod role.',
  examples: `\`${process.env.GLOBAL_BOT_PREFIX}removemodrole @Mod\``,
  category: 'Management'
};
