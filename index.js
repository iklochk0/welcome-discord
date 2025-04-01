import dotenv from 'dotenv';
dotenv.config();

import { Client, GatewayIntentBits } from 'discord.js';
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// __dirname emulation for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
      content: `Welcome ${member.user}!\nPlease check <#1356245281066193056> and <#1354555963499352174> to get started.`,
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
    ctx.fillStyle = '#2c2f33'; // Discord dark style fallback
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Avatar circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();

  const avatarURL = member.user.displayAvatarURL({ extension: 'jpg', size: 256 });
  const avatar = await loadImage(avatarURL);
  ctx.drawImage(avatar, 25, 25, 200, 200);
  ctx.restore();

  // Welcome text
  ctx.font = 'bold 40px Sans';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`WELCOME ${member.user.username.toUpperCase()}`, 250, 150);

  return canvas.toBuffer();
}

client.login(process.env.DISCORD_TOKEN);