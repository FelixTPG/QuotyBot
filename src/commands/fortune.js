import {
  ApplicationIntegrationType,
  InteractionContextType,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { getFortune } from '../services/quotable.js';
import { buildFortuneMessage } from '../utils/builders.js';

export const data = new SlashCommandBuilder()
  .setName('fortune')
  .setDescription('Draw a random fortune from the wider world of quotes')
  .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
  .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel]);

export async function execute(interaction) {
  try {
    const fortune = await getFortune();
    await interaction.reply(buildFortuneMessage(fortune));
  } catch (err) {
    console.error('Fortune fetch failed:', err);
    await interaction.reply({
      content: "Couldn't reach the fortune service right now. Try again shortly.",
      flags: MessageFlags.Ephemeral,
    });
  }
}
