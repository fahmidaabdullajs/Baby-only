const fs = require('fs');
const path = require('path');

// তোমার JSON ফাইলগুলোর ফোল্ডার যেখানে রাখা আছে
const jsonFolder = "./json_files"; 

// ফোল্ডারে থাকা সব JSON ফাইল লুপ করে আপডেট করা
fs.readdirSync(jsonFolder).forEach(file => {
    if (file.endsWith(".json")) {
        const filePath = path.join(jsonFolder, file);
        let jsonData = [];

        if (fs.existsSync(filePath)) {
            jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        }

        // নতুন ডাটা যোগ করা (তুমি চাইলে এখান থেকে কোড কাস্টমাইজ করতে পারো)
        jsonData.push({ id: Date.now(), name: "AutoBot", score: Math.floor(Math.random() * 1000) });

        // JSON ফাইলটি আপডেট করা
        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), "utf-8");

        console.log(`✅ Updated: ${file}`);
    }
});
