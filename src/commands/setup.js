import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('⚙️ Configurer le bot Twitch pour ce serveur')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('twitch')
        .setDescription('Configurer les credentials Twitch')
        .addStringOption(option =>
          option
            .setName('client_id')
            .setDescription('Votre Twitch Client ID')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('client_secret')
            .setDescription('Votre Twitch Client Secret')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('channel_name')
            .setDescription('Le nom de la chaîne Twitch à surveiller')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('channel')
        .setDescription('Définir le canal pour les notifications')
        .addChannelOption(option =>
          option
            .setName('channel')
            .setDescription('Le canal où envoyer les notifications')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('test')
        .setDescription('Tester la configuration Twitch')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('status')
        .setDescription('Voir la configuration actuelle')
    ),
  cooldown: 3,
  async execute(interaction, bot) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (subcommand === 'twitch') {
      await interaction.deferReply({ ephemeral: true });

      const clientId = interaction.options.getString('client_id');
      const clientSecret = interaction.options.getString('client_secret');
      const channelName = interaction.options.getString('channel_name');

      // Sauvegarder la configuration
      await bot.database.updateGuildSetting(guildId, 'twitchClientId', clientId);
      await bot.database.updateGuildSetting(guildId, 'twitchClientSecret', clientSecret);
      await bot.database.updateGuildSetting(guildId, 'twitchChannelName', channelName);
      await bot.database.updateGuildSetting(guildId, 'isConfigured', true);

      // Arrêter l'ancien service s'il existe
      const oldService = bot.twitchServices.get(guildId);
      if (oldService) {
        oldService.stopStreamCheck();
      }

      // Initialiser le service Twitch pour ce serveur
      try {
        const TwitchService = (await import('../services/TwitchService.js')).default;
        const twitchService = new TwitchService(
          clientId,
          clientSecret,
          channelName,
          guildId
        );
        await twitchService.initialize();

        // Stocker le service dans la map des services par guild
        if (!bot.twitchServices) {
          bot.twitchServices = new Map();
        }
        bot.twitchServices.set(guildId, twitchService);

        // Démarrer la vérification des streams
        twitchService.startStreamCheck(interaction.client, guildId, bot.database);

        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('✅ Configuration Twitch enregistrée!')
          .setDescription(`**Client ID:** ${clientId.substring(0, 10)}...\n**Chaîne:** ${channelName}\n\nLe bot surveille maintenant cette chaîne et enverra des notifications lorsqu'elle sera en live.`)
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('❌ Erreur de configuration')
          .setDescription(`Impossible de se connecter à Twitch avec ces credentials.\n\n**Erreur:** ${error.message}\n\nVérifiez que votre Client ID et Client Secret sont corrects.`)
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      }
    } else if (subcommand === 'channel') {
      const channel = interaction.options.getChannel('channel');

      if (channel.type !== 0) {
        return interaction.reply({
          embeds: [new EmbedBuilder().setColor('#FF0000').setDescription('❌ Le canal doit être un canal textuel.')],
          ephemeral: true
        });
      }

      await bot.database.updateGuildSetting(guildId, 'notificationChannelId', channel.id);

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Canal de notification configuré!')
        .setDescription(`Les notifications Twitch seront envoyées dans ${channel}.`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else if (subcommand === 'test') {
      await interaction.deferReply({ ephemeral: true });

      const settings = await bot.database.getGuildSettings(guildId);

      if (!settings.isConfigured) {
        return interaction.editReply({
          embeds: [new EmbedBuilder().setColor('#FF0000').setDescription('❌ Le bot n\'est pas encore configuré. Utilisez `/setup twitch` d\'abord.')]
        });
      }

      try {
        // Utiliser le service existant ou en créer un temporaire pour le test
        let twitchService = bot.twitchServices.get(guildId);
        
        if (!twitchService) {
          const TwitchService = (await import('../services/TwitchService.js')).default;
          twitchService = new TwitchService(
            settings.twitchClientId,
            settings.twitchClientSecret,
            settings.twitchChannelName,
            guildId
          );
          await twitchService.initialize();
        }

        const { isLive, streamData } = await twitchService.checkStreamStatus();

        const embed = new EmbedBuilder()
          .setColor(isLive ? '#00FF00' : '#808080')
          .setTitle('🧪 Test de connexion Twitch')
          .setDescription(isLive 
            ? `✅ **Connexion réussie!**\n\n🔴 **${settings.twitchChannelName}** est actuellement en live!\n\n**Jeu:** ${streamData.game_name || 'Aucun'}\n**Spectateurs:** ${streamData.viewer_count}`
            : `✅ **Connexion réussie!**\n\n⚫ **${settings.twitchChannelName}** n'est pas actuellement en live.`)
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('❌ Test échoué')
          .setDescription(`Impossible de se connecter à Twitch.\n\n**Erreur:** ${error.message}`)
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      }
    } else if (subcommand === 'status') {
      const settings = await bot.database.getGuildSettings(guildId);

      const embed = new EmbedBuilder()
        .setColor(settings.isConfigured ? '#00FF00' : '#FF9900')
        .setTitle('⚙️ Configuration du serveur')
        .addFields(
          { 
            name: 'Twitch', 
            value: settings.isConfigured 
              ? `✅ Configuré\n**Chaîne:** ${settings.twitchChannelName || 'Non défini'}\n**Client ID:** ${settings.twitchClientId ? settings.twitchClientId.substring(0, 10) + '...' : 'Non défini'}`
              : '❌ Non configuré',
            inline: false
          },
          { 
            name: 'Canal de notification', 
            value: settings.notificationChannelId 
              ? `<#${settings.notificationChannelId}>`
              : '❌ Non configuré',
            inline: false
          }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
