module.exports = {
  config: {
    name: "topexp",
   aliases:  ["topuser"],
 version: "1.0",
    author: "OTINXSANDIP",
    role: 0,
    shortDescription: {
      en: "Top 10 Exp users"
    },
    longDescription: {
      en: ""
    },
    category: "rank",
    guide: {
      en: "{pn}"
    }
  },
  onStart: async function ({ api, args, message, event, usersData }) {
    const allUsers = await usersData.getAll();

    // Filter out users with no experience points
    const usersWithExp = allUsers.filter(user => user.exp > 0);

    if (usersWithExp.length < 10) {
      message.reply("There are not enough users with experience points to display a top 10.");
      return;
    }

    const topExp = usersWithExp.sort((a, b) => b.exp - a.exp).slice(0, 10);

    // Format money function to display experience in a readable format
    function formatMoney(num) {
      const units = ["", "𝐊", "𝐌", "𝐁", "𝐓", "𝐐", "𝐐𝐢", "𝐒𝐱", "𝐒𝐩", "𝐎𝐜", "𝐍", "𝐃"];
      let unit = 0;

      // Cap the unit at a maximum safe unit index for huge numbers
      while (num >= 1000 && unit < units.length - 1) {
        num /= 1000;
        unit++;
      }

      // Format large numbers with 1 or 2 decimal places
      return Number(num.toFixed(1)) + units[unit]; // Shows 1 decimal place
    }

    const topUsersList = topExp.map((user, index) => `${index + 1}. ${user.name}: ${formatMoney(user.exp)}`);

    const messageText = `👑 𝗧𝗢𝗣 𝗥𝗔𝗡𝗞 𝗨𝗦𝗘𝗥𝗦::\n\n${topUsersList.join('\n')}`;

    message.reply(messageText);
  }
};
