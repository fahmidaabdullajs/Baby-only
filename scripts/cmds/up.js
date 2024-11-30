module.exports = {
  config: {
    name: "uptime",
    aliases: ["upt"],
    version: "1.0",
    author: "♡ 𝐍𝐚𝐳𝐫𝐮𝐥 ♡",
    role: 0,
    shortDescription: {
      en: "Displays the total number of users of the bot and checks uptime."
    },
    longDescription: {
      en: "Displays the total number of users who have interacted with the bot and checks uptime."
    },
    category: "general",
    guide: {
      en: "Use {p}totalusers to display the total number of users of the bot and check uptime."
    }
  },
  onStart: async function ({ api, event, usersData, threadsData }) {
    try {
      const allUsers = await usersData.getAll();
      const allThreads = await threadsData.getAll();
      const uptime = process.uptime();
      
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      
      const uptimeString = `${hours}Hrs ${minutes}min ${seconds}sec`;
      
      api.sendMessage(`===[𝗬𝗢𝗨𝗥 𝗕𝗔𝗕𝗬 𝗨𝗣𝗧]===\n\n🐤 | 𝗨𝗽𝘁𝗶𝗺𝗲: ${uptimeString}\n\n   
👥 | 𝗧𝗼𝘁𝗮𝗹 𝗨𝘀𝗲𝗿𝘀: ${allUsers.length}  
📂 | 𝗧𝗼𝘁𝗮𝗹 𝗧𝗵𝗿𝗲𝗮𝗱𝘀: ${allThreads.length}`, event.threadID);
    } catch (error) {
      console.error(error);
      api.sendMessage("An error occurred while retrieving data.", event.threadID);
    }
  }
};
