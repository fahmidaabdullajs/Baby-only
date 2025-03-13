const fs = require("fs");

let captionsData;
const jsonFilePath = "caption1.json";

// Load the JSON data
try {
    captionsData = JSON.parse(fs.readFileSync(jsonFilePath, "utf-8"));
} catch (error) {
    console.error("❌ Error reading caption.json:", error.message);
    captionsData = {};
}

// Valid categories for adding captions
const validCategories = ["love", "sad", "cool", "funny", "attitude", "anime", "islamic", "friend"];

// Function to fetch a random caption
function getCaption(category, language) {
    if (captionsData[category] && captionsData[category][language]) {
        const categoryList = captionsData[category][language];
        const randomIndex = Math.floor(Math.random() * categoryList.length);
        return categoryList[randomIndex];
    } else {
        return "❌ Category or language not found! Use 'caption list' to see available categories.";
    }
}

// Function to save the updated data back to the JSON file
function saveCaptionsData() {
    fs.writeFileSync(jsonFilePath, JSON.stringify(captionsData, null, 2), "utf-8");
}

module.exports = {
    config: {
        name: "caption",
        version: "1.7",
        author: "MahMUD",
        countDown: 10,
        category: "fun",
    },

    onStart: async ({ message, args }) => {
        // If the user asks for the list of categories
        if (args[0] === "list") {
            const availableCategories = Object.keys(captionsData).map(cat => `➤ ${cat}`).join("\n");
            return message.reply(`📜 Available categories:\n${availableCategories}`);
        }

        // Check if the user wants to add a caption
        if (args[0] === "add") {
            // Ensure the user specifies a valid category, language, and caption text
            if (args.length < 4) {
                return message.reply("⚠ Please specify a valid category ('love', 'sad', 'cool', 'funny', 'anime', 'attitude', 'Islamic'), language (bn/en), and caption text. Example: `!caption add love bn This is a love caption.`");
            }

            const category = args[1]?.toLowerCase();
            const language = args[2]?.toLowerCase();
            const captionText = args.slice(3).join(" ");

            // Validate the category
            if (!validCategories.includes(category)) {
                return message.reply("❌ Invalid category. You can only add captions to 'love', 'sad', 'cool', or 'funny', 'attitude', 'anime', 'Islamic' friend");
            }

            // Validate the language
            if (language !== "bn" && language !== "bangla" && language !== "en" && language !== "english") {
                return message.reply("❌ Invalid language. Use 'bn' or 'en'.");
            }

            // Add the caption to the specified language within the category
            if (language === "bn" || language === "bangla") {
                captionsData[category].bangla.push(captionText);
            } else if (language === "en" || language === "english") {
                captionsData[category].english.push(captionText);
            }

            // Save the updated captions data
            saveCaptionsData();

            return message.reply(`✅ New caption added to '${category}' category in ${language === 'bn' || language === 'bangla' ? "Bangla" : "English"}.`);
        }

        // If not adding a caption, proceed to fetch a random caption
        if (!args || args.length < 1) {
            return message.reply("⚠ Please specify a category! Example: `!caption love`");
        }

        // Set default language to Bangla
        let category = args[0]?.toLowerCase();
        let language = "bangla";  // Default language is Bangla

        // If a language is provided, set it accordingly
        if (args[1]) {
            const lang = args[1]?.toLowerCase();
            if (lang === "en" || lang === "english") {
                language = "english";
            } else if (lang !== "bn" && lang !== "bangla") {
                return message.reply("❌ Invalid language. Use 'bn' or 'en'.");
            }
        }

        // Validate if category exists
        if (!validCategories.includes(category)) {
            return message.reply("❌ Invalid category. You can only request captions from 'love', 'sad', 'cool', or 'funny', 'anime', 'Islamic', 'attitude' Friend");
        }

        // Fetch random caption
        const caption = getCaption(category, language);
        const title = args.slice(1).join(" ") || category.charAt(0).toUpperCase() + category.slice(1); // Default title is category name if no custom title is given

        message.reply(`Here your ${title} caption:\n\n${caption}`);
    },
};
