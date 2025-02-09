const fs = require('fs');  // Ensure fs is required at the top

module.exports = {
  config: {
    name: "wordgame",
    aliases: ["wdgame"],
    version: "1.0",
    author: "old<Upol>",
    role: 0,
    countDown: 10,
    reward: 100,  // Initial reward for the first answer
    category: "game",
    shortDescription: {
      en: "Unscramble the given word within a time limit"
    },
    longDescription: {
      en: "A game where you have to unscramble a given word within a given time limit to win a prize"
    },
    guide: {
      en: "{prefix}wordgame - Start the word rearranging game"
    }
  },

  onStart: function (args) {
    const { message, event, commandName } = args;
    const words = JSON.parse(fs.readFileSync('words.json'));
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const shuffledWord = shuffleWord(randomWord);

    message.reply('What is this word: "' + shuffledWord + '" ?', function (err, info) {
      if (!err) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: commandName,
          messageID: info.messageID,
          author: event.senderID,  // Store the author's ID
          answer: randomWord,
          words: words,
          replied: false, // Track if a reply has been sent
          round: 1,  // Start with the first round
          correctAnswer: false, // Initially, the answer is incorrect
          count: 0,  // Track how many words the user has answered
          maxlimits: 5  // Limit the number of rounds/words to 5 (you can adjust this)
        });
      }
    });
  },

  onReply: function (args) {
    const { message, Reply, event, usersData, commandName } = args;
    const { author, messageID, answer, words, replied, round, correctAnswer, count, maxlimits } = Reply;

    // Check if the current user is the one who started the game
    if (event.senderID !== author) {
      return message.reply("Not your turn baka 🐸🦎");
    }

    // Prevent further replies if the system already replied or if the max limit is reached
    if (replied || count >= maxlimits) return;

    // Check if the answer is correct
    if (formatText(event.body) === formatText(answer)) {
      // Update the count and correct answer status
      const reward = 100 * round;  // 100 coins for the 1st round, 150 for the 2nd, and so on
      usersData.addMoney(event.senderID, reward).then(function () {
        const nextWord = words[Math.floor(Math.random() * words.length)];
        const shuffledNextWord = shuffleWord(nextWord);

        message.reply(
          `✅ | Correct Answer\nYou win ${reward}$\nNext word: "${shuffledNextWord}" ?`,
          function (err, info) {
            if (!err) {
              // Increase round and word count after sending the correct message
              global.GoatBot.onReply.set(info.messageID, {
                commandName: commandName,
                messageID: info.messageID,
                author: event.senderID,
                answer: nextWord,
                words: words,
                replied: false,  // Set replied to false for the next round
                round: round + 1,  // Increase the round number for the next word
                correctAnswer: true,  // Set correct answer status to true for the next round
                count: count + 1,  // Increment the count of words answered
                maxlimits: maxlimits  // Retain the max limits
              });
            }
          }
        );
      });
    } else {
      // Incorrect answer logic
      message.reply("❌ | Sorry, that's incorrect. Try again!");

      // Mark this round as replied after sending the incorrect message
      global.GoatBot.onReply.set(messageID, {
        commandName: commandName,
        messageID: messageID,
        author: event.senderID,
        answer: answer,
        words: words,
        replied: true,  // Mark this round as replied
        round: round,  // Keep the same round number since the answer was incorrect
        correctAnswer: false,  // Set correct answer status to false for retry
        count: count,  // Keep the same count since the answer was incorrect
        maxlimits: maxlimits  // Retain the max limits
      });
    }
  }
};

function shuffleWord(word) {
  const shuffled = word.split('').sort(function () {
    return 0.5 - Math.random();
  }).join('');
  if (shuffled === word) {
    return shuffleWord(word);
  }
  return shuffled;
}

function formatText(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
