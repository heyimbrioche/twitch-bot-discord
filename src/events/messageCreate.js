import { Events } from 'discord.js';

export default {
  name: Events.MessageCreate,
  async execute(message, bot) {
    // Ignorer les messages du bot
    if (message.author.bot) return;
    // Pas de traitement nécessaire pour les alertes Twitch
  },
};
