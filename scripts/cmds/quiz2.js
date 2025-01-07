const axios = require("axios");
const mongoose = require('mongoose');

// MongoDB URI for your database
const dbUri = "mongodb+srv://mahmudabdullax7:ttnRAhj81JikbEw8@cluster0.zwknjau.mongodb.net/GoatBotV2?retryWrites=true&w=majority&appName=Cluster0";

// MongoDB Schema to track user usage
const userSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  usageCount: { type: Number, default: 0 },
  correctAnswersCount: { type: Number, default: 0 },  // Track correct answers
});

// MongoDB Schema for Quiz Game Stats (tracking wins)
const quizStatsSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  correctAnswers: { type: Number, default: 0 },
  incorrectAnswers: { type: Number, default: 0 },
});

const UserUsage = mongoose.models.UserUsage || mongoose.model('UserUsage', userSchema);
const QuizGameStats = mongoose.models.QuizGameStats || mongoose.model('QuizGameStats', quizStatsSchema);

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
    author: "ERROR",
    countDown: 10,
    role: 0,
    category: "game",
    guide: {
      en: '{pn}'
    }
  },

  onStart: async function ({ api, event, usersData, args }) {
    if (args[0] === 'list') {
      const quizStats = await QuizGameStats.find({ correctAnswers: { $gt: 0 } }).sort({ correctAnswers: -1 });
      let message = "👑 Quiz Game Rankings:\n\n";
      let index = 0;
      for (const stats of quizStats) {
        const userName = await usersData.getName(stats.userID);
        if (userName) {
          message += `${index + 1}. ${userName}: ${stats.correctAnswers} wins\n`;
        index++;
        } else {
          message += `User with ID ${stats.userID}: ${stats.correctAnswers} wins\n`;     
        }
      }
      api.sendMessage(message, event.threadID, event.messageID);
      return;
    }
    const input = args.join("").toLowerCase() || "bn";
    let category = "bangla";

    if (input === "bn" || input === "bangla") {
      category = "bangla";
    } else if (input === "en" || input === "english") {
      category = "english";
    }

    const { senderID } = event;
    const maxlimit = 15;
    const attemptTimeLimit = 12 * 60 * 60 * 1000;  // 24 hours in milliseconds
    const currentTime = Date.now();
    const userData = await usersData.get(senderID);
    
    if (!userData.data.attempts) {
      userData.data.attempts = { count: 0, firstAttempt: currentTime };
    }

    const timeElapsed = currentTime - userData.data.attempts.firstAttempt;

    if (timeElapsed >= attemptTimeLimit) {
      userData.data.attempts = { count: 0, firstAttempt: currentTime };
    }

    if (userData.data.attempts.count >= maxlimit) {
      const timeLeft = attemptTimeLimit - timeElapsed;
      const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

      return api.sendMessage(
        `❌ | 𝐘𝐨𝐮 𝐡𝐚𝐯𝐞 𝐫𝐞𝐚𝐜𝐡𝐞𝐝 𝐲𝐨𝐮𝐫 𝐪𝐮𝐢𝐳 𝐥𝐢𝐦𝐢𝐭 𝐨𝐟 𝐦𝐚𝐱𝐚𝐭𝐭𝐞𝐦𝐩𝐭𝐬. 𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐢𝐧 ${hoursLeft}𝐡 ${minutesLeft}𝐦.`,
        event.threadID,
        event.messageID
      );
    }

    userData.data.attempts.count++;
    await usersData.set(senderID, userData);

    try {
      const response = await axios.get(
        `${await baseApiUrl()}/quiz2?category=${category}&q=random`
      );

      const quizData = response.data.question;
      const { question, correctAnswer, options } = quizData;
      const { a, b, c, d } = options;
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
            author: senderID,
            messageID: info.messageID,
            correctAnswer,
            count: userData.data.attempts.count,
            attempts: 1,
            maxlimit,
          });

          setTimeout(() => {
            api.unsendMessage(info.messageID);
          }, 20000);
        },
        event.messageID
      );
    } catch (error) {
      console.error("❌ | Error occurred:", error);
      api.sendMessage(error.message, event.threadID, event.messageID);
    }
  },

  onReply: async ({ event, api, Reply, usersData }) => {
    const { correctAnswer, author, count: usedQuizzes, maxlimit } = Reply;
    if (event.senderID !== author)
      return api.sendMessage(
        "Who are you bby🐸🦎",
        event.threadID,
        event.messageID
      );

    switch (Reply.type) {
      case "reply": {
        let userReply = event.body.toLowerCase();

        if (userReply === correctAnswer.toLowerCase()) {
          await api.unsendMessage(Reply.messageID).catch(console.error);

          let rewardCoins = 500;
          let rewardExp = 121;
          let userData = await usersData.get(author);
          await usersData.set(author, {
            money: userData.money + rewardCoins,
            exp: userData.exp + rewardExp,
            data: userData.data,
          });

          const quizStats = await QuizGameStats.findOne({ userID: author });
          if (quizStats) {
            quizStats.correctAnswers += 1;
            await quizStats.save();
          } else {
            await QuizGameStats.create({ userID: author, correctAnswers: 1 });
          }

          let correctMsg = `✅ | Correct answer!\nYou have earned ${rewardCoins} coins and ${rewardExp} exp.\nYou have used ${usedQuizzes} of your ${maxlimit} daily quizzes.`;
          api.sendMessage(correctMsg, event.threadID, event.messageID);
        } else {
          await api.unsendMessage(Reply.messageID).catch(console.error);

          const penaltyCoins = 300;
          const penaltyExp = 121;

          let userData = await usersData.get(author);
          await usersData.set(author, {
            money: userData.money - penaltyCoins,
            exp: userData.exp - penaltyExp,
            data: userData.data,
          });

          const quizStats = await QuizGameStats.findOne({ userID: author });
          if (quizStats) {
            quizStats.incorrectAnswers += 1;
            await quizStats.save();
          } else {
            await QuizGameStats.create({ userID: author, incorrectAnswers: 1 });
          }

          Reply.aAnswers += 1;
          global.GoatBot.onReply.set(Reply.messageID, Reply);
          api.sendMessage(
            `❌ | Wrong Answer baby.\nYou lost ${penaltyCoins} coin & ${penaltyExp} exp.\nThe correct answer is: ${correctAnswer}\nYou have used ${usedQuizzes} of your ${maxlimit} daily quizzes.\n✅ | Try again`,
            event.threadID,
            event.messageID
          );
        }
        break;
      }
      default:
        break;
    }
  },
};
