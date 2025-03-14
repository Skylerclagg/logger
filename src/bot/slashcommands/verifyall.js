const Eris = require('eris');

module.exports = {
  name: 'verifyall',
  userPerms: ['manageChannels'],
  botPerms: ['sendMessages'],
  noThread: false,
  quickHelp: 'Starts verification for all members without the verified role (excluding specified roles).',
  examples: `!verifyall Moderator,Guest`,
  category: 'Verification',
  func: async interaction => {
    await interaction.deferReply({ flags: Eris.Constants.MessageFlags.EPHEMERAL });
    let config;
    try {
      const data = await global.redisClient.get(`guild_config:${interaction.guildID}`);
      config = data ? JSON.parse(data) : {};
    } catch (err) {
      console.error(err);
      return interaction.editReply({ content: 'Failed to retrieve configuration from Redis.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
    if (!config.role_given) {
      return interaction.editReply({ content: 'Verified role is not configured. Use setrolegiven.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
    const verifiedRoleId = config.role_given;
    let excludedRoleIds = new Set();
    const excludeOption = interaction.data.options.find(o => o.name === 'excluderoles');
    if (excludeOption) {
      excludeOption.value.split(',').forEach(part => {
        const id = part.replace(/\D/g, '');
        if (id) excludedRoleIds.add(id);
      });
    }
    let count = 0;
    const guild = global.bot.guilds.get(interaction.guildID);
    guild.members.forEach(member => {
      if (member.user.bot) return;
      if (member.roles.includes(verifiedRoleId)) return;
      if (member.roles.some(r => excludedRoleIds.has(r))) return;
      member.user.getDMChannel()
        .then(dm => dm.createMessage('Please verify by replying with your full name.'))
        .catch(err => console.error(err));
      count++;
    });
    return interaction.editReply({ content: `Started verification process for ${count} members.`, flags: Eris.Constants.MessageFlags.EPHEMERAL });
  }
};
