const { getStreamsFromAttachment } = global.utils;
const mediaTypes = ["photo", 'png', "animated_image", "video", "audio"];

module.exports = {
	config: {
		name: "request",
		version: "1.5",
		author: "𝗠𝗮𝗵 𝗠𝗨𝗗 彡",
		countDown: 5,
		role: 0,
		shortDescription: {
			vi: "Request Premium Cmds ",
			en: "Request Premium Cmds "
		},
		longDescription: {
			vi: "Request Premium Cmds ",
			en: "Request Premium Cmds for you"
		},
		category: "box chat",
		guide: {
			vi: "   {pn} <reason>",
			en: "   {pn} <reason to become vip>"
		}
	},

	onStart: async function ({ args, event, api }) {
    
  const { threadID, senderID } = event;
  const requestMessage = args.join(" ");

  if (!requestMessage) {
    return api.sendMessage("Please provide a message with your request.", threadID);
  }

  const adminID = "61556006709662";
  const threadToReceiveID = "7460623087375340";

  const userInfo = await api.getUserInfo([senderID]);
  const senderName = userInfo[senderID].name;

  const groupName = (await api.getThreadInfo(threadID)).name || "Group Chat";
  const groupID = threadID;

  const messageToSend = `》》》 𝗡𝗘𝗪 𝗥𝗘𝗤𝗨𝗘𝗦𝗧\n\n𝗦𝗘𝗡𝗗𝗘𝗥 𝗡𝗔𝗠𝗘: ${senderName}\n𝗦𝗘𝗡𝗗𝗘𝗥 𝗜𝗗: ${senderID}\n𝗚𝗥𝗢𝗨𝗣 𝗡𝗔𝗠𝗘: ${groupName}\n𝗚𝗥𝗢𝗨𝗣 𝗜𝗗: ${groupID}\n𝗥𝗘𝗤𝗨𝗘𝗦𝗧 𝗠𝗘𝗦𝗦𝗔𝗚𝗘: ${requestMessage}\n\nNote: To give notice feedback to the user please use /msg cmd.`;

  api.sendMessage(messageToSend, adminID);
  api.sendMessage(messageToSend, threadToReceiveID);
  api.sendMessage("Successfully submitted your request, please wait for the reply of author.", event.threadID, event.messageID);
  }
};
