const fs = require("fs-extra");
const request = require("request");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "write2",
    aliases: ["w2"],
    version: "1.0",
    author: "RL", // if you change it, then you are a pure gay
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Write text on a replied image"
    },
    longDescription: {
      en: "Writes text on a replied image and sends it back."
    },
    category: "image",
    guide: {
      en: "{p}write <text>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, senderID, body } = event;

    // Ensure that text is provided
    let text = args.join(" ");
    if (!text) {
      return api.sendMessage("Please provide text to write.", threadID, messageID);
    }

    // Ensure the user has replied to an image
    if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
      return api.sendMessage("Please reply to an image.", threadID, messageID);
    }

    // Get image URL from the reply
    const imageUrl = event.messageReply.attachments[0].url;

    // Request the image and load it
    request(imageUrl, { encoding: null }, async (error, response, body) => {
      if (error) {
        return api.sendMessage("Error downloading the image.", threadID, messageID);
      }

      try {
        const img = await loadImage(body);

        // Create a canvas and draw the image on it
        const canvas = createCanvas(img.width, img.height);
        const ctx = canvas.getContext("2d");

        ctx.drawImage(img, 0, 0);

        // Set text properties (optional adjustment for simple layout)
        ctx.font = "30px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";

        // Calculate text size based on image dimensions to prevent text from exceeding
        const padding = 10;
        const textWidth = ctx.measureText(text).width;

        if (textWidth > img.width - 2 * padding) {
          // If the text is too wide, scale down the font size
          let fontSize = 30;
          while (ctx.measureText(text).width > img.width - 2 * padding && fontSize > 10) {
            fontSize--;
            ctx.font = `${fontSize}px Arial`;
          }
        }

        // Set text position near the bottom of the image
        const x = canvas.width / 2;
        const y = canvas.height - 40; // Adjust vertical positioning

        // Render text on the image
        ctx.fillText(text, x, y);

        // Save to temporary path and send image
        const tempFilePath = __dirname + "/tmp/modified_image.png";
        const out = fs.createWriteStream(tempFilePath);
        const stream = canvas.createPNGStream();
        stream.pipe(out);

        out.on("finish", () => {
          api.sendMessage(
            { body: "", attachment: fs.createReadStream(tempFilePath) },
            threadID,
            () => fs.unlinkSync(tempFilePath), // Clean up temp file
            messageID
          );
        });

      } catch (err) {
        console.error(err);
        return api.sendMessage("Error processing the image.", threadID, messageID);
      }
    });
  }
};