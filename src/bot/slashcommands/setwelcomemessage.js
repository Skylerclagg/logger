module.exports = {
    name: 'setwelcomemessage',
    quickHelp: 'Sets the welcome message (use {user} for mention).',
    examples: `\`${process.env.GLOBAL_BOT_PREFIX}setwelcomemessage Welcome {user}! Please verify.\``,
    category: 'Configuration',
    func: async (message, args) => {
      const newMessage = args.join(' ');
      try {
        let config = await global.redisClient.get(`guild_config:${message.guild.id}`);
        config = config ? JSON.parse(config) : {};
        config.welcome_message = newMessage;
        await global.redisClient.set(`guild_config:${message.guild.id}`, JSON.stringify(config));
        message.channel.createMessage(`Welcome message set to:\n${newMessage}`);
      } catch (err) {
        console.error(err);
        message.channel.createMessage(`Failed to set welcome message: ${err}`);
      }
    }
  };
  