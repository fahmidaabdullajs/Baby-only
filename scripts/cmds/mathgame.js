module.exports = {
  config: {
    name: "mathgame",
    version: "1.7",
    author: "MahMUD",
    countDown: 10,
    category: "game",
  },

  onStart: async function ({ api, event, usersData }) {
    const { senderID, threadID } = event;
    const maxlimit = 15;
    const mathTimeLimit = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
    const currentTime = Date.now();
    let userData = await usersData.get(senderID);

    if (!userData.data.maths) {
      userData.data.maths = { count: 0, firstMath: currentTime };
    }

    const timeElapsed = currentTime - userData.data.maths.firstMath;

    if (timeElapsed >= mathTimeLimit) {
      userData.data.maths = { count: 0, firstMath: currentTime };
    }

    if (userData.data.maths.count >= maxlimit) {
      const timeLeft = mathTimeLimit - timeElapsed;
      const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

      return api.sendMessage(
        `❌ | 𝐘𝐨𝐮 𝐡𝐚𝐯𝐞 𝐫𝐞𝐚𝐜𝐡𝐞𝐝 𝐲𝐨𝐮𝐫 𝐪𝐮𝐢𝐳 𝐥𝐢𝐦𝐢𝐭 𝐨𝐟 𝐦𝐚𝐱𝐚𝐭𝐭𝐞𝐦𝐩𝐭𝐬. 𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐢𝐧 ${hoursLeft}𝐡 ${minutesLeft}𝐦.`,
        threadID
      );
    }

    function generateMathProblem() {
      const num1 = Math.floor(Math.random() * 10) + 1;
      let num2 = Math.floor(Math.random() * 10) + 1;
      const operators = ['+', '-', '×', '÷'];
      const operator = operators[Math.floor(Math.random() * operators.length)];
      
      let correctAnswer;
      
      if (operator === '÷') {
        while (num1 % num2 !== 0) {
          num2 = Math.floor(Math.random() * 9) + 1;
        }
        correctAnswer = num1 / num2;
      } else {
        switch (operator) {
          case '+': correctAnswer = num1 + num2; break;
          case '-': correctAnswer = num1 - num2; break;
          case '×': correctAnswer = num1 * num2; break;
        }
      }

      return { question: `${num1} ${operator} ${num2} = ?`, answer: correctAnswer };
    }

    const problem = generateMathProblem();
    const userName = (await usersData.get(senderID))?.name || "Player";

    api.sendMessage(`🎯 ${userName}, solve this: ${problem.question}`, threadID, (err, info) => {
      if (err) return console.error(err);

      global.GoatBot.onReply.set(info.messageID, {
        commandName: "mathgame",
        messageID: info.messageID,
        author: senderID,
        threadID: threadID,
        correctAnswer: problem.answer
      });

      // Increment user's attempt count
      userData.data.maths.count += 1;
      usersData.set(senderID, userData);
    });
  },

  onReply: async function ({ api, event, usersData }) {
    const { messageID, senderID, body, threadID } = event;

    const replyData = global.GoatBot.onReply.get(event.messageReply?.messageID);
    if (!replyData || replyData.commandName !== "mathgame") return;

    if (senderID !== replyData.author) {
      return api.sendMessage("❌ This is not your question to answer!", threadID);
    }

    const userAnswer = parseFloat(body.trim());
    const correctAnswer = replyData.correctAnswer;

    let userData = await usersData.get(senderID);

    const rewardCoins = 300;
    const rewardExp = 50;
    const penaltyCoins = 200;
    const penaltyExp = 100;

    if (!isNaN(userAnswer)) {
      if (userAnswer === correctAnswer) {
        await usersData.set(senderID, {
          money: userData.money + rewardCoins,
          exp: userData.exp + rewardExp,
          data: userData.data,
        });
        api.sendMessage(`✅ Correct answer! You win ${rewardCoins} coins & ${rewardExp} EXP.`, threadID);
      } else {
        await usersData.set(senderID, {
          money: userData.money - penaltyCoins,
          exp: userData.exp - penaltyExp,
          data: userData.data,
        });
        api.sendMessage(`❌ Wrong answer! You lost ${penaltyCoins} coins & ${penaltyExp} EXP.`, threadID);
      }
    } else {
      api.sendMessage("⚠ Please send a valid number.", threadID);
    }

    global.GoatBot.onReply.delete(replyData.messageID);
  },
};
