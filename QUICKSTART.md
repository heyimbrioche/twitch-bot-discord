# ⚡ Guide de Démarrage Rapide

Ce guide vous aidera à installer et configurer le bot en moins de 10 minutes.

## 📋 Prérequis

- Node.js 18+ installé ([Télécharger](https://nodejs.org/))
- Un compte Discord
- Un compte Twitch
- Un serveur Discord où vous êtes administrateur

## 🚀 Installation

### Étape 1 : Télécharger le projet

```bash
git clone https://github.com/heyimbrioche/twitch-bot-discord.git
cd twitch-bot-discord
```

### Étape 2 : Installer les dépendances

```bash
npm install
```

### Étape 3 : Créer un Bot Discord

1. Allez sur https://discord.com/developers/applications
2. Cliquez sur **"New Application"**
3. Donnez un nom (ex: "Mon Bot Twitch")
4. Allez dans **"Bot"** → **"Add Bot"**
5. Copiez le **Token** (⚠️ Gardez-le secret !)
6. Activez **MESSAGE CONTENT INTENT** et **SERVER MEMBERS INTENT**
7. Allez dans **"OAuth2"** → **"URL Generator"**
   - Scopes: `bot`, `applications.commands`
   - Permissions: `Administrator`
8. Copiez l'URL et ouvrez-la pour inviter le bot

### Étape 4 : Créer une Application Twitch

1. Allez sur https://dev.twitch.tv/console/apps
2. Cliquez sur **"Register Your Application"**
3. Remplissez :
   - **Name** : "Mon Bot Discord"
   - **OAuth Redirect URLs** : `http://localhost:3000/oauth/callback`
   - **Category** : Application Integration
4. Cliquez sur **"Create"**
5. Copiez le **Client ID**
6. Cliquez sur **"New Secret"** et copiez le **Client Secret**

### Étape 5 : Configurer le fichier .env

Créez un fichier `.env` à la racine :

```env
DISCORD_TOKEN=votre_token_discord
TWITCH_CLIENT_ID=votre_twitch_client_id
TWITCH_CLIENT_SECRET=votre_twitch_client_secret
TWITCH_REDIRECT_URI=http://localhost:3000/oauth/callback
OAUTH_PORT=3000
DISCORD_CLIENT_ID=votre_discord_client_id
DISCORD_GUILD_ID=votre_guild_id
```

> 💡 **Astuce** : Le Client ID Discord se trouve dans l'onglet "General Information" de votre application Discord. Le Guild ID s'obtient en activant le mode développeur dans Discord, puis clic droit sur votre serveur → "Copier l'ID".

### Étape 6 : Déployer les commandes

```bash
npm run deploy
```

Vous devriez voir : `✅ X commandes (/) déployées avec succès!`

### Étape 7 : Démarrer le bot

```bash
npm start
```

Vous devriez voir :
```
✅ Bot connecté en tant que VotreBot#1234!
Service OAuth Twitch initialisé avec succès
Bot démarré avec succès!
```

## 🎮 Configuration dans Discord

### 1. Se connecter avec Twitch

Dans votre serveur Discord, tapez :
```
/setup connect
```

Cliquez sur le bouton "Se connecter avec Twitch", autorisez l'application, et c'est fait !

### 2. Définir le canal de notifications

```
/setup channel channel:#notifications
```

Remplacez `#notifications` par le canal de votre choix.

### 3. Tester

```
/setup test
```

Si tout fonctionne, vous verrez un message de confirmation !

## ✅ Vérification

Le bot devrait maintenant :
- ✅ Être en ligne dans Discord
- ✅ Répondre aux commandes
- ✅ Vérifier automatiquement si votre chaîne est en live toutes les 2 minutes
- ✅ Envoyer une notification quand vous commencez à streamer

## 🐛 Problèmes courants

### Le bot ne répond pas
- Vérifiez qu'il est en ligne (icône verte dans Discord)
- Vérifiez que les commandes sont déployées : `npm run deploy`
- Vérifiez les logs : `logs/combined.log`

### Erreur "Port already in use"
- Changez le port dans `.env` : `OAUTH_PORT=3001`
- Ou arrêtez le processus utilisant le port

### Erreur OAuth
- Vérifiez que l'URI de redirection dans Twitch correspond exactement à celle dans `.env`
- Vérifiez que `TWITCH_CLIENT_ID` et `TWITCH_CLIENT_SECRET` sont corrects

## 📚 Prochaines étapes

- Lisez le [README.md](README.md) complet pour plus d'informations
- Consultez la [documentation](https://github.com/heyimbrioche/twitch-bot-discord/wiki)
- Rejoignez les [discussions](https://github.com/heyimbrioche/twitch-bot-discord/discussions)

---

**Besoin d'aide ?** Ouvrez une [issue](https://github.com/heyimbrioche/twitch-bot-discord/issues) !
