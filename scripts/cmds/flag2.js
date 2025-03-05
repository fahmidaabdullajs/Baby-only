const fs = require("fs");
const mongoose = require("mongoose");
const flags = JSON.parse(fs.readFileSync("flag.json", "utf-8"));

const dbUri = "mongodb+srv://mahmudabdullax7:ttnRAhj81JikbEw8@cluster0.zwknjau.mongodb.net/GoatBotV2?retryWrites=true&w=majority&appName=Cluster0";

const userSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  usageCount: { type: Number, default: 0 },
});

const flagStatsSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  winCount: { type: Number, default: 0 },
});

const UserUsage =
  mongoose.models.UserUsage || mongoose.model("UserUsage", userSchema);
const FlagGameStats =
  mongoose.models.FlagGameStats ||
  mongoose.model("FlagGameStats", flagStatsSchema);

mongoose
  .connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

module.exports = {
  config: {
    name: "flag",
    version: "1.9",
    author: "MahMUD",
    countDown: 10,
    role: 0,
    category: "game",
    guide: {
      en: "{pn}"
    }
  },

  onReply: async function ({ api, event, Reply, usersData }) {
    const { flag, author } = Reply;
    const getCoin = 1000;
    const getExp = 121;
    const penaltyCoin = 300;
    const penaltyExp = 100;
    const userData = await usersData.get(event.senderID);

    if (event.senderID !== author) {
      return api.sendMessage("𝐓𝐡𝐢𝐬 𝐢𝐬 𝐧𝐨𝐭 𝐲𝐨𝐮𝐫 𝐟𝐥𝐚𝐠 𝐛𝐚𝐛𝐲 >🐸", event.threadID, event.messageID);
    }

    const reply = event.body.toLowerCase();
    if (reply === flag.toLowerCase()) {
      try {
        await api.unsendMessage(Reply.messageID);
        userData.money += getCoin;
        userData.exp += getExp;
        await usersData.set(event.senderID, userData);

        await FlagGameStats.findOneAndUpdate(
          { userID: event.senderID },
          { $inc: { winCount: 1 } },
          { upsert: true, new: true }
        );

        api.sendMessage(
          `✅ | Correct answer baby.\nYou have earned ${getCoin} coins and ${getExp} exp.`,
          event.threadID,
          event.messageID
        );
      } catch (err) {
        console.log("Error:", err.message);
      }
    } else {
      await api.unsendMessage(Reply.messageID);
      userData.money -= penaltyCoin;
      userData.exp -= penaltyExp;
      await usersData.set(event.senderID, userData);

      api.sendMessage(
        `❌ | Wrong Answer!\nYou lost ${penaltyCoin} coins & ${penaltyExp} exp.\nCorrect answer was: ${flag}`,
        event.threadID,
        event.messageID
      );
    }
  },

  onStart: async function ({ api, args, event, usersData }) {
    try {
      const { senderID } = event;
      if (args[0] === "list") {
        const flagStats = await FlagGameStats.find().sort({ winCount: -1 });

        if (flagStats.length === 0) {
          return api.sendMessage("No one has won the flag game yet!", event.threadID, event.messageID);
        }

        let message = "👑 Flag Game Rankings:\n\n";
        let index = 0;
        for (const stats of flagStats) {
          const userName = await usersData.getName(stats.userID);
          message += `${index + 1}. ${userName}: ${stats.winCount} wins\n`;
          index++;
        }

        return api.sendMessage(message, event.threadID, event.messageID);
      }

      const maxLimit = 15;
      const attemptTimeLimit = 10 * 60 * 60 * 1000;
      const currentTime = Date.now();
      const userData = await usersData.get(senderID);

      if (!userData.data.flagAttempts) {
        userData.data.flagAttempts = { count: 0, firstAttempt: currentTime };
      }

      const timeElapsed = currentTime - userData.data.flagAttempts.firstAttempt;
      if (timeElapsed >= attemptTimeLimit) {
        userData.data.flagAttempts = { count: 0, firstAttempt: currentTime };
      }

      if (userData.data.flagAttempts.count >= maxLimit) {
        const timeLeft = attemptTimeLimit - timeElapsed;
        const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        return api.sendMessage(
          `❌ | You have reached your maximum attempts limit of attempts. Please try again later Time left: ${hoursLeft}h ${minutesLeft}m.`,
          event.threadID,
          event.messageID
        );
      }

      userData.data.flagAttempts.count++;
      await usersData.set(senderID, userData);

      const randomFlag = flags[Math.floor(Math.random() * flags.length)];

      api.sendMessage(
        {
          body: "🌍 A random flag has appeared! Guess the flag name.",
          attachment: await global.utils.getStreamFromURL(randomFlag.imgurLink)
        },
        event.threadID,
        (error, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            type: "reply",
            messageID: info.messageID,
            author: event.senderID,
            flag: randomFlag.name
          });

          setTimeout(() => {
            api.unsendMessage(info.messageID);
          }, 40000);
        },
        event.messageID
      );
    } catch (error) {
      console.error(`Error: ${error.message}`);
      api.sendMessage(`Error: ${error.message}`, event.threadID, event.messageID);
    }
  }
};
