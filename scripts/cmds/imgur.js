const axios = require("axios");
module.exports = {
  config: {
    name: "imgur",
    author: "Nyx",
    category:'media'
  },
  onStart: async function ({ api, event }) {
    try {
      if (!event.messageReply || !event.messageReply.attachments ) {
       api.sendMessage(
          "❌ Please reply to an image or video message to upload it to Imgur.",
          event.threadID,
          event.messageID
        );
      }

      const attachment = event.messageReply.attachments[0].url;
      const response = await axios.post(
        "https://api.imgur.com/3/upload",
        { image: attachment },
        {
          headers: {
            Authorization: "Bearer edd3135472e670b475101491d1b0e489d319940f",
            "Content-Type": "application/json",
          },
        }
      );

      const imgurData = response.data;
      const imgurLink = imgurData.data.link;
      api.sendMessage(
        `${imgurLink}`,
        event.threadID,
        event.messageID
      );
    } catch (error) {
      api.sendMessage(
        `${error.message}`,
        event.threadID,
        event.messageID
      );
    }
  },
};
