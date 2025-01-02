const axios = require("axios");
const fs = require("fs");

const ok = "xyz";
const apiBaseUrl = `https://smfahim.${ok}/sing`;

module.exports = {
  config: {
    name: "sing",
    version: "1.4",
    author: "Team Calyx",
    countDown: 5,
    role: 0,
    description: {
      en: "Search and download audio from YouTube"
    },
    category: "media",
    guide: {
      en: "{pn} <search term or URL>: search YouTube and download audio"
    }
  },

  onStart: async ({ api, args, event }) => {
    let videoURL = args.join(" ");

    if (!videoURL) {
      if (event.messageReply && event.messageReply.body) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const foundURLs = event.messageReply.body.match(urlRegex);
        if (foundURLs && foundURLs.length > 0) {
          videoURL = foundURLs[0];
        } else {
          return api.sendMessage("❌ No URL found in the replied message. Please provide a valid URL.", event.threadID, event.messageID);
        }
      } else {
        return api.sendMessage("❌ Please provide a search term or URL.", event.threadID, event.messageID);
      }
    }

    const isUrl = videoURL.startsWith("http://") || videoURL.startsWith("https://");

    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      let response;
      if (isUrl) {
        response = await axios.get(`${apiBaseUrl}?url=${encodeURIComponent(videoURL)}`);
      } else {
        response = await axios.get(`${apiBaseUrl}?search=${encodeURIComponent(videoURL)}`);
      }

      const { link, title } = response.data;

      if (!link) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
      }

      const audioPath = `ytb_audio_${Date.now()}.mp3`;

      const audioResponse = await axios.get(link, { responseType: "arraybuffer" });
      fs.writeFileSync(audioPath, Buffer.from(audioResponse.data));
      api.setMessageReaction("✅", event.messageID, () => {}, true);
      const titleBody = `✅𝙃𝙚𝙧𝙚'𝙨 𝙮𝙤𝙪𝙧 𝙨𝙤𝙣𝙜 𝙗𝙖𝙗𝙮 \n\n 🐤 | 𝗲𝙣𝙟𝙤𝙮 : ${title}`;
      await api.sendMessage(
        {
          body: titleBody,
          attachment: fs.createReadStream(audioPath)
        },
        event.threadID,
        () => {
          fs.unlinkSync(audioPath);
        },
        event.messageID
      );
    } catch (error) {
      console.error(error);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};
