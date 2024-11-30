module.exports = {
  config: {
    name: "top",
    version: "1.0",
    author: "MahMUD x Leon",
    role: 0,
    shortDescription: {
      en: "Top 15 Richest users"
    },
    longDescription: {
      en: "Top 15 richest users list"
    },
    category: "economy",
    guide: {
      en: "Use `{pn}topbalance` to see the top 15 richest users."
    }
  },

  onStart: async function ({ api, args, message, event, usersData }) {
    const allUsers = await usersData.getAll();
    
    // Filter out users with no money points
    const usersWithMoney = allUsers.filter(user => user.money > 0);

    if (usersWithMoney.length < 15) {
      message.reply("There are not enough users with money points to display a top 15 list.");
      return;
    }
    
    // Sort users based on money points (descending) and get the top 15
    const topBalance = usersWithMoney.sort((a, b) => b.money - a.money).slice(0, 15);
    
    // Create a list of the top 15 richest users, formatted with money abbreviation
    const topUsersList = topBalance.map((user, index) => `${index + 1}. ${user.name}: ${formatMoney(user.money)}$`);
    
    const messageText = `👑 | Top 15 Richest Users:\n${topUsersList.join('\n')}`;
    
    // Reply with the list of the top 15 richest users
    message.reply(messageText);
  }
};

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
