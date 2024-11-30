const { MongoClient } = require("mongodb");

const mongoUri = "mongodb+srv://mahmudabdullax7:ttnRAhj81JikbEw8@cluster0.zwknjau.mongodb.net/GoatBotV2?retryWrites=true&w=majority&appName=Cluster0";

// Helper function to format money (assuming this function is not defined elsewhere)
function formatMoney(amount) {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

module.exports = {
  config: {
    name: "bank",
    version: "1.2",
    description: "Deposit, withdraw money, and earn interest",
    guide: {
      vi: "",
      en: "{pn}Bank:\n- Interest - Balance\n- Withdraw - Deposit\n- Transfer - Top",
    },
    category: "economy",
    countDown: 3,
    role: 0,
    author: "Loufi | SiAM | Samuel\n\nModified: Shikaki",
  },

  onStart: async function ({ args, message, event, api, usersData }) {
    const { getPrefix } = global.utils;
    const p = getPrefix(event.threadID);

    const commandAliases = {
      "bal": "balance",
      "to": "top",
      "depo": "deposit",
      "wd": "withdraw", // Short for withdraw
      "int": "interest", // Short for interest
      "-t": "transfer" // Short for transfer
    };

    const command = commandAliases[args[0]?.toLowerCase()] || args[0]?.toLowerCase();
    
    const userMoney = await usersData.get(event.senderID, "money");
    const userId = parseInt(event.senderID);

    const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
      await client.connect();
      const database = client.db("GoatBotV2");
      const bankCollection = database.collection("bankData");

      let bankData = await bankCollection.findOne({ userId });
      if (!bankData) {
        bankData = { userId, bank: 0, lastInterestClaimed: Date.now() };
        await bankCollection.insertOne(bankData);
      }

      const bankBalance = bankData.bank || 0;
      const amount = parseInt(args[1]);

      // Balance command
      if (command === "balance") {
        return message.reply(`[🏦 Bank 🏦]\n\nYour bank balance is: ${formatMoney(bankBalance || 0)}.`);
      }

      // Deposit command
      if (command === "deposit") {
        console.log("Processing deposit...");
        if (isNaN(amount) || amount <= 0) {
          return message.reply("[🏦 Bank 🏦]\n\n❌ Please enter a valid amount to deposit.");
        }
        if (userMoney < amount) {
          return message.reply("Insufficient funds to deposit.");
        }
        try {
          const result = await bankCollection.updateOne({ userId }, { $inc: { bank: amount } });
          if (result.modifiedCount === 0) {
            console.log("Failed to update bank data.");
            return message.reply("An error occurred while depositing your funds.");
          }
          await usersData.set(event.senderID, { money: userMoney - amount });
          return message.reply(`[🏦 Bank 🏦]\n\n✅ Successfully deposited $${amount} into your bank account`);
        } catch (error) {
          console.error("Error during deposit:", error);
          return message.reply("An error occurred while processing your deposit request.");
        }
      }

// set command to manually set a user's bank balance
if (command === "set") {
  if (args.length < 3) {
    return message.reply("[🏦 Bank 🏦]\n\n❌ Please specify a valid user ID(s) and amount to set.");
  }

  const targetUIDs = args.slice(1, args.length - 1); // All user IDs except the first command and last amount
  const newAmount = parseInt(args[args.length - 1]);

  // Validate the new amount to ensure it's a valid number
  if (isNaN(newAmount) || newAmount < 0) {
    return message.reply("[🏦 Bank 🏦]\n\n❌ Please enter a valid amount to set. The amount must be a positive number.");
  }

  // Check if the user has permission to modify balances (for example, admin check)
  if (event.senderID !== '61556006709662') {  // Replace '61556006709662' with the actual admin's user ID
    return message.reply("[🏦 Bank 🏦]\n\n❌ You do not have permission to set the bank balance for another user.");
  }

  // Validate if there are any target user IDs specified
  if (targetUIDs.length === 0) {
    return message.reply("[🏦 Bank 🏦]\n\n❌ Please specify at least one user ID to set their bank balance.");
  }

  // Prepare for responses and update operation
  let successfulUpdates = [];
  let failedUpdates = [];

  // Iterate over the list of target user IDs and update their bank balances
  for (let i = 0; i < targetUIDs.length; i++) {
    const targetUID = parseInt(targetUIDs[i]);

    if (isNaN(targetUID)) {
      failedUpdates.push(targetUID);
      continue; // Skip invalid user IDs
    }

    // Fetch the target user's bank data
    const targetBankData = await bankCollection.findOne({ userId: targetUID });
    if (!targetBankData) {
      failedUpdates.push(targetUID);
      continue;
    }

    // Set the new amount for the target user's bank balance
    await bankCollection.updateOne(
      { userId: targetUID },
      { $set: { bank: newAmount } }
    );

    successfulUpdates.push(targetUID);
  }

  // Prepare the response message
  let responseMessage = "[🏦 Bank 🏦]\n\n";
  if (successfulUpdates.length > 0) {
    responseMessage += `✅ Successfully set the bank balance of user(s) ${successfulUpdates.join(", ")} to $${formatMoney(newAmount)}.\n`;
  }
  if (failedUpdates.length > 0) {
    responseMessage += `❌ Failed to find user(s) ${failedUpdates.join(", ")} in the bank database or invalid user IDs.\n`;
  }

  return message.reply(responseMessage);
	    }	    
	    
      // Transfer command
      if (command === "transfer") {
        let recipientID;
        let transferAmount;

        // Check if there are mentions in the event
        if (event.mentions && Object.keys(event.mentions).length > 0) {
          // Get the first mentioned user ID
          recipientID = Object.keys(event.mentions)[0];
          
          // Find the amount by looking through the args for the first number
          transferAmount = parseInt(args.find(arg => !isNaN(arg)));
        } else {
          // If no mentions, use the first argument as recipient ID and second as amount
          recipientID = args[0];
          transferAmount = parseInt(args[1]);
        }

        // Ensure the amount is valid
        if (isNaN(transferAmount) || transferAmount <= 0) {
          return message.reply("[🏦 Bank 🏦]\n\n❌ Please enter a valid amount to transfer");
        }

        // Ensure recipientID is valid
        if (!recipientID) {
          return message.reply("[🏦 Bank 🏦]\n\n❌ Please specify the recipient's user ID or mention someone to transfer money to");
        }

        // Fetch recipient's bank data
        const recipientBankData = await bankCollection.findOne({ userId: parseInt(recipientID) });
        if (!recipientBankData) {
          // If the recipient doesn't have bank data, create it
          console.log(`Recipient ${recipientID} not found in bank data. Creating new record.`);
          await bankCollection.insertOne({ userId: parseInt(recipientID), bank: 0, lastInterestClaimed: Date.now() });
        }

        // Check if the recipient is the sender (can't transfer money to yourself)
        if (parseInt(recipientID) === userId) {
          return message.reply("[🏦 Bank 🏦]\n\n❌ You cannot transfer money to yourself");
        }

        const senderBankBalance = bankData.bank || 0;
        const recipientBankBalance = recipientBankData.bank || 0;

        // Prevent transfer if recipient's bank balance is too high (safety check)
        if (recipientBankBalance >= 1e104) {
          return message.reply("[🏦 Bank 🏦]\n\n❌ The recipient's bank balance is already $1e104. You cannot transfer money to them");
        }

        // Check if sender has enough funds
        if (transferAmount > senderBankBalance) {
          return message.reply("[🏦 Bank 🏦]\n\n❌ You don't have enough money in your bank account for this transfer");
        }

        // Fetch recipient's name from the user info API
        const recipientInfo = await api.getUserInfo(recipientID);
        const recipientName = recipientInfo[recipientID]?.name || "Unknown User"; // Fallback if name not found

        // Update sender's and recipient's bank balance in the database
        await bankCollection.updateOne(
          { userId: userId },
          { $inc: { bank: -transferAmount } }
        );
        await bankCollection.updateOne(
          { userId: parseInt(recipientID) },
          { $inc: { bank: transferAmount } }
        );

        // Notify user of successful transfer with recipient's name only (no UID)
        return message.reply(`[🏦 Bank 🏦]\n\n✅ Successfully transferred $${transferAmount} to ${recipientName}`);
      }

      // Withdraw command
      if (command === "withdraw") {
        if (isNaN(amount) || amount <= 0) {
          return message.reply("[🏦 Bank 🏦]\n\n❌ Please enter the correct amount to withdraw");
        }
        if (amount > bankBalance) {
          return message.reply("[🏦 Bank 🏦]\n\n❌ Insufficient bank balance to withdraw.");
        }
        await bankCollection.updateOne({ userId }, { $inc: { bank: -amount } });
        await usersData.set(event.senderID, { money: userMoney + amount });
        return message.reply(`[🏦 Bank 🏦]\n\n✅ Successfully withdrew $${amount} from your bank account`);
      }

	    
if (command === "interest") {
  const interestRate = 0.01; // 1% daily interest rate
  const lastInterestClaimed = bankData.lastInterestClaimed || 0;

  const currentTime = Date.now();
  const timeDiffInSeconds = (currentTime - lastInterestClaimed) / 1000;

  if (timeDiffInSeconds < 86400) {
    // If it's been less than 24 hours since the last interest claim
    const remainingTime = Math.ceil(86400 - timeDiffInSeconds);
    const remainingHours = Math.floor(remainingTime / 3600);
    const remainingMinutes = Math.floor((remainingTime % 3600) / 60);

    return message.reply(`╔════ஜ۩۞۩ஜ═══╗\n\n[🏦 Bank 🏦]\n\n❏You can claim interest again in ${remainingHours} hours and ${remainingMinutes} minutes 😉•\n\n╚════ஜ۩۞۩ஜ═══╝`);
  }

  if (bankData.bank <= 0) {
    return message.reply("╔════ஜ۩۞۩ஜ═══╗\n\n[🏦 Bank 🏦]\n\n❏You don't have any money in your bank account to earn interest 💸🥱•\n\n╚════ஜ۩۞۩ஜ═══╝");
  }

  // Calculate daily interest
  const interestEarned = bankData.bank * interestRate;  // 1% interest per day

  // Update the bank data and last interest claimed timestamp in MongoDB
  await bankCollection.updateOne(
    { userId }, 
    { 
      $set: { lastInterestClaimed: currentTime }, 
      $inc: { bank: interestEarned } 
    }
  );

  return message.reply(`╔════ஜ۩۞۩ஜ═══╗\n\n[🏦 Bank 🏦]\n\n❏You have earned interest of $${formatMoney(interestEarned)}\n\nIt has been successfully added to your account balance ✅•\n\n╚════ஜ۩۞۩ஜ═══╝`);
}
	    
// Payloan command
if (command === "payloan") {
  const amount = parseInt(args[1]); // Loan repayment amount
  const bankData = await bankCollection.findOne({ userId });

  // If the user doesn't have any bank data, reply with an error
  if (!bankData) {
    return message.reply("[🏦 Bank 🏦]\n\n❌ No bank data found for this user. Please try again later.");
  }

  const loanBalance = bankData.loan || 0; // The user's current loan balance

  if (isNaN(amount) || amount <= 0) {
    return message.reply("╔════ஜ۩۞۩ஜ═══╗\n\n[🏦 Bank 🏦]\n\n❏Please enter a valid amount to repay your loan ✖️•\n\n╚════ஜ۩۞۩ஜ═══╝");
  }

  if (loanBalance <= 0) {
    return message.reply("╔════ஜ۩۞۩ஜ═══╗\n\n[🏦 Bank 🏦]\n\n❏You don't have any pending loan payments•\n\n✧⁺⸜(●˙▾˙●)⸝⁺✧ʸᵃʸ\n\n╚════ஜ۩۞۩ஜ═══╝");
  }

  if (amount > loanBalance) {
    return message.reply(`╔════ஜ۩۞۩ஜ═══╗\n\n[🏦 Bank 🏦]\n\n❏The amount required to pay off the loan is greater than your due amount. Please pay the exact amount 😊•\nYour total loan: $${loanBalance}\n\n╚════ஜ۩۞۩ஜ═══╝`);
  }

  const userMoney = await usersData.get(event.senderID, "money"); // User's current balance
  
  if (amount > userMoney) {
    return message.reply(`╔════ஜ۩۞۩ஜ═══╗\n\n[🏦 Bank 🏦]\n\n❏You do not have $${amount} in your balance to repay the loan 😢•\n\n╚════ஜ۩۞۩ஜ═══╝`);
  }

  // Update the loan balance in MongoDB
  const updatedLoanBalance = loanBalance - amount;

  await bankCollection.updateOne(
    { userId }, 
    { 
      $set: { loan: updatedLoanBalance }, // Update the user's loan balance
      $set: { loanPayed: updatedLoanBalance === 0 } // Mark the loan as paid if the balance is 0
    }
  );

  // Update the user's money in the usersData
  await usersData.set(event.senderID, {
    money: userMoney - amount // Deduct the repayment amount from the user's balance
  });

  return message.reply(`╔════ஜ۩۞۩ஜ═══╗\n\n[🏦 Bank 🏦]\n\n❏Successfully repaid $${amount} towards your loan. Your current loan to pay: $${updatedLoanBalance} ✅•\n\n╚════ஜ۩۞۩ஜ═══╝`);
      }
	
      // Top command (Display top 10 richest users)
      if (command === "top") {
        const topUsers = await bankCollection.find({}).sort({ bank: -1 }).limit(10).toArray();
        if (topUsers.length === 0) {
          return message.reply("No data available for top users.");
        }

        let topList = "[🏦 Bank 🏦]\n\nTop 10 Bank richest users:\n";
        for (let i = 0; i < topUsers.length; i++) {
          const userId = topUsers[i].userId;
          const userInfo = await api.getUserInfo(userId);
          const userName = userInfo[userId]?.name || "Unknown User";
          const balanceDisplay = topUsers[i].bank ? formatMoney(topUsers[i].bank) : "0";
          topList += `[${i + 1}] ${userName}: ${balanceDisplay}\n`;
        }
        topList += "\n";
        return message.reply(topList);
      }

    } catch (error) {
      console.error("Error during MongoDB operation:", error);
      return message.reply("An error occurred while processing your request.");
    } finally {
      await client.close();
    }
  },
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
