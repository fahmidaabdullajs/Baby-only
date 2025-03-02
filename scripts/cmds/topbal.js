module.exports = {
  config: {
    name: "top",
    version: "1.7",
    author: "MahMUD",
    role: 0,
    category: "economy",
    guide: {
      en: "Use `{pn}top` to see the top 15 richest users."
    }
  },

  onStart: async function ({ api, args, message, event, usersData }) {
    try {
      const allUsers = await usersData.getAll();

      // Filter users with money > 0
      const usersWithMoney = allUsers.filter(user => user.money > 0);

      if (usersWithMoney.length === 0) {
        return message.reply("There are no users with money to display a ranking.");
      }

      // Sort users by money in descending order and get the top 20
      const topBalance = usersWithMoney.sort((a, b) => b.money - a.money).slice(0, 15);

      // Medal icons for top 3 ranks
      const medals = ["🥇", "🥈", "🥉"];

      // Formatting the leaderboard
      const topUsersList = topBalance.map((user, index) => {
        const rank = index < 3 ? medals[index] : toBoldNumbers(index + 1);
        const boldName = toBoldUnicode(user.name);
        return `${rank}. ${boldName}: ${formatMoney(user.money)}$`;
      });

      const messageText = `👑 | 𝐓𝐨𝐩 𝟏𝟓 𝐑𝐢𝐜𝐡𝐞𝐬𝐭 𝐔𝐬𝐞𝐫𝐬:\n\n${topUsersList.join("\n")}`;
      
      message.reply(messageText);
    } catch (error) {
      console.error(error);
      message.reply("An error occurred while fetching the leaderboard.");
    }
  }
};

// Function to format money with K, M, B, etc.
function formatMoney(num) {
  const units = ["", "𝐊", "𝐌", "𝐁", "𝐓", "𝐐", "𝐐𝐢", "𝐒𝐱", "𝐒𝐩", "𝐎𝐜", "𝐍", "𝐃"];
  let unit = 0;

  while (num >= 1000 && unit < units.length - 1) {
    num /= 1000;
    unit++;
  }

  return Number(num.toFixed(1)) + units[unit];
}

// Convert numbers to bold Unicode
function toBoldNumbers(number) {
  const boldNumbers = {
    "0": "𝟎", "1": "𝟏", "2": "𝟐", "3": "𝟑", "4": "𝟒", 
    "5": "𝟓", "6": "𝟔", "7": "𝟕", "8": "𝟖", "9": "𝟗"
  };

  return number.toString().split("").map(char => boldNumbers[char] || char).join("");
}

// Convert text to bold Unicode
function toBoldUnicode(text) {
  const boldAlphabet = {
    "a": "𝐚", "b": "𝐛", "c": "𝐜", "d": "𝐝", "e": "𝐞", "f": "𝐟", "g": "𝐠", "h": "𝐡", "i": "𝐢", "j": "𝐣",
    "k": "𝐤", "l": "𝐥", "m": "𝐦", "n": "𝐧", "o": "𝐨", "p": "𝐩", "q": "𝐪", "r": "𝐫", "s": "𝐬", "t": "𝐭",
    "u": "𝐮", "v": "𝐯", "w": "𝐰", "x": "𝐱", "y": "𝐲", "z": "𝐳", "A": "𝐀", "B": "𝐁", "C": "𝐂", "D": "𝐃",
    "E": "𝐄", "F": "𝐅", "G": "𝐆", "H": "𝐇", "I": "𝐈", "J": "𝐉", "K": "𝐊", "L": "𝐋", "M": "𝐌", "N": "𝐍",
    "O": "𝐎", "P": "𝐏", "Q": "𝐐", "R": "𝐑", "S": "𝐒", "T": "𝐓", "U": "𝐔", "V": "𝐕", "W": "𝐖", "X": "𝐗",
    "Y": "𝐘", "Z": "𝐙", " ": " ", "'": "'", ",": ",", ".": ".", "-": "-", "!": "!", "?": "?"
  };

  return text.split('').map(char => boldAlphabet[char] || char).join('');
    }
