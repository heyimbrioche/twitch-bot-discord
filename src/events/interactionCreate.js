import { Events, EmbedBuilder, Collection } from 'discord.js';
import logger from '../utils/logger.js';

export default {
  name: Events.InteractionCreate,
  async execute(interaction, bot) {
    if (!interaction.isChatInputCommand()) return;

    const command = bot.client.commands.get(interaction.commandName);

    if (!command) {
      logger.warn(`Commande ${interaction.commandName} introuvable`);
      return;
    }

    // Gestion des cooldowns
    const { cooldowns } = bot.client;
    if (!cooldowns.has(command.data.name)) {
      cooldowns.set(command.data.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.data.name);
    const defaultCooldownDuration = 3;
    const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

    if (timestamps.has(interaction.user.id)) {
      const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

      if (now < expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1000);
        const embed = new EmbedBuilder()
          .setColor('#FF0000')
          .setDescription(`⏰ Veuillez patienter, vous pouvez réutiliser cette commande <t:${expiredTimestamp}:R>.`);
        
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    try {
      await command.execute(interaction, bot);
      logger.info(`${interaction.user.tag} a utilisé la commande ${interaction.commandName}`);
    } catch (error) {
      logger.error(`Erreur lors de l'exécution de ${interaction.commandName}:`, error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Erreur')
        .setDescription('Une erreur est survenue lors de l\'exécution de cette commande.')
        .setTimestamp();

      const replyOptions = { embeds: [errorEmbed], ephemeral: true };
      
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(replyOptions);
      } else {
        await interaction.reply(replyOptions);
      }
    }
  },
};
