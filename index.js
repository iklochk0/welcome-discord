require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ]
});

// ID каналу, куди надсилати привітання
const WELCOME_CHANNEL_ID = '1356245281066193056';

client.once('ready', () => {
  console.log(`Бот запущено як ${client.user.tag}`);
});

// Відстеження приєднання нового учасника
client.on('guildMemberAdd', async (member) => {
  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!channel) return;

  const welcomeMessage = `Hello, ${member.user}! Welcome to our discord server!`;
  channel.send(welcomeMessage);
});

client.login(process.env.DISCORD_TOKEN);