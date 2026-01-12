import { Client, GatewayIntentBits, Collection, ActivityType } from 'discord.js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';
import logger from './utils/logger.js';
import TwitchService from './services/TwitchService.js';
import Database from './utils/Database.js';
import OAuthService from './services/OAuthService.js';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class TwitchDiscordBot {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ],
      presence: {
        activities: [{
          name: 'Twitch Streams',
          type: ActivityType.Watching,
        }],
        status: 'online',
      },
    });

    this.client.commands = new Collection();
    this.client.cooldowns = new Collection();
    this.database = new Database();
    this.twitchServices = new Map(); // Map pour stocker les services Twitch par guild
    this.oauthService = null;
  }

  async loadCommands() {
    const commandsPath = join(__dirname, 'commands');
    const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = join(commandsPath, file);
      const command = await import(`file://${filePath}`);
      
      if ('data' in command.default && 'execute' in command.default) {
        this.client.commands.set(command.default.data.name, command.default);
        logger.info(`Commande chargée: ${command.default.data.name}`);
      } else {
        logger.warn(`La commande ${file} n'a pas les propriétés requises.`);
      }
    }
  }

  async loadEvents() {
    const eventsPath = join(__dirname, 'events');
    const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
      const filePath = join(eventsPath, file);
      const event = await import(`file://${filePath}`);
      
      if (event.default.once) {
        this.client.once(event.default.name, (...args) => event.default.execute(...args, this));
      } else {
        this.client.on(event.default.name, (...args) => event.default.execute(...args, this));
      }
      
      logger.info(`Événement chargé: ${event.default.name}`);
    }
  }

  async initializeOAuth() {
    // Charger les credentials OAuth depuis la base de données
    const oauthSettings = await this.database.getOAuthSettings();

    if (!oauthSettings.isConfigured) {
      logger.warn('Les credentials Twitch OAuth ne sont pas configurés.');
      logger.warn('Utilisez /setup oauth pour configurer les credentials OAuth.');
      return;
    }

    try {
      this.oauthService = new OAuthService(
        oauthSettings.twitchClientId,
        oauthSettings.twitchClientSecret,
        oauthSettings.redirectUri,
        oauthSettings.oauthPort
      );
      await this.oauthService.startServer();
      logger.info('Service OAuth Twitch initialisé avec succès');
    } catch (error) {
      logger.error('Erreur lors de l\'initialisation du service OAuth:', error);
    }
  }

  async loadExistingConfigurations() {
    // Charger toutes les configurations existantes et démarrer les services Twitch
    try {
      const allData = await this.database.db.all();
      const guildConfigs = allData.filter(item => item.id.startsWith('guild_'));

      for (const config of guildConfigs) {
        const guildId = config.id.replace('guild_', '');
        const settings = config.value;

        if (settings.isConfigured && 
            settings.twitchAccessToken && 
            settings.twitchChannelName &&
            settings.twitchChannelId) {
          try {
            // Vérifier si le token est expiré
            if (settings.twitchTokenExpiry && Date.now() > settings.twitchTokenExpiry) {
              logger.warn(`Token expiré pour le serveur ${guildId}, reconnexion nécessaire`);
              continue;
            }

            // Charger les credentials OAuth depuis la DB
            const oauthSettings = await this.database.getOAuthSettings();
            if (!oauthSettings.isConfigured) {
              logger.warn(`Credentials OAuth non configurés, impossible de charger le service pour ${guildId}`);
              continue;
            }

            const twitchService = new TwitchService(
              oauthSettings.twitchClientId,
              settings.twitchAccessToken,
              settings.twitchChannelName,
              settings.twitchChannelId,
              guildId
            );

            await twitchService.initialize();
            twitchService.startStreamCheck(this.client, guildId, this.database);
            this.twitchServices.set(guildId, twitchService);

            logger.info(`Service Twitch chargé pour le serveur ${guildId} (${settings.twitchChannelName})`);
          } catch (error) {
            logger.error(`Erreur lors du chargement du service Twitch pour le serveur ${guildId}:`, error);
          }
        }
      }
    } catch (error) {
      logger.error('Erreur lors du chargement des configurations existantes:', error);
    }
  }

  async start() {
    try {
      // Vérifier que le token Discord est présent
      if (!process.env.DISCORD_TOKEN) {
        logger.error('DISCORD_TOKEN manquant dans les variables d\'environnement');
        logger.error('Veuillez définir DISCORD_TOKEN dans votre fichier .env');
        process.exit(1);
      }

      // Initialiser le service OAuth
      await this.initializeOAuth();

      await this.loadCommands();
      await this.loadEvents();
      await this.client.login(process.env.DISCORD_TOKEN);
      
      // Attendre que le bot soit prêt avant de charger les configurations
      this.client.once('ready', async () => {
        await this.loadExistingConfigurations();
        logger.info('Bot démarré avec succès!');
      });
    } catch (error) {
      logger.error('Erreur lors du démarrage:', error);
      process.exit(1);
    }
  }
}

const bot = new TwitchDiscordBot();
bot.start();

// Gestion propre de l'arrêt
process.on('SIGINT', async () => {
  logger.info('Arrêt du bot...');
  
  // Arrêter le serveur OAuth
  if (bot.oauthService) {
    bot.oauthService.stopServer();
  }
  
  // Arrêter tous les services Twitch
  for (const [guildId, service] of bot.twitchServices) {
    service.stopStreamCheck();
  }
  
  bot.client.destroy();
  process.exit(0);
});
