const axios = require("axios");

module.exports = {
  config: {
    name: "twitterdl",
    version: "1.3",
    author: "BADBOY",
    countDown: 5,
    role: 0,
    shortDescription: {
      vi: "Tải video từ twitter",
      en: "Download video from twitter"
    },
    longDescription: {
      vi: "Tải video twitter từ twitter (công khai)",
      en: "Download video twitter from twitter (public)"
    },
    category: "media",
    guide: {
      vi: "   {pn} <url video twitter>: tải video từ twitter",
      en: "   {pn} <url video twitter>: download video from twitter"
    }
  },

  langs: {
    vi: {
      missingUrl: "Vui lòng nhập url video twitter (công khai) bạn muốn tải về",
      error: "Đã xảy ra lỗi khi tải video",
      downloading: "Đang tiến hành tải video cho bạn",
      tooLarge: "Rất tiếc không thể tải video cho bạn vì dung lượng lớn hơn 83MB"
    },
    en: {
      missingUrl: "Please enter the twitter video (public) url you want to download",
      error: "An error occurred while downloading the video",
      downloading: "Downloading video for you",
      tooLarge: "Sorry, we can't download the video for you because the size is larger than 83MB"
    }
  },

  onStart: async function ({ args, event, message, getLang }) {
    if (!args[0]) {
      return message.reply(getLang("missingUrl"));
    }

    let msgSend = null;
    try {
      const response = await axios.get(`https://anbusec.xyz/api/downloader/twitter?apikey=jmBOjQSgq5mK8GScw9AB&url=${args[0]}`);

      if (response.data.success === false) {
        return message.reply(getLang("error"));
      }

      msgSend = message.reply(getLang("downloading"));

      const stream = await global.utils.getStreamFromURL(response.data.url);
            const creator = response.data.author

      await message.reply({ body: `Command By ♪♪ BADBOY ♪♪\n\nApi_Owner: ${creator}`,
        attachment: stream });

      message.unsend((await msgSend),event.messageID);
    }
    catch (e) {
      message.unsend((await msgSend),event.messageID);
      return message.reply(getLang("tooLarge"));
    }
  }
};
