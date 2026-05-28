import {
  ApplicationIntegrationType,
  InteractionContextType,
  SlashCommandBuilder,
} from 'discord.js';
import { getFortune } from '../services/fortunes.js';
import { buildFortuneMessage } from '../utils/builders.js';

export const data = new SlashCommandBuilder()
  .setName('fortune')
  .setDescription('Draw a random fortune')
  .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
  .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel]);

export async function execute(interaction) {
  await interaction.reply(buildFortuneMessage(getFortune()));
}
