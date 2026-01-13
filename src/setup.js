import { config } from 'dotenv';
import { existsSync, writeFileSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const envPath = join(rootDir, '.env');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function writeEnvFile(envVars) {
  let content = '';
  for (const [key, value] of Object.entries(envVars)) {
    content += `${key}=${value}\n`;
  }
  writeFileSync(envPath, content);
  console.log('✅ Fichier .env créé avec succès!\n');
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║   🤖 Configuration du Bot Twitch Discord                  ║');
  console.log('║   Assistant de configuration automatique                ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  const envVars = {};

  // Vérifier si .env existe déjà
  if (existsSync(envPath)) {
    console.log('⚠️  Un fichier .env existe déjà.');
    const overwrite = await question('Voulez-vous le remplacer ? (o/N): ');
    if (overwrite.toLowerCase() !== 'o' && overwrite.toLowerCase() !== 'oui') {
      console.log('❌ Configuration annulée.');
      rl.close();
      return;
    }
    console.log('');
  }

  console.log('📋 Configuration Discord\n');
  console.log('💡 Vous pouvez trouver ces informations sur: https://discord.com/developers/applications\n');

  // Discord Token
  const discordToken = await question('1. Token Discord (DISCORD_TOKEN): ');
  if (!discordToken.trim()) {
    console.log('❌ Le token Discord est requis!');
    rl.close();
    return;
  }
  envVars.DISCORD_TOKEN = discordToken.trim();

  // Discord Client ID
  const discordClientId = await question('2. Client ID Discord (DISCORD_CLIENT_ID): ');
  if (!discordClientId.trim()) {
    console.log('❌ Le Client ID Discord est requis!');
    rl.close();
    return;
  }
  envVars.DISCORD_CLIENT_ID = discordClientId.trim();

  // Discord Guild ID (optionnel)
  const discordGuildId = await question('3. Guild ID Discord (optionnel, laissez vide pour déploiement global): ');
  if (discordGuildId.trim()) {
    envVars.DISCORD_GUILD_ID = discordGuildId.trim();
  }

  // Application Twitch - DÉJÀ CONFIGURÉE DANS LE CODE !
  console.log('\n✅ Application Twitch - DÉJÀ CONFIGURÉE !\n');
  console.log('🎉 L\'application Twitch est déjà créée et intégrée dans le code.');
  console.log('   Vous n\'avez RIEN à faire pour Twitch - tout est automatique !\n');
  console.log('💡 Les utilisateurs n\'auront qu\'à utiliser /setup channel dans Discord');
  console.log('   et cliquer sur "Se connecter avec Twitch" - c\'est tout !\n');

  // Écrire le fichier .env
  console.log('\n📝 Création du fichier .env...');
  writeEnvFile(envVars);

  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   ✅ Configuration terminée avec succès!                ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  console.log('📋 Prochaines étapes:');
  console.log('   1. Déployez les commandes: npm run deploy');
  console.log('   2. Démarrez le bot: npm start');
  console.log('   3. Dans Discord, utilisez: /setup channel canal:#notifications');
  console.log('   4. Cliquez sur "Se connecter avec Twitch"\n');
  console.log('🎉 C\'est tout! Les utilisateurs n\'ont plus qu\'à se connecter.\n');

  rl.close();
}

main().catch(error => {
  console.error('❌ Erreur lors de la configuration:', error);
  rl.close();
  process.exit(1);
});
