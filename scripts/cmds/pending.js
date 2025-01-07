const { config } = global.GoatBot;
const fs = require("fs-extra");
const axios = require("axios");

module.exports = {
  config: {
    name: "pending",
    aliases: ["pen", "approve"],
    version: "1.7",
    author: "Mah MUD",
    countDown: 10,
    role: 0,
    category: "utility",
    whiteListModeThread: {
      whiteListThreadIds: [] // Store the whitelisted thread IDs
    }
  },

  onReply: async function ({ message, api, event, Reply, usersData }) {
    const allowedThreadID = '7460623087375340'; // The thread ID where the command is allowed
    const { author, pending } = Reply;
    
    if (String(event.senderID) !== String(author)) return;
    const { body, threadID, messageID } = event;

    // Check if the command is being used in the correct thread
    if (threadID !== allowedThreadID) {
      return api.sendMessage("❌ 𝐎𝐧𝐥𝐲 𝐛𝐨𝐭 𝐒𝐮𝐩𝐩𝐨𝐫𝐭 𝐠𝐫𝐨𝐮𝐩 𝐰𝐨𝐫𝐤 𝐭𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝.\n\n𝐓𝐲𝐩𝐞 !joingc 𝐚𝐝𝐝 𝐭𝐨 𝐛𝐨𝐭 𝐬𝐮𝐩𝐩𝐨𝐫𝐭 𝐠𝐫𝐨𝐮𝐩.", threadID, messageID);
    }

    var count = 0;

    if (isNaN(body) && (body.indexOf("c") === 0 || body.indexOf("cancel") === 0)) {
      const index = body.slice(1).split(/\s+/);
      for (const singleIndex of index) {
        if (isNaN(singleIndex) || singleIndex <= 0 || singleIndex > pending.length)
          return api.sendMessage(`[ ERR ] ${singleIndex} Not a valid number`, threadID, messageID);
      }
      return api.sendMessage(`[ OK ] Successfully refused`, threadID, messageID);
    } else {
      const index = body.split(/\s+/);
      for (const singleIndex of index) {
        if (isNaN(singleIndex) || singleIndex <= 0 || singleIndex > pending.length)
          return api.sendMessage(`❯ ${singleIndex} Not a valid number`, threadID, messageID);
        api.unsendMessage(messageID);

        api.changeNickname(
          `[ Bot ]`,
          pending[singleIndex - 1].threadID,
          api.getCurrentUserID()
        );
        api.sendMessage(
          { body: `Bot is now connected! Use !help to see the Command Lists` },
          pending[singleIndex - 1].threadID
        );

        const approvedByName = await usersData.getName(event.senderID);
        api.sendMessage(`✅ | 𝐆𝐫𝐨𝐮𝐩 𝐚𝐩𝐩𝐫𝐨𝐯𝐞𝐝 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 𝐛𝐲 ${approvedByName}`, pending[singleIndex - 1].threadID);

        const directID = pending[singleIndex - 1].threadID;
        if (this.config.whiteListModeThread.whiteListThreadIds.includes(directID)) {
          console.log("Already added in whitelistThread");
        } else {
          this.config.whiteListModeThread.whiteListThreadIds.push(directID);
          console.log("Added to whitelist");
        }

        count += 1;
      }

      setTimeout(() => {
        const replyData = global.GoatBot.onReply.get(info.messageID);
        if (replyData) {
          const { messageID } = replyData;
          global.GoatBot.onReply.delete(messageID);
          api.unsendMessage(messageID);
        }
      }, 5000);

      return api.sendMessage(`✅ | 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 𝐚𝐩𝐩𝐫𝐨𝐯𝐞𝐝 ${count} 𝐭𝐡𝐫𝐞𝐚𝐝`, threadID, messageID);
    }
  },

  onStart: async function ({ message, api, event }) {
    const allowedThreadID = '7460623087375340'; // The thread ID where the command is allowed
    const { threadID, messageID } = event;
    const commandName = this.config.name;
    var msg = "", index = 1;

    // Check if the command is being used in the correct thread
    if (threadID !== allowedThreadID) {
      return api.sendMessage("❌ 𝐎𝐧𝐥𝐲 𝐛𝐨𝐭 𝐒𝐮𝐩𝐩𝐨𝐫𝐭 𝐠𝐫𝐨𝐮𝐩 𝐰𝐨𝐫𝐤 𝐭𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝.\n\n𝐓𝐲𝐩𝐞 !joingc 𝐚𝐝𝐝 𝐭𝐨 𝐛𝐨𝐭 𝐬𝐮𝐩𝐩𝐨𝐫𝐭 𝐠𝐫𝐨𝐮𝐩.", threadID, messageID);
    }

    try {
      var spam = await api.getThreadList(100, null, ["OTHER"]) || [];
      var pending = await api.getThreadList(100, null, ["PENDING"]) || [];
    } catch (e) {
      return api.sendMessage("[ ERR ] can't get the current list", threadID, messageID);
    }

    const list = [...spam, ...pending].filter(group => group.isSubscribed && group.isGroup);

    for (const single of list) {
      const threadName = single.name || "Unknown";
      msg += `${index++}: ${threadName}\n𝐓𝐢𝐝:${single.threadID}\n\n`;
    }

    if (list.length !== 0) {
      return api.sendMessage(`📚 | 𝐓𝐨𝐭𝐚𝐥 𝐩𝐞𝐧𝐝𝐢𝐧𝐠 𝐠𝐫𝐨𝐮𝐩: ${list.length} \n${msg}\n\n𝐑𝐞𝐩𝐥𝐲 𝐭𝐨 𝐭𝐡𝐞 𝐨𝐫𝐝𝐞𝐫 𝐧𝐮𝐦𝐛𝐞𝐫 𝐛𝐞𝐥𝐨𝐰 𝐭𝐨 𝐚𝐩𝐩𝐫𝐨𝐯𝐞`, threadID, (error, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          author: event.senderID,
          pending: list
        });
      }, messageID);
    } else {
      return api.sendMessage("There are currently no groups in the queue", threadID, messageID);
    }
  }
};
