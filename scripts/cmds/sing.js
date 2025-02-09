const axios = require("axios");
const fs = require('fs-extra');
const path = require('path');

async function video(event, args, message) {
    try {
        let title = '';
        let videoId = '';

        if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
            const attachment = event.messageReply.attachments[0];
            if (attachment.type !== "video" && attachment.type !== "audio") {
                message.reply("Invalid attachment type.");
                return;
            }

            const shortUrl = attachment.url;
            const musicRecognitionResponse = await axios.get(`https://audio-recon-ahcw.onrender.com/kshitiz?url=${encodeURIComponent(shortUrl)}`);
            title = musicRecognitionResponse.data.title;
        } else if (args.length === 0) {
            message.reply("Please provide a video name or reply to a video/audio attachment.");
            return;
        } else {
            title = args.join(" ");
        }

        const searchResponse = await axios.get(`https://youtube-kshitiz-gamma.vercel.app/yt?search=${encodeURIComponent(title)}`);
        if (searchResponse.data.length > 0) {
            videoId = searchResponse.data[0].videoId;
        }

        if (!videoId) {
            message.reply("No video found for the given query.");
            return;
        }

        try {
            const downloadResponse = await axios.get(`${global.GoatBot.config.api}api/ytmp3?query=${videoId}&format=mp3`);
            const songUrl = downloadResponse.data.data;
            const filePath = path.join(__dirname, "cache", `${searchResponse.data[0].title}.mp3`);

            fs.writeFileSync(filePath, Buffer.from((await axios.get(songUrl, { responseType: "arraybuffer" })).data, "binary"));

            const tinyUrlResponse = await axios.get(`https://tinyurl.com/api-create.php?url=${songUrl}`);
            const tinyUrl = tinyUrlResponse.data;

            await message.reply({
                body: `✅𝙃𝙚𝙧𝙚'𝙨 𝙮𝙤𝙪𝙧 𝙨𝙤𝙣𝙜 𝙗𝙖𝙗𝙮 \n\n 🐤 | 𝗲𝙣𝙟𝙤𝙮 : ${title}`,
                attachment: fs.createReadStream(filePath)
            }, () => fs.unlinkSync(filePath));
        } catch (error) {
            message.reply("Error: Unable to fetch the song. Please try again later.");
        }
    } catch (error) {
        console.error("Error:", error);
        message.reply("An error occurred.");
    }
}

module.exports = {
    config: {
        name: "sing",
        version: "1.0",
        author: "Vex_Kshitiz",
        countDown: 10,
        role: 0,
        shortDescription: "Play audio from YouTube",
        longDescription: "Play audio from YouTube with audio recognition support.",
        category: "music",
        guide: "{p}sing videoname / reply to audio or video"
    },
    onStart: function ({ event, args, message }) {
        return video(event, args, message);
    }
};
