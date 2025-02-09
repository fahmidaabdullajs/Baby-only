const axios = require('axios');

const baseApiUrl = async () => {
  const base = await axios.get(
    `https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json`
  );
  return base.data.api;
};

module.exports.config = {
  name: "font",
  aliases: ["style"],
  version: '1.7',
  role: 0,
  countDowns: 5,
  author: 'dipto',
  description: 'This command transforms text with different fonts',
  guide: { en: '[number] [text]' }
};

module.exports.onStart = async function ({ message, args }) {
  if (args[0] === 'list') {
    const fontList = `Available Styles:\n
1: Ă̈r̆̈ĭ̈y̆̈ă̈n̆̈
2: 𝘈𝘳𝘪𝘺𝘢𝘯
3: 𝗔𝗿𝗶𝘆𝗮𝗻
4: 🅐🅡🅘🅨🅐🅝
5: ᴬᴿᴵʸᴬᴺ
6: Ａｒｉｙａｎ
7: 𝙰𝚛𝚒𝚢𝚊𝚗
8: 𝔸𝕣𝕚𝕪𝕒𝕟
9: 𝘼𝙧𝙞𝙮𝙖𝙣
10: Ａⅈ𝚛𝘪𝘺օ𝚗
11: 𝐀𝐫𝐢𝐲𝐚𝐧
12: 🄰🅁🄸🅈🄰🄽
13: Ⓐⓡⓘⓨⓐⓝ
14: 𝕬𝖗𝖎𝖞𝖆𝖓
15: ᴀʀɪʏᴀɴ
16: 🅰🆁🅸🆈🅰🅽
17: ᴬᴿᴵʸᴬᴺ
18: A̷r̷i̷y̷a̷n̷
19: ȺᴿɨɎΛN
20: ∂ιяуαη`;

    await message.reply(fontList);
    return;
  }

  const number = args[0];
  const text = encodeURIComponent(args.slice(1).join(" "));

  if (!text || isNaN(number)) {
    return message.reply('Invalid command. Usage: font <number> <text>');
  }

  try {
    const response = await axios.get(`${await baseApiUrl()}/font?message=${text}&number=${number}`);
    const result = response.data;
    await message.reply(result.data);
  } catch (error) {
    console.error('Error:', error);
    message.reply('An error occurred while processing your request.');
  }
};
