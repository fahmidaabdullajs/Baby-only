const fs = require('fs');

module.exports = {
  config: {
    name: "tord",
    version: "1.8",
    author: "MahMUD",
    role: 0,
    category: "game",
    description: "Play Truth or Dare.",
    usage: "[truth/dare]"
  },

  onStart: async function ({ api, event, args }) {
    // Load questions from the external JSON file
    let questions;
    try {
      questions = JSON.parse(fs.readFileSync("questions.json", "utf-8"));
    } catch (error) {
      return api.sendMessage("⚠️ | Error reading questions file.", event.threadID);
    }

    const type = args[0]?.toLowerCase(); // Get user input (truth/dare)

    if (!type || (type !== "truth" && type !== "dare")) {
      return api.sendMessage("⚠️ | Please use: !tord truth or !tord dare", event.threadID);
    }

    // Get a random question
    const question = questions[type][Math.floor(Math.random() * questions[type].length)];
    api.sendMessage(`🔥 | ${type.toUpperCase()}: ${question}`, event.threadID);
  }
};
