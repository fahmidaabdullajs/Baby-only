const axios = require("axios");
const mongoose = require('mongoose');

// MongoDB URI for your database
const dbUri = "mongodb+srv://mahmudabdullax7:ttnRAhj81JikbEw8@cluster0.zwknjau.mongodb.net/GoatBotV2?retryWrites=true&w=majority&appName=Cluster0";

// MongoDB Schema to track user usage
const userSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  usageCount: { type: Number, default: 0 },
  correctAnswersCount: { type: Number, default: 0 },  // Track correct answers
});

// MongoDB Schema for Quiz Game Stats (tracking wins)
const quizStatsSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  correctAnswers: { type: Number, default: 0 },
  incorrectAnswers: { type: Number, default: 0 },
});

// MongoDB Schema for Flag Game Stats
const flagStatsSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  winCount: { type: Number, default: 0 },
});

const UserUsage = mongoose.models.UserUsage || mongoose.model('UserUsage', userSchema);
const QuizGameStats = mongoose.models.QuizGameStats || mongoose.model('QuizGameStats', quizStatsSchema);
const FlagGameStats = mongoose.models.FlagGameStats || mongoose.model('FlagGameStats', flagStatsSchema);

// MongoDB Connection
mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Function to get the base API URL
const baseApiUrl = async () => {
  const base = await axios.get(`https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json`);
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

    // Set the genderText based on gender information
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

    // Ensure position is defined (e.g., user class/type)
    let position = userInfo[uid]?.type; // Use optional chaining to avoid errors if userInfo[uid] is undefined
    position = position || "Normal User"; // Default value if no position is defined

    // Fetch Flag Stats from MongoDB
    const flagGameStats = await FlagGameStats.findOne({ userID: uid });
    const flagWins = flagGameStats ? flagGameStats.winCount : 0;

    // Get all Flag Game stats for rank calculation
    const allFlagGameStats = await FlagGameStats.find({}).sort({ winCount: -1 });
    const flagGameRank = allFlagGameStats.findIndex(stats => String(stats.userID) === String(uid)) + 1 || 0;

    // Add axios call to fetch baby teacher data
    const response = await axios.get(`${await baseApiUrl()}/baby?list=all`);
    const dataa = response.data || { teacher: { teacherList: [] } };
    let babyTeach = 0;
    let babyTeacherRank = 0;

    if (dataa?.teacher?.teacherList?.length) {
      // Find the specific babyTeach value
      const teacherData = dataa.teacher.teacherList.find(t => t[uid]);
      if (teacherData) {
        babyTeach = teacherData[uid] || 0;
      }

      // Sort teacher list by the babyTeach value (descending order)
      const sortedBabyTeachers = dataa.teacher.teacherList
        .map(t => ({ userID: Object.keys(t)[0], babyTeach: t[Object.keys(t)[0]] })) // Extract userID and babyTeach
        .sort((a, b) => b.babyTeach - a.babyTeach);  // Sort in descending order by babyTeach value

      // Find the rank by the index of the sorted list
      babyTeacherRank = sortedBabyTeachers.findIndex(t => t.userID === uid) + 1 || 0;
    }

    // Fetch Quiz Stats from MongoDB
    const quizStats = await QuizGameStats.findOne({ userID: uid });
    const correctAnswers = quizStats ? quizStats.correctAnswers : 0;

    // Get all Quiz Game stats for rank calculation
    const allQuizStats = await QuizGameStats.find({}).sort({ correctAnswers: -1 });
    const quizRank = allQuizStats.findIndex(stats => String(stats.userID) === String(uid)) + 1 || 0;

    // Format the balance
    const formattedBalance = formatMoney(userMoney);

    // Define displayOverallRank and displayRichRank
    const displayRichRank = richRank > 0 ? richRank : 0;
    const displayOverallRank = overallRank > 0 ? overallRank : 0; // Show 0 if rank not found

    // Compose the user information response
    const userInformation = `
╭──── [${userInfo[uid].name}]
├‣ NickName: ${userInfo[uid].alternateName || "none"}
├‣ Gender: ${genderText}
├‣ 𝚄𝙸𝙳: ${uid}
├‣ 𝙲𝚕𝚊𝚜𝚜: ${position?.toUpperCase() || "Normal User"}
├‣ 𝙱𝚒𝚛𝚝𝚑𝚍𝚊𝚢: ${userInfo[uid].isBirthday !== false ? userInfo[uid].isBirthday : "Private"}
├‣ Username: ${userInfo[uid].vanity || "none"}
╰‣ Bot Friend: ${userInfo[uid].isFriend ? "Yes✅" : "No❎"}

╭──── [ Rank ]
├‣ Rank Level: ${userLevel}
╰‣ Rank Top: ${displayOverallRank}

╭──── [ BALANCE ]
├‣ Balance: ${formattedBalance}
╰‣ Balance Top: ${displayRichRank}

╭──── [ Flag game ]
├‣ Flag Wins: ${flagWins}
╰‣ Flag Game Top: ${flagGameRank || 0}

╭──── [ Baby Teacher ]
├‣ Baby Teach: ${babyTeach || 0}
╰‣ Baby Teacher Top: ${babyTeacherRank || 0}

╭──── [ Quiz Game ]
├‣ Correct Answers: ${correctAnswers}
╰‣ Quiz Game Top: ${quizRank || 0}`;

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
