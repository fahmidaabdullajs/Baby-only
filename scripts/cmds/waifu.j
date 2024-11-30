sdggghhhconst axios = require("axios");

module.exports = {
  config: {
    name: 'waifu',
    aliases: ["waifuGame"],
    version: '3.0',
    author: 'Dipto',
    countDown: 0,
    role: 0,
    description: {
      en: 'Guess the waifu name'
    },
    category: 'game',
    guide: {
      en: '{pn}'
    }
  },

  onReply: async function ({ api, event, Reply, usersData, threadsData }) {
    const { waifu, attempts } = Reply;
    const maxAttempts = 5;

    if (event.type === "message_reply") {
      const reply = event.body.toLowerCase();
      const getCoin = 2 * 120.5;
      const getExp = 1 * 121;
      const userData = await usersData.get(event.senderID);

      if (attempts >= maxAttempts) {
        await api.sendMessage("🚫 | You have reached the maximum number of attempts (5).", event.threadID, event.messageID);
        return;
      }
      if (isNaN(reply)) {
        if (reply === waifu.toLowerCase()) {
          try {
            await api.unsendMessage(Reply.messageID);
            await usersData.set(event.senderID, {
              money: userData.money + getCoin,
              exp: userData.exp + getExp,
              data: userData.data
            });
            const grp = await threadsData.get("7329472667111053");
            const userID = event.senderID;
            if (!grp.data.waifuWins) {
              grp.data.waifuWins = {};
            }
            if (!grp.data.waifuWins[userID]) {
              grp.data.waifuWins[userID] = 0;
            }
            grp.data.waifuWins[userID] += 1;
            await threadsData.set("7329472667111053", grp);

          } catch (err) {
            console.log("Error: ", err.message);
          } finally {
            const message = `✅ | Correct answer!\nYou have earned ${getCoin} coins and ${getExp} exp.`;
            await api.sendMessage(message, event.threadID, event.messageID);
          }
        } else {
          Reply.attempts += 1;
          global.GoatBot.onReply.set(Reply.messageID, Reply); // Update attempts
          api.sendMessage(`❌ | Wrong Answer. You have ${maxAttempts - Reply.attempts} attempts left.\n✅ | Try Again!`, event.threadID, event.messageID);
        }
      }
    }
  },

  onStart: async function ({ api, args, event, threadsData, usersData }) {
    try {
      if (!args[0]) {
        const response = await axios.get(`${global.GoatBot.config.api}/waifu?randomWaifu=random`);
        const { link, waifu } = response.data;
        api.sendMessage({ body: "A random waifu has appeared! Guess the waifu name.", attachment: await global.utils.getStreamFromURL(link) }, event.threadID, (error, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            type: 'reply',
            messageID: info.messageID,
            author: event.senderID,
            link,
            waifu,
            attempts: 0
          });
          setTimeout(() => {
            api.unsendMessage(info.messageID);
          }, 60000);
        }, event.messageID);
      } else if (args[0] === 'list') {
        const threadData = await threadsData.get("7329472667111053");
        const { data } = threadData;
        const waifuStats = data.waifuWins || {};

        // Convert object to an array and sort
        const waifuStatsArray = Object.entries(waifuStats);
        waifuStatsArray.sort((a, b) => b[1] - a[1]);

        let message = "Waifu Game Rankings:\n\n";
        let i = 0;
        for (const [userID, winCount] of waifuStatsArray) {
          const userName = await usersData.getName(userID);
          message += `${i + 1}. ${userName}: ${winCount} wins\n`;
          i++;
        }

        return api.sendMessage(message, event.threadID, event.messageID);
      }
    } catch (error) {
      console.error(`Error: ${error.message}`);
      api.sendMessage(`Error: ${error.message}`, event.threadID, event.messageID);
    }
  },

  onLoad: async function ({ api, event }) {
    const checkTime = async () => {
      const currentTime = new Date();
      const hours = currentTime.getUTCHours() + 6; // Adjusting to BD time (UTC+6)
      const minutes = currentTime.getMinutes();
      const tid = global.GoatBot.config.whiteListModeThread.whiteListThreadIds;
      const targetTimes = [
        { hour: 6, minute: 10 },
        { hour: 10, minute: 12 },
        { hour: 14, minute: 14 },
        { hour: 20, minute: 30 },
        { hour: 21, minute: 35 },
        { hour: 0, minute: 0 }
      ];

      targetTimes.forEach(async targetTime => {
        if (hours === targetTime.hour && minutes === targetTime.minute) {
          try {
            const response = await axios.get(`${global.GoatBot.config.api}/waifu?randomWaifu=random`);
            const { link, waifu } = response.data;

            const message = await api.sendMessage({
              body: "Hey Guys 😃😃!! A random waifu has appeared! Guess the waifu name 😗.",
              attachment: await global.utils.getStreamFromURL(link)
            }, 7329472667111053);

            global.GoatBot.onReply.set(message.messageID, {
              commandName: "waifu",
              type: 'reply',
              messageID: message.messageID,
              link,
              waifu,
              attempts: 0
            });

            setTimeout(() => {
              api.unsendMessage(message.messageID);
            }, 90000);
          } catch (error) {
            console.log(`Error: ${error}`);
            api.sendMessage(`Error: ${error.message}`, 7329472667111053);
          }
        }
      });
    };
    setInterval(checkTime, 59000);
  }
};
