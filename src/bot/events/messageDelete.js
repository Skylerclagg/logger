const send = require('../modules/webhooksender');
const getMessageFromDB = require('../../db/interfaces/postgres/read').getMessageById;
const getMessageFromBatch = require('../../db/messageBatcher').getMessage;
const deleteMessage = require('../../db/interfaces/postgres/delete').deleteMessage;
const cacheGuild = require('../utils/cacheGuild');

module.exports = {
  name: 'messageDelete',
  type: 'on',
  handle: async message => {
    if (!message.channel.guild) return;

    const guildSettings = global.bot.guildSettingsCache[message.channel.guild.id];
    if (!guildSettings) await cacheGuild(message.channel.guild.id);
    if (global.bot.guildSettingsCache[message.channel.guild.id].isChannelIgnored(message.channel.id)) return;

    let cachedMessage = await getMessageFromBatch(message.id);
    if (!cachedMessage) {
      cachedMessage = await getMessageFromDB(message.id);
    }
    if (!cachedMessage) return;

    await deleteMessage(message.id);

    let cachedUser = global.bot.users.get(cachedMessage.author_id);
    if (!cachedUser) {
      try {
        cachedUser = await message.channel.guild.getRESTMember(cachedMessage.author_id);
        message.channel.guild.members.add(cachedUser, global.bot);
      } catch (_) {
        // either the member does not exist or the person left and others are deleting their messages
      }
    }

    const member = message.channel.guild.members.get(cachedMessage.author_id);

    console.log("Before fetching audit logs");

    let deleterUser;
    try {
      // Adding a delay to ensure the audit log entry is created
      await new Promise(resolve => setTimeout(resolve, 7000)); // Total 7 seconds delay

      const auditLogs = await message.channel.guild.getAuditLogs(1, null, 72); // 72 is the action type for MESSAGE_DELETE
      console.log("Audit Logs: ", auditLogs);

      const entry = auditLogs.entries.find(e => {
        console.log(`Audit Log Entry: ${e.id}, ActionType: ${e.actionType}, ChannelID: ${e.channel ? e.channel.id : 'N/A'}, TargetID: ${e.targetID}, CreatedAt: ${e.createdAt}, Now: ${Date.now()}`);
        return e.actionType === 72 && e.channel.id === message.channel.id && e.targetID === cachedMessage.author_id;
      });

      if (entry) {
        const entryAge = Date.now() - entry.createdAt;
        console.log(`Entry age: ${entryAge} ms`);
        if (entryAge < 10000) { // Check if the entry is within 10 seconds
          deleterUser = entry.user;
          console.log("Deleter found: ", deleterUser);
        } else {
          console.log("No matching audit log entry found or entry is too old");
        }
      } else {
        console.log("No matching audit log entry found");
      }
    } catch (err) {
      console.error("Error fetching audit logs: ", err);
    }

    const messageDeleteEvent = {
      guildID: message.channel.guild.id,
      eventName: 'messageDelete',
      embeds: [{
        author: {
          name: cachedUser ? `${cachedUser.username}${cachedUser.discriminator === '0' ? '' : `#${cachedUser.discriminator}`} ${member && member.nick ? `(${member.nick})` : ''}` : `Unknown User <@${cachedMessage.author_id}>`,
          icon_url: cachedUser ? cachedUser.avatarURL : 'https://logger.bot/staticfiles/red-x.png'
        },
        description: `Message deleted in <#${message.channel.id}> (${message.channel.name})`,
        fields: [],
        color: 8530669
      }]
    };


    let messageChunks = [];
    if (cachedMessage.content) {
      if (cachedMessage.content.length > 1000) {
        messageChunks = chunkify(cachedMessage.content.replace(/\"/g, '"').replace(/`/g, ''));
      } else {
        messageChunks.push(cachedMessage.content);
      }
    } else {
      messageChunks.push('<no message content>');
    }

    messageChunks.forEach((chunk, i) => {
      messageDeleteEvent.embeds[0].fields.push({
        name: i === 0 ? 'Content' : 'Continued',
        value: chunk
      });
    });

    messageDeleteEvent.embeds[0].fields.push({
      name: 'Date',
      value: `<t:${Math.round(cachedMessage.ts / 1000)}:F>`
    }, {
      name: 'ID',
      value: `\`\`\`ini\nUser = ${cachedMessage.author_id}\nMessage = ${cachedMessage.id}\`\`\``
    });

    if (deleterUser) {
      messageDeleteEvent.embeds[0].fields.push({
        name: 'Deleted by',
        value: `<@${deleterUser.id}>`
      });
    } else {
      messageDeleteEvent.embeds[0].fields.push({
        name: 'Deleted by',
        value: `<@${cachedMessage.author_id}>`
      });
    }

    if (cachedMessage.attachment_b64) {
      const attachment_b64urls = cachedMessage.attachment_b64.split("|");
      attachment_b64urls.forEach(
        (base64url, indx) => messageDeleteEvent.embeds[indx] = {
          ...messageDeleteEvent.embeds[indx],
          image: { url: Buffer.from(base64url, "base64url").toString("utf-8") },
          url: "https://example.com"
        }
      );
    }

    await send(messageDeleteEvent);
  }
};

function chunkify(toChunk) {
  const lenChunks = Math.ceil(toChunk.length / 1000);
  const chunksToReturn = [];
  for (let i = 0; i < lenChunks; i++) {
    const chunkedStr = toChunk.substring((1000 * i), i === 0 ? 1000 : 1000 * (i + 1));
    chunksToReturn.push(chunkedStr);
  }
  return chunksToReturn;
}
