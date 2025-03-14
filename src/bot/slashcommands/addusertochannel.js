const Eris = require('eris');
module.exports = {
  name: 'addusertochannel',
  userPerms: ['manageChannels'],
  botPerms: ['manageChannels'],
  noThread: false,
  quickHelp: 'Adds a user to a channel by setting view permissions.',
  examples: '!addusertochannel #general @User',
  category: 'Management',
  func: async interaction => {
    const channelOption = interaction.data.options.find(o => o.name === 'channel');
    const userOption = interaction.data.options.find(o => o.name === 'user');
    if (!channelOption || !userOption) {
      return interaction.createMessage({ content: 'Please specify both a channel and a user.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
    const channelId = channelOption.value;
    const targetId = userOption.value;
    const guild = global.bot.guilds.get(interaction.guildID);
    try {
      await guild.editChannelPermission(channelId, targetId, { VIEW_CHANNEL: true }, 0, 'add');
      return interaction.createMessage({ content: `<@${targetId}> was added to <#${channelId}>.`, flags: Eris.Constants.MessageFlags.EPHEMERAL });
    } catch (err) {
      console.error(err);
      return interaction.createMessage({ content: `Failed to add user to channel: ${err}`, flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
  }
};
