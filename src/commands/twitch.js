import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('twitch')
    .setDescription('📺 Informations sur le stream Twitch')
    .addSubcommand(subcommand =>
      subcommand
        .setName('status')
        .setDescription('Vérifier si le stream est en ligne')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('info')
        .setDescription('Informations sur la chaîne Twitch')
    ),
  cooldown: 5,
  async execute(interaction, bot) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    const settings = await bot.database.getGuildSettings(guildId);

    if (!settings.isConfigured) {
      const embed = new EmbedBuilder()
        .setColor('#FF9900')
        .setTitle('⚠️ Configuration requise')
        .setDescription('Le bot n\'est pas encore configuré pour ce serveur.\n\nUtilisez `/setup twitch` pour configurer vos credentials Twitch.')
        .setTimestamp();

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const twitchService = bot.twitchServices.get(guildId);
    if (!twitchService) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Erreur')
        .setDescription('Le service Twitch n\'est pas initialisé. Utilisez `/setup test` pour réinitialiser.')
        .setTimestamp();

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (subcommand === 'status') {
      await interaction.deferReply();
      
      const { isLive, streamData } = await twitchService.checkStreamStatus();
      
      if (isLive && streamData) {
        const embed = twitchService.createStreamEmbed(streamData);
        await interaction.editReply({ embeds: [embed] });
      } else {
        const embed = new EmbedBuilder()
          .setColor('#808080')
          .setTitle('📺 Stream hors ligne')
          .setDescription(`La chaîne **${settings.twitchChannelName}** n'est pas actuellement en stream.`)
          .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
      }
    } else if (subcommand === 'info') {
      await interaction.deferReply();
      
      try {
        const channelInfo = await twitchService.getChannelInfo();
        const { isLive, streamData } = await twitchService.checkStreamStatus();
        
        const embed = new EmbedBuilder()
          .setColor('#9146FF')
          .setTitle(`📺 ${channelInfo.display_name}`)
          .setDescription(channelInfo.description || 'Aucune description')
          .setURL(`https://twitch.tv/${channelInfo.login}`)
          .setThumbnail(channelInfo.profile_image_url)
          .addFields(
            { name: '🆔 ID', value: channelInfo.id, inline: true },
            { name: '📅 Créé le', value: `<t:${Math.floor(new Date(channelInfo.created_at).getTime() / 1000)}:D>`, inline: true },
            { name: '📊 Statut', value: isLive ? '🔴 En ligne' : '⚫ Hors ligne', inline: true },
            { name: '👁️ Vues totales', value: channelInfo.view_count?.toString() || '0', inline: true }
          )
          .setTimestamp()
          .setFooter({ 
            text: 'Twitch Info', 
            iconURL: 'https://static.twitchcdn.net/assets/favicon-32-e29e246c157142c94346.png' 
          });

        if (isLive && streamData) {
          embed.addFields(
            { name: '🎮 Jeu actuel', value: streamData.game_name || 'Aucun jeu', inline: true },
            { name: '👁️ Spectateurs', value: streamData.viewer_count.toString(), inline: true }
          );
        }

        await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('❌ Erreur')
          .setDescription('Impossible de récupérer les informations de la chaîne Twitch.');
        
        await interaction.editReply({ embeds: [errorEmbed] });
      }
    }
  },
};
