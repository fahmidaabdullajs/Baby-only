const axios = require('axios');

module.exports.config = {
  name: "emojis",
  aliases: ["emojipng"],
  version: "1.5",
  author: "Dipto",
  role: 0,
  category: "media",
  description: { 
    en: "Fetch emoji PNGs based on user selection."
  },
  countDown: 2,
  guide: {
    en: "{pn} <emoji>"
  }
};

module.exports.onStart = async ({ api, args, event }) => {
  try {
    const emojisResponse = await axios.get(`${global.api.dipto}/emojiTopng?emoji=${args.join(" ")}`);
    const emojiList = emojisResponse.data.result;

    if (emojiList.length === 0) {
      return api.sendMessage("No emojis found for the provided input.", event.threadID, event.messageID);
    }

    const emojiOptions = emojiList.map((emoji, index) => `├‣ ${index + 1}. ${emoji.title}`).join("\n");

    const messageContent = `
╭───✦ [ Available emojis ]
${emojiOptions}
╰────⧕\nReply to this message with the number of the emoji you want to download.`;

    api.sendMessage(
      messageContent,
      event.threadID,
      (error, info) => {
        if (error) return api.sendMessage("An error occurred.", event.threadID, event.messageID);
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID,
          emojiList
        });
      },
      event.messageID
    );
  } catch (error) {
    api.sendMessage(`An error occurred: ${error.message}`, event.threadID, event.messageID);
  }
};

module.exports.onReply = async ({ api, event, Reply }) => {
  const { author, messageID, emojiList } = Reply;

  if (event.senderID !== author) return;

  const choice = parseInt(event.body);

  if (isNaN(choice) || choice < 1 || choice > emojiList.length) {
    return api.sendMessage("Invalid selection. Please reply with a valid number.", event.threadID, event.messageID);
  }
    await api.unsendMessage(messageID)
  const selectedEmoji = emojiList[choice - 1];

  try {
    const emojiStream = await global.utils.getStreamFromURL(selectedEmoji.link);
    api.sendMessage({ attachment: emojiStream }, event.threadID, event.messageID);
  } catch (error) {
    api.sendMessage(`An error occurred while fetching the emoji: ${error.message}`, event.threadID, event.messageID);
  }
};