import {
  ApplicationIntegrationType,
  InteractionContextType,
  SlashCommandBuilder,
} from 'discord.js';
import { buildSubmitModal } from '../utils/builders.js';

export const data = new SlashCommandBuilder()
  .setName('submit')
  .setDescription('Submit a new quote')
  .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
  .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel]);

export async function execute(interaction) {
  await interaction.showModal(buildSubmitModal());
}
