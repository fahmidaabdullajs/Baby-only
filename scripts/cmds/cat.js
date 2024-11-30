module.exports = {
	config: {
		name: "cat",
		aliases: [],
		version: "1.0",
		author: "",
		countDown: 5,
		role: 0,
		shortDescription: "send you pic&video of gojo",
		longDescription: "",
		category: "image",
		guide: "{pn}"
	},

	onStart: async function ({ message }) {
	 var link = [
		"https://telegra.ph/file/a27734c0da76820744b43.jpg",
		 "https://telegra.ph/file/4f2d2e970cb1d76f30301.jpg",
		 "https://telegra.ph/file/39b812cad5e71c68a94e9.jpg",
		 "https://telegra.ph/file/8ebdef281e25fbbf0d2d9.jpg",
		 "https://telegra.ph/file/737dc4eb7cd465f21ba0a.jpg",
		 "https://telegra.ph/file/0f0db2ad2003b2858eb8c.jpg",
		 "https://telegra.ph/file/3644338be55749036a3be.jpg",
		 "https://telegra.ph/file/a62a946945a06d05314ef.jpg",
		 "https://telegra.ph/file/e4128d1871460eb96f6d7.jpg",
		 "https://telegra.ph/file/bf96048bf1001c9bf0d0b.jpg",
		 "https://telegra.ph/file/29381e8e2d2f14205bd26.jpg",
		 "https://telegra.ph/file/c55f7c05cede2eba93acc.jpg",
		 "https://telegra.ph/file/d4ce451a6b08d696ab0c4.jpg",
		 "https://telegra.ph/file/a07e751e952953f9c5cac.jpg",
		 "https://telegra.ph/file/ed330eb64d4c2a7516316.jpg",
		 "https://telegra.ph/file/ba58da16f4e736f30f513.jpg",
		 "https://telegra.ph/file/e3743a00ec71b4edd098d.jpg",
		 "https://telegra.ph/file/59e9d8bbc1fac4e059325.jpg",
		 

]

let img = link[Math.floor(Math.random()*link.length)]
message.send({
  body: ' Naw baby cat image <😘 ',attachment: await global.utils.getStreamFromURL(img)
})
}
}
