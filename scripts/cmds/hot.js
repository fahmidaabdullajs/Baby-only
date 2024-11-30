const axios = require("axios");
const fs = require("fs");

module.exports.config = {
  name: "hot",
  category: "18+",
  version: "1.0",
  author: "Mah MUD彡",
  countDown: 2,
  role: 2,
};

module.exports.onStart = async ({ api, event }) => {
  try {
    const m = await axios.get("https://a6-video-api-t0il.onrender.com/Romim/horny");
    const d = m.data;
    const n = d.data;
    const a = await axios.get(n, { responseType: "arraybuffer" });
    const f = __dirname + "/cache/anime.mp4";
    const i = Buffer.from(a.data, "binary");
    fs.writeFileSync(f, i);
    const naruto = fs.createReadStream(f);
    api.sendMessage({ body: "video", attachment: naruto }, event.threadID, event.messageID);
  } catch (error) {
    api.sendMessage("api error", event.threadID, event.messageID);
  }
};
