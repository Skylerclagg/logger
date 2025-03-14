const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addusertochannel')
    .setDescription('Add a user to a channel (permission controlled).')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to add the user to')
        .setRequired(true))
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to add to the channel')
        .setRequired(true)),
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const target = interaction.options.getMember('user');
    try {
      await channel.permissionOverwrites.edit(target, { VIEW_CHANNEL: true });
      await interaction.reply({ content: `${target} was added to ${channel.toString()}.`, ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: `Failed to add user to channel: ${err}`, ephemeral: true });
    }
  },
  quickHelp: 'Adds a user to a channel by setting their permission overwrite.',
  examples: `\`${process.env.GLOBAL_BOT_PREFIX}addusertochannel #general @User\``,
  category: 'Management'
};
