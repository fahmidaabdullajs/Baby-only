const { loadImage, createCanvas } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "pair4",
    author: "xemon",
    role: 0,
    shortDescription: " ",
    longDescription: "",
    category: "love",
    guide: "{pn}",
  },
  onStart: async function ({ api, event, args, usersData, threadsData }) {
    let pathImg = __dirname + "/cache/background.png";
    let pathAvt1 = __dirname + "/cache/Avtmot.png";
    let pathAvt2 = __dirname + "/cache/Avthai.png";

    let one, two;
    const mention = Object.keys(event.mentions);

    // Handle mentions
    if (mention.length == 0) {
      return api.sendMessage("Please mention someone to pair with!", event.threadID);
    } else if (mention.length == 1) {
      one = event.senderID;
      two = mention[0]; // The first mentioned user
    } else {
      one = mention[0]; // First mentioned user
      two = mention[1]; // Second mentioned user
    }

    var name1 = ""; 
    var ThreadInfo = await api.getThreadInfo(event.threadID);
    var all = ThreadInfo.userInfo;

    // Get the name of the first user (name1)
    for (let c of all) {
      if (c.id == one) {
        name1 = c.name; // Assign the name of the sender to name1
        var gender1 = c.gender;
      }
    }

    const botID = api.getCurrentUserID();
    let ungvien = [];
    if (gender1 == "FEMALE") {
      for (let u of all) {
        if (u.gender == "MALE") {
          if (u.id !== one && u.id !== botID) ungvien.push(u.id);
        }
      }
    } else if (gender1 == "MALE") {
      for (let u of all) {
        if (u.gender == "FEMALE") {
          if (u.id !== one && u.id !== botID) ungvien.push(u.id);
        }
      }
    } else {
      for (let u of all) {
        if (u.id !== one && u.id !== botID) ungvien.push(u.id);
      }
    }

    var name2 = ""; // Initialize name2
    // Get the name of the second user (name2)
    for (let c of all) {
      if (c.id == two) {
        name2 = c.name; // Assign the name of the second user to name2
      }
    }

    var rd1 = Math.floor(Math.random() * 100) + 1;
    var cc = ["0", "-1", "99,99", "-99", "-100", "101", "0,01"];
    var rd2 = cc[Math.floor(Math.random() * cc.length)];
    var djtme = [`${rd1}`, `${rd1}`, `${rd1}`, `${rd1}`, `${rd1}`, `${rd2}`, `${rd1}`, `${rd1}`, `${rd1}`, `${rd1}`];

    var tile = djtme[Math.floor(Math.random() * djtme.length)];

    var background = [
      "https://i.postimg.cc/wjJ29HRB/background1.png",
      "https://i.postimg.cc/zf4Pnshv/background2.png",
      "https://i.postimg.cc/5tXRQ46D/background3.png",
    ];
    var rd = background[Math.floor(Math.random() * background.length)];
    
    let getAvtmot = (
      await axios.get(`https://graph.facebook.com/${one}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, {
        responseType: "arraybuffer",
      })
    ).data;
    fs.writeFileSync(pathAvt1, Buffer.from(getAvtmot, "utf-8"));
    
    let getAvthai = (
      await axios.get(`https://graph.facebook.com/${two}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, {
        responseType: "arraybuffer",
      })
    ).data;
    fs.writeFileSync(pathAvt2, Buffer.from(getAvthai, "utf-8"));

    let getbackground = (
      await axios.get(`${rd}`, {
        responseType: "arraybuffer",
      })
    ).data;
    fs.writeFileSync(pathImg, Buffer.from(getbackground, "utf-8"));

    let baseImage = await loadImage(pathImg);
    let baseAvt1 = await loadImage(pathAvt1);
    let baseAvt2 = await loadImage(pathAvt2);
    let canvas = createCanvas(baseImage.width, baseImage.height);
    let ctx = canvas.getContext("2d");
    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseAvt1, 100, 150, 300, 300);
    ctx.drawImage(baseAvt2, 900, 150, 300, 300);
    const imageBuffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, imageBuffer);
    fs.removeSync(pathAvt1);
    fs.removeSync(pathAvt2);

    // Send the message with names properly replaced
    return api.sendMessage(
      {
        body: `🥰Successful pairing!\n• ${name1}🎀\n• ${name2}🎀\n💌Wish you two hundred years of happiness💕\n\nLove percentage ${tile}%`, 
        attachment: fs.createReadStream(pathImg),
      },
      event.threadID,
      () => fs.unlinkSync(pathImg),
      event.messageID
    );
  },
};
