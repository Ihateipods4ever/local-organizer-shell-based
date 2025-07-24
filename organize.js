// /path/to/your/project/local-organizer/organize.js

const fs = require('fs').promises;
const path = require('path');

// --- CONFIGURATION: Define how files should be organized ---
// You can easily add more rules here.
// The key is the folder name, and the value is an array of file extensions.
const ORGANIZATION_RULES = {
    "Images": ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'],
    "Documents": ['.pdf', '.doc', 'docx', '.txt', '.ppt', '.pptx', '.xls', '.xlsx', '.odt'],
    "Videos": ['.mp4', '.mov', '.avi', '.mkv', '.wmv'],
    "Audio": ['.mp3', '.wav', '.aac', '.flac'],
    "Archives": ['.zip', '.rar', '.7z', '.tar', '.gz'],
    "Code": ['.js', '.html', '.css', '.py', '.java', '.cpp', '.c', '.ts', '.json'],
};
// ---------------------------------------------------------

async function organizeFolder(targetPath) {
    console.log(`Scanning folder: ${targetPath}`);

    try {
        // Check if the target directory exists
        await fs.access(targetPath);
    } catch (error) {
        console.error(`\x1b[31mError: The folder "${targetPath}" does not exist. Please check the path.\x1b[0m`);
        process.exit(1);
    }

    // Read all files and folders in the target directory
    const files = await fs.readdir(targetPath);
    let filesMoved = 0;

    for (const file of files) {
        const filePath = path.join(targetPath, file);
        const fileStats = await fs.stat(filePath);

        // Skip directories and the script itself
        if (fileStats.isDirectory() || file === 'organize.js') {
            continue;
        }

        const fileExt = path.extname(file).toLowerCase();
        let destinationFolder = null;

        // Find the correct destination folder based on the rules
        for (const folder in ORGANIZATION_RULES) {
            if (ORGANIZATION_RULES[folder].includes(fileExt)) {
                destinationFolder = folder;
                break;
            }
        }

        // If no rule matches, move it to a default "Other" folder
        if (!destinationFolder) {
            destinationFolder = "Other";
        }

        const destinationPath = path.join(targetPath, destinationFolder);

        // Create the destination folder if it doesn't exist
        try {
            await fs.access(destinationPath);
        } catch (error) {
            console.log(`\x1b[36mCreating folder: ${destinationPath}\x1b[0m`);
            await fs.mkdir(destinationPath);
        }

        // Move the file
        const newFilePath = path.join(destinationPath, file);
        await fs.rename(filePath, newFilePath);
        console.log(`\x1b[32mMoved:\x1b[0m ${file} -> ${destinationFolder}/`);
        filesMoved++;
    }

    if (filesMoved === 0) {
        console.log("\n\x1b[33mAnalysis complete. No new files to organize.\x1b[0m");
    } else {
        console.log(`\n\x1b[1m\x1b[32m✅ Success! Organized ${filesMoved} file(s).\x1b[0m`);
    }
}

// --- HOW TO RUN ---
// 1. Open your terminal.
// 2. Navigate to this project folder.
// 3. Run the command: node organize.js "/path/to/your/messy/folder"
//    (Replace with the actual path to the folder you want to clean up)
// ------------------

const targetDirectory = process.argv[2];

if (!targetDirectory) {
    console.error("\x1b[31mError: Please provide a folder path to organize.\x1b[0m");
    console.error("\x1b[33mUsage: node organize.js \"/path/to/your/folder\"\x1b[0m");
    process.exit(1);
}

organizeFolder(targetDirectory).catch(console.error);
