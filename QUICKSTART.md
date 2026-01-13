# ⚡ Guide de Démarrage Rapide

> 💡 **Note importante** : Ce guide est pour le **propriétaire du bot** (celui qui héberge le bot). Les **utilisateurs finaux** n'ont qu'à utiliser `/setup channel` dans Discord et se connecter à Twitch - aucune configuration technique requise !

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

### Étape 4 : Application Twitch - DÉJÀ CRÉÉE ! ✅

> 🎉 **Excellente nouvelle** : L'application Twitch a été créée automatiquement par le développeur du bot !

**Vous n'avez RIEN à faire** - l'application Twitch est déjà configurée dans `src/config/twitch.js`.

> 💡 **Note** : Les utilisateurs finaux n'ont qu'à utiliser `/setup channel` dans Discord et se connecter à Twitch - aucune configuration technique requise !

### Étape 5 : Configurer le fichier .env

1. Créez un fichier `.env` à la racine du projet
2. Copiez le contenu suivant et remplacez les valeurs par vos propres credentials :

```env
# ============================================
# Configuration Discord
# ============================================
DISCORD_TOKEN=votre_token_discord
DISCORD_CLIENT_ID=votre_discord_client_id

# Optionnel - Uniquement pour développement/test
DISCORD_GUILD_ID=votre_guild_id

# ============================================
# Configuration Twitch OAuth
# ============================================
# ✅ L'application Twitch est déjà créée et configurée dans src/config/twitch.js
# Vous n'avez RIEN à mettre ici pour Twitch - tout est automatique !
# (Ces variables sont optionnelles si vous voulez override la config centralisée)
# TWITCH_CLIENT_ID=votre_twitch_client_id
# TWITCH_CLIENT_SECRET=votre_twitch_client_secret
# TWITCH_REDIRECT_URI=http://localhost:3000/oauth/callback
# OAUTH_PORT=3000
```

> ⚠️ **SÉCURITÉ** : 
> - Le fichier `.env` est dans `.gitignore` et ne sera **jamais** commité sur GitHub
> - Ne partagez **jamais** vos credentials (Token Discord, Client Secret Twitch)
> - Ces credentials sont pour le propriétaire du bot uniquement
> 
> 💡 **Où trouver les valeurs** :
> - **DISCORD_TOKEN** : Discord Developer Portal > Bot > Token
> - **DISCORD_CLIENT_ID** : Discord Developer Portal > General Information
> - **DISCORD_GUILD_ID** : Mode développeur Discord > Clic droit sur serveur > "Copier l'ID"
> - **TWITCH_CLIENT_ID & SECRET** : De l'étape 4 ci-dessus

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

## 🎮 Pour les utilisateurs finaux (Simple et rapide ! 🚀)

> 💡 **Note** : Cette section est pour les utilisateurs finaux du bot. Le propriétaire du bot a déjà configuré et démarré le bot.

### Configuration en une étape !

Dans votre serveur Discord, tapez :
```
/setup channel canal:#notifications
```

Remplacez `#notifications` par le canal de votre choix.

Le bot vous enverra un message avec un bouton **"Se connecter avec Twitch"**. Cliquez dessus, autorisez l'application, et c'est terminé ! 🎉

> 💡 **Note** : 
> - Vous pouvez aussi ajouter un message personnalisé :
>   ```
>   /setup channel canal:#notifications message:@everyone 🔴 Nouveau stream !
>   ```
> - Aucune configuration technique requise - tout se fait via Discord !
> - Le propriétaire du bot a déjà configuré tout ce qui est nécessaire

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
