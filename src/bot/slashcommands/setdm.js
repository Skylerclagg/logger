module.exports = {
    name: 'setdm',
    quickHelp: 'Enables or disables DM verification.',
    examples: `\`${process.env.GLOBAL_BOT_PREFIX}setdm true\` or \`${process.env.GLOBAL_BOT_PREFIX}setdm false\``,
    category: 'Configuration',
    func: async (message, args) => {
      const enabled = args[0]?.toLowerCase() === 'true';
      try {
        let config = await global.redisClient.get(`guild_config:${message.guild.id}`);
        config = config ? JSON.parse(config) : {};
        config.dm_enabled = enabled;
        await global.redisClient.set(`guild_config:${message.guild.id}`, JSON.stringify(config));
        message.channel.createMessage(`DM verification has been ${enabled ? 'enabled' : 'disabled'}.`);
      } catch (err) {
        console.error(err);
        message.channel.createMessage(`Failed to set DM verification: ${err}`);
      }
    }
  };
  