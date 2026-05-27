import {
  ApplicationIntegrationType,
  InteractionContextType,
  SlashCommandBuilder,
} from 'discord.js';
import { getRandom } from '../database/index.js';
import { buildQuoteMessage } from '../utils/builders.js';

export const data = new SlashCommandBuilder()
  .setName('quote')
  .setDescription('Get a random quote')
  .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
  .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel]);

export async function execute(interaction) {
  await interaction.reply(buildQuoteMessage(getRandom()));
}
