import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('📚 Afficher l\'aide et la liste des commandes'),
  cooldown: 3,
  async execute(interaction, bot) {
    const commands = Array.from(bot.client.commands.values());
    
    const embed = new EmbedBuilder()
      .setColor(0x9146FF)
      .setTitle('📚 Centre d\'aide - Bot Twitch Discord')
      .setDescription('Bot de notifications Twitch pour Discord\n\n**Configuration:** Utilisez `/setup` pour configurer le bot.')
      .setThumbnail(bot.client.user.displayAvatarURL())
      .addFields(
        {
          name: '⚙️ Configuration',
          value: '`/setup twitch` - Configurer les credentials Twitch\n`/setup channel` - Définir le canal de notifications\n`/setup test` - Tester la configuration\n`/setup status` - Voir la configuration actuelle',
          inline: false
        },
        {
          name: '📺 Twitch',
          value: '`/twitch status` - Vérifier si le stream est en ligne\n`/twitch info` - Informations sur la chaîne',
          inline: false
        }
      )
      .setTimestamp()
      .setFooter({ text: `Bot créé avec ❤️ | Version 1.0.0` });

    await interaction.reply({ embeds: [embed] });
  },
};
