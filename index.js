const { Client, Events, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

const fetch = require('node-fetch');
const { token: TOKEN } = require('./config.json');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction
  ]
});


// well er heres the level system.. id prolly do this a better way but im a lil lazy for that so
const registerLevelSystem = require('./levels');
registerLevelSystem(client);


// this is just sending a message to my server and can be removed if you want
try {
  const sendMessageToChat = require('./message');
  sendMessageToChat(client);
} catch (err) {
  console.warn('module ./message.js failed to load:', err.message);
}


// here is where the model comes into place
const keyword = 'andy';
client.on('messageCreate', async (message) => {
  if (message.author.id === client.user.id) return;
  if (message.author.bot) {
    const shouldReply = Math.random() < 0.5;
    if (shouldReply) return; 
  }

  const content = message.content.toLowerCase();
  const botMentioned = message.mentions.has(client.user);
  const botRepliedTo = message.reference && message.reference.messageId === client.user.id;

  if (content.includes(keyword) || botMentioned || botRepliedTo) {
    message.channel.sendTyping();
    const imageAttachments = message.attachments.filter(att => att.contentType?.startsWith('image/'));
    
    let caption = null;

    const typingInterval = setInterval(() => {
      message.channel.sendTyping();
    }, 4000);

    for (const [, image] of imageAttachments) {
      try {
        const res = await fetch('http://192.168.1.142:5085/caption', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_url: image.url })
        });

        const data = await res.json();
        if (data.caption) {
          caption = `*shows you an image of ${data.caption}. comment on it*`;
        } else {
          caption = `failed to caption image.`;
        }
      } catch (err) {
        console.error(err);
        caption = `error while generating caption.`;
      }
    }
    console.log(caption);

    const { getMarvinResponse } = await import('./llm.mjs');

    const marvins = `Reply in a tone appropriate to this message: "${message.content}" ${caption || ''}` 
    console.log(marvins);

    const reply = await getMarvinResponse(marvins);

    clearInterval(typingInterval);

    await message.reply(reply);
  }
});


client.once('ready', () => {
  console.log(`bot is online as ${client.user.tag}`);
});

client.login(TOKEN);
