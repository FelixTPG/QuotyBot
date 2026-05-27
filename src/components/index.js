import { addQuote, getRandom } from '../database/index.js';
import { buildQuoteMessage, buildSubmitModal, buildSuccessMessage } from '../utils/builders.js';

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
      }
    } else if (interaction.isModalSubmit() && interaction.customId === 'modal_submit_quote') {
      const text   = interaction.fields.getTextInputValue('quote_text').trim();
      const author = interaction.fields.getTextInputValue('quote_author').trim();
      addQuote(text, author, interaction.user.id);
      await interaction.reply(buildSuccessMessage(text, author));
    }
  } catch (err) {
    console.error(err);
  }
}
