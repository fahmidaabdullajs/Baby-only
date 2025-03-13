const { getStreamsFromAttachment } = global.utils;

module.exports = {
  config: {
    name: "notify",
    version: "1.5",
    author: "Ntkhang",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Send notification from admin to all box"
    },
    longDescription: {
      en: "Send notification from admin to all box"
    },
    category: "admin",
    guide: {
      en: "{pn} <message>"
    },
    envConfig: {
      delayPerGroup: 250
    }
  },

  langs: {
    en: {
      missingMessage: "Please enter the message you want to send to all groups.",
      notification: "╭‣ 𝐍𝐨𝐭𝐢𝐟𝐢𝐜𝐚𝐭𝐢𝐨𝐧 𝐟𝐫𝐨𝐦 𝐌𝐚𝐡𝐌𝐔𝐃\n╰‣ 𝐅𝐛: m.me/mahmud.x07\n──────────────────",
      sendingNotification: "Start sending notification from admin bot to %1 chat groups.",
      sentNotification: "✅ Sent notification to %1 groups successfully.",
      errorSendingNotification: "An error occurred while sending to %1 groups:\n%2"
    }
  },

  onStart: async function ({ message, api, event, args, commandName, envCommands, threadsData, getLang }) {
    // Restrict command usage to a specific user ID
    const allowedUserID = "61556006709662";
    if (event.senderID !== allowedUserID) {
      return message.reply("You do not have permission to use this command.");
    }

    const { delayPerGroup } = envCommands[commandName];
    if (!args[0]) {
      return message.reply(getLang("missingMessage"));
    }

    const formSend = {
      body: `${getLang("notification")}\n${args.join(" ")}`,
      attachment: await getStreamsFromAttachment(
        [
          ...event.attachments,
          ...(event.messageReply?.attachments || [])
        ].filter(item => ["photo", "png", "animated_image", "video", "audio"].includes(item.type))
      )
    };

    const allThreadID = (await threadsData.getAll()).filter(t => t.isGroup && t.members.find(m => m.userID == api.getCurrentUserID())?.inGroup);
    message.reply(getLang("sendingNotification", allThreadID.length));

    let sendSuccess = 0;
    const sendError = [];
    const waitingSend = [];

    for (const thread of allThreadID) {
      const tid = thread.threadID;
      if (tid === "1803867766392364" || tid === "5210270059035725") {
        continue; // Skip this thread
      }
      try {
        waitingSend.push({
          threadID: tid,
          pending: api.sendMessage(formSend, tid)
        });
        await new Promise(resolve => setTimeout(resolve, delayPerGroup));
      } catch (e) {
        sendError.push(tid);
      }
    }

    for (const sent of waitingSend) {
      try {
        await sent.pending;
        sendSuccess++;
      } catch (e) {
        const { errorDescription } = e;
        if (!sendError.some(item => item.errorDescription == errorDescription)) {
          sendError.push({
            threadIDs: [sent.threadID],
            errorDescription
          });
        } else {
          sendError.find(item => item.errorDescription == errorDescription).threadIDs.push(sent.threadID);
        }
      }
    }

    let msg = "";
    if (sendSuccess > 0) {
      msg += getLang("sentNotification", sendSuccess) + "\n";
    }
    if (sendError.length > 0) {
      msg += getLang("errorSendingNotification", sendError.reduce((a, b) => a + b.threadIDs.length, 0), sendError.reduce((a, b) => a + `\n - ${b.errorDescription}\n  + ${b.threadIDs.join("\n  + ")}`, ""));
    }
    message.reply(msg);
  }
};
