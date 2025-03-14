const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('manualverify')
    .setDescription('Manually verify a member by setting their nickname and assigning the verified role.')
    .addUserOption(option =>
      option.setName('member')
        .setDescription('The member to verify')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('fullname')
        .setDescription('Full name to set as nickname (optional)')
        .setRequired(false)),
  async execute(interaction, { redisClient, client }) {
    let config;
    try {
      const data = await redisClient.get(`guild_config:${interaction.guild.id}`);
      config = data ? JSON.parse(data) : {};
    } catch (err) {
      console.error(err);
      return interaction.reply({ content: 'Failed to retrieve configuration.', ephemeral: true });
    }
    if (!config.role_given) {
      return interaction.reply({ content: 'Verified role is not configured. Use /setrolegiven to set it.', ephemeral: true });
    }
    const verifiedRole = interaction.guild.roles.cache.get(config.role_given);
    if (!verifiedRole) {
      return interaction.reply({ content: 'Verified role not found in this server.', ephemeral: true });
    }
    const member = interaction.options.getMember('member');
    const fullName = interaction.options.getString('fullname');
    if (fullName) {
      try {
        await member.setNickname(fullName);
      } catch (err) {
        return interaction.reply({ content: `Failed to update nickname: ${err}`, ephemeral: true });
      }
    }
    try {
      await member.roles.add(verifiedRole);
    } catch (err) {
      return interaction.reply({ content: `Failed to assign role: ${err}`, ephemeral: true });
    }
    await interaction.reply({ content: `${member} has been manually verified.`, ephemeral: true });
    if (client.sendLog) {
      client.sendLog(interaction.guild, `Manual verification: ${interaction.user} manually verified ${member} with full name: ${fullName || member.displayName}`);
    }
  },
  quickHelp: 'Manually verifies a member (optionally updates nickname and assigns verified role).',
  examples: `\`${process.env.GLOBAL_BOT_PREFIX}manualverify @User John Doe\``,
  category: 'Verification'
};
