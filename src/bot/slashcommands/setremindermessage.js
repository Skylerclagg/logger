const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setremindermessage')
    .setDescription('Set the reminder message for verification; use {user} for mention.')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The reminder message to use')
        .setRequired(true)),
  async execute(interaction, { redisClient }) {
    let config;
    try {
      const data = await redisClient.get(`guild_config:${interaction.guild.id}`);
      config = data ? JSON.parse(data) : {};
    } catch (err) {
      console.error(err);
      return interaction.reply({ content: 'Failed to retrieve configuration.', ephemeral: true });
    }
    config.reminder_message = interaction.options.getString('message');
    try {
      await redisClient.set(`guild_config:${interaction.guild.id}`, JSON.stringify(config));
    } catch (err) {
      console.error(err);
      return interaction.reply({ content: 'Failed to save configuration.', ephemeral: true });
    }
    await interaction.reply({ content: `Reminder message set to:\n${config.reminder_message}`, ephemeral: true });
  },
  quickHelp: 'Sets the reminder message (use {user} for mention).',
  examples: `\`${process.env.GLOBAL_BOT_PREFIX}setremindermessage Reminder {user}, please verify!\``,
  category: 'Configuration'
};
