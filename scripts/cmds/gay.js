const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "gay",
    version: "1.1",
    author: "@tas33n",
    countDown: 1,
    role: 0,
    shortDescription: "Add gay flag to an image",
    longDescription: "Apply a gay flag filter to an avatar or a replied image.",
    category: "fun",
    guide: "{pn} {{[on | off]}}",
    envConfig: {
      deltaNext: 5
    }
  },

  langs: {
    vi: {
      noTag: "Bạn phải tag người bạn muốn áp dụng cờ lục sắc.",
      notVIP: "Bạn không phải là VIP, chỉ VIP mới được dùng lệnh này!"
    },
    en: {
      noTag: "You must tag the person you want to apply the rainbow flag to.",
      notVIP: "You are not a VIP user. Only VIP users can use this command."
    }
  },

  onStart: async function ({ event, api, message, usersData, args, getLang }) {
    const vipData = global.GoatBot.config.vipUser;
    if (!vipData.includes(event.senderID)) {
      api.sendMessage(
        getLang("notVIP"),
        event.threadID,
        event.messageID
      );
      return;
    }

    let uid;
    let imageURL;

    // Check if the message is a reply
    if (event.type == "message_reply") {
      const reply = event.messageReply;
      
      // Check if the replied message contains an image
      if (reply.attachments && reply.attachments.length > 0 && reply.attachments[0].type === 'photo') {
        imageURL = reply.attachments[0].url;  // Get the image URL from the reply
      } else {
        uid = reply.senderID;  // Fallback to the sender's avatar if no image is found
        imageURL = await usersData.getAvatarUrl(uid);
      }
    } else {
      // If no reply, check if a user is mentioned, otherwise use the sender's avatar
      let mention = Object.keys(event.mentions);
      if (mention[0]) {
        uid = mention[0];
        imageURL = await usersData.getAvatarUrl(uid);
      } else {
        uid = event.senderID;
        imageURL = await usersData.getAvatarUrl(uid);
      }
    }

    try {
      // Apply the gay filter to the image or avatar
      let gayImage = await new DIG.Gay().getImage(imageURL);

      // Save the image temporarily
      const pathSave = `${__dirname}/tmp/gay.png`;
      fs.writeFileSync(pathSave, Buffer.from(gayImage));

      let body = "Look... I found a gay!";
      if (!uid) body = "Baka, you're gay. You forgot to reply or mention someone.";

      // Send the modified image with the rainbow flag
      message.reply({
        body: body,
        attachment: fs.createReadStream(pathSave)
      }, () => fs.unlinkSync(pathSave)); // Clean up the file after sending
    } catch (error) {
      console.error("Error generating image: ", error);
      message.reply("Sorry, something went wrong when generating the image.");
    }
  }
};
