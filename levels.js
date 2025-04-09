// level.js
const fs = require('fs');

const XP_PER_MESSAGE = 1;
const LEVELS = Array.from({ length: 200 }, (_, i) => Math.floor(10 * Math.pow(1.5, i)));
const DATA_FILE = './levels.json';

let userData = {};

// load data
if (fs.existsSync(DATA_FILE)) {
  userData = JSON.parse(fs.readFileSync(DATA_FILE));
}

// save data
function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(userData, null, 2));
}

// get level from XP
function getLevel(xp) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i]) return i;
  }
  return 0;
}

// export a function to attach to the bot
function registerLevelSystem(client) {
  client.on('messageCreate', message => {
    // if (message.author.bot) return; // i allowed bots cos i thought it would be funny but you can enable this if you like

    const userId = message.author.id;
    if (!userData[userId]) {
      userData[userId] = { xp: 0, level: 0 };
    }

    userData[userId].xp += XP_PER_MESSAGE;
    const newLevel = getLevel(userData[userId].xp);

    if (newLevel > userData[userId].level) {
      userData[userId].level = newLevel;
      message.channel.send(`${message.author} leveled up to **Level ${newLevel}**`);
    }

    saveData();
  });
}

module.exports = registerLevelSystem;
