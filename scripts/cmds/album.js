const fs = require("fs");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "album",
    version: "1.7",
    role: 0,
    author: "MahMUD",
    category: "media",
    guide: {
      en: "{p}{n} [page number] (e.g., {p}{n} 2 to view the next page)\n{p}{n} add [category] [URL] - Add a video to a category\n{p}{n} list - View total videos in each category",
    },
  },

onStart: async function ({ api, event, args }) {
    if (args[0] === "add") {
      if (!args[1]) {
        return api.sendMessage("❌ Please specify a category. Usage: !album add [category]", event.threadID, event.messageID);
      }

      const category = args[1].toLowerCase();
      const allowedCategories = [
        "funny", "islamic", "sad", "anime", "lofi", "attitude", "horny", "couple",
        "flower", "bikecar", "love", "lyrics", "cat", "18+", "freefire",
        "football", "baby", "friend", "flirting", "aesthetic", "naruto", "dragon", "bleach", "demon", "jjk", "solo", "attackon", "bluelock", "cman", "deathnote"
      ];

      if (!allowedCategories.includes(category)) {
        return api.sendMessage(`❌ Invalid category! Choose from:\n${allowedCategories.join(", ")}`, event.threadID, event.messageID);
      }

if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
    const attachment = event.messageReply?.attachments[0];
    if (attachment?.type !== "video") {
        return api.sendMessage("❌ Only video attachments are allowed.", event.threadID, event.messageID);
    }
    try {
        const response = await axios.post(
            "https://api.imgur.com/3/upload",
            { image: attachment.url },
            {
                headers: {
                    Authorization: "Bearer edd3135472e670b475101491d1b0e489d319940f",
                    "Content-Type": "application/json",
                },
            }
        );

        const imgurLink = response.data?.data?.link;
        if (!imgurLink) throw new Error("Imgur upload failed");

        const albumData = JSON.parse(fs.readFileSync("album1.json", "utf-8"));
        if (!albumData[category]) {
            albumData[category] = [];
        }
        albumData[category].push(imgurLink);
        fs.writeFileSync("album1.json", JSON.stringify(albumData, null, 2));

        api.sendMessage(`✅ Video added ${category} category.\n📎Imgur Link: ${imgurLink}`, event.threadID, event.messageID);
    } catch (error) {
        api.sendMessage(`❌ Failed to upload video to Imgur.\nError: ${error.message}`, event.threadID, event.messageID);
    }
    return;
}

      // If the user provided a URL directly
      if (!args[2]) {
        return api.sendMessage("❌ Please provide a video URL or reply to a video message.", event.threadID, event.messageID);
      }

      const videoUrl = args[2];
      try {
        const albumData = JSON.parse(fs.readFileSync("album1.json", "utf-8"));
        if (!albumData[category]) {
          albumData[category] = [];
        }
        albumData[category].push(videoUrl);
        fs.writeFileSync("album1.json", JSON.stringify(albumData, null, 2));

        api.sendMessage(`✅ Video added to the ${category} category.`, event.threadID, event.messageID);
      } catch (error) {
        api.sendMessage(`❌ Error: ${error.message}`, event.threadID, event.messageID);
      }
      return;
    } else if (args[0] === "list") {
      try {
        const albumData = JSON.parse(fs.readFileSync("album1.json", "utf-8"));
        const categories = Object.keys(albumData);

        let message = `𝐓𝐨𝐭𝐚𝐥 𝐯𝐢𝐝𝐞𝐨𝐬 𝐢𝐧 𝐚𝐥𝐛𝐮𝐦 >😘\n\n`;

        categories.forEach((category, index) => {
          const totalVideos = albumData[category].length;
          message += `${index + 1}. 𝐓𝐨𝐭𝐚𝐥 ${category} 𝐯𝐢𝐝𝐞𝐨𝐬: ${totalVideos}\n`;
        });

        api.sendMessage(message, event.threadID, event.messageID);
      } catch (error) {
        api.sendMessage(`❌ Error: ${error.message}`, event.threadID, event.messageID);
      }
      return;
    }

    const categories = [
      "𝐅𝐮𝐧𝐧𝐲 𝐕𝐢𝐝𝐞𝐨", "𝐈𝐬𝐥𝐚𝐦𝐢𝐜 𝐕𝐢𝐝𝐞𝐨", "𝐒𝐚𝐝 𝐕𝐢𝐝𝐞𝐨", "𝐀𝐧𝐢𝐦𝐞 𝐕𝐢𝐝𝐞𝐨", "𝐋𝐨𝐅𝐈 𝐕𝐢𝐝𝐞𝐨",
 "𝐀𝐭𝐭𝐢𝐭𝐮𝐝𝐞 𝐕𝐢𝐝𝐞𝐨", "𝐇𝐨𝐫𝐧𝐲 𝐕𝐢𝐝𝐞𝐨", "𝐂𝐨𝐮𝐩𝐥𝐞 𝐕𝐢𝐝𝐞𝐨", "𝐅𝐥𝐨𝐰𝐞𝐫 𝐕𝐢𝐝𝐞𝐨", "𝐁𝐢𝐤𝐞 & 𝐂𝐚𝐫 𝐕𝐢𝐝𝐞𝐨",
 "𝐋𝐨𝐯𝐞 𝐕𝐢𝐝𝐞𝐨", "𝐋𝐲𝐫𝐢𝐜𝐬 𝐕𝐢𝐝𝐞𝐨", "𝐂𝐚𝐭 𝐕𝐢𝐝𝐞𝐨", "𝟏𝟖+ 𝐕𝐢𝐝𝐞𝐨", "𝐅𝐫𝐞𝐞 𝐅𝐢𝐫𝐞 𝐕𝐢𝐝𝐞𝐨",
 "𝐅𝐨𝐨𝐭𝐛𝐚𝐥𝐥 𝐕𝐢𝐝𝐞𝐨", "𝐁𝐚𝐛𝐲 𝐕𝐢𝐝𝐞𝐨", "𝐅𝐫𝐢𝐞𝐧𝐝𝐬 𝐕𝐢𝐝𝐞𝐨", "𝐅𝐥𝐢𝐫𝐭𝐢𝐧𝐠 𝐯𝐢𝐝𝐞𝐨", "𝐀𝐞𝐬𝐭𝐡𝐞𝐭𝐢𝐜 𝐕𝐢𝐝𝐞𝐨", "𝐍𝐚𝐫𝐮𝐭𝐨 𝐕𝐢𝐝𝐞𝐨", "𝐃𝐫𝐚𝐠𝐨𝐧 𝐛𝐚𝐥𝐥 𝐕𝐢𝐝𝐞𝐨", "𝐁𝐥𝐞𝐚𝐜𝐡 𝐕𝐢𝐝𝐞𝐨", "𝐃𝐞𝐦𝐨𝐧 𝐬𝐲𝐥𝐞𝐫 𝐕𝐢𝐝𝐞𝐨", "𝐉𝐮𝐣𝐮𝐭𝐬𝐮 𝐊𝐚𝐢𝐬𝐞𝐧 𝐯𝐢𝐝𝐞𝐨", "𝐒𝐨𝐥𝐨 𝐥𝐞𝐯𝐞𝐥𝐢𝐧𝐠 𝐕𝐢𝐝𝐞𝐨", "𝐀𝐭𝐭𝐚𝐜𝐤 𝐨𝐧 𝐭𝐢𝐭𝐚𝐧 𝐕𝐢𝐝𝐞𝐨", "𝐁𝐥𝐮𝐞 𝐥𝐨𝐜𝐤 𝐕𝐢𝐝𝐞𝐨", "𝐂𝐡𝐚𝐢𝐧𝐬𝐚𝐰 𝐦𝐚𝐧 𝐕𝐢𝐝𝐞𝐨", "𝐃𝐞𝐚𝐭𝐡 𝐧𝐨𝐭𝐞 𝐯𝐢𝐝𝐞𝐨"
 ];

    const itemsPerPage = 10;
    const page = parseInt(args[0]) || 1;
    const totalPages = Math.ceil(categories.length / itemsPerPage);

    if (page < 1 || page > totalPages) {
      return api.sendMessage(`❌ Invalid page! Please choose between 1 - ${totalPages}.`, event.threadID, event.messageID);
    }

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedCategories = categories.slice(startIndex, endIndex);

    const message = `𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐀𝐥𝐛𝐮𝐦 𝐕𝐢𝐝𝐞𝐨 𝐋𝐢𝐬𝐭 🎀\n` +
      "━━━━━━━━━━━━━━━━━━━━━\n" +
      displayedCategories.map((option, index) => `${startIndex + index + 1}. ${option}`).join("\n") +
      "\n━━━━━━━━━━━━━━━━━━━━━" +
      `\n♻ | 𝐏𝐚𝐠𝐞 [${page}/${totalPages}]<😘\nℹ | 𝐓𝐲𝐩𝐞 !album ${page + 1} - 𝐭𝐨 𝐬𝐞𝐞 𝐧𝐞𝐱𝐭 𝐩𝐚𝐠𝐞.`.repeat(page < totalPages);

    await api.sendMessage(message, event.threadID, (error, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        type: "reply",
        messageID: info.messageID,
        author: event.senderID,
        page,
        startIndex,
        categories,
      });
    }, event.messageID);
  },

  onReply: async function ({ api, event, Reply }) {
    api.unsendMessage(Reply.messageID);
    
    const reply = parseInt(event.body);
    const startIndex = Reply.startIndex;
    const index = reply - 1;

    if (isNaN(reply) || index < 0 || index >= Reply.categories.length) {
      return api.sendMessage("Please reply with a valid number from the list.", event.threadID, event.messageID);
    }

    const categories = [
      "funny", "islamic", "sad", "anime", "lofi", "attitude", "horny", "couple",
      "flower", "bikecar", "love", "lyrics", "cat", "18+", "freefire",
      "football", "baby", "friend", "flirting", "aesthetic", "naruto", "dragon", "bleach", "demon", "jjk", "solo", "attackon", "bluelock", "cman", "deathnote" 

    ];

    const captions = [
  "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐅𝐮𝐧𝐧𝐲 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <😺",
  "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐈𝐬𝐥𝐚𝐦𝐢𝐜 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <✨",
  "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐒𝐚𝐝 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <😢",
  "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐀𝐧𝐢𝐦𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
  "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐋𝐨𝐅𝐈 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🎶",
  "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐀𝐭𝐭𝐢𝐭𝐮𝐝𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <☠️ ",
  "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐇𝐨𝐫𝐧𝐲 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🥵",
  "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐂𝐨𝐮𝐩𝐥𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <💑",
  "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐅𝐥𝐨𝐰𝐞𝐫 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌸",
  "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐁𝐢𝐤𝐞 & 𝐂𝐚𝐫 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲",
  "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐋𝐨𝐯𝐞 𝐯𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <❤",
  "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐋𝐲𝐫𝐢𝐜𝐬 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🎵",
  "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐂𝐚𝐭 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🐱",
  "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐈𝟖+ 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🥵",
  "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐅𝐫𝐞𝐞 𝐅𝐢𝐫𝐞 𝐕𝐢𝐝𝐞𝐨 🔥",
  "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐅𝐨𝐨𝐭𝐛𝐚𝐥𝐥 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <⚽",
  "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐁𝐚𝐛𝐲 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🐥",
  "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐅𝐫𝐢𝐞𝐧𝐝𝐬 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <👭",
  "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐅𝐥𝐢𝐫𝐭𝐢𝐧𝐠 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <😋",
  "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐀𝐞𝐬𝐭𝐡𝐞𝐭𝐢𝐜 𝐯𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲",
  "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐍𝐚𝐫𝐮𝐭𝐨 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
  "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐃𝐫𝐚𝐠𝐨𝐧 𝐛𝐚𝐥𝐥 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
  "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐁𝐥𝐞𝐚𝐜𝐡 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
  "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐃𝐞𝐦𝐨𝐧 𝐬𝐲𝐥𝐞𝐫 𝐁𝐚𝐛𝐲 <🌟",
  "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐉𝐮𝐣𝐮𝐭𝐬𝐮 𝐊𝐚𝐢𝐬𝐞𝐧 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
  "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐒𝐨𝐥𝐨 𝐥𝐞𝐯𝐞𝐥𝐢𝐧𝐠 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
  "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐀𝐭𝐭𝐚𝐜𝐤 𝐨𝐧 𝐭𝐢𝐭𝐚𝐧 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
  "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐁𝐥𝐮𝐞 𝐥𝐨𝐜𝐤 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
  "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐂𝐡𝐚𝐢𝐧𝐬𝐚𝐰 𝐦𝐚𝐧 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟",
  "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐃𝐞𝐚𝐭𝐡 𝐧𝐨𝐭𝐞 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 <🌟"
    ];

    let query = categories[index];
    let cp = captions[index];

    const adminUID = ["61556006709662", "100083900196039"]; 
    if ((query === "18+" || query === "horny") && !adminUID.includes(event.senderID)) {
      return api.sendMessage("𝐕𝐚𝐠 𝐋𝐮𝐜𝐜𝐡𝐚 >😋", event.threadID, event.messageID);
    }

    const albumData = JSON.parse(fs.readFileSync("album1.json", "utf-8"));
    const videoUrls = albumData[query];

    if (!videoUrls || videoUrls.length === 0) {
      return api.sendMessage("❌ | 𝐍𝐨 𝐯𝐢𝐝𝐞𝐨𝐬 𝐟𝐨𝐮𝐧𝐝 𝐟𝐨𝐫 𝐭𝐡𝐢𝐬 𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐲.", event.threadID, event.messageID);
    }

    const randomVideoUrl = videoUrls[Math.floor(Math.random() * videoUrls.length)];
    const filePath = path.join(__dirname, "temp_video.mp4");

    async function downloadFile(url, filePath) {
      const response = await axios({ url, method: "GET", responseType: "stream" });

      return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
    }

    try {
      await downloadFile(randomVideoUrl, filePath);

      api.sendMessage(
        { body: cp, attachment: fs.createReadStream(filePath) },
        event.threadID,
        () => fs.unlinkSync(filePath),
        event.messageID
      );
    } catch (error) {
      api.sendMessage("❌ | 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐭𝐡𝐞 𝐯𝐢𝐝𝐞𝐨.", event.threadID, event.messageID);
    }
  }
};
