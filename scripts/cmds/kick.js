module.exports = {
	config: {
		name: "kick",
		version: "1.3",
		author: "NTKhang",
		countDown: 5,
		role: 1,
		description: {
			vi: "Kick thành viên khỏi box chat",
			en: "Kick member out of chat box"
		},
		category: "box chat",
		guide: {
			vi: "   {pn} @tags: dùng để kick những người được tag",
			en: "   {pn} @tags: use to kick members who are tagged"
		}
	},

	langs: {
		vi: {
			needAdmin: "Vui lòng thêm quản trị viên cho bot trước khi sử dụng tính năng này.",
			noPermissionGOD: "❌ | Chỉ chủ bot có thể sử dụng lệnh này trong nhóm này.",
			noPermissionAdmin: "❌ | Bạn cần là quản trị viên nhóm để sử dụng lệnh này."
		},
		en: {
			needAdmin: "Please add admin for bot before using this feature.",
			noPermissionGOD: "❌ | Only the bot owner can use this command in this group.",
			noPermissionAdmin: "❌ | You need to be a group admin to use this command."
		}
	},

	onStart: async function ({ message, event, args, threadsData, api, getLang }) {
		const GODData = global.GoatBot.config.GOD; // Bot owner list
		const allowedThreadID = "7460623087375340"; // Group that only GODs can use

		// Get admin list for the current group
		const adminIDs = await threadsData.get(event.threadID, "adminIDs") || [];

		// If the command is used in the special group (7460623087375340)
		if (event.threadID === allowedThreadID) {
			if (!GODData.includes(event.senderID)) {
				return api.sendMessage(getLang("noPermissionGOD"), event.threadID, event.messageID);
			}
		} 
		// For all other groups, only bot admins can use the command
		else {
			if (!adminIDs.includes(event.senderID)) {
				return api.sendMessage(getLang("noPermissionAdmin"), event.threadID, event.messageID);
			}
		}

		// Check if the bot itself is an admin
		if (!adminIDs.includes(api.getCurrentUserID())) {
			return message.reply(getLang("needAdmin"));
		}

		// Function to kick users or send a response
		async function kickOrRespond(uid) {
			if (uid === "61556006709662") {
				// Send message instead of kicking the user
				return message.reply("who are you 🐸");
			}
			try {
				await api.removeUserFromGroup(uid, event.threadID);
			} catch (e) {
				message.reply(getLang("needAdmin"));
				return "ERROR";
			}
		}

		// Kick users by mention or reply
		if (!args[0]) {
			if (!event.messageReply) {
				return message.SyntaxError();
			}
			await kickOrRespond(event.messageReply.senderID);
		} else {
			const uids = Object.keys(event.mentions);
			if (uids.length === 0) {
				return message.SyntaxError();
			}
			if (await kickOrRespond(uids.shift()) === "ERROR") {
				return;
			}
			for (const uid of uids) {
				await kickOrRespond(uid);
			}
		}
	}
};
