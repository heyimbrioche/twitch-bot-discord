import axios from 'axios';
import cron from 'node-cron';
import { EmbedBuilder } from 'discord.js';
import logger from '../utils/logger.js';

class TwitchService {
  constructor(clientId, accessToken, channelName, channelId, guildId = null) {
    this.clientId = clientId;
    this.accessToken = accessToken;
    this.channelName = channelName;
    this.channelId = channelId;
    this.guildId = guildId;
    this.isLive = false;
    this.lastStreamData = null;
    this.checkInterval = null;
  }

  async getChannelInfo() {
    try {
      const response = await axios.get(
        `https://api.twitch.tv/helix/users?id=${this.channelId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Client-ID': this.clientId,
          },
        }
      );

      if (response.data.data.length === 0) {
        throw new Error('Chaîne Twitch introuvable');
      }

      return response.data.data[0];
    } catch (error) {
      if (error.response?.status === 401) {
        logger.warn('Token OAuth expiré, rafraîchissement nécessaire');
        throw new Error('Token expiré');
      }
      logger.error('Erreur lors de la récupération des infos de la chaîne:', error);
      throw error;
    }
  }

  async checkStreamStatus() {
    try {
      const response = await axios.get(
        `https://api.twitch.tv/helix/streams?user_id=${this.channelId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Client-ID': this.clientId,
          },
        }
      );

      const streamData = response.data.data[0];
      const wasLive = this.isLive;
      this.isLive = !!streamData;

      if (streamData) {
        const channelInfo = await this.getChannelInfo();
        this.lastStreamData = {
          ...streamData,
          user: channelInfo,
        };
      }

      return { isLive: this.isLive, streamData: this.lastStreamData, wasLive };
    } catch (error) {
      if (error.response?.status === 401) {
        logger.warn('Token OAuth expiré lors de la vérification du stream');
        throw new Error('Token expiré - reconnexion nécessaire');
      }
      logger.error('Erreur lors de la vérification du stream:', error);
      return { isLive: false, streamData: null, wasLive: this.isLive };
    }
  }

  createStreamEmbed(streamData) {
    const thumbnail = streamData.thumbnail_url
      .replace('{width}', '1280')
      .replace('{height}', '720');

    return new EmbedBuilder()
      .setColor('#9146FF')
      .setTitle(`🔴 ${streamData.user.display_name} est en live!`)
      .setDescription(streamData.title)
      .setURL(`https://twitch.tv/${streamData.user.login}`)
      .setImage(thumbnail)
      .addFields(
        { name: '🎮 Jeu', value: streamData.game_name || 'Aucun jeu', inline: true },
        { name: '👁️ Spectateurs', value: streamData.viewer_count.toString(), inline: true },
        { name: '📺 Chaîne', value: `[Regarder sur Twitch](https://twitch.tv/${streamData.user.login})`, inline: false }
      )
      .setTimestamp(new Date(streamData.started_at))
      .setFooter({ 
        text: 'Twitch Notification', 
        iconURL: 'https://static.twitchcdn.net/assets/favicon-32-e29e246c157142c94346.png' 
      });
  }

  async initialize() {
    try {
      await this.getChannelInfo();
      logger.info(`Service Twitch initialisé pour ${this.channelName}`);
      return true;
    } catch (error) {
      logger.error('Erreur lors de l\'initialisation du service Twitch:', error);
      throw error;
    }
  }

  startStreamCheck(client, guildId, database) {
    if (!guildId) {
      logger.error('GuildId requis pour démarrer la vérification des streams');
      return;
    }

    // Vérifie toutes les 2 minutes
    this.checkInterval = cron.schedule('*/2 * * * *', async () => {
      try {
        const { isLive, streamData, wasLive } = await this.checkStreamStatus();

        if (isLive && !wasLive) {
          // Stream vient de commencer
          const settings = await database.getGuildSettings(guildId);
          const notificationChannelId = settings.notificationChannelId;

          if (notificationChannelId) {
            try {
              const channel = await client.channels.fetch(notificationChannelId);
              if (channel) {
                const embed = this.createStreamEmbed(streamData);
                await channel.send({ 
                  content: `@everyone 🔴 **NOUVEAU STREAM!**`,
                  embeds: [embed] 
                });
                logger.info(`Notification de stream envoyée pour ${streamData.user.display_name} sur le serveur ${guildId}`);
              }
            } catch (error) {
              logger.error('Erreur lors de l\'envoi de la notification:', error);
            }
          } else {
            logger.warn(`Aucun canal de notification configuré pour le serveur ${guildId}`);
          }
        }
      } catch (error) {
        if (error.message === 'Token expiré - reconnexion nécessaire') {
          logger.warn(`Token expiré pour le serveur ${guildId}, l'utilisateur doit se reconnecter`);
        } else {
          logger.error('Erreur lors de la vérification du stream:', error);
        }
      }
    });

    logger.info(`Vérification des streams Twitch démarrée pour ${this.channelName} (Guild: ${guildId})`);
  }

  stopStreamCheck() {
    if (this.checkInterval) {
      this.checkInterval.stop();
      logger.info(`Vérification des streams arrêtée pour ${this.channelName}`);
    }
  }
}

export default TwitchService;
