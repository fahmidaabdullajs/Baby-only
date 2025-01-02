const axios = require("axios");
const fs = require("fs");

const ok = "xyz";
const apiBaseUrl = `https://smfahim.${ok}/sing`;
const userDataFilePath = "userData.json";

// Initialize storage for replies
global.GoatBot = global.GoatBot || { onReply: new Map() };

// Load user data from file or initialize an empty object
let usersData = loadUserData();

// Function to save user data to a JSON file
function saveUserData() {
  fs.writeFileSync(userDataFilePath, JSON.stringify(usersData, null, 2), "utf8");
}

// Function to load user data from a JSON file
function loadUserData() {
  if (fs.existsSync(userDataFilePath)) {
    return JSON.parse(fs.readFileSync(userDataFilePath, "utf8"));
  }
  return {};
}

module.exports = {
  config: {
    name: "playlist",
    version: "1.4",
    author: "RL",
    countDown: 5,
    role: 0,
    description: {
      en: "Manage and play songs from your playlist via replies or commands.",
    },
    category: "media",
    guide: {
      en: `
{pn} add <song_name>: Add a song to your playlist.
{pn} remove <song_number>: Remove a song from your playlist.
{pn} reset: Clear your entire playlist.
Reply to the playlist message with a song number to play that song.
      `,
    },
  },

  onStart: async ({ api, args, event, commandName }) => {
    const command = args[0]?.toLowerCase();
    const userID = event.senderID;
    const playlistKey = `playlist_${userID}`;

    // Initialize user's playlist if it doesn't exist
    if (!usersData[playlistKey]) {
      usersData[playlistKey] = [];
    }

    // Add a song to the playlist
    if (command === "add") {
      const songName = args.slice(1).join(" ");
      if (!songName) {
        return api.sendMessage("❌ Please provide the song name to add to your playlist.", event.threadID, event.messageID);
      }

      try {
        const songDetails = await getSongDetails(songName);
        const songData = { title: songDetails.title, duration: songDetails.duration };
        usersData[playlistKey].push(songData);
        saveUserData();

        return api.sendMessage(
          `✅ Added '${songData.title}' (Duration: ${formatDecimalDuration(songData.duration)}) to your playlist.`,
          event.threadID,
          event.messageID
        );
      } catch (error) {
        console.error(error);
        return api.sendMessage("❌ Failed to fetch song details. Please try again.", event.threadID, event.messageID);
      }
    }

    // Remove a song from the playlist
    if (command === "remove") {
      const songNumber = parseInt(args[1]);
      const playlist = usersData[playlistKey];
      if (isNaN(songNumber) || songNumber <= 0 || songNumber > playlist.length) {
        return api.sendMessage("❌ Invalid song number. Please provide a valid number from your playlist.", event.threadID, event.messageID);
      }

      const removedSong = playlist.splice(songNumber - 1, 1)[0];
      saveUserData();
      return api.sendMessage(
        `✅ Removed '${removedSong.title}' from your playlist.`,
        event.threadID,
        event.messageID
      );
    }

    // Reset the playlist
    if (command === "reset") {
      usersData[playlistKey] = [];
      saveUserData();
      return api.sendMessage("✅ Your playlist has been reset.", event.threadID, event.messageID);
    }

    // Display the playlist and store metadata for reply handling
    const playlist = usersData[playlistKey];
    if (playlist.length === 0) {
      return api.sendMessage("❌ Your playlist is currently empty.", event.threadID, event.messageID);
    }

    const playlistMessage = playlist
      .map((song, index) => `${index + 1}. ${song.title} | Duration: ${formatDecimalDuration(song.duration)}`)
      .join("\n");

    const info = await api.sendMessage(
      `🎶 Your Playlist:\n${playlistMessage}\n\nReply with a song number to play it.`,
      event.threadID,
      (error, info) => {
        if (error) return console.error(error);

        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          playlist,
          author: event.senderID,
        });
      },
      event.messageID
    );

    // Unsend the playlist message after 2 minutes
    setTimeout(() => {
      api.unsendMessage(info.messageID, (err) => {
        if (err) console.log("Unsend failed: ", err.message || "unknown error");
      });
    }, 120000); // 2 minutes
  },

  onReply: async ({ api, event }) => {
    const replyInfo = global.GoatBot.onReply.get(event.messageReply?.messageID);
    if (!replyInfo) return;

    const { playlist, author, messageID } = replyInfo;

    // Ensure the reply is from the original requester
    if (event.senderID !== author) {
      return api.sendMessage("❌ You didn't request this playlist.", event.threadID, event.messageID);
    }

    // Parse the reply content for song number
    const songNumber = parseInt(event.body.trim());

    // Ensure the reply contains a valid song number
    if (isNaN(songNumber) || songNumber <= 0 || songNumber > playlist.length) {
      return api.sendMessage("❌ Invalid song number. Please reply with a valid number from your playlist.", event.threadID, event.messageID);
    }

    const song = playlist[songNumber - 1]; // Get the song based on the number

    try {
      const dynamicDetails = await getSongDetails(song.title);
      const audioPath = await downloadAudio(dynamicDetails.url);
      api.sendMessage(
        {
          body: `🎧 Now playing: ${dynamicDetails.title} | Duration: ${formatDecimalDuration(dynamicDetails.duration)}`,
          attachment: fs.createReadStream(audioPath),
        },
        event.threadID,
        () => fs.unlinkSync(audioPath),
        event.messageID
      );
    } catch (error) {
      console.error(error);
      api.sendMessage(
        `❌ Failed to play '${song.title}'. Please try again.`,
        event.threadID,
        event.messageID
      );
    }
  },
};

// Helper functions
async function getSongDetails(songName) {
  const searchUrl = `${apiBaseUrl}?search=${encodeURIComponent(songName)}`;
  const response = await axios.get(searchUrl);
  if (!response.data || !response.data.link || !response.data.title || !response.data.duration) {
    throw new Error("Invalid API response");
  }
  return {
    title: response.data.title,
    duration: response.data.duration,
    url: response.data.link,
  };
}

async function downloadAudio(audioUrl) {
  const response = await axios.get(audioUrl, { responseType: "arraybuffer" });
  const audioPath = `ytb_audio_${Date.now()}.mp3`;
  fs.writeFileSync(audioPath, Buffer.from(response.data));
  return audioPath;
}

function formatDecimalDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60) / 100;
  return `${mins + secs}`.slice(0, 4);
}