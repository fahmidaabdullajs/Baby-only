const { removeHomeDir, log } = global.utils;

module.exports = {
	config: {
		name: "eval",
		version: "1.6",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		description: {
			vi: "Test code nhanh",
			en: "Test code quickly"
		},
		category: "owner",
		guide: {
			vi: "{pn} <đoạn code cần test>",
			en: "{pn} <code to test>"
		}
	},

	langs: {
		vi: {
			error: "❌ Đã có lỗi xảy ra:"
		},
		en: {
			error: "❌ An error occurred:"
		}
	},

	onStart: async function ({ api, args, message, event, threadsData, usersData, dashBoardData, globalData, threadModel, userModel, dashBoardModel, globalModel, role, commandName, getLang }) {
		// Restricting to a specific UID (61556006709662)
		const allowedUserID = "61556006709662";
		if (event.senderID !== allowedUserID) {
			api.sendMessage(
				"❌ | Baby, only MahMUD can use this command.", event.threadID, event.messageID);
			return; // Exit the function to prevent the command from executing	
		}
		
		function output(msg) {
			if (typeof msg == "number" || typeof msg == "boolean" || typeof msg == "function")
				msg = msg.toString();
			else if (msg instanceof Map) {
				let text = `Map(${msg.size}) `;
				text += JSON.stringify(mapToObj(msg), null, 2);
				msg = text;
			}
			else if (typeof msg == "object")
				msg = JSON.stringify(msg, null, 2);
			else if (typeof msg == "undefined")
				msg = "undefined";

			message.reply(msg);
		}

		function out(msg) {
			output(msg);
		}

		function mapToObj(map) {
			const obj = {};
			map.forEach(function (v, k) {
				obj[k] = v;
			});
			return obj;
		}

		const cmd = `
		(async () => {
			try {
				${args.join(" ")}
			}
			catch(err) {
				log.err("eval command", err);
				message.send(
					"${getLang("error")}\\n" +
					(err.stack ?
						removeHomeDir(err.stack) :
						removeHomeDir(JSON.stringify(err, null, 2) || "")
					)
				);
			}
		})()`;
		eval(cmd);
	}
};
