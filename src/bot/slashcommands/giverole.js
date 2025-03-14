const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giverole')
    .setDescription('Assign a role to a user (permission controlled).')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Role to assign')
        .setRequired(true))
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to assign the role to')
        .setRequired(true)),
  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const target = interaction.options.getMember('user');
    try {
      await target.roles.add(role);
      await interaction.reply({ content: `Role ${role.toString()} added to ${target}.`, ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: `Failed to add role: ${err}`, ephemeral: true });
    }
  },
  quickHelp: 'Assigns a role to a user.',
  examples: `\`${process.env.GLOBAL_BOT_PREFIX}giverole @Role @User\``,
  category: 'Management'
};
