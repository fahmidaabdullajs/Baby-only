const fs = require('fs');
const path = require('path');

module.exports = {
	config: {
		name: "delete",
		aliases: ["del"],
		version: "1.0",
		author: "Mah MUD",
		countDown: 5,
		role: 2,
		shortDescription: "Delete file and folders",
		longDescription: "Delete file",
		category: "utility",
		guide: "{pn}"
	},


  onStart: async function ({ args, message,event}) {
 const permission = ["100037951718438","61559134070491","61556006709662"];
    if (!permission.includes(event.senderID)) {
      message.reply("You don't have enough permission to use this command. Only Super admin can use it.");
      return;
    }
    const commandName = args[0];

    if (!commandName) {
      return message.reply("Type the file name..");
    }

    const filePath = path.join(__dirname, '..', 'cmds', `${commandName}`);

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        message.reply(`✅ | A command file has been deleted ${commandName} !!`);
      } else {
        message.reply(`command file ${commandName} unavailable!!`);
      }
    } catch (err) {
      console.error(err);
      message.reply(`Cannot be deleted because ${commandName}: ${err.message}`);
    }
  }
};
