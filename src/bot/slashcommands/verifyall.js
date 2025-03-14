const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verifyall')
    .setDescription('Start verification process for members without the verified role.')
    .addStringOption(option =>
      option.setName('excluderoles')
        .setDescription('Comma-separated list of roles to exclude from verification')
        .setRequired(false)),
  async execute(interaction, { redisClient, client }) {
    await interaction.deferReply({ ephemeral: true });
    let config;
    try {
      const data = await redisClient.get(`guild_config:${interaction.guild.id}`);
      config = data ? JSON.parse(data) : {};
    } catch (err) {
      console.error(err);
      return interaction.followUp({ content: 'Failed to retrieve configuration from Redis.', ephemeral: true });
    }
    if (!config.role_given) {
      return interaction.followUp({ content: 'Verified role is not configured. Use /setrolegiven to set it.', ephemeral: true });
    }
    const verifiedRoleId = config.role_given;
    let excludedRoleIds = new Set();
    const excludeStr = interaction.options.getString('excluderoles');
    if (excludeStr) {
      excludeStr.split(',').forEach(part => {
        const id = part.replace(/\D/g, '');
        if (id) excludedRoleIds.add(id);
      });
    }
    let count = 0;
    for (const member of interaction.guild.members.cache.values()) {
      if (member.user.bot) continue;
      if (member.roles.cache.has(verifiedRoleId)) continue;
      if (member.roles.cache.some(r => excludedRoleIds.has(r.id))) continue;
      // Here, initiate your verification process. For example, send a DM.
      try {
        await member.send(`Please verify by replying with your full name.`);
      } catch (err) {
        console.error(err);
      }
      count++;
    }
    await interaction.followUp({ content: `Started verification process for ${count} members.`, ephemeral: true });
  },
  quickHelp: 'Starts verification for all members without the verified role (optionally excluding some roles).',
  examples: `\`${process.env.GLOBAL_BOT_PREFIX}verifyall Moderator,Guest\``,
  category: 'Verification'
};
