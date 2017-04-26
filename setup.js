const execSync = require("child_process").execSync;
const exec = require("child_process").exec
console.log("\x1b[36m", "HELLO Dr. MATHAIS!", "\x1b[0m");
console.log("I had a lot of fun making this game and hope you have some fun playing it");
console.log("Please make sure you have NodeJS 7.5 installed");
console.log("You will also need mongodb running as well.");
console.log("\x1b[36m", "=== INSTALLING ROOT NODE_MODULES ===", "\x1b[0m");
execSync("npm install");
console.log("\x1b[32m", "Root node_modules installed correctly", "\x1b[0m");
console.log("\x1b[36m", "=== INSTALLING LOBBY NODE_MODULES ===", "\x1b[0m");
execSync("cd ./client && npm install");
console.log("\x1b[32m", "Lobby node_modules installed correctly", "\x1b[0m");

console.log("\x1b[32m", "Everything looks like it got setup correctly. (Then again it will probably say this even if it didn't :) )", "\x1b[0m");
console.log("TO RUN THE GAME");
console.log("First do:    `node main.js`");
console.log("Then open an new terminal window and do:    `cd client && npm start`");
console.log("\n\n\nENJOY");
