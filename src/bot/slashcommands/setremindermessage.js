const Eris = require('eris');
module.exports = {
  name: 'setremindermessage',
  userPerms: ['manageChannels'],
  botPerms: ['sendMessages'],
  noThread: false,
  quickHelp: 'Sets the reminder message (use {user} for mention).',
  examples: '!setremindermessage Reminder {user}, please verify!',
  category: 'Configuration',
  func: async interaction => {
    const option = interaction.data.options.find(o => o.name === 'message');
    if (!option) return interaction.createMessage({ content: 'You must provide a reminder message.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    const newMessage = option.value;
    let config;
    try {
      const data = await global.redisClient.get(`guild_config:${interaction.guildID}`);
      config = data ? JSON.parse(data) : {};
    } catch (err) {
      console.error(err);
      return interaction.createMessage({ content: 'Failed to retrieve configuration.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
    config.reminder_message = newMessage;
    try {
      await global.redisClient.set(`guild_config:${interaction.guildID}`, JSON.stringify(config));
    } catch (err) {
      console.error(err);
      return interaction.createMessage({ content: 'Failed to save configuration.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
    return interaction.createMessage({ content: `Reminder message set to:\n${newMessage}`, flags: Eris.Constants.MessageFlags.EPHEMERAL });
  }
};
