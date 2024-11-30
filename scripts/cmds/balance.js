module.exports = {
    config: {
        name: "balance",
	aliases: ["bal","money"],
        version: "1.2",
        author: "NTKhang",
        countDown: 5,
        role: 0,
        description: {
            vi: "xem số tiền hiện có của bạn hoặc người được tag",
            en: "view your money or the money of the tagged person"
        },
        category: "economy",
        guide: {
            vi: "   {pn}: xem số tiền của bạn"
                + "\n   {pn} <@tag>: xem số tiền của người được tag",
            en: "   {pn}: view your money"
                + "\n   {pn} <@tag>: view the money of the tagged person"
        }
    },

    langs: {
        vi: {
            money: "Bạn đang có %1$",
            moneyOf: "%1 đang có %2$"
        },
        en: {
            money: "𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮𝐫 𝐛𝐚𝐥𝐚𝐧𝐜𝐞 %1$",
            moneyOf: "%1 𝐡𝐚𝐬 %2$"
        }
    },

    // Function to format money
    formatMoney(num) {
        const units = ["", "𝐊", "𝐌", "𝐁", "𝐓", "𝐐", "𝐐𝐢", "𝐒𝐱", "𝐒𝐩", "𝐎𝐜", "𝐍", "𝐃", 
 "𝐔𝐧𝐝𝐞𝐜",
 "𝐃𝐮𝐨𝐝𝐞𝐜",
 "𝐓𝐫𝐞𝐝𝐞𝐜",
 "𝐐𝐮𝐚𝐭𝐭𝐮𝐨𝐫𝐝𝐞𝐜",
 "𝐐𝐮𝐢𝐧𝐝𝐞𝐜",
 "𝐒𝐞𝐱𝐝𝐞𝐜",
 "𝐒𝐞𝐩𝐭𝐞𝐧𝐝𝐞𝐜",
 "𝐎𝐜𝐭𝐨𝐝𝐞𝐜",
 "𝐍𝐨𝐯𝐞𝐦𝐝𝐞𝐜",
 "𝐕𝐢𝐠",
 "𝐔𝐧𝐯𝐢𝐠",
 "𝐃𝐮𝐨𝐯𝐢𝐠",
 "𝐓𝐫𝐞𝐬𝐯𝐢𝐠",
 "𝐐𝐮𝐚𝐭𝐭𝐮𝐨𝐫𝐯𝐢𝐠",
 "𝐐𝐮𝐢𝐧𝐯𝐢𝐠",
 "𝐒𝐞𝐬𝐯𝐢𝐠",
 "𝐒𝐞𝐩𝐭𝐞𝐦𝐯𝐢𝐠",
 "𝐎𝐜𝐭𝐨𝐯𝐢𝐠",
 "𝐍𝐨𝐯𝐞𝐦𝐯𝐢𝐠",
 "𝐓𝐫𝐢𝐠",
 "𝐔𝐧𝐭𝐫𝐢𝐠",
 "𝐃𝐮𝐨𝐭𝐫𝐢𝐠",
 "𝐆𝐨𝐨𝐠𝐨𝐥"];
        let unit = 0;
        while (num >= 1000 && ++unit < units.length) num /= 1000;
        return num.toFixed(1).replace(/\.0$/, "") + units[unit];
    },

    onStart: async function ({ message, usersData, event, getLang }) {
        // If the event is a reply to another message
        if (event.type == "message_reply") {
            const reply = event.messageReply;
            const userID = reply.senderID;  // Get the ID of the user who sent the original message
            const userMoney = await usersData.get(userID, "money");

            // Fetch the user's name (if available)
            const userName = reply.senderName || await usersData.get(userID, "name") || "Unknown User"; 

            // Respond with the money of the user who sent the original message
            return message.reply(getLang("moneyOf", userName, this.formatMoney(userMoney)));
        }

        // If there are mentions in the message
        if (Object.keys(event.mentions).length > 0) {
            const uids = Object.keys(event.mentions);
            let msg = "";
            for (const uid of uids) {
                const userMoney = await usersData.get(uid, "money");
                const userName = event.mentions[uid].replace("@", ""); // Get the name from the mention
                msg += getLang("moneyOf", userName, this.formatMoney(userMoney)) + '\n';
            }
            return message.reply(msg);
        }

        // If no mentions or replies, show the balance of the user who sent the message
        const userData = await usersData.get(event.senderID);
        const userName = event.senderName || await usersData.get(event.senderID, "name") || "Unknown User"; // Get the sender's name or fallback to "Unknown User"
        return message.reply(getLang("money", this.formatMoney(userData.money)));
    }
};
