const moment = require("moment-timezone");
const axios = require('axios');

module.exports = {
	config: {
    name: "gpt",
    version: "1.0.0",
    role: 0,
    author: "BADBOY",
    longDescription: "Gpt4 architecture",
    category: "ai",
    countDown: 5,
},


onChat: async function ({ api, event }) {
 const message = event.body;
  const command = "gpt";

  if (message.indexOf(command) === 0 || message.indexOf(command.charAt(0).toUpperCase() + command.slice(1)) === 0) {
    const args = message.split(/\s+/);
    args.shift();
   
try {
        const { messageID, messageReply } = event;
        let prompt = args.join(' ');

        if (messageReply) {
            const repliedMessage = messageReply.body;
            prompt = `${repliedMessage} ${prompt}`;
        }

        if (!prompt) {
            return api.sendMessage('👾 | 𝐇𝐞𝐥𝐥𝐨, 𝐈 𝐚𝐦 𝐆𝐩𝐭-4 𝐭𝐫𝐚𝐢𝐧𝐞𝐝 𝐛𝐲 𝐎𝐩𝐞𝐧𝐚𝐢\n\n𝐇𝐨𝐰 𝐦𝐚𝐲 𝐢 𝐚𝐬𝐬𝐢𝐬𝐭 𝐲𝐨𝐮 𝐭𝐨𝐝𝐚𝐲?', event.threadID, messageID);
        }
        api.sendMessage('💭 | 𝐆𝐩𝐭-4 𝐢𝐬 𝐬𝐞𝐚𝐫𝐜𝐡𝐢𝐧𝐠, 𝐏𝐥𝐞𝐚𝐬𝐞 𝐰𝐚𝐢𝐭...', event.threadID);

        // Delay
        await new Promise(resolve => setTimeout(resolve, 2000)); // Adjust the delay time as needed

        const gpt4_api = `https://gpt4withcustommodel.onrender.com/gpt?query=${encodeURIComponent(prompt)}&model=gpt-4-32k-0314`;
        const manilaTime = moment.tz('Asia/Dhaka');
        const formattedDateTime = manilaTime.format('MMMM D, YYYY h:mm A');

        const response = await axios.get(gpt4_api);

        if (response.data && response.data.response) {
            const generatedText = response.data.response;

            // Ai Answer Here
            api.sendMessage(`🎓 𝐆𝐩𝐭-𝟒 𝐀𝐧𝐬𝐰𝐞𝐫 \n\n𝗔𝗻𝘀𝘄𝗲𝗿: ${generatedText}\n\n🗓 | ⏰ 𝙳𝚊𝚝𝚎 & 𝚃𝚒𝚖𝚎:\n${formattedDateTime}`, event.threadID, messageID);
        } else {
            console.error('API response did not contain expected data:', response.data);
            api.sendMessage(`❌ An error occurred while generating the text response. Please try again later. Response data: ${JSON.stringify(response.data)}`, event.threadID, messageID);
        }
    } catch (error) {
        console.error('Error:', error);
        api.sendMessage(`❌ An error occurred while generating the text response. Please try again later. Error details: ${error.message}`, event.threadID, event.messageID);
    }
}
},
onStart: async function ({ api, event, args }) {

}
};
