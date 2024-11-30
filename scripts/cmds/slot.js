const mongoose = require('mongoose');

// MongoDB URI for your database
const dbUri = "mongodb+srv://mahmudabdullax7:ttnRAhj81JikbEw8@cluster0.zwknjau.mongodb.net/GoatBotV2?retryWrites=true&w=majority&appName=Cluster0";

// MongoDB Schema to track user usage
const userSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  usageCount: { type: Number, default: 0 }, // Number of times the user has used the command
  lastUsedDate: { type: String, default: "" }, // Track last date used
});

// Check if the model is already defined to prevent overwriting
const UserUsage = mongoose.models.UserUsage || mongoose.model('UserUsage', userSchema);

// MongoDB Connection
mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

module.exports = {
  config: {
    name: "slot",
    version: "1.0",
    author: "Samir",
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
      win_message: "Baby, You won $%1",
      lose_message: "Baby, You lost $%1",
      jackpot_message: "Jackpot! You won $%1 with three %2 symbols, buddy!",
      usage_limit_reached: "❌ | You have reached the daily limit of 30 slots, Please try again tomorrow.",
      spin_count: ">🎀",
    },
  },
  onStart: async function ({ args, message, event, envCommands, usersData, commandName, getLang }) {
    const { senderID } = event;
    const userData = await usersData.get(senderID);

    // Get the current date in Bangladesh Standard Time (BST, UTC+6)
    const currentDate = new Date();
    const bstTime = currentDate.toLocaleString("en-US", { timeZone: "Asia/Dhaka" });
    const [dateString] = bstTime.split(","); // Get only the date portion: "MM/DD/YYYY"

    // Retrieve the user's daily slot usage statistics from MongoDB
    let userStats = await UserUsage.findOne({ userID: senderID });
    if (!userStats) {
      // Create a new entry if the user doesn't exist in the database
      userStats = new UserUsage({ userID: senderID, usageCount: 0, lastUsedDate: '' });
    }

    const { lastUsedDate, usageCount } = userStats;

    // If the date has changed (new day), reset the spin count and update the lastUsedDate
    if (lastUsedDate !== dateString) {
      // It's a new day, reset spin count
      userStats.lastUsedDate = dateString;
      userStats.usageCount = 1; // Start the new day with spin count as 1
    } else {
      // It's the same day, so increment the spin count
      userStats.usageCount += 1;
    }

    // If the user has reached the daily limit of 30 spins, prevent more spins
    if (userStats.usageCount > 30) {
      return message.reply(getLang("usage_limit_reached"));
    }

    // Save the updated user data with the incremented spin count
    await userStats.save();

    // Show the current spin count used out of 30
    const spinCountMessage = getLang("spin_count", userStats.usageCount);  // %1 will be replaced by the spin count

    // Get the bet amount from the command args
    const amount = parseInt(args[0]);

    // Validate the bet amount
    if (isNaN(amount) || amount <= 0) {
      return message.reply(getLang("invalid_amount"));
    }

    // Check if the user has enough money for the bet
    if (amount > userData.money) {
      return message.reply(getLang("not_enough_money"));
    }

    // Slot symbols
    const slots = ["❤", "💜", "🖤", "🤍", "🤎", "💙", "💚", "💛"];
    const slot1 = slots[Math.floor(Math.random() * slots.length)];
    const slot2 = slots[Math.floor(Math.random() * slots.length)];
    const slot3 = slots[Math.floor(Math.random() * slots.length)];

    // Calculate winnings
    const winnings = calculateWinnings(slot1, slot2, slot3, amount);

    // Update the user's money after calculating winnings
    await usersData.set(senderID, {
      money: userData.money + winnings,
      data: userData.data,
      slotStats: userStats, // Ensure slot stats are also updated
    });

    // Get the result message based on the spin outcome
    const messageText = getSpinResultMessage(slot1, slot2, slot3, winnings, getLang);

    // Return the message withSamecurrent spin count and game results
    return message.reply(`${spinCountMessage}\n${messageText}`);
  },
};

// Function to calculate winnings based on slot results
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

// Function to return the spin result message based on the outcome
function getSpinResultMessage(slot1, slot2, slot3, winnings, getLang) {
  if (winnings > 0) {
    if (slot1 === "❤" && slot2 === "❤" && slot3 === "❤") {
      return getLang("jackpot_message", winnings, "❤");
    } else {
      return getLang("win_message", winnings) + `\nGame Results [ ${slot1} | ${slot2} | ${slot3} ]`;
    }
  } else {
    return getLang("lose_message", -winnings) + `\nGame Results [ ${slot1} | ${slot2} | ${slot3} ]`;
  }
  }

// Helper function to format large numbers with units
function formatMoney(num) {
  const units = ["", "𝐊", "𝐌", "𝐁", "𝐓", "𝐐", "𝐐𝐢", "𝐒𝐱", "𝐒𝐩", "𝐎𝐜", "𝐍", "𝐃"];
  let unit = 0;

  // Cap the unit at a maximum safe unit index for huge numbers
  while (num >= 1000 && unit < units.length - 1) {
    num /= 1000;
    unit++;
  }

  // Format large numbers with 1 or 2 decimal places
  if (num >= 1000) {
    return Number(num.toFixed(1)) + units[unit]; // Shows 1 decimal place
  } else {
    return Number(num.toFixed(1)) + units[unit]; // Shows 1 decimal place for smaller numbers too
  }
}
