const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;
const doNotDelete = "𝗬𝗼𝘂𝗿 𝗕𝗮𝗯𝘆";
/**
 * @author NTKhang
 * @author: do not delete it
 * @message if you delete or edit it you will get a global ban
 * please don't ban me, your help.js is Modified
 */

module.exports = {
	config: {
		name: "help3",
		version: "1.17",
		author: "NTKhang", //Modified By Zedric
		countDown: 5,
		role: 2,
		shortDescription: {
			en: "View command usage",
		},
		longDescription: {
			en: "View command usage",
		},
		category: "info",
		guide: {
			en:
				"{pn} [empty | <page number> | <command name>]" +
				"\n   {pn} <command name> [-u | usage | -g | guide]: only show command usage" +
				"\n   {pn} <command name> [-i | info]: only show command info" +
				"\n   {pn} <command name> [-r | role]: only show command role" +
				"\n   {pn} <command name> [-a | alias]: only show command alias",
		},
		priority: 1,
	},

	langs: {
		en: {
			help: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n %6\n\n%1\n\n𝙋𝙖𝙜𝙚 [ %2/%3 ]𝙣𝘾𝙪𝙧𝙧𝙚𝙣𝙩𝙡𝙮, 𝙏𝙝𝙚 𝘽𝙤𝙩 𝙝𝙖𝙨 %4 𝘾𝙤𝙢𝙢𝙖𝙣𝙙𝙨 \n\n 📜 » 𝙏𝙮𝙥𝙚 %5𝙝𝙚𝙡𝙥 <𝙥𝙖𝙜𝙚> \n 📃 » 𝙏𝙮𝙥𝙚 %5𝙝𝙚𝙡𝙥 <𝙘𝙤𝙢𝙢𝙖𝙣𝙙> \n\n 👑 𝘼𝙙𝙢𝙞𝙣:Mah MUD彡\n 🎀 𝙁𝘽:m.me/rockexe444\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
			help2:
				"%1├───────⭔\n│ » 𝘾𝙪𝙧𝙧𝙚𝙣𝙩𝙡𝙮, 𝙩𝙝𝙚 𝙗𝙤𝙩 𝙝𝙖𝙨 %2 𝙘𝙤𝙢𝙢𝙖𝙣𝙙𝙨 𝙩𝙝𝙖𝙩 𝙘𝙖𝙣 𝙗𝙚 𝙪𝙨𝙚𝙙\n│ » 𝙏𝙮𝙥𝙚 %3𝙝𝙚𝙡𝙥 <𝙘𝙤𝙢𝙢𝙖𝙣𝙙 𝙣𝙖𝙢𝙚> 𝙩𝙤 𝙫𝙞𝙚𝙬 𝙩𝙝𝙚 𝙙𝙚𝙩𝙖𝙞𝙡𝙨 𝙤𝙛 𝙝𝙤𝙬 𝙩𝙤 𝙪𝙨𝙚 𝙩𝙝𝙖𝙩 𝙘𝙤𝙢𝙢𝙖𝙣𝙙\n│ %4\n╰─────────────⭓",
			commandNotFound: '𝘽𝙖𝙗𝙮,𝙩𝙝𝙞𝙨 𝘾𝙤𝙢𝙢𝙖𝙣𝙙 "%1" 𝙙𝙤𝙚𝙨 𝙣𝙤𝙩 𝙚𝙭𝙞𝙨𝙩 🥺🥺',
			getInfoCommand:
				"╭ [ 𝙉𝘼𝙈𝙀 ]\n╰‣  %1\n╭ [ 𝙄𝙉𝙁𝙊 ]\n╰‣  𝘿𝙚𝙨𝙘𝙧𝙞𝙥𝙩𝙞𝙤𝙣: %2\n╰‣ 𝙊𝙩𝙝𝙚𝙧 𝙣𝙖𝙢𝙚𝙨: %3\n╰‣ 𝙊𝙩𝙝𝙚𝙧 𝙣𝙖𝙢𝙚𝙨 𝙞𝙣 𝙮𝙤𝙪𝙧 𝙜𝙧𝙤𝙪𝙥: %4\n╰‣ 𝙑𝙚𝙧𝙨𝙞𝙤𝙣: %5\n╰‣ 𝙍𝙤𝙡𝙚: %6\n╰‣ 𝙏𝙞𝙢𝙚 𝙥𝙚𝙧 𝙘𝙤𝙢𝙢𝙖𝙣𝙙: %7𝙨\n╰‣ 𝘼𝙪𝙩𝙝𝙤𝙧: Mah MUD彡\n╰‣ 𝙐𝙨𝙖𝙜𝙚: %8",
			onlyInfo:
				"╭ [ 𝙄𝙉𝙁𝙊 ]\n╰‣ 𝘾𝙤𝙢𝙢𝙖𝙣𝙙 𝙣𝙖𝙢𝙚: %1\n╰‣ 𝘿𝙚𝙨𝙘𝙧𝙞𝙥𝙩𝙞𝙤𝙣: %2𝙣\n╰‣ 𝙊𝙩𝙝𝙚𝙧 𝙣𝙖𝙢𝙚𝙨: %3\n╰‣ 𝙊𝙩𝙝𝙚𝙧 𝙣𝙖𝙢𝙚𝙨 𝙞𝙣 𝙮𝙤𝙪𝙧 𝙜𝙧𝙤𝙪𝙥: %4\n╰‣ 𝙑𝙚𝙧𝙨𝙞𝙤𝙣: %5\n╰‣ 𝙍𝙤𝙡𝙚: %6\n╰‣ 𝙏𝙞𝙢𝙚 𝙥𝙚𝙧 𝙘𝙤𝙢𝙢𝙖𝙣𝙙: %7𝙨\n╰‣ 𝘼𝙪𝙩𝙝𝙤𝙧: Mah MUD彡",
	onlyUsage: "╭ [ 𝙐𝙎𝘼𝙂𝙀 ]\n│%1\n╰───────⭓",
			onlyAlias:
				"╭── 𝘼𝙇𝙄𝘼𝙎 ────⭓\n│ 𝙊𝙩𝙝𝙚𝙧 𝙣𝙖𝙢𝙚𝙨: %1\n│ 𝙊𝙩𝙝𝙚𝙧 𝙣𝙖𝙢𝙚𝙨 𝙞𝙣 𝙮𝙤𝙪𝙧 𝙜𝙧𝙤𝙪𝙥: %2\n╰─────────────⭓",
			onlyRole: "╭── 𝙍𝙊𝙇𝙀 ────⭓\n│%1\n╰─────────────⭓",
			doNotHave: "𝘿𝙤 𝙣𝙤𝙩 𝙝𝙖𝙫𝙚",
			roleText0: "0 (𝘼𝙡𝙡 𝙪𝙨𝙚𝙧𝙨)",
			roleText1: "1 (𝙂𝙧𝙤𝙪𝙥 𝙖𝙙𝙢𝙞𝙣𝙞𝙨𝙩𝙧𝙖𝙩𝙤𝙧𝙨)",
			roleText2: "2 (𝘼𝙙𝙢𝙞𝙣 𝙗𝙤𝙩)",
			roleText0setRole: "0 (𝙨𝙚𝙩 𝙧𝙤𝙡𝙚, 𝙖𝙡𝙡 𝙪𝙨𝙚𝙧𝙨)",
			roleText1setRole: "1 (𝙨𝙚𝙩 𝙧𝙤𝙡𝙚, 𝙜𝙧𝙤𝙪𝙥 𝙖𝙙𝙢𝙞𝙣𝙞𝙨𝙩𝙧𝙖𝙩𝙤𝙧𝙨)",
			pageNotFound: "𝙋𝙖𝙜𝙚 %1 𝙙𝙤𝙚𝙨 𝙣𝙤𝙩 𝙚𝙭𝙞𝙨𝙩",
		},
	},

	onStart: async function ({
		message,
		args,
		event,
		threadsData,
		getLang,
		role,
	}) {
		const langCode =
			(await threadsData.get(event.threadID, "data.lang")) ||
			global.GoatBot.config.language;
		let customLang = {};
		const pathCustomLang = path.normalize(
			`${process.cwd()}/languages/cmds/${langCode}.js`,
		);
		if (fs.existsSync(pathCustomLang)) customLang = require(pathCustomLang);

		const { threadID } = event;
		const threadData = await threadsData.get(threadID);
		const prefix = getPrefix(threadID);
		let sortHelp = threadData.settings.sortHelp || "name";
		if (!["category", "name"].includes(sortHelp)) sortHelp = "name";
		const commandName = (args[0] || "").toLowerCase();
		const command =
			commands.get(commandName) || commands.get(aliases.get(commandName));

		// ———————————————— LIST ALL COMMAND ——————————————— //
		if ((!command && !args[0]) || !isNaN(args[0])) {
			const arrayInfo = [];
			let msg = "";
			if (sortHelp == "name") {
				const page = parseInt(args[0]) || 1;
				const numberOfOnePage = 50;
				for (const [name, value] of commands) {
					if (value.config.role > 1 && role < value.config.role) continue;
					let describe = name;
					let shortDescription;
					const shortDescriptionCustomLang = customLang[name]?.description;
					if (shortDescriptionCustomLang != undefined)
						shortDescription = checkLangObject(
							shortDescriptionCustomLang,
							langCode,
						);
					else if (value.config.description)
						shortDescription = checkLangObject(
							value.config.description,
							langCode,
						);
					if (shortDescription)
						describe += `: ${cropContent(shortDescription.charAt(0).toUpperCase() + shortDescription.slice(1))}`;
					arrayInfo.push({
						data: describe,
						priority: value.priority || 0,
					});
				}

				arrayInfo.sort((a, b) => a.data - b.data); // sort by name
				arrayInfo.sort((a, b) => (a.priority > b.priority ? -1 : 1)); // sort by priority
				const { allPage, totalPage } = global.utils.splitPage(
					arrayInfo,
					numberOfOnePage,
				);
				if (page < 1 || page > totalPage)
					return message.reply(getLang("pageNotFound", page));

				const returnArray = allPage[page - 1] || [];
				const startNumber = (page - 1) * numberOfOnePage + 1;
				msg += (returnArray || [])
					.reduce(
						(text, item, index) =>
							(text += `${index + startNumber}${index + startNumber < 10 ? " " : ""}. ${item.data}\n`),
						"",
					)
					.slice(0, -1);
				let hh = await message.reply(
					getLang(
						"help",
						msg,
						page,
						totalPage,
						commands.size,
						prefix,
						doNotDelete,
					),
				);
				setTimeout(() => {
					message.unsend(hh.messageID);
				}, 60000);
			} else if (sortHelp == "category") {
				for (const [, value] of commands) {
					if (value.config.role > 1 && role < value.config.role) continue; // if role of command > role of user => skip
					const indexCategory = arrayInfo.findIndex(
						(item) =>
							(item.category || "NO CATEGORY") ==
							(value.config.category?.toLowerCase() || "NO CATEGORY"),
					);

					if (indexCategory != -1)
						arrayInfo[indexCategory].names.push(value.config.name);
					else
						arrayInfo.push({
							category: value.config.category.toLowerCase(),
							names: [value.config.name],
						});
				}
				arrayInfo.sort((a, b) => (a.category < b.category ? -1 : 1));
				arrayInfo.forEach((data, index) => {
					const categoryUpcase = `${index == 0 ? `╭` : `├`}─── ${data.category.toUpperCase()} ${index == 0 ? "⭓" : "⭔"}`;
					data.names = data.names.sort().map((item) => (item = `│ ${item}`));
					msg += `${categoryUpcase}\n${data.names.join("\n")}\n`;
				});
				let pp = message.reply(
					getLang("help2", msg, commands.size, prefix, doNotDelete),
				);
				setTimeout(() => {
					message.unsend(pp.messageID);
				}, 30000);
			}
		}
		// ———————————— COMMAND DOES NOT EXIST ———————————— //
		else if (!command && args[0]) {
			return message.reply(getLang("commandNotFound", args[0]));
		}
		// ————————————————— INFO COMMAND ————————————————— //
		else {
			const formSendMessage = {};
			const configCommand = command.config;

			let guide =
				configCommand.guide?.[langCode] || configCommand.guide?.["en"];
			if (guide == undefined)
				guide =
					customLang[configCommand.name]?.guide?.[langCode] ||
					customLang[configCommand.name]?.guide?.["en"];

			guide = guide || {
				body: "",
			};
			if (typeof guide == "string") guide = { body: guide };
			const guideBody = guide.body
				.replace(/\{prefix\}|\{p\}/g, prefix)
				.replace(/\{name\}|\{n\}/g, configCommand.name)
				.replace(/\{pn\}/g, prefix + configCommand.name);

			const aliasesString = configCommand.aliases
				? configCommand.aliases.join(", ")
				: getLang("doNotHave");
			const aliasesThisGroup = threadData.data.aliases
				? (threadData.data.aliases[configCommand.name] || []).join(", ")
				: getLang("doNotHave");

			let roleOfCommand = configCommand.role;
			let roleIsSet = false;
			if (threadData.data.setRole?.[configCommand.name]) {
				roleOfCommand = threadData.data.setRole[configCommand.name];
				roleIsSet = true;
			}

			const roleText =
				roleOfCommand == 0
					? roleIsSet
						? getLang("roleText0setRole")
						: getLang("roleText0")
					: roleOfCommand == 1
						? roleIsSet
							? getLang("roleText1setRole")
							: getLang("roleText1")
						: getLang("roleText2");

			//const author = configCommand.author;
			const descriptionCustomLang = customLang[configCommand.name]?.description;
			let description = checkLangObject(configCommand.description, langCode);
			if (description == undefined)
				if (descriptionCustomLang != undefined)
					description = checkLangObject(descriptionCustomLang, langCode);
				else description = getLang("doNotHave");

			let sendWithAttachment = false; // check subcommand need send with attachment or not

			if (args[1]?.match(/^-g|guide|-u|usage$/)) {
				formSendMessage.body = getLang(
					"onlyUsage",
					guideBody.split("\n").join("\n│"),
				);
				sendWithAttachment = true;
			} else if (args[1]?.match(/^-a|alias|aliase|aliases$/))
				formSendMessage.body = getLang(
					"onlyAlias",
					aliasesString,
					aliasesThisGroup,
				);
			else if (args[1]?.match(/^-r|role$/))
				formSendMessage.body = getLang("onlyRole", roleText);
			else if (args[1]?.match(/^-i|info$/))
				formSendMessage.body = getLang(
					"onlyInfo",
					configCommand.name,
					description,
					aliasesString,
					aliasesThisGroup,
					configCommand.version,
					roleText,
					configCommand.countDown || 1 /*author*/,
				);
			else {
				formSendMessage.body = getLang(
					"getInfoCommand",
					configCommand.name,
					description,
					aliasesString,
					aliasesThisGroup,
					configCommand.version,
					roleText,
					configCommand.countDown || 1,
					/*author || "", */ `${guideBody.split("\n").join("\n│")}`,
				);
				sendWithAttachment = true;
			}

			if (sendWithAttachment && guide.attachment) {
				if (
					typeof guide.attachment == "object" &&
					!Array.isArray(guide.attachment)
				) {
					const promises = [];
					formSendMessage.attachment = [];

					for (const keyPathFile in guide.attachment) {
						const pathFile = path.normalize(keyPathFile);

						if (!fs.existsSync(pathFile)) {
							const cutDirPath = path.dirname(pathFile).split(path.sep);
							for (let i = 0; i < cutDirPath.length; i++) {
								const pathCheck = `${cutDirPath.slice(0, i + 1).join(path.sep)}${path.sep}`; // create path
								if (!fs.existsSync(pathCheck)) fs.mkdirSync(pathCheck); // create folder
							}
							const getFilePromise = axios
								.get(guide.attachment[keyPathFile], {
									responseType: "arraybuffer",
								})
								.then((response) => {
									fs.writeFileSync(pathFile, Buffer.from(response.data));
								});

							promises.push({
								pathFile,
								getFilePromise,
							});
						} else {
							promises.push({
								pathFile,
								getFilePromise: Promise.resolve(),
							});
						}
					}

					await Promise.all(promises.map((item) => item.getFilePromise));
					for (const item of promises)
						formSendMessage.attachment.push(fs.createReadStream(item.pathFile));
				}
			}

	 const oo = message.reply(formSendMessage);
				setTimeout(() => {
					message.unsend(oo.messageID);
				}, 30000);
		//	return;
		}
	},
};

function checkLangObject(data, langCode) {
	if (typeof data == "string") return data;
	if (typeof data == "object" && !Array.isArray(data))
		return data[langCode] || data.en || undefined;
	return undefined;
}

function cropContent(content, max) {
	if (content.length > max) {
		content = content.slice(0, max - 3);
		content = content + "...";
	}
	return content;
}
