const axios = require('axios');
const baseApiUrl = async()=>{
  const url = await axios.get("https://raw.githubusercontent.com/BlankId018/D1PT0/main/baseApiUrl.json");
  return url.data.api;
}

module.exports = {
  config: {
    name: "quiz2",
    aliases: ["qz2"],
    version: "1.0",
    author: "RUBISH",
    countDown: 0,
    role: 0,
    category: "game",
    guide: "{pn}",
  },

  onStart: async function ({ api, event, usersData, commandName }) {
    const { threadID, senderID } = event;

    const timeout = 300;

    try {
      const response = await axios.get(`${await baseApiUrl()}/quiz?q=random`);

      const quizData = response.data.quiz;
      const { quiz, answer } = quizData;
      const namePlayerReact = await usersData.getName(senderID);

      const quizMsg = {
        body: `
╭───✦ QUESTION ✦───
├‣ ${quiz}
╰──────────────────‣
Reply to this message with your answer.`,
      };

      api.sendMessage(quizMsg, threadID, async (error, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          type: "reply",
          commandName,
          author: senderID,
          messageID: info.messageID,
          answer,
          nameUser: namePlayerReact,
          attempts: 0
        });
        setTimeout(function () {
          api.unsendMessage(info.messageID);
        }, timeout * 1000);
      });
    } catch (error) {
      console.error("❌ | Error occurred:", error);
      const errorMsg = "❌ | Error occurred while fetching the quiz. Please try again later.";
      api.sendMessage(errorMsg, threadID);
    }
  },

  onReply: async function ({ event, api, Reply, usersData }) {
    const { answer, nameUser } = Reply;
    if (event.senderID !== Reply.author) return api.sendMessage("Who are you bby🐸🦎", event.threadID, event.messageID);
    const maxAttempts = 5;

    switch (Reply.type) {
      case "reply": {
        if (Reply.attempts >= maxAttempts) {
        await api.unsendMessage(Reply.messageID);
        const incorrectMsg = `
        🚫 | ${nameUser}, you have reached the maximum number of attempts (2).
        The correct answer is: ${answer}`;
                    api.sendMessage(incorrectMsg, event.threadID, event.messageID);
          return;
        }
        const userReply = event.body.toLowerCase();

        if (userReply === answer.toLowerCase()) {
 api.unsendMessage(Reply.messageID).catch(console.error);
          const rewardCoins = 300;
          const rewardExp = 100;
          const senderID = event.senderID;
          const userData = await usersData.get(senderID);
          await usersData.set(senderID, {
            money: userData.money + rewardCoins,
            exp: userData.exp + rewardExp,
            data: userData.data
          });
          const correctMsg = `
Congratulations, ${nameUser}! 🌟🎉

You're a Quiz Champion! 🏆

You've earned ${rewardCoins} Coins 💰 and ${rewardExp} EXP 🌟

Keep up the great work! 🚀`;
          api.sendMessage(correctMsg, event.threadID, event.messageID);
        } else {
          Reply.attempts += 1;
          global.GoatBot.onReply.set(Reply.messageID, Reply);
          api.sendMessage(`❌ | Wrong Answer. You have ${maxAttempts - Reply.attempts} attempts left.\n✅ | Try Again!`, event.threadID, event.messageID);
        }
       break;
      }
      default:

        break;
    }
  },
};
