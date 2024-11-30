const axios = require("axios");

module.exports = {
  config: {
    name: "tempmail",
    version: "1.0",
    author: "NTKhang",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Generate a temporary email and check inbox",
    },
    longDescription: {
      en: "Use this command to generate a temporary email and check its inbox for messages.",
    },
    category: "tools",
    guide: {
      en: "{pn} gen - Generates a new temporary email\n{pn} inbox - Checks the inbox of the generated email",
    },
  },

  onStart: async function ({ message, args, event, api, usersData }) {
    const { senderID } = event;
    const userData = await usersData.get(senderID) || {};
    const email = userData.tempmail;

    if (args[0] === "gen") {
      try {
        const response = await axios.get("https://upol-tempmail.onrender.com/gen");
        const data = response.data;

        if (data.success) {
          userData.tempmail = data.email;
          await usersData.set(senderID, userData);

          message.reply(
            `╭─────────────────────╮\n` +
            `│ TEMPORARY EMAIL GENERATED │\n` +
            `╰─────────────────────╯\n` +
            `📧 Email: ${data.email}\n` +
            `💬 Use '${this.config.name} inbox' to check for new messages.`
          );
        } else {
          message.reply("Failed to generate a temporary email. Please try again.");
        }
      } catch (error) {
        message.reply("An error occurred while generating the temporary email. Please try again later.");
      }
    } else if (args[0] === "inbox") {
      if (!email) {
        return message.reply(
          "You don't have a temporary email yet. Use the 'gen' option to create one."
        );
      }

      try {
        const response = await axios.get(`https://upol-tempmail.onrender.com/inbox?email=${email}`);
        const data = response.data;

        if (data.success) {
          message.reply(
            `╭─────────────────────╮\n` +
            `│ TEMPORARY EMAIL INBOX │\n` +
            `╰─────────────────────╯\n` +
            `📬 Email: ${email}\n` +
            `📝 Message: ${data.message}`
          );
        } else {
          message.reply("Failed to fetch the inbox. Please try again later.");
        }
      } catch (error) {
        message.reply("An error occurred while checking the inbox. Please try again later.");
      }
    } else {
      message.reply("Invalid option. Use 'gen' to generate a temporary email or 'inbox' to check messages.");
    }
  },
};
