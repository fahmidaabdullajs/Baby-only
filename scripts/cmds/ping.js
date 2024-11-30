 module.exports = {
  config: {
    name: "ping",
    Author: "𝗠𝗮𝗵 𝗠𝗨𝗗 彡",
    version: "1.0",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Ping!"
    },
    longDescription: {
      en: "𝙘𝙝𝙖𝙠𝙞𝙣𝙜 𝙗𝙤𝙩 𝙥𝙞𝙣𝙜"
    },
    category: "general",
    guide: {
      en: "{pn}"
    }
  },
  onStart: async function ({ api, event, args }) {
    const timeStart = Date.now();
    await api.sendMessage("checking bot ping ✅", event.threadID);
    const ping = Date.now() - timeStart;
    api.sendMessage(`[ ${ping}ms ]`, event.threadID);
  }
};
