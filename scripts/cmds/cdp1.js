const fs = require('fs');
const path = './cdp.json'; 

module.exports = {
	config: {
		name: "copuledp",
		aliases: ["cdp"],
		version: "1.0",
		author: "Mah MUD彡",
		countDown: 2,
		role: 0,
		shortDescription: "copule dp",
		longDescription: "random nibba nibbi copule dp",
		category: "image",
		guide: "{pn}"
	}, 

	onStart: async function ({ message }) {
		let pairs = JSON.parse(fs.readFileSync(path, 'utf8'));

		const selectedPair = pairs[Math.floor(Math.random() * pairs.length)]; 

		const maleLink = selectedPair.male;
		const femaleLink = selectedPair.female;
		let attachments = [];
		attachments.push(await global.utils.getStreamFromURL(maleLink));
		attachments.push(await global.utils.getStreamFromURL(femaleLink));
		message.send({
			body: 'Naw baby copule dp <😘',
			attachment: attachments
		});
	}
};
