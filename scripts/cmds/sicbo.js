module.exports = {
  config: {
    name: "sicbo",
    aliases: ["sic"],
    version: "1.0",
    author: "Loid Butter",
    countDown: 10,
    role: 0,
    shortDescription: "Play Sicbo, the oldest gambling game",
    longDescription: "Play Sicbo, the oldest gambling game, and earn money",
    category: "game",
    guide: "{pn} <Small/Big> <amount of money>"
  },

  onStart: async function ({ args, message, usersData, event }) {
    const betType = args[0];
    const betAmount = parseInt(args[1]);
    const user = event.senderID;
    const userData = await usersData.get(event.senderID);

    // Check for valid bet type (Small or Big)
    if (!["small", "big"].includes(betType)) {
      return message.reply("🙊 | Choose 'small' or 'big'.");
    }

    // Check for valid bet amount (at least 50)
    if (!Number.isInteger(betAmount) || betAmount < 50) {
      return message.reply("❌ | Please bet an amount of 50 or more.");
    }

    // Check for bet amount exceeding the user's available money
    if (betAmount > userData.money) {
      return message.reply("❌ | You don't have enough money to make that bet.");
    }

    // Check for bet amount exceeding the maximum limit (50,000)
    if (betAmount > 50000) {
      return message.reply("❌ | The maximum bet amount is 50,000.");
    }

    const dice = [1, 2, 3, 4, 5, 6];
    const results = [];

    for (let i = 0; i < 3; i++) {
      const result = dice[Math.floor(Math.random() * dice.length)];
      results.push(result);
    }

    const winConditions = {
      small: results.filter((num, index, arr) => num >= 1 && num <= 3 && arr.indexOf(num) !== index).length > 0,
      big: results.filter((num, index, arr) => num >= 4 && num <= 6 && arr.indexOf(num) !== index).length > 0,
    };

    const resultString = results.join(" | ");

    // Adjusted winning condition to set a 20% chance of winning overall (80% chance of losing)
    const winChance = Math.random() <= 0.2; // 20% chance of winning overall

    if ((winConditions[betType] && winChance) || (!winConditions[betType] && !winChance)) {
      const winAmount = 1 * betAmount;
      userData.money += winAmount;
      await usersData.set(event.senderID, userData);
      return message.reply(`(\\_/)\n( •_•)\n// >[ ${resultString} ]\n\n🎉 | Congratulations! You won ${winAmount}!`);
    } else {
      userData.money -= betAmount;
      await usersData.set(event.senderID, userData);
      return message.reply(`(\\_/)\n( •_•)\n// >[ ${resultString} ]\n\n😿 | You lost ${betAmount}.`);
    }
  }
};
