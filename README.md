# 🤖 Bot Twitch Discord - Notifications Automatiques

Un bot Discord simple et efficace pour recevoir des notifications automatiques lorsque votre streamer Twitch préféré est en live.

## ✨ Fonctionnalités

- 🔴 **Notifications automatiques** : Alertes dès qu'un stream commence
- ⚙️ **Configuration via Discord** : Tout se configure directement dans Discord, pas besoin de fichier .env complexe
- 📺 **Multi-serveurs** : Chaque serveur peut surveiller sa propre chaîne Twitch
- 🎮 **Informations détaillées** : Titre du stream, jeu, nombre de spectateurs
- 🔄 **Vérification automatique** : Vérifie toutes les 2 minutes si un stream est en ligne

## 🚀 Installation

### Prérequis
- Node.js 18.0.0 ou supérieur
- Un bot Discord (créé sur [Discord Developer Portal](https://discord.com/developers/applications))
- Un compte Twitch avec API credentials

### Étapes

1. **Cloner ou télécharger le projet**
```bash
git clone https://github.com/heyimbrioche/twitch-bot-discord.git
cd twitch-bot-discord
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer le token Discord**

Créez un fichier `.env` à la racine du projet avec uniquement le token Discord :

```env
DISCORD_TOKEN=votre_token_discord_ici
```

**Comment obtenir le token Discord ?**
- Allez sur https://discord.com/developers/applications
- Créez une nouvelle application
- Allez dans **Bot** → Créez un bot
- Copiez le **Token**
- Activez les **Privileged Gateway Intents** :
  - ✅ MESSAGE CONTENT INTENT
  - ✅ SERVER MEMBERS INTENT
- Allez dans **OAuth2** → **URL Generator**
  - Scopes: `bot`, `applications.commands`
  - Permissions: `Administrator` (ou sélectionnez manuellement)
- Invitez le bot avec l'URL générée

4. **Déployer les commandes**
```bash
npm run deploy
```

**Note:** Vous aurez besoin de `DISCORD_CLIENT_ID` et `DISCORD_GUILD_ID` pour le déploiement. Ajoutez-les temporairement dans `.env` :

```env
DISCORD_TOKEN=votre_token
DISCORD_CLIENT_ID=votre_client_id
DISCORD_GUILD_ID=votre_guild_id
```

Après le déploiement, vous pouvez supprimer `DISCORD_CLIENT_ID` et `DISCORD_GUILD_ID` du `.env` - seul `DISCORD_TOKEN` est nécessaire pour le fonctionnement du bot.

5. **Démarrer le bot**
```bash
npm start
```

## 📝 Configuration via Discord

Une fois le bot démarré, utilisez les commandes suivantes dans Discord :

### 1. Configurer Twitch
```
/setup twitch client_id:<votre_client_id> client_secret:<votre_secret> channel_name:<nom_chaîne>
```

**Comment obtenir les credentials Twitch ?**
- Allez sur https://dev.twitch.tv/console/apps
- Créez une nouvelle application
- Copiez le **Client ID**
- Générez un **Client Secret**

### 2. Définir le canal de notifications
```
/setup channel channel:#notifications
```

### 3. Tester la configuration
```
/setup test
```

### 4. Voir la configuration actuelle
```
/setup status
```

## 📚 Commandes Disponibles

### ⚙️ Configuration
- `/setup twitch` - Configurer les credentials Twitch
- `/setup channel` - Définir le canal de notifications
- `/setup test` - Tester la configuration
- `/setup status` - Voir la configuration actuelle

### 📺 Twitch
- `/twitch status` - Vérifier si le stream est en ligne
- `/twitch info` - Informations sur la chaîne Twitch

### ℹ️ Aide
- `/help` - Afficher l'aide

## 🏗️ Structure du Projet

```
twitch-bot-discord/
├── src/
│   ├── commands/          # Commandes slash
│   │   ├── setup.js      # Configuration
│   │   ├── twitch.js     # Commandes Twitch
│   │   └── help.js       # Aide
│   ├── events/           # Événements Discord
│   │   ├── ready.js
│   │   ├── interactionCreate.js
│   │   └── messageCreate.js
│   ├── services/         # Services externes
│   │   └── TwitchService.js
│   ├── utils/            # Utilitaires
│   │   ├── logger.js
│   │   ├── Database.js
│   │   └── config.js
│   ├── index.js          # Point d'entrée
│   └── deploy-commands.js # Déploiement des commandes
├── data/                 # Base de données (générée automatiquement)
├── logs/                 # Logs (générés automatiquement)
├── .env                  # Variables d'environnement
├── package.json
└── README.md
```

## 🔧 Fonctionnement

1. Le bot vérifie toutes les 2 minutes si la chaîne configurée est en live
2. Lorsqu'un stream commence, une notification est envoyée dans le canal configuré
3. Chaque serveur Discord peut avoir sa propre configuration Twitch
4. Les configurations sont stockées dans une base de données SQLite

## 🐛 Dépannage

### Le bot ne répond pas aux commandes
- Vérifiez que les commandes ont été déployées (`npm run deploy`)
- Vérifiez que le bot a les permissions nécessaires
- Vérifiez les logs dans `logs/combined.log`

### Les notifications ne fonctionnent pas
- Vérifiez que le canal de notification est configuré (`/setup status`)
- Vérifiez que les credentials Twitch sont corrects (`/setup test`)
- Vérifiez que le nom de la chaîne est exact (sensible à la casse)

### Erreur de token
- Vérifiez que le token dans `.env` est correct
- Vérifiez que le bot n'est pas banni du serveur

## 📄 Licence

MIT License - Libre d'utilisation et de modification

## 🤝 Contribution

Les contributions sont les bienvenues! N'hésitez pas à ouvrir une issue ou une pull request.

---

**Créé avec ❤️ pour la communauté Discord & Twitch**
