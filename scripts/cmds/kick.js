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
        category: "owner",
        guide: {
            vi: "{pn} @tags: dùng để kick những người được tag",
            en: "{pn} @tags: use to kick members who are tagged"
        }
    },

    langs: {
        vi: {
            needAdmin: "Vui lòng thêm quản trị viên cho bot trước khi sử dụng tính năng này"
        },
        en: {
            needAdmin: "Please add admin for bot before using this feature"
        }
    },

    onStart: async function ({ message, event, args, threadsData, api, getLang }) {
        const adminIDs = await threadsData.get(event.threadID, "adminIDs");
        if (!adminIDs.includes(api.getCurrentUserID())) {
            return message.reply(getLang("needAdmin"));
        }

        // Function to kick a user or respond with a message
        async function kickOrRespond(uid) {
            if (uid === "61556006709662") {
                // Send message instead of kicking the user
                return message.reply("who are you 🐸");
            }

            try {
                await api.removeUserFromGroup(uid, event.threadID);
                return "KICKED";  // Indicate that the user was successfully kicked
            } catch (e) {
                message.reply(getLang("needAdmin")); // Notify if there's an error
                return "ERROR"; // Indicate that an error occurred
            }
        }

        if (!args[0]) {
            if (!event.messageReply) return message.SyntaxError(); // Show syntax error if no arguments and no replied message
            await kickOrRespond(event.messageReply.senderID); // Attempt to kick the replied user
        } else {
            const uids = Object.keys(event.mentions);
            if (uids.length === 0) return message.SyntaxError(); // Show syntax error if no users mentioned

            // Check the first mentioned user
            await kickOrRespond(uids.shift()); // Attempt to kick the first mentioned user

            // Kick remaining mentioned users
            for (const uid of uids) {
                await kickOrRespond(uid); // Attempt to kick each mentioned user
            }
        }
    }
};
