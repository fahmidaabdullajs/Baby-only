module.exports = {
    config: {
        name: "count",
        aliases: ["c"],
        version: "1.4", 
        author: "NTKhang",
        countDown: 5,
        role: 0,
        description: "View the number of messages of all members or yourself (since the bot joined the group)",
        category: "box chat",
        guide: "{pn}: used to view the number of messages of you\n"
            + "{pn} @tag: used to view the number of messages of those tagged\n"
            + "{pn} all: used to view the number of messages of all members"
    },

    langs: {
        en: {
            count: "Number of messages of members:",
            endMessage: "Those who do not have a name in the list have not sent any messages.",
            page: "Page [%1/%2]",
            reply: "Reply to this message with the page number to view more",
            result: "%1 rank %2 with %3 messages",
            yourResult: "You are ranked %1 and have sent %2 messages in this group",
            invalidPage: "Invalid page number"
        }
    },

    onStart: async function ({ args, threadsData, message, event, api, commandName, getLang }) {
        const { threadID, senderID } = event;
        const threadData = await threadsData.get(threadID);
        const { members } = threadData;
        const usersInGroup = (await api.getThreadInfo(threadID)).participantIDs;
        let arraySort = [];

        // Sort members and filter out those who aren't in the group
        for (const user of members) {
            if (!usersInGroup.includes(user.userID)) continue;
            arraySort.push({
                name: user.name,
                count: user.count,
                uid: user.userID
            });
        }

        let stt = 1;
        arraySort.sort((a, b) => b.count - a.count);
        arraySort.forEach(item => item.stt = stt++);

        if (args[0]) {
            if (args[0].toLowerCase() === "all") {
                // Full count list in desired format
                let msg = getLang("count");
                const endMessage = getLang("endMessage");

                // For members who have sent messages
                for (const item of arraySort) {
                    if (item.count > 0) {
                        let rankEmoji = item.stt === 1 ? "🥇" : item.stt === 2 ? "🥈" : item.stt === 3 ? "🥉" : item.stt + ".";
                        msg += `\n${rankEmoji} ${toBoldUnicode(item.name)}: ${toBoldNumbers(item.count)}`;
                    }
                }

                return message.reply(msg + `\n\n${endMessage}`);
            } else if (event.mentions) {
                // Mentioned user(s) will have bold format
                let msg = "";
                for (const id in event.mentions) {
                    const findUser = arraySort.find(item => item.uid == id);
                    if (findUser) {
                        msg += `\n${toBoldUnicode(findUser.name)}: 🎀 ${toBoldNumbers(findUser.count)} messages`;
                    }
                }
                return message.reply(msg);
            }
        } else {
            // Self-count message in bold format with specific rank display
            const findUser = arraySort.find(item => item.uid == senderID);
            if (findUser) {
                let rankEmoji = findUser.stt === 1 ? "🥇" : findUser.stt === 2 ? "🥈" : findUser.stt === 3 ? "🥉" : "🎀";
                let msg = `${toBoldUnicode(findUser.name)} >${rankEmoji}\n${toBoldUnicode("𝐫𝐚𝐧𝐤")} ${toBoldNumbers(findUser.stt)} ${toBoldUnicode("𝐰𝐢𝐭𝐡")} ${toBoldNumbers(findUser.count)} ${toBoldUnicode("𝐦𝐞𝐬𝐬𝐚𝐠𝐞𝐬")}`;
                return message.reply(msg);
            }
        }
    },

    onChat: async ({ usersData, threadsData, event }) => {
        const { senderID, threadID } = event;
        const members = await threadsData.get(threadID, "members");
        const findMember = members.find(user => user.userID == senderID);

        if (!findMember) {
            members.push({
                userID: senderID,
                name: await usersData.getName(senderID),
                nickname: null,
                inGroup: true,
                count: 1
            });
        } else {
            findMember.count += 1;
        }

        await threadsData.set(threadID, members, "members");
    }
};

// Convert numbers to bold Unicode
function toBoldNumbers(number) {
    const boldNumbers = {
        "0": "𝟎", "1": "𝟏", "2": "𝟐", "3": "𝟑", "4": "𝟒", 
        "5": "𝟓", "6": "𝟖", "7": "𝟕", "8": "𝟖", "9": "𝟗"
    };

    return number.toString().split("").map(char => boldNumbers[char] || char).join("");
}

// Convert text to bold Unicode
function toBoldUnicode(text) {
    const boldAlphabet = {
        "a": "𝐚", "b": "𝐛", "c": "𝐜", "d": "𝐝", "e": "𝐞", "f": "𝐟", "g": "𝐠", "h": "𝐡", "i": "𝐢", "j": "𝐣",
        "k": "𝐤", "l": "𝐥", "m": "𝐦", "n": "𝐧", "o": "𝐨", "p": "𝐩", "q": "𝐪", "r": "𝐫", "s": "𝐬", "t": "𝐭",
        "u": "𝐮", "v": "𝐯", "w": "𝐰", "x": "𝐱", "y": "𝐲", "z": "𝐳", "A": "𝐀", "B": "𝐁", "C": "𝐂", "D": "𝐃",
        "E": "𝐄", "F": "𝐅", "G": "𝐆", "H": "𝐇", "I": "𝐈", "J": "𝐉", "K": "𝐊", "L": "𝐋", "M": "𝐌", "N": "𝐍",
        "O": "𝐎", "P": "𝐏", "Q": "𝐐", "R": "𝐑", "S": "𝐒", "T": "𝐓", "U": "𝐔", "V": "𝐕", "W": "𝐖", "X": "𝐗",
        "Y": "𝐘", "Z": "𝐙", " ": " ", "'": "'", ",": ",", ".": ".", "-": "-", "!": "!", "?": "?"
    };

    return text.split('').map(char => boldAlphabet[char] || char).join('');
}
