const axios = require("axios");
const mongoose = require("mongoose");

// MongoDB URI for your database
const dbUri =
  "mongodb+srv://mahmudabdullax7:ttnRAhj81JikbEw8@cluster0.zwknjau.mongodb.net/GoatBotV2?retryWrites=true&w=majority&appName=Cluster0";

// MongoDB Schema to track user usage
const userSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  usageCount: { type: Number, default: 0 },
});

// MongoDB Schema for Flag Game Stats
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

const baseApiUrl = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json"
  );
  return base.data.api;
};

module.exports = {
  config: {
    name: "flag",
    aliases: ["flagGame"],
    version: "3.0",
    author: "Dipto",
    countDown: 18,
    role: 0,
    description: {
      en: "Guess the flag name",
    },
    category: "game",
    guide: {
      en: "{pn}",
    },
  },
  onReply: async function ({ api, event, Reply, usersData, threadsData }) {
    const { country, author, count, maxlimit } = Reply;
    const penaltyCoin = 300;
    const penaltyExp = 121;
    if (event.senderID !== author) return;
    if (event.type == "message_reply") {
      const reply = event.body.toLowerCase();
      const getCoin = 500;
      const getExp = 121;
      const userData = await usersData.get(event.senderID);

      if (reply == country.toLowerCase()) {
        try {
          await api.unsendMessage(Reply.messageID);
          await usersData.set(event.senderID, {
            money: userData.money + getCoin,
            exp: userData.exp + getExp,
            data: userData.data,
          });

          let userStats = await FlagGameStats.findOne({
            userID: event.senderID,
          });
          if (!userStats) {
            userStats = new FlagGameStats({
              userID: event.senderID,
              winCount: 1,
            });
          } else {
            userStats.winCount += 1;
          }
          await userStats.save();
        } catch (err) {
          console.log("Error: ", err.message);
        } finally {
          const message = `✅ | Correct answer!\nYou have earned ${getCoin} coins and ${getExp} exp.\nYou have used ${count} of your ${maxlimit} daily attempts limit.`;
          await api.sendMessage(message, event.threadID, event.messageID);
        }
      } else {
        await api.unsendMessage(Reply.messageID);
        await usersData.set(event.senderID, {
          money: userData.money - penaltyCoin,
          exp: userData.exp - penaltyExp,
          data: userData.data,
        });
        await api.sendMessage(
          `❌ | Wrong Answer.\nYou lost ${penaltyCoin} coin & ${penaltyExp} exp.\ncorrect answer was: ${country}\nYou have used ${count} of your ${maxlimit} daily attempts limit.`,
          event.threadID,
          event.messageID
        );
      }
    }
  },

  onStart: async function ({ api, args, event, threadsData, usersData }) {
    try {
      const { senderID } = event;
      let userStats = await UserUsage.findOne({ userID: senderID });
      if (!userStats) {
        userStats = new UserUsage({ userID: senderID, usageCount: 0 });
      }

      userStats.usageCount += 1;
      await userStats.save();

      if (!args[0]) {
        const maxlimit = 15;
        const attemptTimeLimit = 12 * 60 * 60 * 1000;  
        const currentTime = Date.now();
        const userData = await usersData.get(senderID);
        
        if (!userData.data.flagAttempts) {
          userData.data.flagAttempts = { count: 0, firstAttempt: currentTime };
        }
    
        const timeElapsed = currentTime - userData.data.flagAttempts.firstAttempt;
    
        if (timeElapsed >= attemptTimeLimit) {
          userData.data.flagAttempts = { count: 0, firstAttempt: currentTime };
        }
    
        if (userData.data.flagAttempts.count >= maxlimit) {
          const timeLeft = attemptTimeLimit - timeElapsed;
          const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
          const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          return api.sendMessage(
            `❌ | You have reached your maximum attempts limit of ${maxlimit} attempts. Please try again later. Time left: ${hoursLeft}h ${minutesLeft}m.`,
            event.threadID,
            event.messageID
          );
        }

        userData.data.flagAttempts.count++;
        await usersData.set(senderID, userData);
        const response = await axios.get(
          `${await baseApiUrl()}/flagGame?randomFlag=random`
        );
        const { link, country } = response.data;

        api.sendMessage(
          {
            body: "A random flag has appeared! Guess the flag.",
            attachment: await global.utils.getStreamFromURL(link),
          },
          event.threadID,
          (error, info) => {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: this.config.name,
              type: "reply",
              messageID: info.messageID,
              author: event.senderID,
              link,
              maxlimit,
              count: userData.data.flagAttempts.count,
              country,
            });
            setTimeout(() => {
              api.unsendMessage(info.messageID);
            }, 25000);
          },
          event.messageID
        );
      } else if (args[0] === "list") {
        const flagStats = await FlagGameStats.find().sort({ winCount: -1 });

        let message = "👑 Flag Game Rankings:\n\n";
        let index = 0;
        for (const stats of flagStats) {
          const userName = await usersData.getName(stats.userID);
          message += `${index + 1}. ${userName}: ${stats.winCount} wins\n`;
          index++;
        }

        return api.sendMessage(message, event.threadID, event.messageID);
      }
    } catch (error) {
      console.log(`Error: ${error}`);
      api.sendMessage(
        `Error: ${error.message}`,
        event.threadID,
        event.messageID
      );
    }
  },
};
