const axios = require("axios");

async function fetchAIResponse(prompt) {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer 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"
        }
      }
    );

    return response.data.choices[0]?.message?.content || "No response.";
  } catch (error) {
    console.error("Error from OpenAI API:", error.message);
    return "An error occurred while processing your request.";
  }
}

async function handleAICommand(api, event, args, message) {
  try {
    const userInput = args.join(" ").trim().toLowerCase();
    if (!userInput) {
      return message.reply("ex: {p}cmdName {your question} ");
    }

    // Custom responses for specific questions
    if (userInput.includes("your father name")) {
      return message.reply("My father is MahMud.");
    }

    const aiResponse = await fetchAIResponse(userInput);

    message.reply(aiResponse, (err, response) => {
      if (!err) {
        global.GoatBot.onReply.set(response.messageID, {
          commandName: module.exports.config.name,
          uid: event.senderID
        });
      }
    });
  } catch (error) {
    console.error("Error:", error);
    message.reply("An error occurred while processing your request.");
  }
}

module.exports = {
  config: {
    name: "ai",
    version: "1.7",
    author: "MahMUD", 
    role: 0,
    category: "ai",
    guide: {
      en: "{p} Your AI assistant"
    }
  },

  handleCommand: handleAICommand,
  onStart: function ({ api, message, event, args }) {
    return handleAICommand(api, event, args, message);
  },
  onReply: function ({ api, message, event, args }) {
    return handleAICommand(api, event, args, message);
  }
};
