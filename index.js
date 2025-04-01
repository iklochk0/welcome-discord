require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ]
});

const WELCOME_CHANNEL_ID = '1356245281066193056';

client.once('ready', () => {
  console.log(`Бот запущено як ${client.user.tag}`);
});

client.on('guildMemberAdd', async (member) => {
  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!channel) return;

  try {
    const imageBuffer = await createWelcomeImage(member);

    await channel.send({
      content: `Вітаємо, ${member}!  
Шукай інструкції в <#канал-verification> та <#канал-rules>. Успіхів у Королівстві!`,
      files: [{ attachment: imageBuffer, name: 'welcome.png' }]
    });
  } catch (err) {
    console.error('Помилка при створенні вітального зображення:', err);
    await channel.send(`Привіт, ${member}! Раді бачити тебе на сервері.`);
  }
});

async function createWelcomeImage(member) {
  const canvas = createCanvas(800, 250);
  const ctx = canvas.getContext('2d');

  const backgroundPath = path.join(__dirname, 'background.jpg');

  if (fs.existsSync(backgroundPath)) {
    const background = await loadImage(backgroundPath);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = '#2c2f33'; // запасний Discord-стиль фон
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Коло під аватарку
  ctx.save();
  ctx.beginPath();
  ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();

  const avatarURL = member.user.displayAvatarURL({ extension: 'jpg', size: 256 });
  const avatar = await loadImage(avatarURL);
  ctx.drawImage(avatar, 25, 25, 200, 200);
  ctx.restore();

  // Напис "WELCOME Username"
  ctx.font = 'bold 40px Sans';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`WELCOME ${member.user.username.toUpperCase()}`, 250, 150);

  return canvas.toBuffer();
}

client.login(process.env.DISCORD_TOKEN);