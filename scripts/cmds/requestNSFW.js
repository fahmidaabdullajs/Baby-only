const fs = require("fs");
const path = require("path");
const { config } = global.GoatBot;

const pendingIDsPath = path.join(__dirname, "assist_json", "pending_ids.json");
const approvedIDsPath = path.join(__dirname, "assist_json", "approved_ids.json");

module.exports = {
  config: {
    name: "requestnsfw",
    version: "1.1",
    author: "Mah MUD",
    countDown: 5,
    category: "utility",
    role: 0,
    guide: {
      en: "{pn} Your <message for admin> "
    }
  },

  onStart: async function ({ api, args, event, threadsData }) {
    const { getPrefix } = global.utils;
       const p = getPrefix(event.threadID);
    const threadID = event.threadID;
    const senderID = event.senderID;
    const threadInfo = await api.getThreadInfo(threadID);

    // Check if the thread ID is already approved
    if (fs.existsSync(approvedIDsPath)) {
      const approvedIDs = JSON.parse(fs.readFileSync(approvedIDsPath));
      if (approvedIDs.includes(threadID)) {
        const approvalMsg = `╔════ஜ۩۞۩ஜ═══╗\n\nNo need for approval. This thread is already approved to use the NSFW command.\n\n If you don't know how to use this bot then join the support Box \nType : ${p}support or ${p}supportgc\nto join.\n\n╚════ஜ۩۞۩ஜ═══╝`;
        api.sendMessage(approvalMsg, threadID);
        return;
      }
    }

    // Check if the thread ID is already pending
    if (fs.existsSync(pendingIDsPath)) {
      const pendingIDs = JSON.parse(fs.readFileSync(pendingIDsPath));
      if (pendingIDs.includes(threadID)) {
        const pendingMsg = `╔════ஜ۩۞۩ஜ═══╗\n\nYour request is already in pending.... \nPlease Contact: BADBOY for fast approval.\nFB: https://www.facebook.com/rockexe007\n\n or join the support box for help \nType : ${p}support or ${p}supportgc\nto join\n\n╚════ஜ۩۞۩ஜ═══╝`;
        api.sendMessage(pendingMsg, threadID);
        return;
      }
    } else {
      // If the file doesn't exist, create an empty array
      fs.writeFileSync(pendingIDsPath, "[]");
    }

    // Check if the user provided a message for the admin
    const userMessage = args.join(" ");
    if (!userMessage) {
      const messageReminder = `╔════ஜ۩۞۩ஜ═══╗\n\nPlease add a message for the admin. \n\nExample: {pn} yourmessage\n\n╚════ஜ۩۞۩ஜ═══╝`;
      api.sendMessage(messageReminder, threadID);
      return;
    }

    // Store the thread ID in the pending list
    const pendingIDs = JSON.parse(fs.readFileSync(pendingIDsPath));
    pendingIDs.push(threadID);
    fs.writeFileSync(pendingIDsPath, JSON.stringify(pendingIDs));

    const msg = `╔════ஜ۩۞۩ஜ═══╗\n\n------NSFW Request------\n\nThread ID: ${threadID}\nThread Type: ${threadInfo.isGroup ? "Group" : "User"}\n${threadInfo.isGroup ? `Group Name: ${threadInfo.name}\n\nRequester ID: ${senderID}\nRequester Name: ${await getUserName(api, senderID)}` : `User Name: ${await getUserName(api, senderID)}`}\n\nMessage: ${userMessage}\n\n╚════ஜ۩۞۩ஜ═══╝`;
for (const adminID of config.DEV) {
  api.sendMessage(msg, adminID);
}


    const notifyMsg = `╔════ஜ۩۞۩ஜ═══╗\n\n✅Your approval request has been sent to admin BADBOY with this\nmessage: ${userMessage}.\n\n I will notify you if your thread is approved. Please wait until then.\n\n join the support box for fast approve \ntype : ${p} support or ${p} supportgc\nto join\n\n╚════ஜ۩۞۩ஜ═══╝`;
    api.sendMessage(notifyMsg, threadID);
  }
};

async function getUserName(api, userID) {
  const user = await api.getUserInfo(userID);
  return user[userID].name;
      }
