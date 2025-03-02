module.exports = {
  config: {
    name: "send",
    version: "1.7",
    author: "MahMUD",
    role: 0,
    shortDescription: {
      en: "Send money to another user",
    },
    longDescription: {
      en: "Send money to another user using their UID, mention, or by replying to their message. The amount is specified at the end of the command.",
    },
    category: "economy",
  },
  langs: {
    en: {
      invalid_amount: "❎ Please specify a valid amount to send.",
      not_enough_money: "❎ You don't have enough money to send.",
      invalid_user: "❎ The specified user is invalid or not found.",
      transfer_success: "✅ | Successfully sent money %1$ to %2.",
      transfer_fail: "❌ | Failed to send money. Please check the user and try again.",
      thread_only: "❌ 𝐎𝐧𝐥𝐲 𝐛𝐨𝐭 𝐒𝐮𝐩𝐩𝐨𝐫𝐭 𝐠𝐫𝐨𝐮𝐩 𝐰𝐨𝐫𝐤 𝐭𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝.\n\n𝐓𝐲𝐩𝐞 !joingc 𝐚𝐝𝐝 𝐭𝐨 𝐛𝐨𝐭 𝐬𝐮𝐩𝐩𝐨𝐫𝐭 𝐠𝐫𝐨𝐮𝐩.",
      self_transfer: "❎ You cannot send money to yourself.",
      invalid_command: "❎ Invalid command. Example: !send money @mention 100$",
    },
  },

  formatMoney: function (num) {
    const units = ["", "K", "M", "B", "T"];
    let unit = 0;
    while (num >= 1000 && unit < units.length - 1) {
      num /= 1000;
      unit++;
    }
    return Number(num.toFixed(1)) + units[unit];
  },

  onStart: async function ({ args, message, event, usersData, getLang }) {
    const { senderID, mentions, messageReply, threadID } = event;
    const allowedThreadID = "7460623087375340"; // Allowed thread ID
    let recipientID, amount;

    const commandAliases = {
      "-m": "money",
    };

    // Validate args[0] existence and retrieve command
    if (!args[0]) {
      return message.reply(getLang("invalid_command"));
    }

    let command = args[0].toLowerCase();
    if (commandAliases[command]) {
      command = commandAliases[command];
    }

    switch (command) {
      case "money":
        // Ensure the command is used in the allowed thread
        if (threadID !== allowedThreadID) {
          return message.reply(getLang("thread_only"));
        }

        // Parse the amount (last argument should be the amount)
        amount = parseInt(args[args.length - 1]);
        if (isNaN(amount) || amount <= 0) {
          return message.reply(getLang("invalid_amount"));
        }

        // Determine recipient:
        if (messageReply && messageReply.senderID) {
          // Case 1: Replying to a user's message
          recipientID = messageReply.senderID;
        } else if (mentions && Object.keys(mentions).length > 0) {
          // Case 2: Mentioning a user
          recipientID = Object.keys(mentions)[0];
        } else if (args.length > 2) {
          // Case 3: Providing a UID
          recipientID = args[1];
        } else {
          return message.reply("❎ Please provide a user by replying to their message, mentioning them, or entering their UID.");
        }

        // Prevent self-transfer
        if (recipientID === senderID) {
          return message.reply(getLang("self_transfer"));
        }

        // Validate recipient
        const recipientData = await usersData.get(recipientID);
        if (!recipientData) {
          return message.reply(getLang("invalid_user"));
        }

        // Fetch sender's balance
        const senderData = await usersData.get(senderID);
        const senderBalance = senderData.money || 0;

        if (amount > senderBalance) {
          return message.reply(getLang("not_enough_money"));
        }

        // Fetch recipient's balance
        const recipientBalance = recipientData.money || 0;

        // Perform the transfer
        try {
          await usersData.set(senderID, { money: senderBalance - amount });
          await usersData.set(recipientID, { money: recipientBalance + amount });

          const formattedAmount = this.formatMoney(amount);
          const recipientName = recipientData.name || "Unknown User";

          return message.reply(getLang("transfer_success", formattedAmount, recipientName));
        } catch (error) {
          console.error(error);
          return message.reply(getLang("transfer_fail"));
        }
      default:
        return message.reply(getLang("invalid_command"));
    }
  },
};
