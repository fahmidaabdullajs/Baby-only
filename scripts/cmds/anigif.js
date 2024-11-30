const fetch = require('node-fetch');
const fs = require('fs-extra');

module.exports = {
    config: {
        name: "anigif",
        version: "1.1",
        author: "kshitiz",
        role: 2,
        category: "anime",
      shortDescription: "bot will send you anime gif based on tag.",
        longDescription: "bot will send you anime gif based on tag.",
        guide: {
            en: "{pn} <tag> |type only {pn} to see tag list",
        }
    },

    onStart: async function ({ api, args, message, event }) {


          const { getPrefix } = global.utils;
       const p = getPrefix(event.threadID);
   






        const availableTags = ["bite", "blush", "comfy", "cry", "cuddle", "dance", "eevee","fluff","holo","hug","icon","kiss","kitsune","lick","neko","okami","pat","poke","senko","sairo","slap","smile","tail","tickle","anal", "blowjob","cum","fuck","pussylick","solo","threesome_fff","threesome_ffm","threesome_mmf","yaio","yuri"];

        const tag = args[0];

            const bypassUid = event.senderID;

            let invalidTagMessage = `Invalid tag "${tag}" ⚠️.\nPlease use :\n`;
            invalidTagMessage += "bite, blush, comfy, cry, cuddle, dance, eevee, fluff, holo, hug, icon, kiss, kitsune, lick, neko, okami, pat, poke, senko, sairo, slap, smile, tail, tickle.";


        const isNsfw = ["anal", "blowjob","cum","fuck","pussylick","solo","threesome_fff","threesome_ffm","threesome_mmf","yaio","yuri"].includes(tag);
        
                const msgSend = await message.reply("Your thread/group is not allowed to use this tag.\nType /requestNSFW to send a request to admin for permission.");
                setTimeout(async () => {
                    await message.unsend(msgSend.messageID);
                }, 100000);
                
            
        

        const endpoint = isNsfw
            ? `https://purrbot.site/api/img/nsfw/${tag}/gif`
            : `https://purrbot.site/api/img/sfw/${tag}/gif`;

        const response = await fetch(endpoint);

        if (response.status !== 200) {
            return message.reply("Failed to get image.");
        }

        const data = await response.json();
        const gif = data.link;

        const gifResponse = await fetch(gif);
        const buffer = await gifResponse.buffer();

        fs.writeFileSync(`${tag}_anime.gif`, buffer);

        message.reply({
            body: ` ${tag} 😗👇🤐 !`,
            attachment: fs.createReadStream(`${tag}_anime.gif`)
        }, () => fs.unlinkSync(`${tag}_anime.gif`));
    }
};
