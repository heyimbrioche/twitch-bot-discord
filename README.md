# 🤖 Bot Twitch Discord - Notifications Automatiques

Un bot Discord simple et efficace pour recevoir des notifications automatiques lorsque votre streamer Twitch préféré est en live.

## ✨ Fonctionnalités

- 🔴 **Notifications automatiques** : Alertes dès qu'un stream commence
- 🔐 **Connexion OAuth Twitch** : Connectez-vous directement avec votre compte Twitch, aucune saisie manuelle nécessaire
- 📺 **Multi-serveurs** : Chaque serveur peut surveiller sa propre chaîne Twitch
- 🎮 **Informations détaillées** : Titre du stream, jeu, nombre de spectateurs
- 🔄 **Vérification automatique** : Vérifie toutes les 2 minutes si un stream est en ligne

## 🚀 Installation

### Prérequis
- Node.js 18.0.0 ou supérieur
- Un bot Discord (créé sur [Discord Developer Portal](https://discord.com/developers/applications))
- Une application Twitch (pour OAuth)

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

3. **Configurer les variables d'environnement**

Créez un fichier `.env` à la racine du projet :

```env
# Token Discord (requis)
DISCORD_TOKEN=votre_token_discord_ici

# Configuration Twitch OAuth (requis pour que les utilisateurs se connectent)
TWITCH_CLIENT_ID=votre_twitch_client_id
TWITCH_CLIENT_SECRET=votre_twitch_client_secret
TWITCH_REDIRECT_URI=http://localhost:3000/oauth/callback
OAUTH_PORT=3000
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

**Comment obtenir les credentials Twitch OAuth ?**
- Allez sur https://dev.twitch.tv/console/apps
- Créez une nouvelle application
- Copiez le **Client ID**
- Générez un **Client Secret**
- Dans les **OAuth Redirect URLs**, ajoutez : `http://localhost:3000/oauth/callback`
  - Pour la production, ajoutez aussi votre domaine : `https://votre-domaine.com/oauth/callback`

4. **Déployer les commandes**
```bash
npm run deploy
```

**Note:** Vous aurez besoin de `DISCORD_CLIENT_ID` et `DISCORD_GUILD_ID` pour le déploiement. Ajoutez-les temporairement dans `.env` :

```env
DISCORD_CLIENT_ID=votre_client_id
DISCORD_GUILD_ID=votre_guild_id
```

5. **Démarrer le bot**
```bash
npm start
```

## 📝 Configuration via Discord

Une fois le bot démarré, utilisez les commandes suivantes dans Discord :

### 1. Se connecter avec Twitch
```
/setup connect
```

Cette commande vous donnera un lien pour vous connecter avec votre compte Twitch. Cliquez sur le bouton, autorisez l'application, et toutes vos informations seront automatiquement récupérées !

**Note:** Vous devez être le propriétaire de la chaîne Twitch que vous souhaitez surveiller.

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

### 5. Déconnecter votre compte
```
/setup disconnect
```

## 📚 Commandes Disponibles

### ⚙️ Configuration
- `/setup connect` - Se connecter avec votre compte Twitch (OAuth)
- `/setup channel` - Définir le canal de notifications
- `/setup test` - Tester la configuration
- `/setup status` - Voir la configuration actuelle
- `/setup disconnect` - Déconnecter votre compte Twitch

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
│   │   ├── setup.js       # Configuration OAuth
│   │   ├── twitch.js      # Commandes Twitch
│   │   └── help.js        # Aide
│   ├── events/            # Événements Discord
│   │   ├── ready.js
│   │   ├── interactionCreate.js
│   │   └── messageCreate.js
│   ├── services/          # Services externes
│   │   ├── TwitchService.js
│   │   └── OAuthService.js # Service OAuth Twitch
│   ├── utils/             # Utilitaires
│   │   ├── logger.js
│   │   └── Database.js
│   ├── index.js           # Point d'entrée
│   └── deploy-commands.js # Déploiement des commandes
├── data/                  # Base de données (générée automatiquement)
├── logs/                  # Logs (générés automatiquement)
├── .env                   # Variables d'environnement
├── package.json
└── README.md
```

## 🔧 Fonctionnement

1. L'utilisateur utilise `/setup connect` dans Discord
2. Le bot génère un lien OAuth unique
3. L'utilisateur clique sur le lien et s'authentifie avec Twitch
4. Le bot récupère automatiquement :
   - Le token d'accès OAuth
   - Les informations de la chaîne (nom, ID, etc.)
5. Le bot vérifie toutes les 2 minutes si la chaîne est en live
6. Lorsqu'un stream commence, une notification est envoyée dans le canal configuré

## 🌐 Production

Pour utiliser le bot en production, vous devez :

1. **Configurer un domaine** avec un serveur web
2. **Mettre à jour l'URI de redirection** dans votre application Twitch :
   - Allez sur https://dev.twitch.tv/console/apps
   - Modifiez votre application
   - Ajoutez `https://votre-domaine.com/oauth/callback` dans OAuth Redirect URLs
3. **Mettre à jour `.env`** :
   ```env
   TWITCH_REDIRECT_URI=https://votre-domaine.com/oauth/callback
   ```
4. **Configurer un reverse proxy** (nginx, Apache, etc.) pour rediriger `/oauth/callback` vers `http://localhost:3000/oauth/callback`

## 🐛 Dépannage

### Le bot ne répond pas aux commandes
- Vérifiez que les commandes ont été déployées (`npm run deploy`)
- Vérifiez que le bot a les permissions nécessaires
- Vérifiez les logs dans `logs/combined.log`

### Les notifications ne fonctionnent pas
- Vérifiez que le canal de notification est configuré (`/setup status`)
- Vérifiez que vous êtes connecté (`/setup status`)
- Vérifiez que le serveur OAuth est démarré (port 3000 par défaut)

### Erreur OAuth
- Vérifiez que `TWITCH_CLIENT_ID` et `TWITCH_CLIENT_SECRET` sont corrects
- Vérifiez que l'URI de redirection dans Twitch correspond à `TWITCH_REDIRECT_URI`
- Vérifiez que le port 3000 (ou celui configuré) n'est pas déjà utilisé

### Token expiré
- Si votre token expire, utilisez `/setup disconnect` puis `/setup connect` pour vous reconnecter

## 📄 Licence

MIT License - Libre d'utilisation et de modification

## 🤝 Contribution

Les contributions sont les bienvenues! N'hésitez pas à ouvrir une issue ou une pull request.

---

**Créé avec ❤️ pour la communauté Discord & Twitch**
