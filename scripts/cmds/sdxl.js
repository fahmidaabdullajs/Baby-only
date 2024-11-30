const axios = require('axios');

module.exports = {
    config: {
        name: 'sdxl',
        role: 0,
        category: 'Image gen',
        shortDescription: 'Text to Image with sdxl',
        longDescription: 'Generate image based on prompt',
        version: '3.2.1',
        author: 'UPoL🐔',
        guide: {
            en: '{pn} [prompt]'
        }
    },
    onStart: async function ({ event, api, message, args }) {
        const prompt = args.join(' ');

        if (!prompt) {
            return message.reply('Enter a prompt with text or emoji.');
        }

        const models = {
      '1': 'sdxl-1.7',
      '2': 'sdxl-1.3',
      '3': 'sdxl-1.0',
      '4': 'sdxl-1.2',
      '5': 'sdxl-1.4',
      '6': 'SDXL-7'
    };

    const modelNumber = args[args.length - 1];
    const model = models[modelNumber];

    const [ prompts, modelName ] = prompt.split('|').map(part => part.trim());

        await message.reply('Creating....!');

        api.setMessageReaction('⏳', event.messageID, () => {}, true);

        const text = 'encodeFromURI(prompts)';

        try {

            const ApiUrl = `https://horrorable-upoldev.onrender.com/sdxl?prompt=${text}&model=${model}`;

            const attachment = await global.utils.getStreamFromURL(ApiUrl);

            api.setMessageReaction("✅", event.messageID, () => {}, true);
          api.setMessageReaction("", event.messageID, () => {}, false);

          if (!attachment) {
                return message.reply('Cannot generate image.');
        }
            message.reply({
                body: `✅ Generated your picture:\nYour Prompt: ${args.join(' ')}`,
                attachment: attachment
            });
        } catch (error) {
            console.error(error);
            return message.reply('Failed:', error);
        }
    }
};
