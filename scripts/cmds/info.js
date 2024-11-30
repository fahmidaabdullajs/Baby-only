const fs = require('fs');
const moment = require('moment-timezone');

module.exports = {
  config: {
    name: "info",
    version: "2.0",
    author: "Mah MUD彡",
    countDown: 5,
    role: 0, 
    shortDescription: {
      vi: "",
      en: "Sends information about the bot and admin along with an image."
    },
    longDescription: {
      vi: "",
      en: "Sends information about the bot and admin along with an image."
    },
    category: "info",
    guide: {
      en: "{pn}"
    },
    envConfig: {}
  },

  onStart: async function ({ message }) {
    this.sendInfo(message);
  },

  onChat: async function ({ event, message }) {
    if (event.body && event.body.toLowerCase() === "info") {
      this.sendInfo(message);
    }
  },

  sendInfo: async function (message) {
    const botName = "𝗬𝗼𝘂𝗿 𝗯𝗮𝗯𝘆";
    const botPrefix = "!";
    const authorName = "Mah MUD彡";
    const authorFB = "m.me/mahmud.x07";
    const authorInsta = "𝗹𝗼𝗮𝗱𝗶𝗻𝗴";
    const relationship = "𝘀𝗲𝗰𝗿𝗲𝘁";

    const urls = JSON.parse(fs.readFileSync('scripts/cmds/assets/info.json'));
    const link = urls[Math.floor(Math.random() * urls.length)];

    const now = moment().tz('Asia/Dhaka');
    const date = now.format('MMMM Do YYYY');
    const time = now.format('h:mm:ss A');

    const uptime = process.uptime();
    const seconds = Math.floor(uptime % 60);
    const minutes = Math.floor((uptime / 60) % 60);
    const hours = Math.floor((uptime / (60 * 60)) % 24);
    const days = Math.floor(uptime / (60 * 60 * 24));
    const uptimeString = `${hours}h ${minutes}m ${seconds}sec`;

    message.reply({
      body: `
╭────────────◊
├‣ 𝐁𝐨𝐭 & 𝐎𝐰𝐧𝐞𝐫 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧 
├‣ 𝐍𝐚𝐦𝐞: ${authorName}
├‣ 𝐁𝐨𝐭 𝐍𝐚𝐦𝐞: ${botName}
├‣ 𝐏𝐫𝐞𝐟𝐢𝐱: ${botPrefix}
├‣ 𝐀𝐠𝐞: 𝐃𝐨𝐞𝐬𝐧'𝐭 𝐌𝐚𝐭𝐭𝐞𝐫
├‣ 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤: ${authorFB}
├‣ 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦: ${authorInsta}
├‣ 𝐑𝐞𝐥𝐚𝐭𝐢𝐨𝐧𝐬𝐡𝐢𝐩: ${relationship}   
├‣ 𝐓𝐢𝐦𝐞: ${time}
├‣ 𝐔𝐩𝐭𝐢𝐦𝐞: ${uptimeString}
╰────────────◊`,
      attachment: await global.utils.getStreamFromURL(link)
    });
  setTimeout(() => {
	message.unsend(hh.messageID);
	}, 30000);
   }
};
