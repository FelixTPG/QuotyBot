import { MessageFlags } from 'discord.js';
import { addPending, getAnyById, getRandom, setStatus } from '../database/index.js';
import { isDashboardConfigured } from '../config.js';
import { getFortune } from '../services/fortunes.js';
import {
  buildFortuneMessage,
  buildQuoteMessage,
  buildReviewNotification,
  buildSubmitModal,
  buildSubmittedMessage,
} from '../utils/builders.js';

const REVIEW_CHANNEL_ID = process.env.REVIEW_CHANNEL_ID;
const DASHBOARD_URL = process.env.DASHBOARD_URL;

export async function handleComponent(interaction) {
  try {
    if (interaction.isButton()) {
      switch (interaction.customId) {
        case 'quote_next':
          await interaction.update(buildQuoteMessage(getRandom()));
          break;
        case 'quote_submit':
          await interaction.showModal(buildSubmitModal());
          break;
        case 'fortune_new':
          await interaction.update(buildFortuneMessage(getFortune()));
          break;
      }
    } else if (interaction.isModalSubmit() && interaction.customId === 'modal_submit_quote') {
      await handleSubmit(interaction);
    }
  } catch (err) {
    console.error(err);
  }
}

async function handleSubmit(interaction) {
  // Defer immediately — posting the review notification hits the network and
  // could otherwise blow past the 3s interaction window.
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const text = interaction.fields.getTextInputValue('quote_text').trim();
  const author = interaction.fields.getTextInputValue('quote_author').trim();
  const id = addPending(text, author, interaction.user.id);

  const reviewing = isDashboardConfigured();
  if (!reviewing) {
    // No dashboard configured to review with → publish immediately.
    setStatus(id, 'approved');
  } else if (REVIEW_CHANNEL_ID) {
    try {
      const channel = await interaction.client.channels.fetch(REVIEW_CHANNEL_ID);
      await channel.send(buildReviewNotification(getAnyById(id), DASHBOARD_URL));
    } catch (err) {
      console.error('Could not post review notification:', err);
    }
  }

  await interaction.editReply(buildSubmittedMessage(id, reviewing));
}
