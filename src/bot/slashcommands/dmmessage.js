const Eris = require('eris');
module.exports = {
  name: 'dmmessage',
  userPerms: ['manageChannels'],
  botPerms: ['sendMessages'],
  noThread: false,
  quickHelp: 'Sets the DM welcome message (use {user} for mention).',
  examples: '!dmmessage Hello {user}, welcome!',
  category: 'Configuration',
  func: async interaction => {
    const option = interaction.data.options.find(o => o.name === 'message');
    if (!option) return interaction.createMessage({ content: 'You must provide a message.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    const newMessage = option.value;
    let config;
    try {
      const data = await global.redisClient.get(`guild_config:${interaction.guildID}`);
      config = data ? JSON.parse(data) : {};
    } catch (err) {
      console.error(err);
      return interaction.createMessage({ content: 'Failed to retrieve configuration.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
    config.dm_welcome_message = newMessage;
    try {
      await global.redisClient.set(`guild_config:${interaction.guildID}`, JSON.stringify(config));
    } catch (err) {
      console.error(err);
      return interaction.createMessage({ content: 'Failed to save configuration.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
    return interaction.createMessage({ content: `DM welcome message set to:\n${newMessage}`, flags: Eris.Constants.MessageFlags.EPHEMERAL });
  }
};
