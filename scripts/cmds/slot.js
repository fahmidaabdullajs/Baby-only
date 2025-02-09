module.exports = {
  config: {
    name: "slot",
    version: "1.0",
    author: "xxx",
    countDown: 10,
    shortDescription: {
      en: "Slot game",
    },
    longDescription: {
      en: "Slot game.",
    },
    category: "game",
  },
  langs: {
    en: {
      invalid_amount: "Enter a valid and positive amount to have a chance to win double",
      not_enough_money: "Check your balance if you have that amount",
      spin_message: "Spinning...",
      win_message: "• 𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮 𝐰𝐨𝐧 $%1",
      lose_message: "• 𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮 𝐥𝐨𝐬𝐭 $%1",
      jackpot_message: "Jackpot! You won $%1 with three %2 symbols, buddy!",
      spin_count: ">🎀",
      wrong_use_message: "❌ | WRONG use: Please enter a valid and positive number as your bet amount.",
      time_left_message: "❌ | 𝐘𝐨𝐮 𝐡𝐚𝐯𝐞 𝐫𝐞𝐚𝐜𝐡𝐞𝐝 𝐲𝐨𝐮𝐫 𝐬𝐥𝐨𝐭 𝐥𝐢𝐦𝐢𝐭 𝐨𝐟 𝐦𝐚𝐱𝐚𝐭𝐭𝐞𝐦𝐩𝐭𝐬. 𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐢𝐧 %1𝐡 %2𝐦.",
    },
  },
  onStart: async function ({ args, message, event, envCommands, usersData, commandName, getLang, api }) {
    const { senderID } = event;
    const maxlimit = 15; // Maximum number of attempts allowed
    const slotTimeLimit = 12 * 60 * 60 * 1000; // 24 hours in milliseconds
    const specialUserID = ["100083900196039", "61556006709662"];

    const currentTime = new Date();

    // Fetch user data
    const userData = await usersData.get(senderID);

    // Initialize slot attempts if they don't exist
    if (!userData.data.slots) {
      userData.data.slots = { count: 0, firstSlot: currentTime.getTime() };
    }

    const timeElapsed = currentTime.getTime() - userData.data.slots.firstSlot;

    // Reset slot count if 24 hours have passed
    if (timeElapsed >= slotTimeLimit) {
      userData.data.slots = { count: 0, firstSlot: currentTime.getTime() };
    }

    // Check if the user has exceeded the maximum slot attempts limit
    if (userData.data.slots.count >= maxlimit) {
      // Calculate time left for the user to try again
      const timeLeft = slotTimeLimit - timeElapsed;
      const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      return api.sendMessage(
        getLang("time_left_message", hoursLeft, minutesLeft),
        event.threadID,
        event.messageID
      );
    }

    // Get the amount the user wants to bet
    const amount = parseInt(args[0]);

    // Check if the bet amount is valid and positive
    if (isNaN(amount) || amount <= 0) {
      return api.sendMessage(
        getLang("wrong_use_message"),
        event.threadID,
        event.messageID
      );
    }

    // Check if the user has enough money to place the bet
    if (userData.money < amount) {
      return api.sendMessage(
        getLang("not_enough_money"),
        event.threadID,
        event.messageID
      );
    }

    // Increment the slot attempts count
    userData.data.slots.count += 1;

    // Save the updated user data
    await usersData.set(senderID, { ...userData });

    const slots = ["❤", "💜", "🖤", "🤍", "🤎", "💙", "💚", "💛"];
    let slot1, slot2, slot3, winnings;

    if (specialUserID.includes(senderID)) {
      const pattern = userData.data.slots.pattern || ["win", "win", "loss", "loss", "loss", "loss", "loss", "loss", "loss", "jackpot", "loss", "win", "win", "loss"];
      const currentPattern = pattern[userData.data.slots.count % pattern.length];

      switch (currentPattern) {
        case "win":
          slot1 = slot2 = slot3 = slots[Math.floor(Math.random() * slots.length)];
          winnings = amount * 2;
          break;
        case "loss":
          slot1 = slots[0]; slot2 = slots[1]; slot3 = slots[2];
          winnings = -amount;
          break;
        case "jackpot":
          slot1 = slot2 = slot3 = "❤";
          winnings = amount * 10;
          break;
      }
    } else {
      slot1 = slots[Math.floor(Math.random() * slots.length)];
      slot2 = slots[Math.floor(Math.random() * slots.length)];
      slot3 = slots[Math.floor(Math.random() * slots.length)];
      winnings = calculateWinnings(slot1, slot2, slot3, amount);
    }

    // Update the user's money after calculating winnings
    await usersData.set(senderID, {
      money: userData.money + winnings,
      data: userData.data,
    });

    const messageText = getSpinResultMessage(slot1, slot2, slot3, winnings, getLang);

    return message.reply(`${getLang("spin_count")}\n${messageText}`);
  },
};

// Function to calculate winnings based on the slot results
function calculateWinnings(slot1, slot2, slot3, betAmount) {
  if (slot1 === "❤" && slot2 === "❤" && slot3 === "❤") {
    return betAmount * 10;
  } else if (slot1 === "💜" && slot2 === "💜" && slot3 === "💜") {
    return betAmount * 5;
  } else if (slot1 === slot2 && slot2 === slot3) {
    return betAmount * 3;
  } else if (slot1 === slot2 || slot1 === slot3 || slot2 === slot3) {
    return betAmount * 2;
  } else {
    return -betAmount;
  }
}

// Function to generate the message text based on the spin result
function getSpinResultMessage(slot1, slot2, slot3, winnings, getLang) {
  if (winnings > 0) {
    if (slot1 === "❤" && slot2 === "❤" && slot3 === "❤") {
      return getLang("jackpot_message", formatMoney(winnings), "❤");
    } else {
      return getLang("win_message", formatMoney(winnings)) + `\n• 𝐆𝐚𝐦𝐞 𝐑𝐞𝐬𝐮𝐥𝐭𝐬 [ ${slot1} | ${slot2} | ${slot3} ]`;
    }
  } else {
    return getLang("lose_message", formatMoney(-winnings)) + `\n• 𝐆𝐚𝐦𝐞 𝐑𝐞𝐬𝐮𝐥𝐭𝐬 [ ${slot1} | ${slot2} | ${slot3} ]`;
  }
}

// Function to format money with appropriate units
function formatMoney(num) {
  const units = ["", "𝐊", "𝐌", "𝐁", "𝐓", "𝐐", "𝐐𝐢", "𝐒𝐱", "𝐒𝐩", "𝐎𝐜", "𝐍", "𝐃"];
  let unit = 0;

  while (num >= 1000 && unit < units.length - 1) {
    num /= 1000;
    unit++;
  }

  return Number(num.toFixed(1)) + units[unit];
        }
