import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const commands = [];
const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  try {
    const filePath = join(commandsPath, file);
    const command = await import(`file://${filePath}`);
    if ('data' in command.default && 'execute' in command.default) {
      const commandData = command.default.data.toJSON();
      commands.push(commandData);
    } else {
      console.warn(`⚠️  La commande ${file} n'a pas les propriétés requises (data ou execute manquant)`);
    }
  } catch (error) {
    console.error(`❌ Erreur lors du chargement de la commande ${file}:`, error.message);
  }
}

if (commands.length === 0) {
  console.error('❌ Aucune commande valide trouvée!');
  process.exit(1);
}

// Vérifier les variables d'environnement
if (!process.env.DISCORD_TOKEN) {
  console.error('❌ DISCORD_TOKEN est requis dans le fichier .env');
  process.exit(1);
}

if (!process.env.DISCORD_CLIENT_ID) {
  console.error('❌ DISCORD_CLIENT_ID est requis dans le fichier .env');
  console.error('💡 Vous pouvez le trouver dans Discord Developer Portal > General Information');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`\n📦 Chargement de ${commands.length} commande(s)...`);
    commands.forEach(cmd => {
      console.log(`   - /${cmd.name}`);
    });

    // Si DISCORD_GUILD_ID est défini, déployer sur un serveur spécifique (dev/test)
    // Sinon, déployer globalement (production - multi-serveurs)
    const clientId = process.env.DISCORD_CLIENT_ID;
    let guildId = process.env.DISCORD_GUILD_ID;
    
    // Valider le guild ID s'il est fourni
    if (guildId) {
      // Vérifier que ce n'est pas un placeholder
      if (guildId.includes('your_guild_id') || guildId.includes('votre_guild_id') || guildId.length < 17) {
        console.warn(`⚠️  DISCORD_GUILD_ID semble être un placeholder ou invalide: "${guildId}"`);
        console.log(`   Déploiement global à la place...\n`);
        guildId = null;
      }
    }

    let data;
    if (guildId) {
      // Déploiement sur un serveur spécifique (développement/test)
      console.log(`\n📌 Déploiement sur le serveur ${guildId} (mode développement)...`);
      console.log(`   Les commandes apparaîtront immédiatement sur ce serveur.`);
      data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands },
      );
    } else {
      // Déploiement global (production - multi-serveurs)
      console.log(`\n🌐 Déploiement global (tous les serveurs)...`);
      console.log(`   ⚠️  Les commandes peuvent prendre jusqu'à 1 heure pour apparaître sur tous les serveurs.`);
      console.log(`   💡 Pour un déploiement instantané, ajoutez DISCORD_GUILD_ID dans votre .env`);
      data = await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands },
      );
    }

    console.log(`\n✅ ${data.length} commande(s) (/) déployée(s) avec succès!`);
    console.log(`\n💡 Pour voir les commandes dans Discord:`);
    if (guildId) {
      console.log(`   - Tapez "/" dans le serveur où vous avez déployé`);
    } else {
      console.log(`   - Attendez quelques minutes (jusqu'à 1h) puis tapez "/" dans n'importe quel serveur`);
      console.log(`   - Ou redémarrez Discord pour forcer la mise à jour`);
    }
    console.log('');
  } catch (error) {
    console.error('\n❌ Erreur lors du déploiement des commandes:\n');
    
    if (error.code === 50001) {
      console.error('   🔴 Erreur: Application introuvable');
      console.error('   💡 Vérifiez que DISCORD_CLIENT_ID correspond à votre application Discord');
    } else if (error.code === 50035) {
      console.error('   🔴 Erreur: Format de commande invalide');
      console.error('   💡 Vérifiez que vos commandes sont correctement formatées');
    } else if (error.status === 401) {
      console.error('   🔴 Erreur: Token Discord invalide');
      console.error('   💡 Vérifiez que DISCORD_TOKEN est correct dans votre .env');
    } else if (error.status === 403) {
      console.error('   🔴 Erreur: Permissions insuffisantes');
      console.error('   💡 Vérifiez que votre bot a les permissions nécessaires');
    } else if (error.code === 10004) {
      console.error('   🔴 Erreur: Serveur Discord introuvable');
      console.error('   💡 Vérifiez que DISCORD_GUILD_ID est correct et que le bot est sur ce serveur');
    } else {
      console.error(`   Code d'erreur: ${error.code || error.status || 'N/A'}`);
      console.error(`   Message: ${error.message}`);
      if (error.rawError) {
        console.error(`   Détails:`, JSON.stringify(error.rawError, null, 2));
      }
      if (error.request) {
        console.error(`   URL: ${error.request.path || 'N/A'}`);
      }
    }
    
    console.error('\n📋 Vérifications à faire:');
    console.error('   1. ✅ DISCORD_TOKEN est correct dans .env');
    console.error('   2. ✅ DISCORD_CLIENT_ID correspond à votre application Discord');
    console.error('   3. ✅ Le bot est invité sur le serveur (si vous utilisez DISCORD_GUILD_ID)');
    console.error('   4. ✅ Les permissions du bot incluent "applications.commands"\n');
    
    process.exit(1);
  }
})();
