module.exports = {
    name: 'setwelcomechannel',
    quickHelp: 'Sets the channel used for welcome messages.',
    examples: `\`${process.env.GLOBAL_BOT_PREFIX}setwelcomechannel #welcome\``,
    category: 'Configuration',
    func: async (message, args) => {
      const channel = message.channelMentions[0] || message.mentions.channels.first();
      if (!channel) return message.channel.createMessage('Please mention a valid channel.');
      try {
        let config = await global.redisClient.get(`guild_config:${message.guild.id}`);
        config = config ? JSON.parse(config) : {};
        config.welcome_channel = channel.id;
        await global.redisClient.set(`guild_config:${message.guild.id}`, JSON.stringify(config));
        message.channel.createMessage(`Welcome channel set to: ${channel.toString()}`);
      } catch (err) {
        console.error(err);
        message.channel.createMessage(`Failed to set welcome channel: ${err}`);
      }
    }
  };
  