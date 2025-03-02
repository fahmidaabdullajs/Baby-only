const fs = require("fs");
const axios = require("axios");

module.exports = {
  config: {
    name: "cdp2",
    version: "1.7",
    author: "MahMUD",
    countDown: 5,
    role: 0,
    shortDescription: "Get, add, or view Couple DPs",
    longDescription: "Sends a random couple DP (boy & girl), lets users add new ones, or shows the total count.",
    category: "fun",
    guide: "{pn} ➜ Get a random Couple DP\n{pn} add (reply with 2 images) ➜ Add a new Couple DP\n{pn} list ➜ Show total number of Couple DPs"
  },

  onStart: async function ({ message, args, event }) {
    try {
      const filePath = path.join("json_files", "cdp5.json");
let data = [];

if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
}
      // If user wants to check the total count of Couple DPs
      if (args[0] === "list") {
        return message.reply(`🎀 𝐓𝐨𝐭𝐚𝐥 𝐂𝐨𝐮𝐩𝐥𝐞 𝐃𝐏: ${data.length}`);
      }

      // If the user wants to add a new Couple DP
      if (args[0] === "add") {
        if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length >= 2) {
          // Extract image URLs from the reply
          const boyImgUrl = event.messageReply.attachments[0]?.url;
          const girlImgUrl = event.messageReply.attachments[1]?.url;

          console.log("Boy Image URL:", boyImgUrl);
          console.log("Girl Image URL:", girlImgUrl);

          try {
            // Upload the images to Imgur using the API
            const boyImgurLink = await uploadToImgur(boyImgUrl);
            const girlImgurLink = await uploadToImgur(girlImgUrl);

            // Add new Couple DP with Imgur links
            data.push({ boy: boyImgurLink, girl: girlImgurLink });

            // Save to JSON file
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

            return message.reply("✅ Couple DP added successfully!");
          } catch (error) {
            console.error("Error uploading images:", error);
            return message.reply("❌ Error uploading images. Please try again.");
          }
        }

        // If the user didn't reply with two images
        return message.reply("❌ Please reply to a message containing two image attachments for the Couple DP.");
      }

      // If user wants a random Couple DP
      if (data.length === 0) {
        return message.reply("⚠ No Couple DP found. Add one using: cdp2 add (reply with 2 images)");
      }

      const randomDP = data[Math.floor(Math.random() * data.length)];

      // Send both images in a single message
      const attachments = [
        await global.utils.getStreamFromURL(randomDP.boy),
        await global.utils.getStreamFromURL(randomDP.girl)
      ];

      message.reply({
        body: "Here’s a random Couple DP:",
        attachment: attachments
      });

    } catch (error) {
      console.error("Error processing request:", error);
      message.reply("❌ Error processing request.");
    }
  }
};

// Helper function to upload image to Imgur
async function uploadToImgur(imageUrl) {
  try {
    const response = await axios.post(
      "https://api.imgur.com/3/upload",
      { image: imageUrl },
      {
        headers: {
          Authorization: "Bearer edd3135472e670b475101491d1b0e489d319940f",
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data?.data?.link) {
      return response.data.data.link; // Return the Imgur link of the uploaded image
    } else {
      throw new Error("Imgur upload failed: No image in response.");
    }
  } catch (error) {
    console.error("Error uploading to Imgur:", error);
    throw new Error("Failed to upload image to Imgur");
  }
        }
