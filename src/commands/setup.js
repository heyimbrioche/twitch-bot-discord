import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('⚙️ Configurer le bot Twitch pour ce serveur')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('Le canal où envoyer les notifications Twitch')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('message')
        .setDescription('Message personnalisé à envoyer avec les notifications (optionnel)')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('admin')
        .setDescription('⚙️ Configuration admin (Propriétaire bot uniquement)')
        .addSubcommand(subcommand =>
          subcommand
            .setName('oauth')
            .setDescription('Configurer les credentials Twitch OAuth')
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
                .setName('redirect_uri')
                .setDescription('URI de redirection OAuth (optionnel)')
            )
            .addIntegerOption(option =>
              option
                .setName('port')
                .setDescription('Port pour le serveur OAuth (optionnel, défaut: 3000)')
            )
        )
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
    // Si c'est une commande principale (sans subcommand), c'est la configuration simple
    if (!interaction.options.getSubcommand()) {
      const channel = interaction.options.getChannel('channel');
      const customMessage = interaction.options.getString('message');
      const guildId = interaction.guild.id;

      if (channel.type !== 0) {
        return interaction.reply({
          embeds: [new EmbedBuilder().setColor('#FF0000').setDescription('❌ Le canal doit être un canal textuel.')],
          ephemeral: true
        });
      }

      await interaction.deferReply({ ephemeral: true });

      // Vérifier que OAuth est configuré
      const oauthSettings = await bot.database.getOAuthSettings();
      if (!oauthSettings.isConfigured || !bot.oauthService) {
        const embed = new EmbedBuilder()
          .setColor('#FF9900')
          .setTitle('⚠️ Configuration OAuth requise')
          .setDescription('Le bot n\'a pas encore été configuré avec les credentials Twitch OAuth.\n\n**Le propriétaire du bot doit d\'abord configurer OAuth avec :**\n\`/setup admin oauth client_id:<id> client_secret:<secret>\`\n\nUne fois configuré, vous pourrez vous connecter avec Twitch.')
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      }

      // Sauvegarder le canal et le message personnalisé
      await bot.database.updateGuildSetting(guildId, 'notificationChannelId', channel.id);
      if (customMessage) {
        await bot.database.updateGuildSetting(guildId, 'customMessage', customMessage);
      }

      // Vérifier si l'utilisateur est déjà connecté
      const settings = await bot.database.getGuildSettings(guildId);
      if (settings.isConfigured) {
        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('✅ Configuration mise à jour!')
          .setDescription(`**Canal:** ${channel}\n${customMessage ? `**Message:** ${customMessage}\n` : ''}\n✅ Votre compte Twitch est déjà connecté (**${settings.twitchChannelName}**).\n\nLe bot est maintenant configuré et fonctionnel!`)
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      }

      // Initier l'authentification OAuth
      try {
        const { authUrl, authPromise } = await bot.oauthService.initiateAuth(guildId, interaction.user.id);

        // Créer un bouton pour se connecter à Twitch
        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setLabel('🔗 Se connecter avec Twitch')
              .setStyle(ButtonStyle.Link)
              .setURL(authUrl)
          );

        const embed = new EmbedBuilder()
          .setColor('#9146FF')
          .setTitle('⚙️ Configuration en cours...')
          .setDescription(`**Canal configuré:** ${channel}\n${customMessage ? `**Message personnalisé:** ${customMessage}\n` : ''}\n\n🔐 **Étape suivante :** Cliquez sur le bouton ci-dessous pour vous connecter avec votre compte Twitch.\n\n**Note:** Vous devez être le propriétaire de la chaîne Twitch que vous souhaitez surveiller.`)
          .setTimestamp();

        await interaction.editReply({ embeds: [embed], components: [row] });

        // Attendre la réponse OAuth (avec timeout)
        const timeout = setTimeout(() => {
          const timeoutEmbed = new EmbedBuilder()
            .setColor('#FF9900')
            .setTitle('⏰ Authentification expirée')
            .setDescription('Le délai d\'authentification a expiré. Utilisez `/setup` à nouveau pour réessayer.')
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
          const oauthSettings = await bot.database.getOAuthSettings();
          const TwitchService = (await import('../services/TwitchService.js')).default;
          const twitchService = new TwitchService(
            oauthSettings.twitchClientId,
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
            .setTitle('✅ Configuration terminée!')
            .setDescription(`**Canal:** ${channel}\n${customMessage ? `**Message:** ${customMessage}\n` : ''}\n**Chaîne Twitch:** ${authData.userInfo.display_name} (${authData.userInfo.login})\n\n🎉 **Le bot est maintenant configuré et fonctionnel!**\n\nIl surveillera automatiquement votre chaîne et enverra des notifications dans ${channel} lorsqu'elle sera en live.`)
            .setThumbnail(authData.userInfo.profile_image_url)
            .setTimestamp();

          await interaction.followUp({ embeds: [successEmbed], ephemeral: true });
        } catch (authError) {
          clearTimeout(timeout);
          const errorEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ Erreur d\'authentification')
            .setDescription(`Une erreur est survenue lors de l'authentification:\n\n${authError.message}\n\nUtilisez \`/setup\` pour réessayer.`)
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
      return;
    }

    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (subcommand === 'admin') {
      const adminSubcommand = interaction.options.getSubcommand(false);
      
      if (adminSubcommand === 'oauth') {
        // Vérifier que l'utilisateur est le propriétaire du bot
        const application = await interaction.client.application.fetch();
        if (interaction.user.id !== application.owner?.id) {
          return interaction.reply({
            embeds: [new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('❌ Accès refusé')
              .setDescription('Seul le propriétaire du bot peut configurer les credentials OAuth.')
              .setTimestamp()],
            ephemeral: true
          });
        }

        await interaction.deferReply({ ephemeral: true });

        const clientId = interaction.options.getString('client_id');
        const clientSecret = interaction.options.getString('client_secret');
        const redirectUri = interaction.options.getString('redirect_uri') || 'http://localhost:3000/oauth/callback';
        const port = interaction.options.getInteger('port') || 3000;

        // Sauvegarder les credentials OAuth
        await bot.database.updateOAuthSetting('twitchClientId', clientId);
        await bot.database.updateOAuthSetting('twitchClientSecret', clientSecret);
        await bot.database.updateOAuthSetting('redirectUri', redirectUri);
        await bot.database.updateOAuthSetting('oauthPort', port);

        // Arrêter l'ancien service OAuth s'il existe
        if (bot.oauthService) {
          bot.oauthService.stopServer();
        }

        // Initialiser le nouveau service OAuth
        try {
          const OAuthService = (await import('../services/OAuthService.js')).default;
          bot.oauthService = new OAuthService(clientId, clientSecret, redirectUri, port);
          await bot.oauthService.startServer();

          const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('✅ Configuration OAuth complétée!')
            .setDescription(`**Client ID:** ${clientId.substring(0, 10)}...\n**Redirect URI:** ${redirectUri}\n**Port:** ${port}\n\n✅ Le service OAuth est maintenant actif!\n\nLes utilisateurs peuvent maintenant utiliser \`/setup\` pour configurer le bot.`)
            .setTimestamp();

          await interaction.editReply({ embeds: [embed] });
        } catch (error) {
          const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ Erreur')
            .setDescription(`Impossible de démarrer le service OAuth:\n\n${error.message}\n\nVérifiez que votre Client ID et Client Secret sont corrects.`)
            .setTimestamp();

          await interaction.editReply({ embeds: [embed] });
        }
      }
    } else if (subcommand === 'status') {
      const settings = await bot.database.getGuildSettings(guildId);
      const oauthSettings = await bot.database.getOAuthSettings();

      const embed = new EmbedBuilder()
        .setColor(settings.isConfigured ? '#00FF00' : '#FF9900')
        .setTitle('⚙️ Configuration du serveur')
        .addFields(
          { 
            name: 'OAuth Twitch', 
            value: oauthSettings.isConfigured 
              ? `✅ Configuré\n**Client ID:** ${oauthSettings.twitchClientId.substring(0, 10)}...`
              : '❌ Non configuré (Propriétaire doit utiliser `/setup admin oauth`)',
            inline: false
          },
          { 
            name: 'Compte Twitch', 
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
          },
          {
            name: 'Message personnalisé',
            value: settings.customMessage || 'Aucun message personnalisé',
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
        customMessage: settings.customMessage, // Garder le message
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
