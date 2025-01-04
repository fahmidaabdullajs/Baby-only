const axios = require('axios');
const baseApiUrl = async () => {
  const base = await axios.get(`https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json`);
  return base.data.api;
}; 
module.exports = {
  config: {
    name: "dalle",
    aliases: ["bing", "create", "imagine"],
    version: "1.0",
    author: "Dipto",
    countDown: 15,
    role: 0,
    description: "Generate images by Unofficial Dalle3",
    category: "download",
    guide: { en: "{pn} prompt" }
  }, 
  onStart: async({ api, event, args }) => {
    const prompt = (event.messageReply?.body.split("dalle")[1] || args.join(" ")).trim();
    if (!prompt) return api.sendMessage("❌| Wrong Format. ✅ | Use: 17/18 years old boy/girl watching football match on TV with 'Dipto' and '69' written on the back of their dress, 4k", event.threadID, event.messageID);
    try {
       //const cookies = "cookies here (_U value)";
const cookies = ["1p7JTElmPTyVh-F4Vn4MDSfIE1WcUeUyhNp1glQZj8MSPSKbubzfFuKwUnTgYipgU1qhpzAGyV_LmL1HiSu4AyPxTWIUdgYLHXecU9Hwg_jm5iuyMdr-VgbEmZZijFdzhaUdWtEPV1ii0bkQr8o-1bONge2hs_zgh8j7n8WpE7aEuk9XqOa9o5bv7Gff9QLhRS__LqNEwHBgU4h9O-ZEK9g", "1pyXLBKZIa4U2VwnQwNROHq_RIzXxL8mxjSzAcrNN41qxj-iRpLcTQHb3V7QVP9Sm-jaRbeSxg3EszgOvmuBtouAJgK-FrJcM7fPh2cXr27udhpftd658JyAUsm2lZQOkIlhoKyoabhuJrASCrcgFjPaKVLgYV5AdwFFWlVfMINXm_EagxVpUuJBmszTzAupd8SJPoqt5dVGmqlDWdv7gLw"];
const randomCookie = cookies[Math.floor(Math.random() * cookies.length)];
      const wait = api.sendMessage("Wait koro baby 😽", event.threadID);
      const response = await axios.get(`${await baseApiUrl()}/dalle?prompt=${prompt}&key=dipto008&cookies=${randomCookie}`);
const imageUrls = response.data.imgUrls || [];
      if (!imageUrls.length) return api.sendMessage("Empty response or no images generated.", event.threadID, event.messageID);
      const images = await Promise.all(imageUrls.map(url => axios.get(url, { responseType: 'stream' }).then(res => res.data)));
    api.unsendMessage(wait.messageID);
   api.sendMessage({ body: `✅ | Here's Your Generated Photo 😘`, attachment: images }, event.threadID, event.messageID);
    } catch (error) {
      console.error(error);
      api.sendMessage(`Generation failed!\nError: ${error.message}`, event.threadID, event.messageID);
    }
  }
                                                                            }
