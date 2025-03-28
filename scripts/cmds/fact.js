const axios = require('axios');
const jimp = require("jimp");
const fs = require("fs");

module.exports = {
	config: {
		name: "fact1",
    aliases: ["facts1","factz1"],
    version: "1.0",
		author: "Mah MUD彡",
		countDown: 35,
		role: 0,
		shortDescription: "Make A Text As Fact",
		longDescription: "Make A Text As Fact",
		category: "fun",
		guide: "{p} fact"
	},

	onStart: async function ({ message, args }) {
		const text = args.join(" ");
		if (!text) {
			return message.reply(`Please enter a text`);
		} else {
			const img = `https://api.popcat.xyz/facts?text=${encodeURIComponent(text)}`;		
      
                 const form = {
				body: ``
			};
				form.attachment = []
				form.attachment[0] = await global.utils.getStreamFromURL(img);
			message.reply(form);
			  }
}};
