const axios = require("axios");
const mongoose = require('mongoose');

// MongoDB URI for your database
const dbUri = "mongodb+srv://mahmudabdullax7:ttnRAhj81JikbEw8@cluster0.zwknjau.mongodb.net/GoatBotV2?retryWrites=true&w=majority&appName=Cluster0";

// MongoDB Schema to track user usage
const userSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  usageCount: { type: Number, default: 0 }, // Number of times the user has used the command
  lastUsedDate: { type: String, default: "" }, // Track last date used
});

// Check if the model is already defined to prevent overwriting
const UserUsage = mongoose.models.UserUsage || mongoose.model('UserUsage', userSchema);

// MongoDB Connection
mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const baseApiUrl = async () => {
  const base = await axios.get(
    `https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json`
  );
  return base.data.api;
};

module.exports = {
  config: {
    name: "quiz",
    aliases: ["qz"],
    version: "1.0",
    author: "asif",
    countDown: 0,
    role: 0,
    category: "game",
    guide: "{p}quiz2 \n{pn}quiz2 bn \n{p}quiz2 en",
  },

  onStart: async function ({ api, event, usersData, args }) {
    const input = args.join('').toLowerCase() || "bn";
    let timeout = 300;  // Default timeout (in seconds)
    let category = "bangla";

    if (input === "bn" || input === "bangla") {
      category = "bangla";
    } else if (input === "en" || input === "english") {
      category = "english";
    }

    const senderID = event.senderID;
    const currentDate = new Date();
    const bstTime = currentDate.toLocaleString("en-US", { timeZone: "Asia/Dhaka" });
    const [dateString] = bstTime.split(","); // Get only the date portion: "MM/DD/YYYY"

    // Retrieve the user's daily slot usage statistics from MongoDB
    let userStats = await UserUsage.findOne({ userID: senderID });
    if (!userStats) {
      // Create a new entry if the user doesn't exist in the database
      userStats = new UserUsage({ userID: senderID, usageCount: 0, lastUsedDate: '' });
    }

    const { lastUsedDate, usageCount } = userStats;

    // If the date has changed (new day), reset the quiz count and update the lastUsedDate
    if (lastUsedDate !== dateString) {
      // It's a new day, reset quiz count
      userStats.lastUsedDate = dateString;
      userStats.usageCount = 1; // Start the new day with quiz count as 1
    } else {
      // It's the same day, so increment the quiz count
      userStats.usageCount += 1;
    }

    // If the user has reached the daily limit of 20 quizzes, prevent more attempts
    if (userStats.usageCount > 20) {
      return api.sendMessage("❌ | You have reached your daily quiz limit of 20 attempts, Please try again tomorrow.", event.threadID, event.messageID);
    }

    // Save the updated user data with the incremented quiz count
    await userStats.save();

    // Proceed with sending the quiz question if they haven't reached the limit
    try {
      const response = await axios.get(
        `${await baseApiUrl()}/quiz2?category=${category}&q=random`,
      );

      const quizData = response.data.question;
      const { question, correctAnswer, options } = quizData;
      const { a, b, c, d } = options;
      const namePlayerReact = await usersData.getName(event.senderID);
      const quizMsg = {
        body: `\n╭──✦ ${question}\n├‣ 𝗔) ${a}\n├‣ 𝗕) ${b}\n├‣ 𝗖) ${c}\n├‣ 𝗗) ${d}\n╰──────────────────‣\n𝚁𝚎𝚙𝚕𝚎 𝚝𝚘 𝚝𝚑𝚒𝚜 𝚖𝚎𝚜𝚜𝚊𝚐𝚎 𝚠𝚒𝚝𝚑 𝚢𝚘𝚞𝚛 𝚊𝚗𝚜𝚠𝚎𝚛.`,
      };

      api.sendMessage(
        quizMsg,
        event.threadID,
        (error, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            type: "reply",
            commandName: this.config.name,
            author: event.senderID,
            messageID: info.messageID,
            dataGame: quizData,
            correctAnswer,
            nameUser: namePlayerReact,
            attempts: 1
          });

          // Auto unsend the message after 15 seconds
          setTimeout(() => {
            api.unsendMessage(info.messageID);
          }, 15000);  // 15 seconds = 15000 milliseconds
        },
        event.messageID,
      );
    } catch (error) {
      console.error("❌ | Error occurred:", error);
      api.sendMessage(error.message, event.threadID, event.messageID);
    }
  },

  onReply: async ({ event, api, Reply, usersData }) => {
    const { correctAnswer, nameUser, author } = Reply;
    const senderID = event.senderID;
    let userStats = await UserUsage.findOne({ userID: senderID });
    const usedQuizzes = userStats ? userStats.usageCount : 0;

    if (event.senderID !== author)
      return api.sendMessage(
        "Who are you bby🐸🦎",
        event.threadID,
        event.messageID
      );

    const maxAttempts = 1;  // Only 1 attempt

    switch (Reply.type) {
      case "reply": {
        let userReply = event.body.toLowerCase();

        if (Reply.attempts > maxAttempts) {
          // Unsend the quiz message once the user exceeds max attempts
          await api.unsendMessage(Reply.messageID);

          // Deduct 250 coins and 121 experience if the user has used all attempts
          let userData = await usersData.get(author);
          let penaltyCoins = 150;
          let penaltyExp = 75;
          await usersData.set(author, {
            money: userData.money - penaltyCoins,
            exp: userData.exp - penaltyExp,
            data: userData.data,
          });

          const incorrectMsg = `🚫 | You have reached the maximum number of attempts (1).\nThe correct answer is: ${correctAnswer}\nYou have lost ${penaltyCoins} coin & ${penaltyExp} exp.\nYou have used ${usedQuizzes} of your 30 daily quizzes.`;
          return api.sendMessage(incorrectMsg, event.threadID, event.messageID);
        }

        if (userReply === correctAnswer.toLowerCase()) {
          await api.unsendMessage(Reply.messageID) // Unsend the quiz message on correct answer
          .catch(console.error);

          let rewardCoins = 500;
          let rewardExp = 121;
          let userData = await usersData.get(author);
          await usersData.set(author, {
            money: userData.money + rewardCoins,
            exp: userData.exp + rewardExp,
            data: userData.data,
          });

          let correctMsg = `✅ | Correct answer!\nYou have earned ${rewardCoins} coins and ${rewardExp} exp.\nYou have used ${usedQuizzes} of your 20 daily quizzes.`;
          api.sendMessage(correctMsg, event.threadID, event.messageID);
        } else {
          // Unsend the quiz message when the answer is wrong
          await api.unsendMessage(Reply.messageID)
          .catch(console.error);

          // Deduct penalty for incorrect answer attempt (first attempt)
          const penaltyCoins = 300; // Penalty coins for wrong answer
          const penaltyExp = 121;    // Penalty experience for wrong answer

          let userData = await usersData.get(author);
          await usersData.set(author, {
            money: userData.money - penaltyCoins,
            exp: userData.exp - penaltyExp,
            data: userData.data,
          });

          Reply.aAnswers += 1; // Only 1 attempt, no further chances
          global.GoatBot.onReply.set(Reply.messageID, Reply);
          api.sendMessage(
            `❌ | Wrong Answer baby.\nYou lost ${penaltyCoins} coin & ${penaltyExp} exp.\nThe correct answer is: ${correctAnswer}\nYou have used ${usedQuizzes} of your 20 daily quizzes.\n✅ | Try agian`,
          event.threadID,
          event.messageID,
        );
      }
      break;
    }
    default:
      break;
  }
  },
};
