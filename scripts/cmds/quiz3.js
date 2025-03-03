const fs = require("fs");
const mongoose = require("mongoose");

// MongoDB Connection
const dbUri = "mongodb+srv://mahmudabdullax7:ttnRAhj81JikbEw8@cluster0.zwknjau.mongodb.net/GoatBotV2?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// MongoDB Schema for Quiz Stats
const quizStatsSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  correctAnswers: { type: Number, default: 0 },
  incorrectAnswers: { type: Number, default: 0 }
});
const QuizGameStats = mongoose.models.QuizGameStats || mongoose.model("QuizGameStats", quizStatsSchema);

// Load Quiz Data from JSON
const quizData = JSON.parse(fs.readFileSync("quiz.json", "utf-8"));

// Get Random Question from JSON
function getQuiz(category) {
  const questions = quizData.categories[category];
  if (!questions || questions.length === 0) return null;
  return questions[Math.floor(Math.random() * questions.length)];
}

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
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event, usersData, args }) {
    if (args[0] === "list") {
      const quizStats = await QuizGameStats.find({ correctAnswers: { $gt: 0 } }).sort({ correctAnswers: -1 });
      let message = "👑 Quiz Game Rankings:\n\n";
      let index = 0;
      for (const stats of quizStats) {
        const userName = await usersData.getName(stats.userID);
        if (userName) {
          message += `${index + 1}. ${userName}: ${stats.correctAnswers} wins\n`;
        } else {
          message += `User with ID ${stats.userID}: ${stats.correctAnswers} wins\n`;     
        }
        index++;
      }
      return api.sendMessage(message, event.threadID, event.messageID);
    }

    const input = args.join("").toLowerCase() || "bn";
    const category = input === "en" || input === "english" ? "english" : "bangla";

    const quiz = getQuiz(category);
    if (!quiz) {
      return api.sendMessage("❌ No quiz available for this category.", event.threadID, event.messageID);
    }

    const { senderID } = event;
    const maxlimit = 15;
    const attemptTimeLimit = 12 * 60 * 60 * 1000;  // 12 hours
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
  event.messageID);
    }

    userData.data.attempts.count++;
    await usersData.set(senderID, userData);

    const { question, correctAnswer, options } = quiz;
    const { a, b, c, d } = options;
    const quizMsg = {
      body: `\n╭──✦ ${question}\n├‣ 𝗔) ${a}\n├‣ 𝗕) ${b}\n├‣ 𝗖) ${c}\n├‣ 𝗗) ${d}\n╰──────────────────‣\n𝐑𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡 𝐲𝐨𝐮𝐫 𝐚𝐧𝐬𝐰𝐞𝐫.`,
    };

    api.sendMessage(quizMsg, event.threadID, (error, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        type: "reply",
        commandName: this.config.name,
        author: senderID,
        messageID: info.messageID,
        correctAnswer
      });

      // Add timeout to unsend the message after 20 seconds
      setTimeout(() => {
        api.unsendMessage(info.messageID);
      }, 20000);
    }, event.messageID);
  },

  onReply: async function ({ event, api, Reply, usersData }) {
    const { correctAnswer, author } = Reply;
    if (event.senderID !== author) return api.sendMessage("𝐓𝐡𝐢𝐬 𝐢𝐬 𝐧𝐨𝐭 𝐲𝐨𝐮𝐫 𝐪𝐮𝐢𝐳 𝐛𝐚𝐛𝐲 >🐸", event.threadID, event.messageID);

    let userReply = event.body.toLowerCase();
    if (userReply === correctAnswer.toLowerCase()) {
      await api.unsendMessage(Reply.messageID);

      let rewardCoins = 1000;
      let rewardExp = 121;
      let userData = await usersData.get(author);
      await usersData.set(author, {
        money: userData.money + rewardCoins,
        exp: userData.exp + rewardExp,
        data: userData.data
      });

      const quizStats = await QuizGameStats.findOne({ userID: author });
      if (quizStats) {
        quizStats.correctAnswers += 1;
        await quizStats.save();
      } else {
        await QuizGameStats.create({ userID: author, correctAnswers: 1 });
      }

      api.sendMessage(`✅ | Correct answer baby\nYou earned ${rewardCoins} coins & ${rewardExp} exp.`, event.threadID, event.messageID);
    } else {
      await api.unsendMessage(Reply.messageID);

      const penaltyCoins = 500;
      const penaltyExp = 121;
      let userData = await usersData.get(author);
      await usersData.set(author, {
        money: userData.money - penaltyCoins,
        exp: userData.exp - penaltyExp,
        data: userData.data
      });

      const quizStats = await QuizGameStats.findOne({ userID: author });
      if (quizStats) {
        quizStats.incorrectAnswers += 1;
        await quizStats.save();
      } else {
        await QuizGameStats.create({ userID: author, incorrectAnswers: 1 });
      }

      api.sendMessage(`❌ | Wrong answer baby\nYou lost ${penaltyCoins} coin & ${penaltyExp} exp.\nThe correct answer was: ${correctAnswer}`, event.threadID, event.messageID);
    }
  }
};
