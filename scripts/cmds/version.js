const axios = require("axios");
function compareVersion(version1, version2) {
 const v1 = version1.split(".").map(Number);
 const v2 = version2.split(".").map(Number);
 const len = Math.max(v1.length, v2.length);

 for (let i = 0; i < len; i++) {
 if ((v1[i] || 0) > (v2[i] || 0)) return 1;
 if ((v1[i] || 0) < (v2[i] || 0)) return -1;
 }

 return 0;
}


module.exports = {
 config: {
 name: "version",
 version: "1.0",
 author: "NTKhang",
 countDown: 5,
 role: 0,
 shortDescription: {
 vi: "Kiểm tra phiên bản mới nhất của bot",
 en: "Check for the latest version of the bot"
 },
 longDescription: {
 vi: "Kiểm tra phiên bản mới nhất của bot",
 en: "Check for the latest version of the bot"
 },
 category: "utility",
 guide: {
 vi: "{pn}: Kiểm tra phiên bản mới nhất của bot",
 en: "{pn}: Check for the latest version of the bot"
 }
 },

 langs: {
 vi: {
 newVersionDetected: "Đã phát hiện phiên bản mới của %1 (%2). Bạn đang sử dụng phiên bản cũ (%1). Hãy cập nhật để có những tính năng mới nhất!",
 upToDateVersion: "Bạn đang sử dụng phiên bản mới nhất của %1 (%2).",
 versionCheckError: "Đã xảy ra lỗi khi kiểm tra phiên bản. Vui lòng thử lại sau."
 },
 en: {
 newVersionDetected: "New version of %1 (%2) detected. You are currently using an old version (%1). Please update to get the latest features!",
 upToDateVersion: "You are using the latest version of v%1 (%2).",
 versionCheckError: "An error occurred while checking the version. Please try again later."
 }
 },

 onStart: async function ({ message, getLang }) {
 try {
 const { data: { version } } = await axios.get("https://raw.githubusercontent.com/ntkhang03/Goat-Bot-V2/main/package.json");
 const currentVersion = require("../../package.json").version;
 const compare = compareVersion(version, currentVersion);
 if (compare === 1) {
 message.reply(getLang("newVersionDetected", currentVersion, version));
 } else if (compare === -1) {
 message.reply(getLang("newVersionDetected", version, currentVersion));
 } else {
 message.reply(getLang("upToDateVersion"));
 }
 } catch (e) {
 console.error(e);
 message.reply(getLang("versionCheckError"));
 }
 }
};
