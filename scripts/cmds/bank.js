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
      en: "{pn}Bank:\n - Interest\n - Balance\n - Withdraw\n - Deposit\n - Transfer\n - Top\n - Loan\n - Payloan",
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
      "-d": "deposit",
      "-w": "withdraw", // Short for withdraw
      "int": "interest", // Short for interest
      "-t": "transfer", // Short for transfer
      "l": "loan",
      "pl": "payloan"
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

     if (command === "balance") {
    if (event.type === "message_reply") {
        const reply = event.messageReply;
        const userID = reply.senderID;
        const userName = reply.senderName || (await usersData.get(userID, "name")) || "Unknown User";
        let repliedUserBankData = await bankCollection.findOne({ userId: parseInt(userID) });
        if (!repliedUserBankData) {
            repliedUserBankData = { userId: parseInt(userID), bank: 0, lastInterestClaimed: Date.now() };
            await bankCollection.insertOne(repliedUserBankData);
        }
        const repliedUserBankBalance = repliedUserBankData.bank || 0;
        return message.reply(`[🏦 Bank 🏦]\n\n${userName}'s bank balance is: ${formatMoney(repliedUserBankBalance)}.`);
    }

    if (Object.keys(event.mentions).length > 0) {
        const uids = Object.keys(event.mentions);
        const mentionsBalances = await Promise.all(
            uids.map(async (uid) => {
                const userName = event.mentions[uid] || (await usersData.get(uid, "name")) || "Unknown User";
                let userBankData = await bankCollection.findOne({ userId: parseInt(uid) });
                if (!userBankData) {
                    userBankData = { userId: parseInt(uid), bank: 0, lastInterestClaimed: Date.now() };
                    await bankCollection.insertOne(userBankData);
                }
                const userBankBalance = userBankData.bank || 0;
                return `${userName}'s bank balance is: ${formatMoney(userBankBalance)}`;
            })
        );
        return message.reply(`[🏦 Bank 🏦]\n\n${mentionsBalances.join("\n")}`);
    }

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
	    
if (command === "transfer") {
  let recipientID;
  let transferAmount;

  // Check for mentions first
  if (event.mentions && Object.keys(event.mentions).length > 0) {
    // Use the first mentioned user
    recipientID = Object.keys(event.mentions)[0];
    transferAmount = parseInt(args[args.length - 1]); // Last argument as amount
  } else if (event.messageReply && event.messageReply.senderID) {
    // Use the user ID of the replied-to message sender
    recipientID = event.messageReply.senderID;
    transferAmount = parseInt(args[args.length - 1]); // Last argument as amount
  } else {
    // Use direct args for recipient and amount
    recipientID = args[0];
    transferAmount = parseInt(args[args.length - 1]); // Last argument as amount
  }

  // Validate inputs
  if (isNaN(transferAmount) || transferAmount <= 0) {
    return message.reply("[🏦 Bank 🏦]\n\n❌ Please enter a valid amount to transfer.");
  }
  if (!recipientID) {
    return message.reply("[🏦 Bank 🏦]\n\n❌ Please specify the recipient by replying to their message, mentioning them, or providing their user ID.");
  }
  if (parseInt(recipientID) === userId) {
    return message.reply("[🏦 Bank 🏦]\n\n❌ You cannot transfer money to yourself.");
  }

  // Fetch recipient's bank data
  let recipientBankData = await bankCollection.findOne({ userId: parseInt(recipientID) });
  if (!recipientBankData) {
    await bankCollection.insertOne({ userId: parseInt(recipientID), bank: 0, lastInterestClaimed: Date.now() });
    recipientBankData = { userId: parseInt(recipientID), bank: 0 };
  }

  // Check sender's balance
  if (transferAmount > bankBalance) {
    return message.reply("[🏦 Bank 🏦]\n\n❌ You don't have enough funds in your bank account.");
  }

  // Update sender's and recipient's balances
  await bankCollection.updateOne({ userId }, { $inc: { bank: -transferAmount } });
  await bankCollection.updateOne({ userId: parseInt(recipientID) }, { $inc: { bank: transferAmount } });

  // Fetch recipient's name for confirmation
  const recipientInfo = await api.getUserInfo(recipientID);
  const recipientName = recipientInfo[recipientID]?.name || "Unknown User";

  // Reply with success
  return message.reply(`[🏦 Bank 🏦]\n\n✅ Successfully transferred $${formatMoney(transferAmount)} to ${recipientName}.`);
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

    return message.reply(`[🏦 Bank 🏦]\n\n❌ You can claim interest again in ${remainingHours} hours and ${remainingMinutes} minutes`);
  }

  if (bankData.bank <= 0) {
    return message.reply("[🏦 Bank 🏦]\n\n❌ You don't have any money in your bank account to earn interest");
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

  return message.reply(`[🏦 Bank 🏦]\n\n✅ You have earned interest of $${formatMoney(interestEarned)}`);
}

if (command === "loan") {
  const maxLoanAmount = 100000; // Max loan amount can be adjusted
  const amount = parseInt(args[1]); // Loan amount from user input

  // Ensure the user entered a valid loan amount
  if (isNaN(amount) || amount <= 0) {
    return message.reply("[🏦 Bank 🏦]\n\n❌ Please enter a valid loan amount");
  }

  // Check if the loan amount exceeds the maximum limit
  if (amount > maxLoanAmount) {
    return message.reply(`[🏦 Bank 🏦]\n\n❌ The maximum loan amount is $${formatMoney(maxLoanAmount)}.`);
  }

  // Fetch the user's bank data to check for existing loans
  const bankData = await bankCollection.findOne({ userId });
  
  if (!bankData) {
    return message.reply("[🏦 Bank 🏦]\n\n❌ No bank data found for this user. Please try again later.");
  }

  const userLoan = bankData.loan || 0; // Current loan balance
  const loanPayed = bankData.loanPayed !== undefined ? bankData.loanPayed : true; // Check if previous loan was paid off

  // Ensure the user has paid off any existing loans
  if (!loanPayed && userLoan > 0) {
    return message.reply(`[🏦 Bank 🏦]\n\n❌ You cannot take a new loan until you pay off your current loan.\n\nYour current loan to pay: $${formatMoney(userLoan)}.`);
  }

  // If eligible, add the loan amount to the user's balance and update the loan information
  const newLoanBalance = userLoan + amount;
  await bankCollection.updateOne(
    { userId },
    { 
      $set: { loan: newLoanBalance, loanPayed: false }, // Mark loan as unpaid
      $inc: { bank: amount } // Add loan amount to the bank balance
    }
  );

  return message.reply(`[🏦 Bank 🏦]\n\n✅ You have successfully taken a loan of $${formatMoney(amount)}. Please note that loans must be repaid within a certain period.`);
}
	    
if (command === "payloan") {
  const amount = parseInt(args[1]); // Loan repayment amount
  const bankData = await bankCollection.findOne({ userId });

  // If the user doesn't have any bank data, reply with an error
  if (!bankData) {
    return message.reply("[🏦 Bank 🏦]\n\n❌ No bank data found for this user. Please try again later.");
  }

  const loanBalance = bankData.loan || 0; // The user's current loan balance

  if (isNaN(amount) || amount <= 0) {
    return message.reply("[🏦 Bank 🏦]\n\n❌ Please enter a valid amount to repay your loan");
  }

  if (loanBalance <= 0) {
    return message.reply("[🏦 Bank 🏦]\n\n❌ You don't have any pending loan payments");
  }

  if (amount > loanBalance) {
    return message.reply(`[🏦 Bank 🏦]\n\n❌ The amount required to pay off the loan is greater than your due amount. Please pay the exact amount\nYour total loan: $${loanBalance}.`);
  }

  const userMoney = await usersData.get(event.senderID, "money"); // User's current balance
  
  if (amount > userMoney) {
    return message.reply(`[🏦 Bank 🏦]\n\n❌ You do not have $${amount} in your balance to repay to loan`);
  }

  // Update the loan balance in MongoDB
  const updatedLoanBalance = loanBalance - amount;

  // Update loan status: if the loan is fully paid, mark as paid
  const loanPayedStatus = updatedLoanBalance === 0;

  await bankCollection.updateOne(
    { userId }, 
    { 
      $set: { loan: updatedLoanBalance, loanPayed: loanPayedStatus }, // Update loan balance and status
    }
  );

  // Update the user's money in the usersData
  await usersData.set(event.senderID, {
    money: userMoney - amount // Deduct the repayment amount from the user's balance
  });

  // Return updated message
  if (loanPayedStatus) {
    return message.reply(`[🏦 Bank 🏦]\n\n✅ You have successfully repaid your loan of $${amount}. Your loan is now fully paid off.`);
  } else {
    return message.reply(`[🏦 Bank 🏦]\n\n✅ Successfully repaid $${amount} towards your loan. Your current loan to pay: $${updatedLoanBalance}.`);
  }
}
	
 if (command === "top") {
  try {
    const topUsers = await bankCollection.find({}).sort({ bank: -1 }).limit(15).toArray();

    if (!topUsers || topUsers.length === 0) {
      return message.reply("No data available for top users.");
    }

    const topList = "[🏦 Bank 🏦]\n\nTop 15 Bank Richest Users:\n" +
      (await Promise.all(
        topUsers.map(async (user, index) => {
          if (!user || !user.userId) return null;

          const userId = user.userId;
          const userInfo = await api.getUserInfo(userId);
          const userName = userInfo[userId]?.name || "Unknown User";
          const balanceDisplay = user.bank ? formatMoney(user.bank) : "0";
          return `[${index + 1}] ${userName}: ${balanceDisplay}`;
        })
      )).filter(Boolean).join("\n");

    return message.reply(topList);

  } catch (error) {
    console.error("Error fetching top users:", error);
    return message.reply("❌ An error occurred while fetching the top bank users.");
  }
}
    return message.reply("[🏦 Bank 🏦]\n\n❌ Please use one of the following valid commands: Balance, Deposit, Withdraw, Interest, Transfer, Top, Loan, PayLoan.");
  } catch (error) {
    console.error("Error during MongoDB operation:", error);
    return message.reply("[🏦 Bank 🏦]\n\n❌ An error occurred while processing your request. Please try again later.");
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
