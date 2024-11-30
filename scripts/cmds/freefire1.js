module.exports = {
  config: {
    name: "freefire",
    aliases: ["ff"],
    version: "1.0",
    author: "𝗠𝗮𝗵 𝗠𝗨𝗗 彡",
    countDown: 20,
    role: 0,
    shortDescription: "get free fire video",
    longDescription: "get random free fire video",
    category: "media",
    guide: "{pn}",
  },

  sentVideos: [],

  onStart: async function ({ api, event, message }) {
    const senderID = event.senderID;

    const loadingMessage = await message.reply({
      body: "Loading random free fire video... Please wait! 💖",
    });

    const link = [
            "https://drive.google.com/uc?export=download&id=12_bOfwpb0HLfpsmvdn8mC8BiaK5KaKyR",
      "https://drive.google.com/uc?export=download&id=12zcIaCmYBtekRs_z1OMw1j1yVEACBLFL",
      "https://drive.google.com/uc?export=download&id=12WcRzqU_6ImtPktIiV3cEawrQNbuywlO",
      "https://drive.google.com/uc?export=download&id=11rA3oxG1iloMr3vVYJbmlD-1eVRBknkj",
      "https://drive.google.com/uc?export=download&id=12LXIKV9lmzqL7st3uP-mfuf4REfvi-rT",
      "https://drive.google.com/uc?export=download&id=13ESO0GUSqFbwC_VsysiN1RxLZem09Clq",
      "https://drive.google.com/uc?export=download&id=11x8VP2opubG8J7ZdO4uFNNpsYgCwCLA_",
      "https://drive.google.com/uc?export=download&id=13R_4HiKyfRsWoVixL_K17whxaDTGXEHT",
      "https://drive.google.com/uc?export=download&id=12F9GcEoxE8NO4hcrMuyQekpYVt0-RR4v",
      "https://drive.google.com/uc?export=download&id=12mYIYSGcAtzAY-dfoXffYYyHPC89fyN3",
      "https://drive.google.com/uc?export=download&id=12e9zu4xvgq1bay9J2v3TMmmXN2lGkrxr",
      "https://drive.google.com/uc?export=download&id=13L0OPveM5dST1a-ty8BwyYT_fki7pE2y",
      "https://drive.google.com/uc?export=download&id=136TcXyNXGs2Yvr6QGvyK7s594qvDQeQA",
      "https://drive.google.com/uc?export=download&id=11dGhl_p0h_eFt7zJr6bAet28vdZxMr5m",
      "https://drive.google.com/uc?export=download&id=12bg1HNKi9g7nKInCrqvgSqzVOhTW0lK2",
      "https://drive.google.com/uc?export=download&id=12WbKWPdco6l4zONrmIkDEUVYfMv0mFeF",
      "https://drive.google.com/uc?export=download&id=12ho9SvTXRUgBFnx3aCsw1G4l1iGrBZlZ",
      "https://drive.google.com/uc?export=download&id=11npraIrX5ie3pL8wtek4a5YgJ-an1aXv",
      "https://drive.google.com/uc?export=download&id=12fjVnNpkazDss3-gC_NvDfIriuYQeM1Z",
      "https://drive.google.com/uc?export=download&id=12fCdcgIxMk9bLgPtXwaoSphGsVwqtq6U",
      "https://drive.google.com/uc?export=download&id=12S4bq7u8c4o8etFksjYgZvrJjSbpPoB4",
    ];

    const availableVideos = link.filter(video => !this.sentVideos.includes(video));

    if (availableVideos.length === 0) {
      this.sentVideos = [];
    }

    const randomIndex = Math.floor(Math.random() * availableVideos.length);
    const randomVideo = availableVideos[randomIndex];

    this.sentVideos.push(randomVideo);

    if (senderID !== null) {
      message.reply({
        body: 'ENJOY..🤍',
        attachment: await global.utils.getStreamFromURL(randomVideo),
      });

      setTimeout(() => {
        api.unsendMessage(loadingMessage.messageID);
      }, 5000);
    }
  },
};
