import { QuickDB } from 'quick.db';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = join(__dirname, '../../data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

class Database {
  constructor() {
    this.db = new QuickDB({
      filePath: join(dataDir, 'database.sqlite')
    });
  }

  // Guild settings - Configuration par serveur
  async getGuildSettings(guildId) {
    const settings = await this.db.get(`guild_${guildId}`);
    if (!settings) {
      return {
        twitchAccessToken: null,
        twitchRefreshToken: null,
        twitchTokenExpiry: null,
        twitchChannelName: null,
        twitchChannelId: null,
        twitchUserId: null,
        notificationChannelId: null,
        customMessage: null,
        isConfigured: false,
      };
    }
    return settings;
  }

  async setGuildSettings(guildId, settings) {
    return await this.db.set(`guild_${guildId}`, settings);
  }

  async updateGuildSetting(guildId, key, value) {
    const settings = await this.getGuildSettings(guildId);
    settings[key] = value;
    return await this.setGuildSettings(guildId, settings);
  }

  // Global OAuth settings - Configuration OAuth globale pour le bot
  async getOAuthSettings() {
    const settings = await this.db.get('oauth_settings');
    if (!settings) {
      return {
        twitchClientId: null,
        twitchClientSecret: null,
        redirectUri: 'http://localhost:3000/oauth/callback',
        oauthPort: 3000,
        isConfigured: false,
      };
    }
    return settings;
  }

  async setOAuthSettings(settings) {
    return await this.db.set('oauth_settings', settings);
  }

  async updateOAuthSetting(key, value) {
    const settings = await this.getOAuthSettings();
    settings[key] = value;
    settings.isConfigured = !!(settings.twitchClientId && settings.twitchClientSecret);
    return await this.setOAuthSettings(settings);
  }
}

export default Database;
