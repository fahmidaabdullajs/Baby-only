const fs = require("fs");
const path = require("path");
const axios = require("axios");
 
module.exports = {
  config: {
    name: "art2",
    aliases: ['artify'],
    author: "Mahi--",
    version: "1.0",
    cooldowns: 20,
    role: 0,
    shortDescription: "Transform an image into art.",
    longDescription: "Transforms an image into art using the provided image link or reply to an image.",
    category: "Image gen",
    guide: "{p}artify <image_url> or reply to an image with {p}artify",
  },
  onStart: async function ({ message, args, api, event }) {
    // Obfuscated author name check
    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 105, 45, 45);
    if (this.config.author !== obfuscatedAuthor) {
      return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
    }
 
    // Get image URL from arguments or replied message
    let imageUrl;
    if (args.length > 0) {
      imageUrl = args[0];
    } else if (event.messageReply && event.messageReply.attachments.length > 0) {
      imageUrl = event.messageReply.attachments[0].url;
    } else {
      return api.sendMessage("❌ | You need to provide an image URL or reply to an image.", event.threadID);
    }
 
    api.sendMessage("Please wait, we're transforming your image...", event.threadID, event.messageID);
 
    try {
      const artifyApiUrl = `https://samirxpikachuio.onrender.com/artify?url=${encodeURIComponent(imageUrl)}`;
 
      const artifyResponse = await axios.get(artifyApiUrl, {
        responseType: "arraybuffer"
      });
 
      const cacheFolderPath = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
      }
      const imagePath = path.join(cacheFolderPath, `${Date.now()}_artified_image.png`);
      fs.writeFileSync(imagePath, Buffer.from(artifyResponse.data, "binary"));
 
      const stream = fs.createReadStream(imagePath);
      message.reply({
        body: "",
        attachment: stream
      });
    } catch (error) {
      console.error("Error:", error);
      message.reply("❌ | An error occurred. Please try again later.");
    }
  }
};
