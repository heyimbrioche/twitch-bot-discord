import { Client, GatewayIntentBits, Collection, ActivityType } from 'discord.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';
import logger from './utils/logger.js';
import TwitchService from './services/TwitchService.js';
import Database from './utils/Database.js';

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

  async loadExistingConfigurations() {
    // Charger toutes les configurations existantes et démarrer les services Twitch
    try {
      const allData = await this.database.db.all();
      const guildConfigs = allData.filter(item => item.id.startsWith('guild_'));

      for (const config of guildConfigs) {
        const guildId = config.id.replace('guild_', '');
        const settings = config.value;

        if (settings.isConfigured && 
            settings.twitchClientId && 
            settings.twitchClientSecret && 
            settings.twitchChannelName) {
          try {
            const twitchService = new TwitchService(
              settings.twitchClientId,
              settings.twitchClientSecret,
              settings.twitchChannelName,
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
        logger.error('Veuillez définir uniquement DISCORD_TOKEN dans votre fichier .env');
        process.exit(1);
      }

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
  
  // Arrêter tous les services Twitch
  for (const [guildId, service] of bot.twitchServices) {
    service.stopStreamCheck();
  }
  
  bot.client.destroy();
  process.exit(0);
});
