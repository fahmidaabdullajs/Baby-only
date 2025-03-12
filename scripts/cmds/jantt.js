const mongoose = require("mongoose");

const uri = "mongodb+srv://rockx27:rockonx27fire@cluster0.e5kr5.mongodb.net/GoatBotV2?retryWrites=true&w=majority&appName=Cluster0"; // Replace with your MongoDB connection string
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const TeachSchema = new mongoose.Schema({
  trigger: String,
  responses: [String]
});

const UserTeachCountSchema = new mongoose.Schema({
  userID: String,
  count: { type: Number, default: 0 }
});

const Teach = mongoose.models.Teach || mongoose.model("Teach", TeachSchema);
const UserTeachCount = mongoose.models.UserTeachCount || mongoose.model("UserTeachCount", UserTeachCountSchema);

module.exports.config = {
  name: "bbbx",
  aliases: ["jan"],
  version: "1.7",
  author: "MahMUD",
  countDown: 0,
  role: 0,
  category: "ai",
  guide: {
    en: "{pn} [anyMessage] OR\nteach [YourMessage] - [Reply1], [Reply2]... OR\nremove [YourMessage] OR\nlist OR\nlist all OR\nedit [YourMessage] - [NewMessage] OR\nmsg [YourMessage]"
  }
};

module.exports.onStart = async ({ api, event, args, usersData }) => {
  const userMessage = args.join(" ").toLowerCase();
  const uid = event.senderID;

  if (!args[0]) {
    const responses = ["Bolo baby", "hum", "type help baby", "type !baby hi"];
    return api.sendMessage(responses[Math.floor(Math.random() * responses.length)], event.threadID, event.messageID);
  }

  const badWords = ["fuck", "bitch", "mc", "maki", "bc", "maderchod", "asshole", "slut", "dick", "pussy", "whore", "magi", "buda", "bhuda", "voda", "vhuda", "vuda", "dhon", "heda", "khanki", "bessa", "noti", "kuttarbaccha", "gay", "hijla", "hijra", "ফাক", "বিচ", "মাদারচোদ", "অ্যাসহোল", "স্লাট", "ডিক", "পুসি", "হোয়ার", "মাগি", "ভোদা", "ভুদা", "ভুদা", "ধন", "হেদা", "খাকি", "বেশ্যা", "নটি", "কুকুরের বাচ্চা", "গে", "হিজড়া", "হিজলা"];

  if (args[0] === "teach") {
    const [trigger, responses] = userMessage.replace("teach ", "").split(" - ");
    if (!trigger || !responses) return api.sendMessage("❌ | Invalid format!", event.threadID, event.messageID);

    const responseArray = responses.split(", ").map(res => res.toLowerCase());

    const containsBadWord = responseArray.some(response => 
      badWords.some(badWord => new RegExp(`\\b${badWord}\\b`, "i").test(response))
    );

    if (containsBadWord) {
        return api.sendMessage("❌ | Teaching 18+ content is not allowed!", event.threadID, event.messageID);
    }

    const existing = await Teach.findOne({ trigger });
    if (existing) {
        return api.sendMessage(`❌ | "${trigger}" This reply has already been taught. Please add a new reply.`, event.threadID, event.messageID);
    }

    await Teach.create({ trigger, responses: responseArray });

    let userTeach = await UserTeachCount.findOne({ userID: uid });
    if (userTeach) {
        userTeach.count += 1;
        await userTeach.save();
    } else {
        userTeach = await UserTeachCount.create({ userID: uid, count: 1 });
    }

    const userName = await usersData.getName(uid) || "Unknown User";

    return api.sendMessage(`✅ Replies added\nReplies "${responses}" added to "${trigger}".\nTeacher: ${userName}\nTeachs: ${userTeach.count}`, event.threadID, event.messageID);
  }

  if (args[0] === "remove") {
    const [trigger, index] = userMessage.replace("remove ", "").split(" - ");
    const triggerEntry = await Teach.findOne({ trigger });

    if (!triggerEntry) {
      return api.sendMessage(`❌ No entry found for "${trigger}"`, event.threadID, event.messageID);
    }

    if (!index || isNaN(index) || index < 1 || index > triggerEntry.responses.length) {
      return api.sendMessage(`❌ Invalid index. Please provide a valid index between 1 and ${triggerEntry.responses.length}.`, event.threadID, event.messageID);
    }

    const responseToRemove = triggerEntry.responses.splice(index - 1, 1);
    await triggerEntry.save();

    return api.sendMessage(`✅ Removed response: "${responseToRemove}" from "${trigger}".`, event.threadID, event.messageID);
  }

  if (args[0] === "list" && args.length === 1) {
    const totalTeach = await Teach.countDocuments();
    return api.sendMessage(`🎀 𝐓𝐨𝐭𝐚𝐥 𝐓𝐞𝐚𝐜𝐡: ${totalTeach}`, event.threadID, event.messageID);
  }

  if (args[0] === "list" && args[1] === "all") {
    const userTeachCounts = await UserTeachCount.find();

    if (!userTeachCounts.length) {
      return api.sendMessage("❌ No user teach data found.", event.threadID, event.messageID);
    }

    userTeachCounts.sort((a, b) => b.count - a.count);

    const userNamesWithTeachCounts = await Promise.all(
      userTeachCounts.map(async (item) => {
        try {
          const userName = await usersData.getName(item.userID) || "Unknown User";
          return `${userName}: ${item.count}`;
        } catch (error) {
          console.error("Error fetching user info:", error);
          return `User ID: ${item.userID} | Taught: ${item.count}`;
        }
      })
    );

    const output = userNamesWithTeachCounts
      .map((item, index) => `${index + 1}. ${item}`)
      .join("\n");

    return api.sendMessage(`👑 | 𝐋𝐢𝐬𝐭 𝐨𝐟 𝐣𝐚𝐧 𝐓𝐞𝐚𝐜𝐡𝐞𝐫𝐬\n${output}`, event.threadID, event.messageID);
  }

  if (args[0] === "edit") {
    const allowedUserID = "61556006709662";
    if (uid !== allowedUserID) {
      return api.sendMessage("❌ You are not authorized to edit responses.", event.threadID, event.messageID);
    }

    const [oldTrigger, newResponse] = userMessage.replace("edit ", "").split(" - ");
    const updated = await Teach.findOneAndUpdate({ trigger: oldTrigger }, { responses: newResponse.split(", ") });

    if (!updated) return api.sendMessage(`❌ No entry found for "${oldTrigger}"`, event.threadID, event.messageID);

    return api.sendMessage(`✅ Edited response for "${oldTrigger}"`, event.threadID, event.messageID);
  }

  if (args[0] === "msg") {
    const searchTrigger = userMessage.replace("msg ", "");
    const entry = await Teach.findOne({ trigger: searchTrigger });

    if (!entry) return api.sendMessage(`❌ No entry found for "${searchTrigger}"`, event.threadID, event.messageID);

    return api.sendMessage(`✅ Message for "${searchTrigger}" = ${entry.responses.join(", ")}`, event.threadID, event.messageID);
  }

  const entry = await Teach.findOne({ trigger: userMessage });
  if (entry) {
    return api.sendMessage(entry.responses[Math.floor(Math.random() * entry.responses.length)], event.threadID, event.messageID);
  }

  return api.sendMessage("I don't know this yet. Use 'teach [message] - [response]'", event.threadID, event.messageID);
};
