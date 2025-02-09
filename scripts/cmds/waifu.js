const fs = require("fs");
const mongoose = require("mongoose");

// Load waifu data
const waifus = JSON.parse(fs.readFileSync("waifu.json", "utf-8"));

// MongoDB Connection
mongoose.connect("mongodb+srv://mahmudabdullax7:ttnRAhj81JikbEw8@cluster0.zwknjau.mongodb.net/GoatBotV2?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define Schema for Waifu Wins
const waifuWinSchema = new mongoose.Schema({
  userID: String,
  winCount: { type: Number, default: 0 }
});

// Model for Waifu Wins (Avoid OverwriteModelError)
const WaifuWin = mongoose.models.WaifuWin || mongoose.model("WaifuWin", waifuWinSchema);

module.exports = {
  config: {
    name: "waifu",
    version: "1.8",
    author: "MahMUD",
    countDown: 10,
    role: 0,
    category: "game",
    guide: {
      en: "{pn}"
    }
  },

  onReply: async function ({ api, event, Reply, usersData }) {
    const { waifu } = Reply;
    const getCoin = 1000;
    const getExp = 121;
    const penaltyCoin = 300;
    const penaltyExp = 100;
    const userData = await usersData.get(event.senderID);

    if (event.type === "message_reply") {
      const reply = event.body.toLowerCase();

      if (isNaN(reply)) {
        if (reply === waifu.toLowerCase()) {
          try {
            await api.unsendMessage(Reply.messageID);
            await usersData.set(event.senderID, {
              money: userData.money + getCoin,
              exp: userData.exp + getExp
            });

            // Update or insert user win count in MongoDB
            await WaifuWin.findOneAndUpdate(
              { userID: event.senderID },
              { $inc: { winCount: 1 } },
              { upsert: true, new: true }
            );

            const message = `✅ | Correct answer baby.\nYou have earned ${getCoin} coins and ${getExp} exp.`;
            await api.sendMessage(message, event.threadID, event.messageID);
          } catch (err) {
            console.log("Error: ", err.message);
          }
        } else {
          await api.unsendMessage(Reply.messageID);
          await usersData.set(event.senderID, {
            money: userData.money - penaltyCoin,
            exp: userData.exp - penaltyExp
          });
          await api.sendMessage(
            `❌ | Wrong Answer baby.\nYou lost ${penaltyCoin} coins & ${penaltyExp} exp.\nCorrect answer was: ${waifu}`,
            event.threadID,
            event.messageID
          );
        }
      }
    }
  },

  onStart: async function ({ api, args, event, usersData }) {
    try {
      if (!args[0]) {
        // Pick a random waifu from the JSON file
        const randomWaifu = waifus[Math.floor(Math.random() * waifus.length)];

        api.sendMessage(
          { 
            body: "A random waifu has appeared! Guess the waifu name.", 
            attachment: await global.utils.getStreamFromURL(randomWaifu.imgurLink) 
          },
          event.threadID,
          (error, info) => {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: this.config.name,
              type: "reply",
              messageID: info.messageID,
              author: event.senderID,
              waifu: randomWaifu.name,
              link: randomWaifu.imgurLink
            });
            setTimeout(() => {
              api.unsendMessage(info.messageID);
            }, 40000);
          },
          event.messageID
        );
      } else if (args[0] === "list") {
        // Fetch rankings from MongoDB
        const waifuStats = await WaifuWin.find().sort({ winCount: -1 });

        if (waifuStats.length === 0) {
          return api.sendMessage("No rankings available yet.", event.threadID, event.messageID);
        }

        let message = "👑 | Waifu Game Rankings:\n\n";
        let i = 0;
        for (const stat of waifuStats) {
          const userName = await usersData.getName(stat.userID);
          message += `${i + 1}. ${userName}: ${stat.winCount} wins\n`;
          i++;
        }

        return api.sendMessage(message, event.threadID, event.messageID);
      }
    } catch (error) {
      console.error(`Error: ${error.message}`);
      api.sendMessage(`Error: ${error.message}`, event.threadID, event.messageID);
    }
  }
};
