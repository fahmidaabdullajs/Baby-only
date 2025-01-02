const axios = require("axios");
const rubishapi = global.GoatBot.config.rubishapi;

module.exports = {
  config: {
    name: "sam1",
    version: "3.0",
    author: "RUBISH",
    shortDescription: "AI CHAT",
    longDescription: {
      vi: "Chat with simma",
      en: "Chat with simma",
    },
    category: "ai",
    guide: {
      en: `
{pn} Hi : chat with simma

{pn} teach <original word> - <response>: Teach Simsimi how to respond to the original word.

{pn} <original word>: Simsimi will respond based on the original word.

Example:

{pn} teach hello - Hi there

{pn} <original word>: Simsimi will respond based on the original word.

{pn} stats: Display statistics on the number of responses and original words.`,
    },
  },

  onReply: async function ({ api, event }) {
    if (event.type === "message_reply") {
      const reply = event.body?.toLowerCase();
      if (isNaN(reply)) {
        try {
          const { data } = await axios.get(`${rubishapi}/chat`, {
            params: { query: reply, apikey: "rubish69" },
          });
          const responseMessage = data.response;
          await api.sendMessage(
            responseMessage,
            event.threadID,
            (error, info) => {
              global.GoatBot.onReply.set(info.messageID, {
                commandName: this.config.name,
                type: "reply",
                messageID: info.messageID,
                author: event.senderID,
                link: responseMessage,
              });
            },
            event.messageID
          );
        } catch (error) {
          console.error(error);
        }
      }
    }
  },

  onStart: async function ({ api, args, event }) {
    const { threadID, messageID, senderID } = event;
    const [command, ...restArgs] = args;
    const tid = threadID;
    const mid = messageID;
    const uid = senderID;

    if (command === "teach") {
      const [ask, ans] = restArgs
        .join(" ")
        .split("-")
        .map((item) => item.trim());
      if (!ask || !ans)
        return api.sendMessage(
          '⚠ | Both the question and response are required and should be separated by " - ".',
          tid,
          mid
        );

      try {
        const { data } = await axios.get(`${rubishapi}/teach`, {
          params: { query: ask, response: ans, apikey: "rubish69" },
        });
        const responseMessage = data.message || "Successfully taught simma.";
        return api.sendMessage(responseMessage, tid, mid);
      } catch (error) {
        console.error("Error occurred while teaching", error.message);
        return api.sendMessage(
          "I couldn't learn that. Please try again later.",
          tid,
          mid
        );
      }
    }

    if (command === "stats" || command === "list") {
      try {
        const { data } = await axios.get(`${rubishapi}/stats`, {
          params: { apikey: "rubish69" },
        });
        const responseMessage =
          data.stats || "✅ | Fetched the stats successfully.";
        api.sendMessage(responseMessage, tid);
      } catch (error) {
        console.error("Error occurred while fetching stats", error.message);
        api.sendMessage(
          "⚠️ | Failed to fetch the stats. Please try again later.",
          tid
        );
      }
    } else {
      try {
        const rubish = args.join(" ").toLowerCase();
        if (!rubish) {
          api.sendMessage("Hello I'm Simma\n\nHow can I assist you?", tid, mid);
          return;
        }
        const { data } = await axios.get(`${rubishapi}/chat`, {
          params: { query: rubish, apikey: "rubish69" },
        });
        const responseMessage = data.response;
        await api.sendMessage(
          responseMessage,
          tid,
          (error, info) => {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: this.config.name,
              type: "reply",
              messageID: info.messageID,
              author: senderID,
              link: responseMessage,
            });
          },
          mid
        );
      } catch (error) {
        console.error(`Failed to get an answer: ${error.message}`);
        api.sendMessage(`${error.message}.\nAn error`, tid, mid);
      }
    }
  },
  onChat: async function ({ api, event }) {
    var tl = [
      "babu khuda lagse🥺",
      "Hop beda😾,Boss বল boss😼",
      "আমাকে ডাকলে ,আমি কিন্তূ কিস করে দেবো😘 ",
      "🐒🐒🐒",
      "bye",
      "naw messa⁦ge daw m.me/mah⁩mud.x07",
      "mb ney bye",
      "meww",
      "বলো কি বলবা, সবার সামনে বলবা নাকি?🤭🤏",
      "𝗜 𝗹𝗼𝘃𝗲 𝘆𝗼𝘂__😘😘",
      "𝗜 𝗵𝗮𝘁𝗲 𝘆𝗼𝘂__😏😏",
      "গোসল করে আসো যাও😑😩",
      "অ্যাসলামওয়ালিকুম",
      "কেমন আসো",
      "বলেন sir__😌",
      "বলেন ম্যাডাম__😌",
      "আমি অন্যের জিনিসের সাথে কথা বলি না__😏ওকে",
      "🙂🙂🙂",
      "এটায় দেখার বাকি সিলো_🙂🙂🙂",
      "𝗕𝗯𝘆 𝗯𝗼𝗹𝗹𝗮 𝗽𝗮𝗽 𝗵𝗼𝗶𝗯𝗼,,😒😒",
      "𝗧𝗮𝗿𝗽𝗼𝗿 𝗯𝗼𝗹𝗼_🙂",
      "𝗕𝗲𝘀𝗵𝗶 𝗱𝗮𝗸𝗹𝗲 𝗮𝗺𝗺𝘂 𝗯𝗼𝗸𝗮 𝗱𝗲𝗯𝗮 𝘁𝗼__🥺",
      "𝗕𝗯𝘆 না জানু, বল 😌",
      "বেশি bby Bbby করলে leave নিবো কিন্তু 😒😒",
      "__বেশি বেবি বললে কামুর দিমু 🤭🤭",
      "𝙏𝙪𝙢𝙖𝙧 𝙜𝙛 𝙣𝙖𝙞, 𝙩𝙖𝙮 𝙖𝙢𝙠 𝙙𝙖𝙠𝙨𝙤? 😂😂😂",
      "bolo baby😒",
      "তোর কথা তোর বাড়ি কেউ শুনে না ,তো আমি কোনো শুনবো ?🤔😂",
      "আমি তো অন্ধ কিছু দেখি না🐸 😎",
      "আম গাছে আম নাই ঢিল কেন মারো, তোমার সাথে প্রেম নাই বেবি কেন ডাকো 😒🫣",
      "𝗼𝗶𝗶 ঘুমানোর আগে.! তোমার মনটা কথায় রেখে ঘুমাও.!🤔_নাহ মানে চুরি করতাম 😞😘",
      "𝗕𝗯𝘆 না বলে 𝗕𝗼𝘄 বলো 😘",
      "দূরে যা, তোর কোনো কাজ নাই, শুধু 𝗯𝗯𝘆 𝗯𝗯𝘆 করিস  😉😋🤣",
      "এই এই তোর পরীক্ষা কবে? শুধু 𝗕𝗯𝘆 𝗯𝗯𝘆 করিস 😾",
      "তোরা যে হারে 𝗕𝗯𝘆 ডাকছিস আমি তো সত্যি বাচ্চা হয়ে যাবো_☹😑",
      "আজব তো__😒",
      "আমাকে ডেকো না,আমি ব্যাস্ত আসি🙆🏻‍♀️",
      "𝗕𝗯𝘆 বললে চাকরি থাকবে না",
      "𝗕𝗯𝘆 𝗕𝗯𝘆 না করে আমার বস মানে, MahMUD ,MahMUD ও তো করতে পারো😑?",
      "আমার সোনার বাংলা, তারপরে লাইন কি? 🙈",
      "🍺 এই নাও জুস খাও..!𝗕𝗯𝘆 বলতে বলতে হাপায় গেছো না 🥲",
      "হটাৎ আমাকে মনে পড়লো 🙄",
      "𝗕𝗯𝘆 বলে অসম্মান করচ্ছিছ,😰😿",
      "আমি তোমার সিনিয়র আপু ওকে 😼সম্মান দেও🙁",
      "খাওয়া দাওয়া করসো 🙄",
      "এত কাছেও এসো না,প্রেম এ পরে যাবো তো 🙈",
      "আরে আমি মজা করার mood এ নাই😒",
      "𝗛𝗲𝘆 𝗛𝗮𝗻𝗱𝘀𝗼𝗺𝗲 বলো 😁😁",
      "আরে Bolo আমার জান, কেমন আসো? 😚",
      "একটা BF খুঁজে দাও 😿",
      "ফ্রেন্ড রিকোয়েস্ট দিলে ৫ টাকা দিবো 😗",
      "oi mama ar dakis na pilis 😿",
      "🐤🐤",
      "__ভালো হয়ে  যাও 😑😒",
      "এমবি কিনে দাও না_🥺🥺",
      "ওই মামা_আর ডাকিস না প্লিজ",
      "৩২ তারিখ আমার বিয়ে 🐤",
      "হা বলো😒,কি করতে পারি😐😑?",
      "বলো ফুলটুশি_😘",
      "amr JaNu lagbe,Tumi ki single aso?",
      "আমাকে না দেকে একটু পড়তেও বসতে তো পারো 🥺🥺",
      "তোর বিয়ে হয় নি 𝗕𝗯𝘆 হইলো কিভাবে,,🙄",
      "আজ একটা ফোন নাই বলে রিপ্লাই দিতে পারলাম না_🙄",
      "চৌধুরী সাহেব আমি গরিব হতে পারি😾🤭 -কিন্তু বড়লোক না🥹 😫",
      "আমি অন্যের জিনিসের সাথে কথা বলি না__😏ওকে",
      "বলো কি বলবা, সবার সামনে বলবা নাকি?🤭🤏",
      "ভুলে জাও আমাকে 😞😞",
      "দেখা হলে কাঠগোলাপ দিও..🤗",
      "শুনবো না😼 তুমি আমাকে প্রেম করাই দাও নি🥺 পচা তুমি🥺",
      "আগে একটা গান বলো, ☹ নাহলে কথা বলবো না 🥺",
      "বলো কি করতে পারি তোমার জন্য 😚",
      "কথা দেও আমাকে পটাবা...!! 😌",
      "বার বার Disturb করেছিস কোনো 😾, আমার জানু এর সাথে ব্যাস্ত আসি 😋",
      "আমাকে না দেকে একটু পড়তে বসতেও তো পারো 🥺🥺",
      "বার বার ডাকলে মাথা গরম হয় কিন্তু 😑😒",
      "ওই তুমি single না?🫵🤨 😑😒",
      "বলো জানু 😒",
      "Meow🐤",
      "আর কত বার ডাকবা ,শুনছি তো 🤷🏻‍♀️",
      "কি হলো, মিস টিস করচ্ছো নাকি 🤣",
      "Bolo Babu, তুমি কি আমাকে ভালোবাসো? 🙈",
      "আজকে আমার mন ভালো নেই 🙉",
    ];
    try {
      const r = tl[Math.floor(Math.random() * tl.length)];
      const body = event.body ? event.body.toLowerCase() : "";
      if (
        body.startsWith("baby") ||
        body.startsWith("bot") ||
        body.startsWith("bbu") ||
        body.startsWith("bby") ||
        body.startsWith("janu")
      ) {
        const arr = body.replace(/^\S+\s*/, "");
        if (!arr) {
          api.sendMessage(
            r,
            event.threadID,
            (error, info) => {
              global.GoatBot.onReply.set(info.messageID, {
                commandName: this.config.name,
                type: "reply",
                messageID: info.messageID,
                author: event.senderID,
              });
            },
            event.messageID
          );
        }else{
        const { data } = await axios.get(`${rubishapi}/chat`, {
          params: { query: arr, apikey: "rubish69" },
        });
        const responseMessage = data.response;
        await api.sendMessage(
          responseMessage,
          event.threadID,
          (error, info) => {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: this.config.name,
              type: "reply",
              messageID: info.messageID,
              author: event.senderID,
            });
          },
          event.messageID
        );
    }
      }
    } catch (err) {
      return api.sendMessage(
        `Error: ${err.message}`,
        event.threadID,
        event.messageID
      );
    }
  },
};
