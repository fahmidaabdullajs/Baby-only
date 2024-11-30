const { config } = global.GoatBot;
const fs = require("fs-extra");

module.exports.config = {
  name: "pending",
  aliases: ["approve", "pen"],
  version: "1.5",
  author: "Dipto",
  role: 0,
  category: "general",
  description: { 
    en: "Accept pending Groups"
  },
  countDown: 2,
  guide: {
    en: "{pn}"
  }
};

module.exports.onStart = async ({ api, event, args, usersData }) => {
  const directID = args[0];
  if (directID) {
    try {
      const info = await api.getThreadInfo(directID);
        const maleCount = info.userInfo.filter(user => user.gender === "MALE").length || 0;
        const femaleCount = info.userInfo.filter(user => user.gender === "FEMALE").length || 0;
        const otherCount = info.userInfo.length - maleCount - femaleCount || 0;
        const groupDetails = `Accepted successfully 🎉🎉\n╭───✦ Group Info ✦───╮\n├‣ Name: ${info.name || 'none'}\n├‣ Thread ID: ${info.threadID || 'none'}\n├‣ Emoji: ${info.emoji || 'None'}\n├‣ Approval Mode: ${info.approvalMode ? 'Enabled' : 'Disabled'}\n├‣ Admins: ${info.adminIDs.length}\n├‣ Members: ${info.userInfo.length}\n├‣ Male: ${maleCount}\n├‣ Female: ${femaleCount}\n├‣ Other: ${otherCount}\n├‣ Invite Link: ${info.inviteLink && info.inviteLink.enable ? info.inviteLink.link : 'None'}\n╰────────────────────⧕`;
        api.sendMessage(`✅ | Group approved successfully by ${await usersData.getName(event.senderID)}`, directID);
if (config.whiteListModeThread.whiteListThreadIds.includes(directID)){
      console.log("Already added in whitelistThread");
      }
    else{      config.whiteListModeThread.whiteListThreadIds.push(directID);
        }
        return api.sendMessage(groupDetails, event.threadID, event.messageID);
    } catch (error) {
      return api.sendMessage(`🔍 Searching...\nSorry, the group with ID ${directID} was not found in pending or other groups.`, event.threadID, event.messageID);
    }
  }

  try {
    let ren = 100;
    const pendingGroups = await api.getThreadList(ren, null, ['PENDING']);
    const otherGroups = await api.getThreadList(ren, null, ['OTHER']);
    const allGroups = [...pendingGroups, ...otherGroups];

    const pendingNames = allGroups.map(group => group.threadName);
    const pendingIDs = allGroups.map(group => group.threadID);

    if (pendingNames.length === 0) {
      return api.sendMessage("No pending or other groups found.", event.threadID, event.messageID);
    }
    let groups = `╭─✦ Pending and Other Groups ✦─╮\n`;
    pendingNames.forEach((name, index) => {
      groups += `├‣ ${index + 1}. ${name}\n├‣ Group ID: ${pendingIDs[index]}\n`;
    });
    groups += `╰───────────────────⧕\nReply to this message with the number of the group you want to accept.`;

    api.sendMessage(groups, event.threadID, (error, info) => {
global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        type: "reply",
        messageID: info.messageID,
        author: event.senderID,
        pendingIDs: pendingIDs
      });
    }, event.messageID);

  } catch (error) {
    api.sendMessage(error.message, event.threadID, event.messageID);
  }
};

module.exports.onReply = async ({ api, event, Reply,usersData }) => {
  const { author, messageID, pendingIDs } = Reply;
  if (event.senderID != author) return;
  const choice = parseInt(event.body);
  if (isNaN(choice) || choice < 1 || choice > pendingIDs.length) {
    return api.sendMessage("Invalid choice. Please try again.", event.threadID, event.messageID);
  }

  const finalTid = pendingIDs[choice - 1];
  try {
    const info = await api.getThreadInfo(finalTid);

    if (config.whiteListModeThread.whiteListThreadIds.includes(finalTid)){
      console.log("Already added in whitelistThread");
      }
    else{      config.whiteListModeThread.whiteListThreadIds.push(finalTid);
    }
    const maleCount = info.userInfo.filter(user => user.gender === "MALE").length || 0;
    const femaleCount = info.userInfo.filter(user => user.gender === "FEMALE").length || 0;
    const otherCount = info.userInfo.length - maleCount - femaleCount || 0;
    const groupDetails = `Accepted Group🎉🎉🎉\n╭───✦ Group Info ✦───╮\n├‣ Name: ${info.name || 'none'}\n├‣ Thread ID: ${info.threadID || 'none'}\n├‣ Emoji: ${info.emoji || 'None'}\n├‣ Approval Mode: ${info.approvalMode ? 'Enabled' : 'Disabled'}\n├‣ Admins: ${info.adminIDs.length}\n├‣ Members: ${info.userInfo.length}\n├‣ Male: ${maleCount}\n├‣ Female: ${femaleCount}\n├‣ Other: ${otherCount}\n├‣ Goup photo:${info.imageSrc || 'none'}\n├‣ Invite Link: ${info.inviteLink && info.inviteLink.enable ? info.inviteLink.link : 'None'}\n╰───────────────────⧕`;
    api.sendMessage(`✅ | Group approved successfully by ${await usersData.getName(event.senderID)}`, finalTid);
    api.editMessage(groupDetails, messageID);
  } catch (error) {
    api.editMessage(`Sorry, ${error.message}`, messageID);
  }
  global.GoatBot.onReply.delete(messageID);
};
