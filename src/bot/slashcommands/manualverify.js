const Eris = require('eris');

module.exports = {
  name: 'manualverify',
  userPerms: ['manageRoles'],
  botPerms: ['manageRoles'],
  noThread: false,
  quickHelp: 'Manually verifies a member (updates nickname and assigns verified role).',
  examples: `!manualverify @User John Doe`,
  category: 'Verification',
  func: async interaction => {
    const memberOption = interaction.data.options.find(o => o.name === 'member');
    if (!memberOption) {
      return interaction.createMessage({ content: 'You must specify a member.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
    const targetId = memberOption.value;
    const fullName = interaction.data.options.find(o => o.name === 'fullname')?.value;
    const guild = global.bot.guilds.get(interaction.guildID);
    const target = guild.members.get(targetId);
    let config;
    try {
      const data = await global.redisClient.get(`guild_config:${interaction.guildID}`);
      config = data ? JSON.parse(data) : {};
    } catch (err) {
      console.error(err);
      return interaction.createMessage({ content: 'Failed to retrieve configuration.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
    if (!config.role_given) {
      return interaction.createMessage({ content: 'Verified role is not configured. Use setrolegiven.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
    const verifiedRole = guild.roles.get(config.role_given);
    if (!verifiedRole) {
      return interaction.createMessage({ content: 'Verified role not found.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
    if (fullName) {
      try {
        await target.edit({ nick: fullName });
      } catch (err) {
        return interaction.createMessage({ content: `Failed to update nickname: ${err}`, flags: Eris.Constants.MessageFlags.EPHEMERAL });
      }
    }
    try {
      await target.addRole(config.role_given);
    } catch (err) {
      return interaction.createMessage({ content: `Failed to assign role: ${err}`, flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
    interaction.createMessage({ content: `<@${targetId}> has been manually verified.`, flags: Eris.Constants.MessageFlags.EPHEMERAL });
    if (global.bot.sendLog) {
      global.bot.sendLog(interaction.guildID, `Manual verification: ${interaction.member.user.username} verified <@${targetId}> with name: ${fullName || target.nick || target.username}`);
    }
  }
};
