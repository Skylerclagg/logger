const Eris = require('eris');

module.exports = {
  name: 'removerole',
  userPerms: ['manageRoles'],
  botPerms: ['manageRoles'],
  noThread: false,
  quickHelp: 'Removes a role from a user (permission controlled).',
  examples: `!removerole @Role @User`,
  category: 'Management',
  func: async interaction => {
    const roleOption = interaction.data.options.find(o => o.name === 'role');
    const userOption = interaction.data.options.find(o => o.name === 'user');
    if (!roleOption || !userOption) {
      return interaction.createMessage({ content: 'Please specify both a role and a user.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
    const roleId = roleOption.value;
    const targetId = userOption.value;
    const guild = global.bot.guilds.get(interaction.guildID);
    const target = guild.members.get(targetId);
    try {
      await target.removeRole(roleId);
      return interaction.createMessage({ content: `Role <@&${roleId}> removed from <@${targetId}>.`, flags: Eris.Constants.MessageFlags.EPHEMERAL });
    } catch (err) {
      console.error(err);
      return interaction.createMessage({ content: `Failed to remove role: ${err}`, flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
  }
};
