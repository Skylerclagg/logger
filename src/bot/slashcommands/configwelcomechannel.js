const Eris = require('eris');

module.exports = {
  name: 'configwelcomechannel',
  userPerms: ['manageWebhooks', 'manageChannels', 'viewAuditLogs'],
  botPerms: ['sendMessages'],
  noThread: true,
  quickHelp: 'Configures welcome channel permissions and exclusions.',
  examples: `!configwelcomechannel @NegRole @PosRole #welcome [excluderoles] [excludecategories]`,
  category: 'Configuration',
  func: async interaction => {
    await interaction.deferReply({ flags: Eris.Constants.MessageFlags.EPHEMERAL });
    const negRoleOpt = interaction.data.options.find(o => o.name === 'negativerole');
    const posRoleOpt = interaction.data.options.find(o => o.name === 'positiverole');
    const channelOpt = interaction.data.options.find(o => o.name === 'welcomechannel');
    if (!negRoleOpt || !posRoleOpt || !channelOpt) {
      return interaction.editOriginalMessage({ content: 'You must specify a negative role, positive role, and welcome channel.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
    const welcomeChannel = channelOpt.value;
    const excludeRoles = interaction.data.options.find(o => o.name === 'excluderoles')?.value || "";
    const excludeCategories = interaction.data.options.find(o => o.name === 'excludecategories')?.value || "";
    let config;
    try {
      const data = await global.redisClient.get(`guild_config:${interaction.guildID}`);
      config = data ? JSON.parse(data) : {};
    } catch (err) {
      console.error(err);
      return interaction.editOriginalMessage({ content: 'Failed to retrieve configuration.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
    config.welcome_channel = welcomeChannel;
    config.exclude_channels = excludeRoles;
    config.exclude_categories = excludeCategories;
    try {
      await global.redisClient.set(`guild_config:${interaction.guildID}`, JSON.stringify(config));
    } catch (err) {
      console.error(err);
      return interaction.editOriginalMessage({ content: 'Failed to save configuration.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
    }
    if (global.bot.guildSettingsCache && global.bot.guildSettingsCache[interaction.guildID]) {
      global.bot.guildSettingsCache[interaction.guildID].updateCustomSettings({
        welcome_channel: welcomeChannel,
        exclude_channels: excludeRoles,
        exclude_categories: excludeCategories
      });
    }
    return interaction.editOriginalMessage({ content: 'Welcome channel configuration updated.', flags: Eris.Constants.MessageFlags.EPHEMERAL });
  }
};
