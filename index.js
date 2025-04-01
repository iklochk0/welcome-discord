import dotenv from 'dotenv';
dotenv.config();

import { Client, GatewayIntentBits } from 'discord.js';
import { createCanvas, loadImage, registerFont } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Register Open Sans font
registerFont(path.join(__dirname, "fonts", 'OpenSans-Regular.ttf'), {
  family: 'OpenSans'
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ]
});

const WELCOME_CHANNEL_ID = '1356245281066193056';

client.once('ready', () => {
  console.log(`Bot is online as ${client.user.tag}`);
});

client.on('guildMemberAdd', async (member) => {
  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!channel) return;

  try {
    const imageBuffer = await createWelcomeImage(member);

    await channel.send({
      content: `Welcome ${member.user}!\nPlease check <#1354555963499352174> and <#1354860576429576404> to get started.`,
      files: [{ attachment: imageBuffer, name: 'welcome.png' }]
    });
  } catch (err) {
    console.error('Error generating welcome image:', err);
    await channel.send(`Welcome ${member.user}! Glad to have you here.`);
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
    ctx.fillStyle = '#2c2f33';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Draw avatar
  ctx.save();
  ctx.beginPath();
  ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();

  const avatarURL = member.user.displayAvatarURL({ extension: 'jpg', size: 256 });
  const avatar = await loadImage(avatarURL);
  ctx.drawImage(avatar, 25, 0, 200, 200);
  ctx.restore();

  // Draw welcome text with shadow and background
  const text = `WELCOME ${member.user.username.toUpperCase()}`;
  ctx.font = 'bold 40px OpenSans';

  const textMetrics = ctx.measureText(text);
  const textWidth = textMetrics.width;
  const textX = 250;
  const textY = 150;

  // Background rectangle for text
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(textX - 20, textY - 40, textWidth + 40, 60);

  // Text with shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.shadowBlur = 4;

  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, textX, textY);

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 0;

  return canvas.toBuffer();
}

client.login(process.env.DISCORD_TOKEN);