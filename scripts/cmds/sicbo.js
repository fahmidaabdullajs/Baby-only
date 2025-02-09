module.exports = {
  config: {
    name: "sicbo",
    version: "1.7",
    author: "Loid Butter",
    countDown: 10,
    role: 0,
    category: "game",
    guide: "{pn} <Small/Big> <amount of money>",
  },

  onStart: async function ({ args, message, usersData, event }) {
    const { senderID } = event;
    const maxlimit = 10; 
    const sicboTimeLimit = 12 * 60 * 60 * 1000; 
    const currentTime = Date.now();

    const userData = await usersData.get(senderID);

    if (!userData.data.sicbos) {
      userData.data.sicbos = { count: 0, firstSicbo: currentTime };
    }

    const timeElapsed = currentTime - userData.data.sicbos.firstSicbo;

    if (timeElapsed >= sicboTimeLimit) {
      userData.data.sicbos = { count: 0, firstSicbo: currentTime };
    }

    if (userData.data.sicbos.count >= maxlimit) {
      const timeLeft = sicboTimeLimit - timeElapsed;
      const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

      return message.reply(
        `❌ | 𝐘𝐨𝐮 𝐡𝐚𝐯𝐞 𝐫𝐞𝐚𝐜𝐡𝐞𝐝 𝐲𝐨𝐮𝐫 𝐪𝐮𝐢𝐳 𝐥𝐢𝐦𝐢𝐭 𝐨𝐟 𝐦𝐚𝐱𝐚𝐭𝐭𝐞𝐦𝐩𝐭𝐬. 𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐢𝐧 ${hoursLeft}𝐡 ${minutesLeft}𝐦.`
      );
    }

    userData.data.sicbos.count++;
    await usersData.set(senderID, userData);

    const betType = args[0]?.toLowerCase();
    const betAmount = parseInt(args[1]);

    if (!["small", "big"].includes(betType)) {
      return message.reply("❌ | Choose 'small' or 'big'.");
    }

    if (!Number.isInteger(betAmount) || betAmount < 50) {
      return message.reply("❌ | Please bet an amount of 50 or more.");
    }

    if (betAmount > userData.money) {
      return message.reply("❌ | You don't have enough money to make that bet.");
    }

    if (betAmount > 1000000) {
      return message.reply("❌ | The maximum bet amount is 1000000.");
    }

    const dice = [1, 2, 3, 4, 5, 6];
    const results = [];

    for (let i = 0; i < 3; i++) {
      const result = dice[Math.floor(Math.random() * dice.length)];
      results.push(result);
    }

    const total = results.reduce((a, b) => a + b, 0);
    const isTriple = results[0] === results[1] && results[1] === results[2]; 

    const winConditions = {
      small: total >= 4 && total <= 10 && !isTriple, 
      big: total >= 11 && total <= 17 && !isTriple, 
    };

    const resultString = results.join(" | ");

    const loseChance = Math.random() < 0.5; 
    const playerWins = winConditions[betType] && !loseChance;

    if (playerWins) {
      const winAmount = betAmount * 2;
      userData.money += winAmount;
      await usersData.set(senderID, userData);
      return message.reply(
        `(\\_/)\n( •_•)\n/ >🎀 [ ${resultString} ]\n\n😍 | Baby, You won ${formatMoney(winAmount)}!`
      );
    } else {
      userData.money -= betAmount;
      await usersData.set(senderID, userData);
      return message.reply(
        `(\\_/)\n( •_•)\n/ >🎀 [ ${resultString} ]\n\n🥹 | Baby, You lost ${formatMoney(betAmount)}.`
      );
    }
  },
};

function formatMoney(num) {
  const units = ["", "𝐊", "𝐌", "𝐁", "𝐓", "𝐐", "𝐐𝐢", "𝐒𝐱", "𝐒𝐩", "𝐎𝐜", "𝐍", "𝐃"];
  let unit = 0;

  while (num >= 1000 && unit < units.length - 1) {
    num /= 1000;
    unit++;
  }

  return (num % 1 === 0 ? num : num.toFixed(1)) + units[unit];
}
