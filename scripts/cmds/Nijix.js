const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "Nijix",
    aliases: ["nijixl"],
    author: "Mahi--",
    version: "1.0",
    cooldowns: 20,
    role: 0,
    shortDescription: "Generate an image based on a prompt using the Nijix API.",
    longDescription: "Generates an image using the provided prompt and streams the image to the chat.",
    category: "Image gen",
    guide: "${pn}nijix <prompt>",
  },
  onStart: async function ({ message, args, api, event }) {
    const prompt = args.join(" ");

    if (!prompt) {
      return api.sendMessage("❌ | You must provide a prompt to generate an image.", event.threadID);
    }

    const startTime = Date.now(); // Start measuring time
    api.sendMessage("🖼️ | Creating your image, please wait a moment...", event.threadID, event.messageID);

    try {
      const apiUrl = `https://hopeless-nijix.onrender.com/nijix?prompt=${encodeURIComponent(prompt)}`;

      // Call the API to get the image URL
      const response = await axios.get(apiUrl);
      const imageUrl = response.data.imageUrl;

      // If imageUrl is not found
      if (!imageUrl) {
        return api.sendMessage("❌ | Unable to generate the image at the moment. Please try again later.", event.threadID);
      }

      // Download the image from the URL
      const imageResponse = await axios.get(imageUrl, {
        responseType: "arraybuffer"
      });

      const cacheFolderPath = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
      }

      const imagePath = path.join(cacheFolderPath, `${Date.now()}_generated_image.png`);
      fs.writeFileSync(imagePath, Buffer.from(imageResponse.data, "binary"));

      const stream = fs.createReadStream(imagePath);

      // Calculate generation time
      const generationTime = ((Date.now() - startTime) / 1000).toFixed(2); // Time in seconds

      message.reply({
        body: `✅ | Your image is ready!\n\n🕒 Time taken: ${generationTime} seconds.`,
        attachment: stream
      });

    } catch (error) {
      console.error("Error:", error);
      return api.sendMessage("❌ | An error occurred while generating the image. Please try again later.", event.threadID);
    }
  }
};
