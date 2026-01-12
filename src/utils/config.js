import { config } from 'dotenv';
import logger from './logger.js';

config();

const requiredEnvVars = [
  'DISCORD_TOKEN',
  'DISCORD_CLIENT_ID',
  'DISCORD_GUILD_ID',
  'TWITCH_CLIENT_ID',
  'TWITCH_CLIENT_SECRET',
  'TWITCH_CHANNEL_NAME',
];

export function validateConfig() {
  const missing = [];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar] || process.env[envVar].includes('your_')) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    logger.error(`Variables d'environnement manquantes ou invalides: ${missing.join(', ')}`);
    logger.error('Veuillez configurer votre fichier .env avant de démarrer le bot.');
    return false;
  }

  return true;
}

export default {
  discord: {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.DISCORD_CLIENT_ID,
    guildId: process.env.DISCORD_GUILD_ID,
  },
  twitch: {
    clientId: process.env.TWITCH_CLIENT_ID,
    clientSecret: process.env.TWITCH_CLIENT_SECRET,
    channelName: process.env.TWITCH_CHANNEL_NAME,
  },
  bot: {
    prefix: process.env.BOT_PREFIX || '!',
    color: process.env.BOT_COLOR || '#9146FF',
    notificationChannelId: process.env.NOTIFICATION_CHANNEL_ID,
  },
};
