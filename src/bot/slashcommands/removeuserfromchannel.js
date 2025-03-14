const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removeuserfromchannel')
    .setDescription('Remove a user from a channel (permission controlled).')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to remove the user from')
        .setRequired(true))
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to remove from the channel')
        .setRequired(true)),
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const target = interaction.options.getMember('user');
    try {
      await channel.permissionOverwrites.edit(target, { VIEW_CHANNEL: false });
      await interaction.reply({ content: `${target} was removed from ${channel.toString()}.`, ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: `Failed to remove user from channel: ${err}`, ephemeral: true });
    }
  },
  quickHelp: 'Removes a user from a channel by modifying permission overwrites.',
  examples: `\`${process.env.GLOBAL_BOT_PREFIX}removeuserfromchannel #general @User\``,
  category: 'Management'
};
