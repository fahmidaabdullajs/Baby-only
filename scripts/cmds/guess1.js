module.exports = {
    config: {
        name: "guess",
        version: "1.7",
        author: "MahMUD",
        role: 0,
        countDown: 10,
        category: "game",
        guide: "{prefix}guessnumber [your guess] [bet amount]\n{prefix}guessnumber rules"
    },

    formatMoney(num) {
        const units = ["", "𝐊", "𝐌", "𝐁", "𝐓", "𝐐"];
        let unit = 0;
        while (num >= 1000 && ++unit < units.length) num /= 1000;
        return num.toFixed(1).replace(/\.0$/, "") + units[unit];
    },

    onStart: async function ({ event, api, args, usersData }) {
        const { senderID } = event;
        const maxlimit = 15;
        const randomTimeLimit = 10 * 60 * 60 * 1000; // 12 hours in milliseconds
        const cooldownTime = 10 * 1000; // 10 seconds cooldown
        const currentTime = Date.now();
        let userData = await usersData.get(senderID);

        if (!userData.data.randoms) {
            userData.data.randoms = { count: 0, firstRandom: currentTime };
        }
        if (!userData.data.lastGuessTime) {
            userData.data.lastGuessTime = 0;
        }

        const timeSinceLastGuess = currentTime - userData.data.lastGuessTime;
        if (timeSinceLastGuess < cooldownTime) {
            const waitTime = ((cooldownTime - timeSinceLastGuess) / 1000).toFixed(1);
            return api.sendMessage(`⏳ | 𝐏𝐥𝐞𝐚𝐬𝐞 𝐰𝐚𝐢𝐭 ${waitTime} 𝐬𝐞𝐜𝐨𝐧𝐝𝐬 𝐛𝐞𝐟𝐨𝐫𝐞 𝐠𝐮𝐞𝐬𝐬𝐢𝐧𝐠 𝐚𝐠𝐚𝐢𝐧.`, event.threadID, event.messageID);
        }
        userData.data.lastGuessTime = currentTime;

        const timeElapsed = currentTime - userData.data.randoms.firstRandom;
        if (timeElapsed >= randomTimeLimit) {
            userData.data.randoms = { count: 0, firstRandom: currentTime };
        }

        if (userData.data.randoms.count >= maxlimit) {
            const timeLeft = randomTimeLimit - timeElapsed;
            const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

            return api.sendMessage(
                `❌ | 𝐘𝐨𝐮 𝐡𝐚𝐯𝐞 𝐫𝐞𝐚𝐜𝐡𝐞𝐝 𝐲𝐨𝐮𝐫 𝐠𝐮𝐞𝐬𝐬 𝐥𝐢𝐦𝐢𝐭. 𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐢𝐧 ${hoursLeft}𝐡 ${minutesLeft}𝐦.`,
                event.threadID,
                event.messageID
            );
        }

        if (args[0] && args[0].toLowerCase() === "rules") {
            return api.sendMessage(
                "𝐆𝐮𝐞𝐬𝐬 𝐍𝐮𝐦𝐛𝐞𝐫 𝐁𝐞𝐭𝐭𝐢𝐧𝐠 𝐑𝐮𝐥𝐞𝐬\n\n" +
                "1️⃣ Use the command: !guessnumber [your guess] [bet amount]\n" +
                "2️⃣ Guess a number between 1 and 3.\n" +
                "3️⃣ If your guess matches the bot's number, you win double the bet amount.\n" +
                "4️⃣ If your guess is incorrect, you lose the bet amount (but your balance won't go below 0).\n" +
                "5️⃣ Minimum bet is 1, maximum bet is 5M.\n" +
                "6️⃣ Example: !guessnumber 2 10000",
                event.threadID,
                event.messageID
            );
        }

        const userGuess = parseInt(args[0]);
        const betAmount = parseInt(args[1]);

        if (isNaN(userGuess) || userGuess < 1 || userGuess > 3) {
            return api.sendMessage("❌ | 𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐧𝐮𝐦𝐛𝐞𝐫 (𝟏-𝟑).", event.threadID, event.messageID);
        }

        if (!Number.isInteger(betAmount) || betAmount < 1) {
            return api.sendMessage("❌ | 𝐏𝐥𝐞𝐚𝐬𝐞 𝐛𝐞𝐭 𝐚𝐭 𝐥𝐞𝐚𝐬𝐭 𝟏 𝐜𝐨𝐢𝐧𝐬.", event.threadID, event.messageID);
        }

        if (betAmount > 5000000) {
            return api.sendMessage("❌ | 𝐓𝐡𝐞 𝐦𝐚𝐱𝐢𝐦𝐮𝐦 𝐛𝐞𝐭 𝐚𝐦𝐨𝐮𝐧𝐭 𝐢𝐬 5𝐌.", event.threadID, event.messageID);
        }

        if (betAmount > userData.money) {
            return api.sendMessage("❌ | 𝐘𝐨𝐮 𝐝𝐨𝐧'𝐭 𝐡𝐚𝐯𝐞 𝐞𝐧𝐨𝐮𝐠𝐡 𝐦𝐨𝐧𝐞𝐲 𝐭𝐨 𝐛𝐞𝐭 𝐭𝐡𝐚𝐭 𝐚𝐦𝐨𝐮𝐧𝐭.", event.threadID, event.messageID);
        }

        const randomNumber = Math.floor(Math.random() * 3) + 1;
        userData.data.randoms.count++;

        if (userGuess === randomNumber) {
            userData.money += betAmount * 2;
            await usersData.set(senderID, userData);
            return api.sendMessage(
                `╭‣ 𝐓𝐡𝐞 𝐧𝐮𝐦𝐛𝐞𝐫 𝐰𝐚𝐬: ${randomNumber}\n╰‣ 𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮 𝐰𝐨𝐧 ${this.formatMoney(betAmount * 2)} 😘`,
                event.threadID,
                event.messageID
            );
        } else {
            userData.money = Math.max(0, userData.money - betAmount);
            await usersData.set(senderID, userData);
            return api.sendMessage(
                `╭‣ 𝐓𝐡𝐞 𝐧𝐮𝐦𝐛𝐞𝐫 𝐰𝐚𝐬: ${randomNumber}\n╰‣ 𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮 𝐥𝐨𝐬𝐭 ${this.formatMoney(betAmount)} 🥺`,
                event.threadID,
                event.messageID
            );
        }
    }
};
