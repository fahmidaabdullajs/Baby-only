const axios = require("axios");

module.exports = {
  config: {
    name: "say",
    aliases: ["sbn"],
    version: "1.1",
    author: "Siam the frog>🐸",
    countDown: 5,
    role: 0,
    shortDescription: "Say something Bangla will say it clearly",
    longDescription: "Female voice",
    category: "media",
    guide: "{pn} <text> (or reply to a message)",
  },

  onStart: async function ({ api, message, args, event }) {
    let lng = "bn"; // ডিফল্ট ভাষা বাংলা
    let say = args.join(" "); // ইনপুট টেক্সট
    
    // মেসেজ রিপ্লাই থাকলে সেটার টেক্সট নিতে হবে
    if (event.type === "message_reply" && event.messageReply.body) {
      say = event.messageReply.body;
    }

    // ইনপুট টেক্সট না থাকলে এরর মেসেজ
    if (!say) {
      return message.reply("⚠️ দয়া করে কিছু লিখুন বা একটি মেসেজে রিপ্লাই দিন!");
    }

    try {
      let url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lng}&client=tw-ob&q=${encodeURIComponent(say)}`;

      message.reply({
        body: "",
        attachment: await global.utils.getStreamFromURL(url),
      });

    } catch (e) {
      console.error(e);
      message.reply("🐥 দুঃখিত, কিছু একটা সমস্যা হয়েছে!");
    }
  },
};
