import axios from 'axios';
import cron from 'node-cron';
import { EmbedBuilder } from 'discord.js';
import logger from '../utils/logger.js';

class TwitchService {
  constructor(clientId, clientSecret, channelName, guildId = null) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.channelName = channelName;
    this.guildId = guildId;
    this.accessToken = null;
    this.isLive = false;
    this.lastStreamData = null;
    this.checkInterval = null;
  }

  async getAccessToken() {
    try {
      const response = await axios.post(
        'https://id.twitch.tv/oauth2/token',
        null,
        {
          params: {
            client_id: this.clientId,
            client_secret: this.clientSecret,
            grant_type: 'client_credentials',
          },
        }
      );

      this.accessToken = response.data.access_token;
      logger.info(`Token Twitch obtenu avec succès pour ${this.channelName}`);
      return this.accessToken;
    } catch (error) {
      logger.error('Erreur lors de l\'obtention du token Twitch:', error);
      throw error;
    }
  }

  async getChannelInfo() {
    if (!this.accessToken) {
      await this.getAccessToken();
    }

    try {
      const response = await axios.get(
        `https://api.twitch.tv/helix/users?login=${this.channelName}`,
        {
          headers: {
            'Client-ID': this.clientId,
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (response.data.data.length === 0) {
        throw new Error('Chaîne Twitch introuvable');
      }

      return response.data.data[0];
    } catch (error) {
      if (error.response?.status === 401) {
        await this.getAccessToken();
        return this.getChannelInfo();
      }
      logger.error('Erreur lors de la récupération des infos de la chaîne:', error);
      throw error;
    }
  }

  async checkStreamStatus() {
    if (!this.accessToken) {
      await this.getAccessToken();
    }

    try {
      const channelInfo = await this.getChannelInfo();
      const response = await axios.get(
        `https://api.twitch.tv/helix/streams?user_id=${channelInfo.id}`,
        {
          headers: {
            'Client-ID': this.clientId,
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      const streamData = response.data.data[0];
      const wasLive = this.isLive;
      this.isLive = !!streamData;

      if (streamData) {
        this.lastStreamData = {
          ...streamData,
          user: channelInfo,
        };
      }

      return { isLive: this.isLive, streamData, wasLive };
    } catch (error) {
      if (error.response?.status === 401) {
        await this.getAccessToken();
        return this.checkStreamStatus();
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
      await this.getAccessToken();
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
        logger.error('Erreur lors de la vérification du stream:', error);
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
