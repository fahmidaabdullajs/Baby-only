module.exports = {
  config: {
    name: "top2",
    version: "1.0",
    author: "xxx",
    role: 0,
    shortDescription: {
      en: "Top 15 Richest users"
    },
    longDescription: {
      en: "Top 15 richest users list with UID"
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
    
    // Create a list of the top 15 richest users, including their UID and formatted money
    const topUsersList = topBalance.map((user, index) => `${index + 1}. ${user.name}. ${user.userID}: ${formatMoney(user.money)}$`);
    
    const messageText = `👑 | Top 15 Richest Users:\n\n${topUsersList.join('\n\n')}`;
    
    // Reply with the list of the top 15 richest users
    message.reply(messageText);
  }
};

// Helper function to format large numbers with units
function formatMoney(num) {
  const units = ["", "K", "M", "B", "T", "Q", "Qi", "Sx", "Sp", "Oc", "N", "D"];
  let unit = 0;

  // Cap the unit at a maximum safe unit index for huge numbers
  while (num >= 1000 && unit < units.length - 1) {
    num /= 1000;
    unit++;
  }

  // Ensure large numbers are properly formatted without scientific notation
  if (num >= 1000) {
    return Number(num.toPrecision(3)) + units[unit];
  } else {
    return num.toFixed(2) + units[unit];
  }
}
