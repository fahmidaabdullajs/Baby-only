const axios = require("axios");
const fs = require("fs-extra");
module.exports = {
  config: {
    name: "pair2",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "Get to know your partner",
    },
    longDescription : {
      en: "Know your destiny and know who you will complete your life with",
    },
    category: "love",
    guide: {
      en: "{pn}"
    }
  },
  onStart: async function ({ api, args, message, event, threadsData, usersData, dashBoardData, globalData, threadModel, userModel, dashBoardModel, globalModel, role, commandName, getLang }) {
    const { loadImage, createCanvas } = require("canvas");
    let pathImg = __dirname + "/assets/background.png";
    let pathAvt1 = __dirname + "/assets/any.png";
    let pathAvt2 = __dirname + "/assets/avatar.png";
    
    var id1 = event.senderID;
    var name1 = await usersData.getName(id1);
    var ThreadInfo = await api.getThreadInfo(event.threadID);
    var all = ThreadInfo.userInfo;
    for (let c of all) {
      if (c.id == id1) var gender1 = c.gender;
    };
    const botID = api.getCurrentUserID();
    let ungvien = [];
    if(gender1 == "FEMALE"){
      for (let u of all) {
        if (u.gender == "MALE") {
          if (u.id !== id1 && u.id !== botID) ungvien.push(u.id)
        }
      }
    }
    else if(gender1 == "MALE"){
      for (let u of all) {
        if (u.gender == "FEMALE") {
          if (u.id !== id1 && u.id !== botID) ungvien.push(u.id)
        }
      }
    }
    else {
      for (let u of all) {
        if (u.id !== id1 && u.id !== botID) ungvien.push(u.id)
      }
    }
    var id2 = ungvien[Math.floor(Math.random() * ungvien.length)];
    var name2 = await usersData.getName(id2);
    var rd1 = Math.floor(Math.random() * 100) + 1;
    var cc = ["0", "-1", "99,99", "-99", "-100", "101", "0,01"];
    var rd2 = cc[Math.floor(Math.random() * cc.length)];
    var djtme = [`${rd1}`, `${rd1}`, `${rd1}`, `${rd1}`, `${rd1}`, `${rd2}`, `${rd1}`, `${rd1}`, `${rd1}`, `${rd1}`];
    
    var tile = djtme[Math.floor(Math.random() * djtme.length)];

    var background = [
      "https://i.ibb.co/RBRLmRt/Pics-Art-05-14-10-47-00.jpg"
    ];
    
    let getAvtmot = (
      await axios.get( `https://graph.facebook.com/${id1}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
      { responseType: "arraybuffer" }
    )
    ).data;
    fs.writeFileSync(pathAvt1, Buffer.from(getAvtmot, "utf-8"));

    let getAvthai = (
      await axios.get( `https://graph.facebook.com/${id2}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
      { responseType: "arraybuffer" }
    )
    ).data;
    fs.writeFileSync(pathAvt2, Buffer.from(getAvthai, "utf-8"));

    let getbackground = (
      await axios.get(`${background}`, {
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
    ctx.drawImage(baseAvt1, 111, 175, 330, 330);
    ctx.drawImage(baseAvt2, 1018, 173, 330, 330);
    const imageBuffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, imageBuffer);
    fs.removeSync(pathAvt1);
    fs.removeSync(pathAvt2);

    // Function to convert text to bold Unicode
    function toBoldUnicode(name) {
      const boldAlphabet = {
        "a": "𝐚", "b": "𝐛", "c": "𝐜", "d": "𝐝", "e": "𝐞", "f": "𝐟", "g": "𝐠", "h": "𝐡", "i": "𝐢", "j": "𝐣",
        "k": "𝐤", "l": "𝐥", "m": "𝐦", "n": "𝐧", "o": "𝐨", "p": "𝐩", "q": "𝐪", "r": "𝐫", "s": "𝐬", "t": "𝐭",
        "u": "𝐮", "v": "𝐯", "w": "𝐰", "x": "𝐱", "y": "𝐲", "z": "𝐳", "A": "𝐀", "B": "𝐁", "C": "𝐂", "D": "𝐃",
        "E": "𝐄", "F": "𝐅", "G": "𝐆", "H": "𝐇", "I": "𝐈", "J": "𝐉", "K": "𝐊", "L": "𝐋", "M": "𝐌", "N": "𝐍",
        "O": "𝐎", "P": "𝐏", "Q": "𝐐", "R": "𝐑", "S": "𝐒", "T": "𝐓", "U": "𝐔", "V": "𝐕", "W": "𝐖", "X": "𝐗",
        "Y": "𝐘", "Z": "𝐙", "0": "0", "1": "1", "2": "2", "3": "3", "4": "4", "5": "5", "6": "6", "7": "7", "8": "8",
        "9": "9", " ": " ", "'": "'", ",": ",", ".": ".", "-": "-", "!": "!", "?": "?"
      };

      return name.split('')
        .map(char => boldAlphabet[char] || char) // Convert to bold if it's in the alphabet, otherwise return the char as is.
        .join('');
    }

    // Convert user names to bold Unicode
    const styledName1 = toBoldUnicode(name1);
    const styledName2 = toBoldUnicode(name2);

    return api.sendMessage({ body: `𝐂𝐨𝐧𝐠𝐫𝐚𝐭𝐮𝐥𝐚𝐭𝐢𝐨𝐧𝐬 𝐁𝐚𝐛𝐲\n>🎀${styledName1}\n>🎀${styledName2}\n𝐘𝐨𝐮 𝐚𝐫𝐞 𝐭𝐡𝐞 𝐠𝐫𝐞𝐚𝐭𝐞𝐬𝐭 𝐠𝐢𝐟𝐭 𝐢𝐧 𝐦𝐲 𝐥𝐢𝐟𝐞, 𝐬𝐮𝐜𝐡 𝐚 𝐬𝐩𝐞𝐜𝐢𝐚𝐥 𝐩𝐞𝐫𝐬𝐨𝐧 𝐠𝐫𝐞𝐚𝐭𝐞𝐬𝐭 𝐠𝐢𝐟𝐭 𝐨𝐟 𝐦𝐲 𝐥𝐢𝐟𝐞💖\n\n𝐋𝐨𝐯𝐞 𝐩𝐞𝐫𝐜𝐞𝐧𝐭𝐚𝐠𝐞 ${tile}% 💙`,
      mentions: [{
        tag: `${styledName2}`,
        id: id2
      },{tag: `${styledName1}`, id: id1 }], attachment: fs.createReadStream(pathImg) },
      event.threadID,
      () => fs.unlinkSync(pathImg),
      event.messageID);
  }
};
