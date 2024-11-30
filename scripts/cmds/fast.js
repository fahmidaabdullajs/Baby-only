const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { exec } = require('child_process');
const ffmpeg = require('ffmpeg-static');

const cacheFolder = path.join(__dirname, 'cache');

if (!fs.existsSync(cacheFolder)) {
  fs.mkdirSync(cacheFolder);
}

module.exports = {
  config: {
    name: "fast",
    version: "1.0",
    author: "Mah MUD",
    shortDescription: "Change the playback speed of a video",
    longDescription: "Adjust the playback speed of a video.",
    category: "media",
    guide: {
      en: "{p}speed <factor>"
    }
  },
  onStart: async function ({ message, event, args, api }) {
    try {
      if (event.type !== "message_reply") {
        return message.reply("❌ || Reply to a video.");
      }

      const attachment = event.messageReply.attachments;
      if (!attachment || attachment.length !== 1 || attachment[0].type !== "video") {
        return message.reply("❌ || Please reply to a video.");
      }

      const videoUrl = attachment[0].url;
      const speedFactor = parseFloat(args[0]);

      if (isNaN(speedFactor) || speedFactor < 0.1 || speedFactor > 10) {
        return message.reply("❌ || Speed factor must be between 0.1 and 10.");
      }

      const userVideoPath = path.join(cacheFolder, `video_${Date.now()}.mp4`);
      const speedVideoPath = path.join(cacheFolder, `speed_${Date.now()}.mp4`);

    
      const responseVideo = await axios({
        url: videoUrl,
        method: 'GET',
        responseType: 'stream'
      });
      const writerVideo = fs.createWriteStream(userVideoPath);
      responseVideo.data.pipe(writerVideo);

      await new Promise((resolve, reject) => {
        writerVideo.on('finish', resolve);
        writerVideo.on('error', reject);
      });

     
      const ffmpegCommand = [
        '-i', userVideoPath,
        '-filter:v', `setpts=${1 / speedFactor}*PTS`,
        '-filter:a', `atempo=${speedFactor}`,
        speedVideoPath
      ];

      exec(`${ffmpeg} ${ffmpegCommand.join(' ')}`, async (error, stdout, stderr) => {
        if (error) {
          console.error("FFmpeg error:", error);
          message.reply("❌ || An error occurred during speed adjustment.");
          return;
        }
        console.log("FFmpeg output:", stdout);
        console.error("FFmpeg stderr:", stderr);

      
        message.reply({
          attachment: fs.createReadStream(speedVideoPath)
        }).then(() => {
          
          fs.unlinkSync(userVideoPath);
          fs.unlinkSync(speedVideoPath);
        }).catch((sendError) => {
          console.error("Error sending video:", sendError);
          message.reply("❌ || An error occurred while sending the adjusted video.");
        });
      });

    } catch (error) {
      console.error("Error:", error);
      message.reply("❌ || An error occurred.");
    }
  }
};
