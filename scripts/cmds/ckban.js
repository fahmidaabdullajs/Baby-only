 module.exports = {
  config: {
    name: 'ckban',
    version: '1.0',
    author: 'Mah MUD彡',
    countDown: 15,
    role: 0,
    shortDescription: 'Check if bot is media banned',
    longDescription: 'Check if the bot is banned from sending media.',
    category: 'general',
    guide: {
      en: '{pn}: Check if the bot is media banned.'
    }
  },

  onStart: async function ({ message, api, event }) {
    const checkImageURL = "https://i.ibb.co/2ntpM69/image.jpg";
    
    const checkMessage = await message.reply("Checking media ban 🐤");

    try {
      const attachment = await global.utils.getStreamFromURL(checkImageURL);

      if (!attachment) {
        throw new Error("Failed to create attachment. Stream is null or undefined.");
      }

      await message.reply({
        body: "Media not banned ✅",
        attachment: attachment
      },async (error,info)=>{
      if (info) {
        await api.editMessage("✅ The bot's media is not banned.", checkMessage.messageID);
      } else {
message.reply("❌ The bot's media has been moye moye ")
        throw new Error("Media may be blocked, message did not send correctly.");
      }
});

    } catch (error) {
      console.error("Error encountered:", error.message || error);
      await api.editMessage("❌ The bot's media has been banned or an error occurred.", checkMessage.messageID);
    }
  }
};
