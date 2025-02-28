const mongoose = require("mongoose");
const uri = "mongodb+srv://rockx27:rockonx27fire@cluster0.e5kr5.mongodb.net/GoatBotV2?retryWrites=true&w=majority&appName=Cluster0"; // Replace with your MongoDB connection string
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const emojis = [
  "😍", "😄", "😎", "😊", "😉", "😜", "🙃", "🥳", "💖", "💥", 
  "💙", "💚", "💛", "💜", "❤️", "💗", "💘", "💝", "🧡", "🖤", 
  "🤩", "🥰", "😇", "😻", "💌", "🌟", "🔥", "🫶🏻", "😙", "😚", 
  "🙂", "🥹", "😡", "😺", "😼", "😽", "😸", "😝", "😋", "😛", 
  "😒", "😏", "😦", "😳", "🙈", "🙉", "🙊", "🙀", "🐒", "🐤", 
  "🐥", "🐣", "🐸", "🦋", "🌸"
];

const TeachSchema = new mongoose.Schema({
  trigger: String,
  responses: [String]
});
const Teach = mongoose.models.Teach || mongoose.model("Teach", TeachSchema);

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

const stringSimilarity = require("string-similarity");
async function getBotResponse(input) {
  try {
    const allData = await Teach.find();
    const triggers = allData.map(item => item.trigger);

    const matches = stringSimilarity.findBestMatch(input.toLowerCase(), triggers);
    const bestMatch = matches.bestMatch;

    if (bestMatch.rating > 0.6) {
      const matchedData = allData.find(item => item.trigger === bestMatch.target);
      if (matchedData && matchedData.responses.length > 0) {
        const randomIndex = Math.floor(Math.random() * matchedData.responses.length);
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        const boldResponse = toBoldUnicode(matchedData.responses[randomIndex]);

        return `${boldResponse} ${randomEmoji}`;
      }
    }

    return "𝐨𝐢 𝐦𝐚𝐦𝐚 𝐞𝐢𝐭𝐚 𝐚𝐦𝐤 𝐭𝐞𝐚𝐜𝐡 𝐤𝐨𝐫𝐚 𝐡𝐲 𝐧𝐚𝐢 <🥺";
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error.message);
    return "Error fetching data.";
  }
}

module.exports = {
  config: {
    name: "bo",
    version: "1.7",
    author: "MahMUD",
    role: 0,
    description: { en: "no prefix command." },
    category: "ai",
    guide: { en: "just type bby" },
  },

  onStart: async function () {},

  removePrefix: function (str, prefixes) {
    for (const prefix of prefixes) {
      if (str.startsWith(prefix)) {
        return str.slice(prefix.length).trim();
      }
    }
    return str;
  },

  onReply: async function ({ api, event }) {
    if (event.type === "message_reply") {
      let mahmud = event.body.toLowerCase();
      mahmud = this.removePrefix(mahmud, ["jan"]) || "bby";

      if (mahmud) {
        const message = await getBotResponse(mahmud);

        await api.sendMessage(
          message,
          event.threadID,
          (err, info) => {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: "bo",
              type: "reply",
              messageID: info.messageID,
              author: event.senderID,
              text: message,
            });
          },
          event.messageID
        );
      }
    }
  },

  onChat: async function ({ api, event }) {
    const tl = [
      "babu khuda lagse🥺",
      "Hop beda😾,Boss বল boss😼",
      "আমাকে ডাকলে ,আমি কিন্তূ কিস করে দেবো😘",
      "🐒🐒🐒",
      "bye",
      "naw message daw m.me/mahmud.x07",
      "mb ney bye",
      "meww",
      "বলো কি বলবা, সবার সামনে বলবা নাকি?🤭🤏",
      "𝗜 𝗹𝗼𝘃𝗲 𝘆𝗼𝘂__😘😘",
      "𝗜 𝗵𝗮𝘁𝗲 𝘆𝗼𝘂__😏😏",
    ];

    const rand = tl[Math.floor(Math.random() * tl.length)];
    let mahmud = event.body ? event.body.toLowerCase() : "";
    const words = mahmud.split(" ");
    const count = words.length;

    if (event.type !== "message_reply") {
      let messageToSend = this.removePrefix(mahmud, ["jan"]);

      if (["jan"].some((prefix) => mahmud.startsWith(prefix))) {
        setTimeout(() => {
          api.setMessageReaction("😍", event.messageID, () => {}, true);
        }, 400);

        api.sendTypingIndicator(event.threadID, true);
        if (event.senderID === api.getCurrentUserID()) return;

        if (count === 1) {
          setTimeout(() => {
            api.sendMessage(
              { body: rand },
              event.threadID,
              (err, info) => {
                global.GoatBot.onReply.set(info.messageID, {
                  commandName: "bo",
                  type: "reply",
                  messageID: info.messageID,
                  author: event.senderID,
                  link: rand,
                });
              },
              event.messageID
            );
          }, 400);
        } else {
          words.shift();
          const userMessage = words.join(" ");

          const mg = await getBotResponse(userMessage);

          await api.sendMessage(
            { body: mg },
            event.threadID,
            (error, info) => {
              global.GoatBot.onReply.set(info.messageID, {
                commandName: this.config.name,
                type: "reply",
                messageID: info.messageID,
                author: event.senderID,
                link: mg,
              });
            },
            event.messageID
          );
        }
      }
    }
  },
};
