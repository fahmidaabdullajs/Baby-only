const fs = require("fs");
const mongoose = require("mongoose");

// Load anime quiz data
const animeQuiz = JSON.parse(fs.readFileSync("animequiz.json", "utf-8"));

// MongoDB Connection
mongoose.connect("mongodb+srv://mahmudabdullax7:ttnRAhj81JikbEw8@cluster0.zwknjau.mongodb.net/GoatBotV2?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Access MongoDB database
const db = mongoose.connection.db;

module.exports = {
  config: {
    name: "animequiz",
    aliases: ["aniqz"],
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
    const { quiz } = Reply;
    const getCoin = 1000;
    const getExp = 121;
    const penaltyCoin = 300;
    const penaltyExp = 100;
    const userData = await usersData.get(event.senderID);

    if (event.type === "message_reply") {
      const reply = event.body.toLowerCase();

      if (isNaN(reply)) {
        if (reply === quiz.toLowerCase()) {
          try {
            await api.unsendMessage(Reply.messageID);
            await usersData.set(event.senderID, {
              money: userData.money + getCoin,
              exp: userData.exp + getExp
            });

            // Increment win count for correct answer in MongoDB
            await db.collection('animeQuizStats').updateOne(
              { userID: event.senderID }, // Match the user by ID
              { $inc: { correctAnswers: 1 } }, // Increment the correct answer count by 1
              { upsert: true } // Insert if the document doesn't exist
            );

            const message = `✅ | Correct answer!\nYou have earned ${getCoin} coins and ${getExp} exp.`;
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
            `❌ | Wrong Answer.\nYou lost ${penaltyCoin} coins & ${penaltyExp} exp.\nCorrect answer was: ${quiz}`,
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
        // Pick a random quiz from the JSON file
        const randomQuiz = animeQuiz[Math.floor(Math.random() * animeQuiz.length)];

        api.sendMessage(
          { 
            body: "A random anime quiz question has appeared! Guess the anime name.", 
            attachment: await global.utils.getStreamFromURL(randomQuiz.imgurLink) 
          },
          event.threadID,
          (error, info) => {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: this.config.name,
              type: "reply",
              messageID: info.messageID,
              author: event.senderID,
              quiz: randomQuiz.name,
              link: randomQuiz.imgurLink
            });
            setTimeout(() => {
              api.unsendMessage(info.messageID);
            }, 40000);
          },
          event.messageID
        );
      } else if (args[0] === "list") {
        // Fetch rankings from MongoDB based on correctAnswers
        const quizStats = await db.collection('animeQuizStats')
          .find({ correctAnswers: { $gte: 0 } }) // Only consider wins
          .sort({ correctAnswers: -1 }) // Sort by correctAnswers in descending order
          .toArray();

        if (quizStats.length === 0) {
          return api.sendMessage("No rankings available yet.", event.threadID, event.messageID);
        }

        let message = "👑 Anime Quiz Game Rankings:\n\n";
        let index = 1;

        for (const stats of quizStats) {
          try {
            const userName = await usersData.getName(stats.userID);
            message += `${index}. ${userName || `User ID ${stats.userID}`}: ${stats.correctAnswers || 0} wins\n`;
          } catch (error) {
            console.error(`Error fetching username for ID ${stats.userID}:`, error);
            message += `${index}. User ID ${stats.userID}: ${stats.correctAnswers || 0} wins\n`;
          }
          index++;
        }

        return api.sendMessage(message, event.threadID, event.messageID);
      }
    } catch (error) {
      console.error(`Error: ${error.message}`);
      api.sendMessage(`Error: ${error.message}`, event.threadID, event.messageID);
    }
  }
};
