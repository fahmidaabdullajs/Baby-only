const axios = require("axios");

// Function to get the base API URL
const baseApiUrl = async () => {
  const base = await axios.get(
    `https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json`
  );
  return base.data.api;
};

// Function to format large numbers (e.g., balance)
function formatMoney(num) {
  const units = ["", "K", "M", "B", "T", "Q", "Qi", "Sx", "Sp", "Oc", "N", "D"];
  let unit = 0;
  while (num >= 1000 && ++unit < units.length) num /= 1000;
  return num.toFixed(1).replace(/\.0$/, "") + units[unit];
}

module.exports = {
  config: {
    name: "spy",
    aliases: ["whoishe", "whoisshe", "whoami", "atake"],
    version: "1.1",
    role: 0,
    author: "Leon x Mahmud",
    description: "user info rank level & rank top, balance & balance top and pfp",
    category: "general",
    countDown: 5
  },

  onStart: async function ({ event, message, usersData, api, threadsData, args }) {
    const uid1 = event.senderID;
    const uid2 = Object.keys(event.mentions)[0];
    let uid;

    if (args[0]) {
      if (/^\d+$/.test(args[0])) {
        uid = args[0];
      } else {
        const match = args[0].match(/profile\.php\?id=(\d+)/);
        if (match) {
          uid = match[1];
        }
      }
    }

    if (!uid) {
      uid = event.type === "message_reply" ? event.messageReply.senderID : uid2 || uid1;
    }

    const userInfo = await api.getUserInfo(uid);
    const avatarUrl = await usersData.getAvatarUrl(uid);
    
    const allUsers = await usersData.getAll();
    
    // Calculate Rich Rank
    const sortedRichUsers = allUsers.sort((a, b) => b.money - a.money);
    const richRank = sortedRichUsers.findIndex(user => String(user.userID) === String(uid)) + 1;

    // Calculate Overall Rank
    const sortedUsers = allUsers.sort((a, b) => b.exp - a.exp); // Sort by experience for top rank
    const overallRank = sortedUsers.findIndex(user => String(user.userID) === String(uid)) + 1;

    const userMoney = allUsers.find(user => String(user.userID) === String(uid)).money || 0;

    // Get user's experience and level
    const userExp = allUsers.find(user => String(user.userID) === String(uid)).exp || 0;
    const userLevel = expToLevel(userExp);
    
    // Display Rich Rank (0 if not found)
    const displayRichRank = richRank > 0 ? richRank : 0;
    const displayOverallRank = overallRank > 0 ? overallRank : 0; // Show 0 if rank not found

    let genderText;
    switch (userInfo[uid].gender) {
      case 1:
        genderText = "Girl";
        break;
      case 2:
        genderText = "Boy";
        break;
      default:
        genderText = "Other";
    }

    const threadData = await threadsData.get("7460623087375340");
    const flagStats = (threadData?.data?.flagWins || {});

    const position = userInfo[uid].type;

    // Add axios call to fetch baby teacher data
    const response = await axios.get(
      `${await baseApiUrl()}/baby?list=all`
    );
    const dataa = response.data || { teacher: { teacherList: [] } };
    let babyTeach = 0;
    let babyTeacherRank = 0;

    if (dataa?.teacher?.teacherList?.length) {
      // Find the babyTeach for the user
      babyTeach = dataa.teacher.teacherList.find((t) => t[uid])?.[uid] || 0;

      // Sort Baby Teachers by the value of the uid
      const sortedBabyTeachers = dataa.teacher.teacherList.sort((a, b) => b[uid] - a[uid]);
      babyTeacherRank = sortedBabyTeachers.findIndex((t) => t[uid]) + 1 || 0;
    }

    // Calculate Flag Game Rank
    const sortedFlagUsers = allUsers.sort((a, b) => (flagStats[b.userID] || 0) - (flagStats[a.userID] || 0));
    const flagGameRank = sortedFlagUsers.findIndex(user => String(user.userID) === String(uid)) + 1 || 0;

    // Format the balance
    const formattedBalance = formatMoney(userMoney);

    // Compose the user information response
    const userInformation = `
╭──── [${userInfo[uid].name}]
├‣ NickName: ${userInfo[uid].alternateName || "none"}
├‣ Gender: ${genderText}
├‣ 𝚄𝙸𝙳: ${uid}
├‣ 𝙲𝚕𝚊𝚜𝚜: ${position ? position?.toUpperCase() : "𝙽𝚘𝚛𝚖𝚊𝚕 𝚄𝚜𝚎𝚛🥺"}
├‣ 𝙱𝚒𝚛𝚝𝚑𝚍𝚊𝚢: ${userInfo[uid].isBirthday !== false ? userInfo[uid].isBirthday : "𝙿𝚛𝚒𝚟𝚊𝚝𝚎"}
├‣ Username: ${userInfo[uid].vanity || "none"}
╰‣ Bot Friend: ${userInfo[uid].isFriend ? "𝚈𝚎𝚜✅" : "𝙽𝚘❎"}

╭──── [ Rank ]
├‣ Rank Level: ${userLevel}
╰‣ Rank Top: ${displayOverallRank}

╭──── [ BALANCE ]
├‣ Balance: ${formattedBalance}
╰‣ Balance Top: ${displayRichRank}

╭──── [ Flag game ]
├‣ Flag Wins: ${flagStats[uid] || 0}
╰‣ Flag Game Top: ${flagGameRank || 0}

╭──── [ Baby Teacher ]
├‣ Baby Teach: ${babyTeach || 0}
╰‣ Baby Teacher Top: ${babyTeacherRank || 0}`;

    message.reply({
      body: userInformation,
      attachment: avatarUrl ? await global.utils.getStreamFromURL(avatarUrl) : undefined
    });
  }
};

// Helper function to convert experience to level
function expToLevel(exp, deltaNextLevel = 5) {
  return Math.floor((1 + Math.sqrt(1 + 8 * exp / deltaNextLevel)) / 2);
}
