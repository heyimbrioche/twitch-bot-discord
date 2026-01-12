import { Events, ActivityType } from 'discord.js';
import logger from '../utils/logger.js';

export default {
  name: Events.ClientReady,
  once: true,
  execute(client, bot) {
    logger.info(`✅ Bot connecté en tant que ${client.user.tag}!`);
    logger.info(`📊 Bot présent sur ${client.guilds.cache.size} serveur(s)`);
    
    // Mise à jour du statut
    client.user.setPresence({
      activities: [{
        name: `${client.guilds.cache.size} serveurs | !help`,
        type: ActivityType.Watching,
      }],
      status: 'online',
    });

    // Mise à jour périodique du statut
    setInterval(() => {
      const activities = [
        { name: `${client.guilds.cache.size} serveurs`, type: ActivityType.Watching },
        { name: 'Twitch Streams', type: ActivityType.Watching },
        { name: '!help pour l\'aide', type: ActivityType.Playing },
      ];
      const activity = activities[Math.floor(Math.random() * activities.length)];
      client.user.setActivity(activity.name, { type: activity.type });
    }, 30000);
  },
};
