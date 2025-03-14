const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removerole')
    .setDescription('Remove a role from a user (permission controlled).')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Role to remove')
        .setRequired(true))
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to remove the role from')
        .setRequired(true)),
  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const target = interaction.options.getMember('user');
    try {
      await target.roles.remove(role);
      await interaction.reply({ content: `Role ${role.toString()} removed from ${target}.`, ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: `Failed to remove role: ${err}`, ephemeral: true });
    }
  },
  quickHelp: 'Removes a role from a user.',
  examples: `\`${process.env.GLOBAL_BOT_PREFIX}removerole @Role @User\``,
  category: 'Management'
};
