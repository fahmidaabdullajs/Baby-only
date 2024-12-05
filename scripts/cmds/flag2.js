const axios = require("axios");

module.exports = {
  config: {
    name: 'flag',
    aliases: ["flagGame"],
    version: '3.0',
    author: 'Dipto',
    countDown: 0,
    role: 0,
    description: {
      en: 'Guess the flag name'
    },
    category: 'game',
    guide: {
      en: '{pn}'
    }
  },

  onReply: async function ({ api, event, Reply, usersData, threadsData }) {
    const { country, attempts } = Reply;
    const maxAttempts = 1;
    const wrongCoinDeduction = 100;  // Penalty for wrong answer
    const wrongExpDeduction = 50;   // Penalty for wrong answer
    const finalPenaltyCoins = 300;  // Penalty for using all attempts
    const finalPenaltyExp = 121;    // Penalty for using all attempts

    if (event.type == "message_reply") {
      const reply = event.body.toLowerCase();
      const getCoin = 1 * 500;  // Reward for correct answer
      const getExp = 1 * 150;   // Reward for correct answer
      const userData = await usersData.get(event.senderID);

      // If user has reached max attempts
      if (attempts >= maxAttempts) {
        // Deduct 200 coins and 100 experience if max attempts are reached
        const penaltyCoins = finalPenaltyCoins;
        const penaltyExp = finalPenaltyExp;

        // Deduct coins and exp, then update user data
        await usersData.set(event.senderID, {
          money: userData.money - penaltyCoins,
          exp: userData.exp - penaltyExp,
          data: userData.data,
        });

        // Send the penalty message
        const incorrectMsg = `❌ | Wrong Answer baby.\nYou lost ${penaltyCoins} coin & ${penaltyExp} exp.\ncorrect answer was: ${country}\n✅ | Try agian`;

        // Auto unsend the previous message after a few seconds
        try {
          await api.unsendMessage(Reply.messageID);  // Unsend the previous message
          await api.sendMessage(incorrectMsg, event.threadID, event.messageID);  // Send the penalty message
        } catch (err) {
          console.log("Error unsending message: ", err.message);
        }

        return; // Exit after sending the penalty message
      }

      // Check if the answer is correct
      if (isNaN(reply)) {
        if (reply == country.toLowerCase()) {
          try {
            await api.unsendMessage(Reply.messageID);
            await usersData.set(event.senderID, {
              money: userData.money + getCoin,
              exp: userData.exp + getExp,
              data: userData.data
            });
            const grp = await threadsData.get("7460623087375340");
            const userID = event.senderID;
            if (!grp.data.flagWins) {
              grp.data.flagWins = {};
            }
            if (!grp.data.flagWins[userID]) {
              grp.data.flagWins[userID] = 0;
            }
            grp.data.flagWins[userID] += 1;
            await threadsData.set("7460623087375340", grp);
          } catch (err) {
            console.log("Error: ", err.message);
          } finally {
            const message = `✅ | Correct answer baby.\nYou have earned ${getCoin} coins and ${getExp} exp.`;
            await api.sendMessage(message, event.threadID, event.messageID);
          }
        } else {
          // Deduct penalty for wrong answer and increment attempt count
          const newMoney = Math.max(userData.money - wrongCoinDeduction, 0); // Ensure coins don't go negative
          const newExp = Math.max(userData.exp - wrongExpDeduction, 0);  // Ensure exp doesn't go negative

          // Update user data with the penalty deductions
          Reply.attempts += 1;
          global.GoatBot.onReply.set(Reply.messageID, Reply); // Update attempts

          await usersData.set(event.senderID, {
            money: newMoney,
            exp: newExp,
            data: userData.data
          });

          // Send penalty message to user
          api.sendMessage(`❌ | Wrong Answer. You have lost ${wrongCoinDeduction} coins and ${wrongExpDeduction} exp.\nYou have ${maxAttempts - Reply.attempts} attempts left.\n✅ | Try Again!`, event.threadID, event.messageID);
        }
      }
    }
  },

  onStart: async function ({ api, args, event, threadsData, usersData }) {
    try {
      if (!args[0]) {
        const response = await axios.get(`${global.GoatBot.config.api}/flagGame?randomFlag=random`);
        const { link, country } = response.data;
        api.sendMessage({ body: "A random flag has appeared! Guess the flag like this.", attachment: await global.utils.getStreamFromURL(link) }, event.threadID, (error, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            type: 'reply',
            messageID: info.messageID,
            author: event.senderID,
            link,
            country,
            attempts: 1 
          });
          setTimeout(() => {
            api.unsendMessage(info.messageID);
          }, 25000);
        }, event.messageID);
      } else if (args[0] == 'list') {
        const threadData = await threadsData.get("7460623087375340");
        const { data } = threadData;
        const flagStats = data.flagWins || {};

        //--object to an array --//
        const flagStatsArray = Object.entries(flagStats);

        flagStatsArray.sort((a, b) => b[1] - a[1]);

        let message = "👑 Flag Game Rankings:\n\n";
        for (const [userID, winCount] of flagStatsArray) {
          const userName = await usersData.getName(userID);
          message += `${userName}: ${winCount} wins\n`;
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
        { hour: 18, minute: 16 },
        { hour: 22, minute: 18 },
        { hour: 0, minute: 0 }
      ];

      targetTimes.forEach(async targetTime => {
        if (hours === targetTime.hour && minutes === targetTime.minute) {
          try {
            const response = await axios.get(`${global.GoatBot.config.api}/flagGame?randomFlag=random`);
            const { link, country } = response.data;
            tid.forEach(async threadID => {
              const message = await api.sendMessage({ body: "Hey Guys 😃😃!! A random flag has appeared! Guess the flag😗.", attachment: await global.utils.getStreamFromURL(link) }, threadID);

              global.GoatBot.onReply.set(message.messageID, {
                commandName: "flag",
                type: 'reply',
                messageID: message.messageID,
                link,
                country,
                attempts: 1
              });
            });
          } catch (error) {
            console.log(`Error: ${error}`);
            tid.forEach(threadID => {
              api.sendMessage(`Error: ${error.message}`, threadID);
            });
          }
        }
      });
    };
    setInterval(checkTime, 54000);
  }
};
