const axios = require("axios");
const fs = require("fs");
const path = require("path");

const SEARCH_API = "https://www.noobz-api.rf.gd/api/yts?name=";
const DOWNLOAD_API = "https://fastapi-nyx-production.up.railway.app/y?url=";

async function video(event, args, message) {
    try {
        let title = "";
        let videoId = "";

        // If replying to a video/audio attachment
        if (event.messageReply && event.messageReply.attachments?.length > 0) {
            const attachment = event.messageReply.attachments[0];
            if (attachment.type !== "video" && attachment.type !== "audio") {
                return message.reply("❌ Invalid attachment type.");
            }

            const shortUrl = attachment.url;
            const musicRecognitionResponse = await axios.get(`https://audio-recon-ahcw.onrender.com/kshitiz?url=${encodeURIComponent(shortUrl)}`);
            title = musicRecognitionResponse.data.title;
        } 
        // If user provides a title
        else if (args.length > 0) {
            title = args.join(" ");
        } 
        // No valid input
        else {
            return message.reply("❌ Please provide a video name or reply to a video/audio attachment.");
        }

        // Fetch search results
        const searchResponse = await axios.get(`${SEARCH_API}${encodeURIComponent(title)}`);
        const results = searchResponse.data.data;
        
        if (!results || results.length === 0) {
            return message.reply("❌ No video found for the given query.");
        }

        const selectedVideo = results[0]; // Selecting the first result
        videoId = selectedVideo.id;

        // Fetch download link
        const downloadResponse = await axios.get(`${DOWNLOAD_API}https://www.youtube.com/watch?v=${videoId}&type=mp4`);
        const songUrl = downloadResponse.data.url;

        if (!songUrl) {
            return message.reply("❌ Error: Unable to fetch the song. Please try again later.");
        }

        const filePath = path.join(__dirname, "cache", `${selectedVideo.name}.mp4`);
        fs.writeFileSync(filePath, Buffer.from((await axios.get(songUrl, { responseType: "arraybuffer" })).data, "binary"));

        // Shorten the URL
        const tinyUrlResponse = await axios.get(`https://tinyurl.com/api-create.php?url=${songUrl}`);
        const tinyUrl = tinyUrlResponse.data;

        await message.reply({
            body: `✅𝙃𝙚𝙧𝙚'𝙨 𝙮𝙤𝙪𝙧 𝙑𝙞𝙙𝙚𝙤 𝙗𝙖𝙗𝙮 \n\n 🐤 | 𝗲𝙣𝙟𝙤𝙮 : ${selectedVideo.name}`,
            attachment: fs.createReadStream(filePath)
        }, () => fs.unlinkSync(filePath));

    } catch (error) {
        console.error("Error:", error);
        message.reply("❌ An error occurred while processing your request.");
    }
}

module.exports = {
    config: {
        name: "video",
        version: "1.1",
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
