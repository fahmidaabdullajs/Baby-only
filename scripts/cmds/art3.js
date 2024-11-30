const axios = require('axios');

module.exports = {
  config: {
    name: "art3",
    version: "1.7.1",
    author: "Nazrul",
    role: 0,
    description: "{pn} - Enhance your photos with artful transformations!",
    category: "Image gen",
    countDown: 5,
  },
  onStart: async function ({ message, event, args, api }) {
    try {
      let photoUrl;
      const defaultPrompts = ["anime", "watercolor", "sketch", "abstract", "cartoon"];

      let promptText = args[0] || defaultPrompts[Math.floor(Math.random() * defaultPrompts.length)];

      const msg = await api.sendMessage("🎨 Processing your image, please wait...", event.threadID);

      if (event.type === "message_reply" && event.messageReply) {
        const attachment = event.messageReply.attachments[0];
        if (attachment && attachment.type === "photo") {
          photoUrl = attachment.url;
        } else {
          await api.sendMessage("Please reply to a photo.", event.threadID, event.messageID);
          return;
        }
      }

      const response = await axios.get(`https://www.noobs-api.000.pe/dipto/art2?url=${encodeURIComponent(photoUrl)}&prompt=${encodeURIComponent(promptText)}`);

      if (!response.data || !response.data.imageUrl) {
        await api.sendMessage("not return a valid image URL. Please try again.", event.threadID, event.messageID);
        return;
      }

      const imageUrl = response.data.imageUrl;

      await api.unsendMessage(msg.messageID);

      const imageStream = await axios.get(imageUrl, { responseType: 'stream' });

      await api.sendMessage({ 
        body: `Here's your artful image! 🎨`, 
        attachment: imageStream.data 
      }, event.threadID, event.messageID);

    } catch (error) {
      await api.sendMessage(`Error: ${error.message}`, event.threadID, event.messageID);
    }
  }
};
