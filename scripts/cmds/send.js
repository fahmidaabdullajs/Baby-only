module.exports = {
  config: {
    name: "send",
    version: "1.0",
    author: "Mah MUD",
    role: 0,
    shortDescription: {
      en: "Send money to another user",
    },
    longDescription: {
      en: "send money to another user using their tag.",
    },
    category: "economy",
  },
  langs: {
    en: {
      invalid_amount: "Please specify a valid amount to send",
      not_enough_money: "You don't have enough money to send",
      invalid_user: "The specified user is invalid or not found",
      transfer_success: "✅ | Successfully sent money %1$ to %2",
      transfer_fail: "Failed to send balance. Please check the user tag and try again",
      thread_only: "❌ 𝐎𝐧𝐥𝐲 𝐛𝐨𝐭 𝐒𝐮𝐩𝐩𝐨𝐫𝐭 𝐠𝐫𝐨𝐮𝐩 𝐰𝐨𝐫𝐤 𝐭𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝.\n\n𝐓𝐲𝐩𝐞 !joingc 𝐚𝐝𝐝 𝐭𝐨 𝐛𝐨𝐭 𝐬𝐮𝐩𝐩𝐨𝐫𝐭 𝐠𝐫𝐨𝐮𝐩.",
    },
  },

  // Helper function to format large numbers with units
  formatMoney: function(num) {
    const units = ["", "𝐊", "𝐌", "𝐁", "𝐓", "𝐐", "𝐐𝐢", "𝐒𝐱", "𝐒𝐩", "𝐎𝐜", "𝐍", "𝐃"];
    let unit = 0;

    // Cap the unit at a maximum safe unit index for huge numbers
    while (num >= 1000 && unit < units.length - 1) {
      num /= 1000;
      unit++;
    }

    // Format large numbers with 1 or 2 decimal places
    return Number(num.toFixed(1)) + units[unit]; // Shows 1 decimal place for all number ranges
  },

  onStart: async function ({ args, message, event, usersData, getLang }) {
    const { senderID, mentions, threadID } = event;
    const allowedThreadID = '7460623087375340'; // The thread ID where the command is allowed
    let recipientID, amount;

    // Check if the command is being used in the correct thread
    if (threadID !== allowedThreadID) {
      return message.reply(getLang("thread_only"));
    }

    // Define command aliases
    const commandAliases = {
      "-m": "money", 
    };

    // Check if args[0] is defined before calling toLowerCase
    if (!args[0]) {
      return message.reply("❎ Invalid command. example !send money @mention 100$");
    }

    // Get the command name, using alias if available
    let command = args[0].toLowerCase();
    if (commandAliases[command]) {
      command = commandAliases[command]; // Replace alias with the full command
    }

    switch (command) {
      case "money":
        // Check if there are mentions in the event
        if (mentions && Object.keys(mentions).length > 0) {
          // Get the first mentioned user ID
          recipientID = Object.keys(mentions)[0];
          // Find the amount by looking through the args for the first number
          amount = parseInt(args.find(arg => !isNaN(arg)));
        } else {
          // If no mentions, use the first argument as recipient ID and second as amount
          recipientID = args[1];
          amount = parseInt(args[2]);
        }

        // Ensure the amount is valid
        if (isNaN(amount) || amount <= 0) {
          return message.reply("❎ Please enter a valid amount to send");
        }

        // Ensure recipientID is valid
        if (!recipientID) {
          return message.reply("❎ Please specify the recipient's mention someone to send money");
        }

        // Fetch recipient's balance data
        const recipientBalanceData = await usersData.get(recipientID);
        if (!recipientBalanceData) {
          return message.reply("❎ Recipient not found. Please check the recipient's mention a valid user");
        }

        // Check if the recipient is the sender (can't transfer balance to yourself)
        if (recipientID === senderID) {
          return message.reply("❎ You cannot send money to yourself");
        }

        // Fetch sender's balance data
        const senderBalanceData = await usersData.get(senderID);
        const senderBalance = senderBalanceData.money || 0;
        const recipientBalance = recipientBalanceData.money || 0;

        // Prevent transfer if recipient's balance is too high (safety check)
        if (recipientBalance >= 1e104) {
          return message.reply("❎ The recipient's balance is already too high. You cannot send money to them");
        }

        // Check if sender has enough funds
        if (amount > senderBalance) {
          return message.reply("❎ You don't have enough money to complete this transfer");
        }

        // Perform the transfer
        try {
          // Update sender's balance
          await usersData.set(senderID, {
            money: senderBalance - amount,
            data: senderBalanceData.data,
          });

          // Update recipient's balance
          await usersData.set(recipientID, {
            money: recipientBalance + amount,
            data: recipientBalanceData.data,
          });

          // Fetch the recipient's data to get their name (instead of tag)
          const recipientData = await usersData.get(recipientID);
          const recipientName = recipientData ? recipientData.name : "Unknown User"; // Default to "Unknown User" if name is missing

          // Format the amount for a more readable display
          const formattedAmount = this.formatMoney(amount);

          return message.reply(getLang("transfer_success", formattedAmount, recipientName)); // Show formatted amount and name in success message
        } catch (error) {
          console.error(error); // Log any errors
          return message.reply("❎ Failed to send money. Please try again.");
        }

        break; // End of the 'send' case

      default:
        return message.reply("❎ Invalid command. Please use 'send money' or 'send -m' to transfer balance.");
    }
  },
};
