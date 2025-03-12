const fs = require('fs');
const moment = require('moment-timezone');

module.exports = {
  config: {
    name: "info",
    version: "1.7",
    author: "MahMUD",
    countDown: 5,
    role: 0,
    category: "info"
  },

  onStart: async function ({ message, args }) {
    if (args[0] === "add") {
      this.addUserInfo(message, args.slice(1).join(" "));
    } else if (args[0] === "list") {
      this.showUserList(message);
    } else {
      this.processInfoCommand(message, args);
    }
  },

  onChat: async function ({ event, message }) {
    if (event.body && event.body.toLowerCase().startsWith("info")) {
      let args = event.body.split(" ");
      if (args[1] === "list") {
        this.showUserList(message);
      } else if (args[1] === "add") {
        this.addUserInfo(message, args.slice(2).join(" "));
      } else {
        this.processInfoCommand(message, args.slice(1));
      }
    }
  },

  processInfoCommand: async function (message, args) {
    let infoData = this.loadInfoData();
    if (!infoData) return;

    if (args[0]) {
      const userIdOrName = args[0];
      const userInfo = infoData.users.find(user =>
        user.allowed_ids.some(userId =>
          userId.id === userIdOrName || userId.name.toLowerCase() === userIdOrName.toLowerCase()
        )
      );

      if (userInfo) {
        this.sendInfo(message, infoData, userIdOrName);
      } else {
        message.reply("⚠ No information found for this User ID or Name.");
      }
    } else {
      let flag = global.toggleFlag || 0;
      if (flag === 0) {
        this.sendInfo(message, infoData, 'owner');
        global.toggleFlag = 1;
      } else {
        this.sendInfo(message, infoData, 'admin');
        global.toggleFlag = 0;
      }
    }
  },

  showUserList: function (message) {
    let infoData = this.loadInfoData();
    if (!infoData || !infoData.users.length) {
      return message.reply("⚠ No user info found.");
    }

    let userList = infoData.users.map((user, index) => `${index + 1}. ${user.allowed_ids[0].name}`).join("\n");
    let finalMessage = `🎀 𝐔𝐬𝐞𝐫 𝐯𝐢𝐩 𝐢𝐧𝐟𝐨 𝐥𝐢𝐬𝐭:\n${userList}`;
    message.reply(finalMessage);
  },

  loadInfoData: function () {
    try {
      let data = fs.readFileSync('info1.json', 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      console.error("Error loading info1.json:", err);
      return null;
    }
  },

  sendInfo: async function (message, infoData, userType = null) {
    const now = moment().tz('Asia/Dhaka');
    const time = now.format('h:mm:ss A');
    const uptime = process.uptime();
    const uptimeString = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}sec`;

    let userInfos = [];

    if (userType === 'owner') {
      userInfos.push(infoData.users[0]);
    } else if (userType === 'admin') {
      userInfos.push(infoData.users[1]);
    } else if (userType) {
      let userInfo = infoData.users.find(user =>
        user.allowed_ids.some(userId =>
          userId.id === userType || userId.name.toLowerCase() === userType.toLowerCase()
        )
      );
      if (userInfo) {
        userInfos.push(userInfo);
      }
    } else {
      userInfos = infoData.users.filter(user => !user.allowed_ids || user.allowed_ids.length === 0);
    }

    const fontData = JSON.parse(fs.readFileSync("style.json", "utf-8"));
    const fontStyle = fontData["11"];

    for (let userInfo of userInfos) {
      let finalMessage = userInfo.message
        .replace("{time}", time)
        .replace("{uptime}", uptimeString);
        
      finalMessage = this.applyFontStyle(finalMessage, fontStyle);

      try {
        let imageStream = await global.utils.getStreamFromURL(userInfo.image);
        message.reply({ body: finalMessage, attachment: imageStream });
      } catch (error) {
        message.reply(finalMessage);
      }
    }
  },

  applyFontStyle: function (text, fontStyle) {
    return text.split('').map(char => fontStyle[char] || char).join('');
  },

  addUserInfo: function (message, userData) {
    let parts = userData.split(" - ");

    if (parts.length < 4) {
      return message.reply("⚠ Incorrect format! Use: info add <uid> - <name> - <message> - <image_url>");
    }

    const now = moment().tz('Asia/Dhaka');
    const time = now.format('h:mm:ss A');
    const uptime = process.uptime();
    const uptimeString = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}sec`;

    let newUser = {
      allowed_ids: [{ id: parts[0].trim(), name: parts[1].trim() }],
      message: parts[2].trim().replace("{time}", time).replace("{uptime}", uptimeString),
      image: parts[3].trim()
    };

    let infoData = this.loadInfoData() || { users: [] };
    infoData.users.push(newUser);
    fs.writeFileSync('info1.json', JSON.stringify(infoData, null, 2));

    message.reply(`✔ User info added successfully for ID/Name: ${parts[0].trim()}!`);
  }
};
