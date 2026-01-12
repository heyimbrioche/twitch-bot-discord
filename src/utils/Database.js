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
        twitchClientId: null,
        twitchClientSecret: null,
        twitchChannelName: null,
        notificationChannelId: null,
        twitchAccessToken: null,
        twitchTokenExpiry: null,
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
}

export default Database;
