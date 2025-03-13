const axios = require("axios");

module.exports = {
  config: {
    name: "animeinfo",
    aliases: ["aniinfo"],
    version: "1.7",
    category: "anime",
    description: "Fetches detailed information about an anime.",
    usage: "animeinfo <anime name>",
    cooldown: 5,
    author: "MahMUD"
  },
  onStart: async function ({ api, event, args }) {  
    if (!args.length) {
      return api.sendMessage("⚠️ Please provide an anime name!", event.threadID, event.messageID);
    }

    const query = encodeURIComponent(args.join(" "));
    const url = `https://api.jikan.moe/v4/anime?q=${query}&limit=1`;

    try {
      const response = await axios.get(url);
      const anime = response.data.data[0];

      if (!anime) {
        return api.sendMessage("❌ Anime not found!", event.threadID, event.messageID);
      }

      const message = `>🎀 𝐀𝐧𝐢𝐦𝐞 𝐈𝐧𝐟𝐨\n\n`
        + `🎬 𝐓𝐢𝐭𝐥𝐞: ${anime.title}\n`
        + `📅 𝐀𝐢𝐫𝐞𝐝: ${anime.aired.string}\n`
        + `🎭 𝐆𝐞𝐧𝐫𝐞𝐬: ${anime.genres.map(g => g.name).join(", ")}\n`
        + `⭐ 𝐑𝐚𝐭𝐢𝐧𝐠: ${anime.score}/10\n`
        + `📚 𝐒𝐲𝐧𝐨𝐩𝐬𝐢𝐬: ${anime.synopsis ? anime.synopsis.substring(0, 300) + "..." : "N/A"}\n\n`
        + `📃 𝐌𝐨𝐫𝐞 𝐈𝐧𝐟𝐨: ${anime.url}`;

      api.sendMessage({ 
        body: message, 
        attachment: await global.utils.getStreamFromURL(anime.images.jpg.large_image_url) 
      }, event.threadID, event.messageID);

    } catch (error) {
      console.error(error);
      api.sendMessage("⚠️ Error fetching anime information. Try again later!", event.threadID, event.messageID);
    }
  }
};
