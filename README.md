# 🤖 Bot Twitch Discord - Notifications Automatiques

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)

Un bot Discord simple et efficace pour recevoir des notifications automatiques lorsque votre streamer Twitch préféré est en live.

[Installation](#-installation-rapide) • [Documentation](#-documentation) • [Support](#-support) • [Contribuer](#-contribuer)

</div>

---

## ✨ Fonctionnalités

- 🔴 **Notifications automatiques** : Alertes dès qu'un stream commence avec embeds colorés
- 🔐 **Connexion OAuth Twitch** : Connectez-vous directement avec votre compte Twitch, aucune saisie manuelle nécessaire
- 📺 **Multi-serveurs** : Chaque serveur Discord peut surveiller sa propre chaîne Twitch
- 🎮 **Informations détaillées** : Titre du stream, jeu, nombre de spectateurs, miniature
- 🔄 **Vérification automatique** : Vérifie toutes les 2 minutes si un stream est en ligne
- 🛡️ **Sécurisé** : Utilise OAuth 2.0 pour une authentification sécurisée
- 📊 **Base de données persistante** : Vos configurations sont sauvegardées automatiquement

## 🚀 Installation Rapide

### Prérequis

- **Node.js** 18.0.0 ou supérieur ([Télécharger](https://nodejs.org/))
- **Git** ([Télécharger](https://git-scm.com/))
- Un compte **Discord** avec un serveur
- Un compte **Twitch**

### Installation en 5 minutes

1. **Cloner le projet**
   ```bash
   git clone https://github.com/heyimbrioche/twitch-bot-discord.git
   cd twitch-bot-discord
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Créer le fichier `.env`**
   ```bash
   cp .env.example .env
   ```
   Puis éditez `.env` avec **uniquement votre token Discord** (voir [Configuration](#-configuration) ci-dessous)

4. **Déployer les commandes Discord**
   ```bash
   npm run deploy
   ```

5. **Démarrer le bot**
   ```bash
   npm start
   ```

## ⚙️ Configuration

### 1. Créer un Bot Discord

1. Allez sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Cliquez sur **"New Application"**
3. Donnez un nom à votre application
4. Allez dans l'onglet **"Bot"**
5. Cliquez sur **"Add Bot"** puis **"Yes, do it!"**
6. Sous **"Token"**, cliquez sur **"Reset Token"** puis **"Copy"** (⚠️ Gardez ce token secret !)
7. Activez les **Privileged Gateway Intents** :
   - ✅ **MESSAGE CONTENT INTENT**
   - ✅ **SERVER MEMBERS INTENT**
8. Allez dans l'onglet **"OAuth2"** → **"URL Generator"**
   - Cochez les scopes : `bot`, `applications.commands`
   - Cochez les permissions : `Administrator` (ou sélectionnez manuellement)
9. Copiez l'URL générée et ouvrez-la dans votre navigateur pour inviter le bot

### 2. Créer une Application Twitch

1. Allez sur [Twitch Developer Console](https://dev.twitch.tv/console/apps)
2. Cliquez sur **"Register Your Application"**
3. Remplissez le formulaire :
   - **Name** : Nom de votre application (ex: "Mon Bot Discord")
   - **OAuth Redirect URLs** : `http://localhost:3000/oauth/callback`
   - **Category** : Application Integration
4. Cliquez sur **"Create"**
5. Copiez le **Client ID**
6. Cliquez sur **"New Secret"** pour générer un **Client Secret** (⚠️ Gardez-le secret !)

### 3. Configurer le fichier `.env`

Créez un fichier `.env` à la racine du projet avec **uniquement votre token Discord** :

```env
# Token Discord (requis)
DISCORD_TOKEN=votre_token_discord_ici

# Optionnel - Nécessaire uniquement pour le déploiement des commandes
# Vous pouvez les supprimer après le premier déploiement
DISCORD_CLIENT_ID=votre_discord_client_id
DISCORD_GUILD_ID=votre_guild_id
```

> 💡 **Important** : Les credentials Twitch OAuth se configurent **via Discord** avec la commande `/setup oauth` (voir ci-dessous). Vous n'avez pas besoin de les mettre dans le fichier `.env` !

## 📝 Utilisation

### Configuration via Discord

Une fois le bot démarré, utilisez ces commandes dans votre serveur Discord :

#### 0. Configurer les credentials Twitch OAuth (Propriétaire du bot uniquement)

**⚠️ IMPORTANT :** Avant que les utilisateurs puissent se connecter, le propriétaire du bot doit configurer les credentials Twitch OAuth :

```
/setup oauth client_id:<votre_client_id> client_secret:<votre_secret> [redirect_uri:<uri>] [port:<port>]
```

**Comment obtenir les credentials Twitch OAuth ?**
- Allez sur [Twitch Developer Console](https://dev.twitch.tv/console/apps)
- Créez une nouvelle application
- Copiez le **Client ID**
- Générez un **Client Secret**
- Dans **OAuth Redirect URLs**, ajoutez : `http://localhost:3000/oauth/callback`

> 💡 **Note** : Seul le propriétaire du bot (celui qui a créé l'application Discord) peut exécuter cette commande.

#### 1. Se connecter avec Twitch
```
/setup connect
```
Cliquez sur le bouton "Se connecter avec Twitch", autorisez l'application, et toutes vos informations seront automatiquement récupérées !

> ⚠️ **Note** : Vous devez être le propriétaire de la chaîne Twitch que vous souhaitez surveiller.

#### 2. Définir le canal de notifications
```
/setup channel channel:#notifications
```

#### 3. Tester la configuration
```
/setup test
```

#### 4. Voir la configuration actuelle
```
/setup status
```

#### 5. Déconnecter votre compte
```
/setup disconnect
```

## 📚 Commandes Disponibles

### ⚙️ Configuration
| Commande | Description |
|----------|-------------|
| `/setup oauth` | Configurer les credentials Twitch OAuth (Propriétaire bot uniquement) |
| `/setup connect` | Se connecter avec votre compte Twitch (OAuth) |
| `/setup channel` | Définir le canal de notifications |
| `/setup test` | Tester la configuration Twitch |
| `/setup status` | Voir la configuration actuelle |
| `/setup disconnect` | Déconnecter votre compte Twitch |

### 📺 Twitch
| Commande | Description |
|----------|-------------|
| `/twitch status` | Vérifier si le stream est en ligne |
| `/twitch info` | Informations sur la chaîne Twitch |

### ℹ️ Aide
| Commande | Description |
|----------|-------------|
| `/help` | Afficher l'aide complète |

## 🏗️ Structure du Projet

```
twitch-bot-discord/
├── src/
│   ├── commands/          # Commandes slash Discord
│   │   ├── setup.js       # Configuration OAuth
│   │   ├── twitch.js      # Commandes Twitch
│   │   └── help.js        # Aide
│   ├── events/            # Événements Discord
│   │   ├── ready.js       # Bot prêt
│   │   ├── interactionCreate.js  # Interactions
│   │   └── messageCreate.js      # Messages
│   ├── services/          # Services externes
│   │   ├── TwitchService.js      # Service Twitch API
│   │   └── OAuthService.js       # Service OAuth Twitch
│   ├── utils/             # Utilitaires
│   │   ├── logger.js      # Système de logs
│   │   └── Database.js    # Base de données
│   ├── index.js           # Point d'entrée principal
│   └── deploy-commands.js # Déploiement des commandes
├── data/                  # Base de données SQLite (générée)
├── logs/                  # Fichiers de logs (générés)
├── .env                   # Variables d'environnement (à créer)
├── .env.example           # Exemple de configuration
├── .gitignore
├── package.json
├── LICENSE
└── README.md
```

## 🔧 Fonctionnement

1. **Authentification** : L'utilisateur utilise `/setup connect` dans Discord
2. **OAuth** : Le bot génère un lien OAuth unique et sécurisé
3. **Autorisation** : L'utilisateur s'authentifie avec son compte Twitch
4. **Récupération** : Le bot récupère automatiquement :
   - Le token d'accès OAuth
   - Le refresh token
   - Les informations de la chaîne (nom, ID, etc.)
5. **Surveillance** : Le bot vérifie toutes les 2 minutes si la chaîne est en live
6. **Notification** : Lorsqu'un stream commence, une notification est envoyée dans le canal configuré

## 🌐 Déploiement en Production

### Option 1 : Serveur VPS/Dédié

1. **Installer Node.js** sur votre serveur
2. **Cloner le projet** sur le serveur
3. **Configurer un reverse proxy** (nginx recommandé) :
   ```nginx
   server {
       listen 80;
       server_name votre-domaine.com;
       
       location /oauth/callback {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```
4. **Mettre à jour l'URI de redirection** dans Twitch :
   - Allez sur https://dev.twitch.tv/console/apps
   - Modifiez votre application
   - Ajoutez `https://votre-domaine.com/oauth/callback` dans OAuth Redirect URLs
5. **Mettre à jour `.env`** :
   ```env
   TWITCH_REDIRECT_URI=https://votre-domaine.com/oauth/callback
   ```
6. **Utiliser PM2** pour garder le bot actif :
   ```bash
   npm install -g pm2
   pm2 start src/index.js --name twitch-bot
   pm2 save
   pm2 startup
   ```

### Option 2 : Services Cloud

- **Heroku** : Ajoutez les variables d'environnement dans les settings
- **Railway** : Configurez les variables d'environnement
- **Render** : Ajoutez les variables dans l'interface

> 💡 Pour la production, utilisez toujours HTTPS pour l'URI de redirection OAuth

## 🐛 Dépannage

### Le bot ne répond pas aux commandes

- ✅ Vérifiez que les commandes ont été déployées : `npm run deploy`
- ✅ Vérifiez que le bot est en ligne dans Discord
- ✅ Vérifiez que le bot a les permissions nécessaires sur le serveur
- ✅ Consultez les logs : `logs/combined.log`

### Les notifications ne fonctionnent pas

- ✅ Vérifiez que le canal de notification est configuré : `/setup status`
- ✅ Vérifiez que vous êtes connecté : `/setup status`
- ✅ Vérifiez que le serveur OAuth est démarré (port 3000 par défaut)
- ✅ Testez la connexion : `/setup test`

### Erreur OAuth

- ✅ Vérifiez que `TWITCH_CLIENT_ID` et `TWITCH_CLIENT_SECRET` sont corrects
- ✅ Vérifiez que l'URI de redirection dans Twitch correspond exactement à `TWITCH_REDIRECT_URI`
- ✅ Vérifiez que le port 3000 (ou celui configuré) n'est pas déjà utilisé
- ✅ Vérifiez que votre firewall/autorouteur permet les connexions sur le port OAuth

### Token expiré

- ✅ Utilisez `/setup disconnect` puis `/setup connect` pour vous reconnecter
- ✅ Les tokens Twitch expirent après un certain temps, c'est normal

### Erreur "Port already in use"

- ✅ Changez le port dans `.env` : `OAUTH_PORT=3001`
- ✅ Ou arrêtez le processus utilisant le port :
  ```bash
  # Linux/Mac
  lsof -ti:3000 | xargs kill -9
  
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```

## ❓ FAQ

**Q : Puis-je surveiller plusieurs chaînes sur le même serveur ?**  
R : Actuellement, chaque serveur peut surveiller une seule chaîne. Pour surveiller plusieurs chaînes, créez plusieurs bots ou utilisez plusieurs serveurs.

**Q : Le bot fonctionne-t-il 24/7 ?**  
R : Oui, tant que le processus Node.js est actif. Utilisez PM2 ou un service similaire pour le garder actif.

**Q : Puis-je personnaliser les messages de notification ?**  
R : Actuellement, les messages sont prédéfinis, mais vous pouvez modifier le code dans `src/services/TwitchService.js`.

**Q : Le bot est-il gratuit ?**  
R : Oui, le bot est entièrement gratuit et open-source sous licence MIT.

**Q : Puis-je contribuer au projet ?**  
R : Absolument ! Voir la section [Contribuer](#-contribuer) ci-dessous.

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🤝 Contribuer

Les contributions sont les bienvenues ! Voici comment contribuer :

1. **Fork** le projet
2. **Créez** une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. **Commitez** vos changements (`git commit -m 'Add some AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrez** une Pull Request

Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour plus de détails.

## 🌟 Support

- 📖 [Documentation complète](https://github.com/heyimbrioche/twitch-bot-discord/wiki)
- 🐛 [Signaler un bug](https://github.com/heyimbrioche/twitch-bot-discord/issues)
- 💡 [Suggérer une fonctionnalité](https://github.com/heyimbrioche/twitch-bot-discord/issues)
- 💬 [Discussions](https://github.com/heyimbrioche/twitch-bot-discord/discussions)

## 🙏 Remerciements

- [Discord.js](https://discord.js.org/) - Bibliothèque Discord
- [Twitch API](https://dev.twitch.tv/) - API Twitch
- Tous les contributeurs du projet

---

<div align="center">

**Créé avec ❤️ pour la communauté Discord & Twitch**

⭐ Si ce projet vous a aidé, n'hésitez pas à mettre une étoile !

</div>
