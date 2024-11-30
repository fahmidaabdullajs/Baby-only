const axios = require('axios');
module.exports.config = {
  name: 'emojigif',
  version: '1.0.0',
  usePrefix: true,
  author: 'Dipto',
  category: 'fun',
  role: 0,
  description:{ en: 'Convert an emoji to a GIF image.'},
  guide: '[emoji]',
  cooldowns: 5
};
module.exports.onStart = async ({ api, event, args }) => {
  const emoji = args.join(' ');
  if (!emoji) {
    return api.sendMessage('Please provide an emoji.', event.threadID, event.messageID);
  }
  const apiUrl = await axios.get(`${global.api.dipto}/emojiTogif?emoji=${emoji}`);

  try {
    const response = await axios.get(apiUrl.data.gifUrl, { responseType: 'stream' });
  api.sendMessage({attachment: response.data } ,event.threadID, event.messageID);
  } catch (error) {
    api.sendMessage(`Failed to convert emoji to GIF.\n${error.message}`, event.threadID);
  }
};
