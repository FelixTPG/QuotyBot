import {
  ApplicationIntegrationType,
  InteractionContextType,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { getById, getRandom } from '../database/index.js';
import { buildQuoteMessage } from '../utils/builders.js';

export const data = new SlashCommandBuilder()
  .setName('quote')
  .setDescription('Get a random quote — or a specific one by ID')
  .addIntegerOption(option =>
    option
      .setName('id')
      .setDescription('Show a specific quote by its ID')
      .setMinValue(1)
      .setRequired(false),
  )
  .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
  .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel]);

export async function execute(interaction) {
  const id = interaction.options.getInteger('id');

  if (id !== null) {
    const quote = getById(id);
    if (!quote) {
      await interaction.reply({
        content: `Quote #${id} doesn't exist (or isn't approved yet).`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    // Specific quote requested → no buttons.
    await interaction.reply(buildQuoteMessage(quote, { showButtons: false }));
    return;
  }

  const quote = getRandom();
  if (!quote) {
    await interaction.reply({ content: 'No quotes available yet.', flags: MessageFlags.Ephemeral });
    return;
  }
  await interaction.reply(buildQuoteMessage(quote));
}
