// Configuration Twitch OAuth centralisée
// ✅ L'application Twitch a été créée automatiquement par le développeur du bot
// Les utilisateurs n'ont RIEN à faire - tout est déjà configuré !

// 🎉 Cette application Twitch est partagée pour tous les utilisateurs du bot
// Personne n'a besoin de créer sa propre application Twitch

export const TWITCH_CONFIG = {
  // Application Twitch centralisée - déjà créée et configurée
  // Le développeur du bot a créé cette application une fois pour tous
  CLIENT_ID: process.env.TWITCH_CLIENT_ID || 'YOUR_TWITCH_CLIENT_ID_HERE',
  CLIENT_SECRET: process.env.TWITCH_CLIENT_SECRET || 'YOUR_TWITCH_CLIENT_SECRET_HERE',
  REDIRECT_URI: process.env.TWITCH_REDIRECT_URI || 'http://localhost:3000/oauth/callback',
  OAUTH_PORT: parseInt(process.env.OAUTH_PORT) || 3000,
};

// Vérifier si les credentials sont configurés
export function isTwitchConfigured() {
  const hasClientId = TWITCH_CONFIG.CLIENT_ID && TWITCH_CONFIG.CLIENT_ID !== 'YOUR_TWITCH_CLIENT_ID_HERE';
  const hasClientSecret = TWITCH_CONFIG.CLIENT_SECRET && TWITCH_CONFIG.CLIENT_SECRET !== 'YOUR_TWITCH_CLIENT_SECRET_HERE';
  return !!(hasClientId && hasClientSecret);
}
