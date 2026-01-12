import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('⚙️ Configurer le bot Twitch pour ce serveur')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('connect')
        .setDescription('Se connecter avec votre compte Twitch')
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
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('disconnect')
        .setDescription('Déconnecter votre compte Twitch')
    ),
  cooldown: 3,
  async execute(interaction, bot) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;

    if (subcommand === 'connect') {
      await interaction.deferReply({ ephemeral: true });

      // Vérifier que le service OAuth est configuré
      if (!bot.oauthService) {
        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('❌ Service OAuth non configuré')
          .setDescription('Le bot n\'a pas été configuré avec les credentials Twitch OAuth.\n\nContactez l\'administrateur du bot.')
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      }

      try {
        // Initier l'authentification OAuth
        const { authUrl, authPromise } = await bot.oauthService.initiateAuth(guildId, userId);

        // Créer un bouton pour ouvrir le lien
        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setLabel('🔗 Se connecter avec Twitch')
              .setStyle(ButtonStyle.Link)
              .setURL(authUrl)
          );

        const embed = new EmbedBuilder()
          .setColor('#9146FF')
          .setTitle('🔐 Connexion Twitch')
          .setDescription('Cliquez sur le bouton ci-dessous pour vous connecter avec votre compte Twitch.\n\n**Note:** Vous devez être le propriétaire de la chaîne Twitch que vous souhaitez surveiller.')
          .setTimestamp();

        await interaction.editReply({ embeds: [embed], components: [row] });

        // Attendre la réponse OAuth (avec timeout)
        const timeout = setTimeout(() => {
          const timeoutEmbed = new EmbedBuilder()
            .setColor('#FF9900')
            .setTitle('⏰ Authentification expirée')
            .setDescription('Le délai d\'authentification a expiré. Utilisez `/setup connect` pour réessayer.')
            .setTimestamp();

          interaction.followUp({ embeds: [timeoutEmbed], ephemeral: true }).catch(() => {});
        }, 10 * 60 * 1000); // 10 minutes

        try {
          const authData = await authPromise;
          clearTimeout(timeout);

          // Sauvegarder les données dans la base de données
          await bot.database.updateGuildSetting(guildId, 'twitchAccessToken', authData.accessToken);
          await bot.database.updateGuildSetting(guildId, 'twitchRefreshToken', authData.refreshToken);
          await bot.database.updateGuildSetting(guildId, 'twitchTokenExpiry', authData.expiresAt);
          await bot.database.updateGuildSetting(guildId, 'twitchChannelName', authData.userInfo.login);
          await bot.database.updateGuildSetting(guildId, 'twitchChannelId', authData.userInfo.id);
          await bot.database.updateGuildSetting(guildId, 'twitchUserId', authData.userInfo.id);
          await bot.database.updateGuildSetting(guildId, 'isConfigured', true);

          // Arrêter l'ancien service s'il existe
          const oldService = bot.twitchServices.get(guildId);
          if (oldService) {
            oldService.stopStreamCheck();
          }

          // Créer et démarrer le nouveau service Twitch
          const TwitchService = (await import('../services/TwitchService.js')).default;
          const twitchService = new TwitchService(
            bot.oauthService.clientId,
            authData.accessToken,
            authData.userInfo.login,
            authData.userInfo.id,
            guildId
          );
          await twitchService.initialize();

          if (!bot.twitchServices) {
            bot.twitchServices = new Map();
          }
          bot.twitchServices.set(guildId, twitchService);
          twitchService.startStreamCheck(interaction.client, guildId, bot.database);

          const successEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('✅ Connexion réussie!')
            .setDescription(`**Chaîne:** ${authData.userInfo.display_name} (${authData.userInfo.login})\n\nLe bot surveille maintenant votre chaîne et enverra des notifications lorsqu'elle sera en live.`)
            .setThumbnail(authData.userInfo.profile_image_url)
            .setTimestamp();

          await interaction.followUp({ embeds: [successEmbed], ephemeral: true });
        } catch (authError) {
          clearTimeout(timeout);
          const errorEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ Erreur d\'authentification')
            .setDescription(`Une erreur est survenue lors de l'authentification:\n\n${authError.message}`)
            .setTimestamp();

          await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
        }
      } catch (error) {
        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('❌ Erreur')
          .setDescription(`Impossible d'initier l'authentification:\n\n${error.message}`)
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
          embeds: [new EmbedBuilder().setColor('#FF0000').setDescription('❌ Le bot n\'est pas encore configuré. Utilisez `/setup connect` d\'abord.')]
        });
      }

      const twitchService = bot.twitchServices.get(guildId);
      if (!twitchService) {
        return interaction.editReply({
          embeds: [new EmbedBuilder().setColor('#FF0000').setDescription('❌ Le service Twitch n\'est pas initialisé. Utilisez `/setup connect` pour réinitialiser.')]
        });
      }

      try {
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
              ? `✅ Connecté\n**Chaîne:** ${settings.twitchChannelName || 'Non défini'}`
              : '❌ Non connecté',
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
    } else if (subcommand === 'disconnect') {
      await interaction.deferReply({ ephemeral: true });

      const settings = await bot.database.getGuildSettings(guildId);

      if (!settings.isConfigured) {
        return interaction.editReply({
          embeds: [new EmbedBuilder().setColor('#FF9900').setDescription('⚠️ Aucun compte Twitch n\'est connecté.')]
        });
      }

      // Arrêter le service Twitch
      const twitchService = bot.twitchServices.get(guildId);
      if (twitchService) {
        twitchService.stopStreamCheck();
        bot.twitchServices.delete(guildId);
      }

      // Réinitialiser les paramètres
      await bot.database.setGuildSettings(guildId, {
        twitchAccessToken: null,
        twitchRefreshToken: null,
        twitchTokenExpiry: null,
        twitchChannelName: null,
        twitchChannelId: null,
        twitchUserId: null,
        notificationChannelId: settings.notificationChannelId, // Garder le canal
        isConfigured: false,
      });

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Déconnexion réussie')
        .setDescription('Votre compte Twitch a été déconnecté. Les notifications ne seront plus envoyées.')
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    }
  },
};
