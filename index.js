const { Client, GatewayIntentBits } = require('discord.js');
const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const fetch = require('node-fetch');
const axios = require('axios');
const { token: TOKEN } = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const { spawn } = require('child_process');

const llm = spawn('node', ['llm.mjs'], {
  stdio: 'inherit',
  shell: true,
});
llm.on('error', (err) => {
  console.error('failed to start llm.mjs:', err);
});
llm.on('exit', (code) => {
  console.log(`llm.mjs exited with code ${code}`);
});


// well er heres the level system.. id prolly do this a better way but im a lil lazy for that so

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

client.on('messageCreate', message => {
//  if (message.author.bot) return;

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


client.on('messageCreate', async (message) =>{
  if (message.channel.id !== "1359131874961916090") return;
  if (message.author.bot) return;
  const messageData = {
    name: message.author.username,
    message: message.content,
    type: 'message',
    timestamp: message.createdTimestamp / 1000,
    discord: true,
  };

  try {
    await axios.post('https://jhorn.net/something.php', messageData);
    console.log('data send');
  } catch (error) {
    console.error('error sending data', error);
  }
})


const keyword = 'big daddy rat';

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();
  const botMentioned = message.mentions.has(client.user);
  const botRepliedTo = message.reference && message.reference.messageId === client.user.id;

  if (content.includes(keyword) || botMentioned || botRepliedTo) {
    let typing = true;

    const typingInterval = setInterval(() => {
      if (typing) {
        message.channel.sendTyping().catch(() => {});
      }
    }, 5000);

    try {
      const response = await fetch('http://192.168.1.142:3457/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'You’re Big Daddy Rat, a laid-back, sharp-tongued rat with a no-nonsense attitude. You’ve got street smarts and always speak your mind. Keep it smooth, confident, and direct—no need for fluff. You know what’s up, and you don’t waste time. Reply in a tone appropriate to this message:' + message.content
        })
      });

      const data = await response.json();
      const reply = data.reply || data.response || data.message || "io am big daddy rat";
      await message.reply(reply);
    } catch (err) {
      console.error('error', err);
      message.reply('big daddy rat couldnt think of wat to say');
    } finally {
      typing = false;
      clearInterval(typingInterval);
    }
  }
});



client.once('ready', () => {
  console.log(`bot is online as ${client.user.tag}`);
});

client.login(TOKEN);
