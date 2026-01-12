# ⚡ Guide de Démarrage Rapide

## 🎯 Installation en 5 minutes

### 1️⃣ Installation des dépendances
```bash
npm install
```

### 2️⃣ Configuration Discord

1. Allez sur https://discord.com/developers/applications
2. Créez une nouvelle application
3. Allez dans **Bot** → Créez un bot
4. Copiez le **Token**
5. Activez les **Privileged Gateway Intents** :
   - ✅ MESSAGE CONTENT INTENT
   - ✅ SERVER MEMBERS INTENT
6. Allez dans **OAuth2** → **URL Generator**
   - Scopes: `bot`, `applications.commands`
   - Permissions: `Administrator` (ou sélectionnez manuellement)
7. Invitez le bot avec l'URL générée

### 3️⃣ Configuration Twitch

1. Allez sur https://dev.twitch.tv/console/apps
2. Créez une nouvelle application
3. Copiez le **Client ID**
4. Générez un **Client Secret**

### 4️⃣ Configuration du fichier .env

Créez un fichier `.env` à la racine du projet :

```env
DISCORD_TOKEN=votre_token_ici
DISCORD_CLIENT_ID=votre_client_id_ici
DISCORD_GUILD_ID=votre_guild_id_ici
TWITCH_CLIENT_ID=votre_twitch_client_id_ici
TWITCH_CLIENT_SECRET=votre_twitch_client_secret_ici
TWITCH_CHANNEL_NAME=nom_de_votre_chaîne
NOTIFICATION_CHANNEL_ID=id_du_canal_de_notification
```

**Comment obtenir le Guild ID ?**
- Activez le mode développeur dans Discord (Paramètres → Avancé → Mode développeur)
- Clic droit sur votre serveur → Copier l'ID

**Comment obtenir le Channel ID ?**
- Clic droit sur le canal → Copier l'ID

### 5️⃣ Déployer les commandes
```bash
npm run deploy
```

### 6️⃣ Démarrer le bot
```bash
npm start
```

## ✅ Vérification

Si tout fonctionne, vous devriez voir :
```
✅ Bot connecté en tant que VotreBot#1234!
📊 Bot présent sur 1 serveur(s)
Service Twitch initialisé
Vérification des streams Twitch démarrée
Bot démarré avec succès!
```

## 🎮 Test des commandes

Essayez dans Discord :
- `/help` - Voir toutes les commandes
- `/twitch status` - Vérifier le statut du stream
- `/profile` - Voir votre profil

## 🆘 Problèmes courants

### Le bot ne répond pas
- Vérifiez que les commandes sont déployées : `npm run deploy`
- Vérifiez que le bot est en ligne dans Discord
- Vérifiez les logs dans `logs/combined.log`

### Erreur de token
- Vérifiez que le token dans `.env` est correct
- Vérifiez que le bot n'est pas banni du serveur

### Erreur Twitch
- Vérifiez que les credentials Twitch sont corrects
- Vérifiez que le nom de la chaîne est exact (sensible à la casse)

## 📚 Prochaines étapes

- Lisez le [README.md](README.md) complet
- Personnalisez les commandes selon vos besoins
- Ajoutez vos propres fonctionnalités!

---

**Besoin d'aide ?** Ouvrez une issue sur GitHub ou consultez la documentation complète.
