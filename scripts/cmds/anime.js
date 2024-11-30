module.exports = {
  config: {
    name: "anime",
    aliases: ["animevideo", "anivid", "amimevdo"],
    version: "1.0",
    author: "𝗠𝗮𝗵 𝗠𝗨𝗗 彡",
    countDown: 20,
    role: 0,
    shortDescription: "get anime video",
    longDescription: "get random anime video",
    category: "anime",
    guide: "{pn} animevdo",
  },

  sentVideos: [],

  onStart: async function ({ api, event, message }) {
    const senderID = event.senderID;

    const loadingMessage = await message.reply({
      body: "𝗟𝗼𝗮𝗱𝗶𝗻𝗴 𝗿𝗮𝗻𝗱𝗼𝗺 𝗮𝗻𝗶𝗺𝗲 𝘃𝗶𝗱𝗲𝗼...𝗣𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁! 🐤",
    });

    const link = [
      "https://drive.google.com/uc?export=download&id=1cyB6E3z4-_Dr4mlYFB87DlWkUlC_KvrR",// video credits xenoz (youtube)
      "https://drive.google.com/uc?export=download&id=1Q5L8SGKYpNrXtJ6mffcwMA9bcUtegtga",
      "https://drive.google.com/uc?export=download&id=1u8JzKCTubRhnh0APo2mMob-mQM0CoNYj",
      "https://drive.google.com/uc?export=download&id=1JBIo966g0MmUT27S1yc0B06lASt4dD9V",
      "https://drive.google.com/uc?export=download&id=1w_HUyAFHnVfkUl8XLY01pxs8dnmQNEVn",
      "https://drive.google.com/uc?export=download&id=1EoeMITZrSNB1PpPjsh5cmsFzbjMZKH2c",
      "https://drive.google.com/uc?export=download&id=1Kh4qvle57FlMjcam-JNxTQtPZe2uxrJ8",
      "https://drive.google.com/uc?export=download&id=1KtyLzqbyJpq5_ke0Cb6gD89ZNf0NQm0t",
      "https://drive.google.com/uc?export=download&id=1vy0ZldnlTqXgwJ36HxOXC9hLObgNkTZ-",
      "https://drive.google.com/uc?export=download&id=1hPZhzKm_uj6HRsEdFAH1lPFFF8vC-lTB",
      "https://drive.google.com/uc?export=download&id=1AJCeDc-MvtvSspz7oX98ywzDB3Z29bSu",
      "https://drive.google.com/uc?export=download&id=1reVD_c5kK29iTdLAu_7sYFBB0hzrRkAx",
      "https://drive.google.com/uc?export=download&id=1vmnlCwp40mmjW6aFob_wD_U1PmOgRYst",
      "https://drive.google.com/uc?export=download&id=1R0n8HQgMEEAlaL6YJ3JiDs_6oBdsjN0e",
      "https://drive.google.com/uc?export=download&id=1tUJEum_tf79gj9420mHx-_q7f0QP27DC",
      "https://drive.google.com/uc?export=download&id=1hAKRt-oOSNnUNYjDQG-OF-tdzN_qJFoR",
      "https://drive.google.com/uc?export=download&id=1HrvT5jaPsPi66seHCLBkRbTziXJUkntn",
      "https://drive.google.com/uc?export=download&id=1v8k2YxBme5zEumlNiLIry5SDMryfkBts",
      "https://drive.google.com/uc?export=download&id=1x01XDJoJMbtUjWztomF25Ne1Up4cWQoC",
      "https://drive.google.com/uc?export=download&id=12j65dstfkMUHMSmQU8FnZi2RyHPHJipx",
      "https://drive.google.com/uc?export=download&id=13ImpZl3aLHpwlYhWvjKLfiRvFsK3kl5z",
      "https://drive.google.com/uc?export=download&id=1EdFmtprVtt652PDocRlgeXXxIQRYTSQw",
      "https://drive.google.com/uc?export=download&id=1EdFmtprVtt652PDocRlgeXXxIQRYTSQw",
      "https://drive.google.com/uc?export=download&id=1QdLGspkvM-Gf1SHh2fJf8zPbrZaURTJs",
      "https://drive.google.com/uc?export=download&id=1RyG2Lh1cp6lq9IEIr4vVaDyu21RW_pav",
      "https://drive.google.com/uc?export=download&id=1zlmaoBVrk9GKPZ_2XYZzzQkFMdiszSzL",
      "https://drive.google.com/uc?export=download&id=1rcxnb5U4gnwSiZhOcsbahqzE003LKYXc",
      "https://drive.google.com/uc?export=download&id=12cjBYkdDR4BMKj1H4aV6rfa7sVuoU3eU",
      "https://drive.google.com/uc?export=download&id=1aBHnJ7AgkQKC9RBIycVN-l6F4kdeX3hf",
      "https://drive.google.com/uc?export=download&id=13X4yhx9Nr8tIleXtxC7bV1Rfjt1FXeDv",
      "https://drive.google.com/uc?export=download&id=1uuajuhhLPlLXlSRBdzmwGfIMAV6WwW5u",
      "https://drive.google.com/uc?export=download&id=1wkoC5kbo4GuDEqoEXoz40DwZi6OMKiSI",
      "https://drive.google.com/uc?export=download&id=15XtlbQn4FW5Txgi14FnuT5Qsd42SaPdK",
     "https://drive.google.com/uc?export=download&id=15Tvq2l1tuGLI_idzNb7hTqV13kOGHeCr",
"https://drive.google.com/uc?export=download&id=15eENY7NYOtUsgxV80iLb0RP24nC77_Zl",
"https://drive.google.com/uc?export=download&id=15GU5CKYFYuBMTGUYphPCRCgF9qIqKvt-",
"https://drive.google.com/uc?export=download&id=15n9nL6GOBV9SrrYftN4RC_eIW7xhy8U7",
"https://drive.google.com/uc?export=download&id=15pGhmB61gm6j3Xab1tNDrpnRdr3aEFVW",
"https://drive.google.com/uc?export=download&id=15aKHi359OHhdxvcMA_mCPGFpcEJP9Gtu",
"https://drive.google.com/uc?export=download&id=15D8MGloWIZX777eespqzA8kD5TT5wYS5",
"https://drive.google.com/uc?export=download&id=154tlkhduazy3TZroAn_itw3hB2sPl8SH",
"https://drive.google.com/uc?export=download&id=14r6ZHphKuWruWUwNeVx_ztqj9bd4Qere",
"https://drive.google.com/uc?export=download&id=14y4ZC0xFNTiz1nZ2YEIXeUIuADqew6qf",
"https://drive.google.com/uc?export=download&id=14sMHPpGq5bGYI-2p1jnkDFzVJB32ZE77",
"https://drive.google.com/uc?export=download&id=15DOMj2_Vq-IrQehdfDDSNaTM0YQ-VpWB",
"https://drive.google.com/uc?export=download&id=15-4Zs6aappNaYL-5XrD03AnHMMSE2py9",
"https://drive.google.com/uc?export=download&id=15WCYVyJDsFmFFSG0uvh2TQWmw_K4dgku",
"https://drive.google.com/uc?export=download&id=15CBU4_ObV1nnnTT-Ra2afJwLpmcSGq7B",
"https://drive.google.com/uc?export=download&id=15fLhHsKHyEjlHPF4qc553ZbzntyhhulY",
"https://drive.google.com/uc?export=download&id=15o1mqTIASPLAxGSibXcnmX9_FzgVIVdI",

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
