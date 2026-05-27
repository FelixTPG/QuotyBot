import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';

const BLURPLE = 0x5865f2;
const GREEN   = 0x57f287;

export function buildQuoteMessage(quote) {
  return {
    flags: MessageFlags.IsComponentsV2,
    components: [
      {
        type: ComponentType.Container,
        accent_color: BLURPLE,
        components: [
          {
            type: ComponentType.TextDisplay,
            content: `*"${quote.text}"*`,
          },
          {
            type: ComponentType.Separator,
            spacing: 1,    // small gap
            divider: false, // no visible line, just whitespace
          },
          {
            type: ComponentType.TextDisplay,
            content: `— **${quote.author}**`,
          },
          {
            type: ComponentType.Separator,
            spacing: 1,
            divider: true,
          },
          {
            type: ComponentType.ActionRow,
            components: [
              new ButtonBuilder()
                .setCustomId('quote_next')
                .setLabel('Next quote')
                .setStyle(ButtonStyle.Secondary)
                .toJSON(),
              new ButtonBuilder()
                .setCustomId('quote_submit')
                .setLabel('Submit a quote')
                .setStyle(ButtonStyle.Secondary)
                .toJSON(),
            ],
          },
        ],
      },
    ],
  };
}

export function buildSuccessMessage(text, author) {
  return {
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    components: [
      {
        type: ComponentType.Container,
        accent_color: GREEN,
        components: [
          {
            type: ComponentType.TextDisplay,
            content: '**Quote submitted** — thank you!',
          },
          {
            type: ComponentType.Separator,
            spacing: 1,
            divider: true,
          },
          {
            type: ComponentType.TextDisplay,
            content: `*"${text}"*\n— **${author}**`,
          },
        ],
      },
    ],
  };
}

export function buildSubmitModal() {
  return new ModalBuilder()
    .setCustomId('modal_submit_quote')
    .setTitle('Submit a Quote')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('quote_text')
          .setLabel('Quote')
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder('Enter the quote...')
          .setRequired(true)
          .setMaxLength(500),
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('quote_author')
          .setLabel('Author')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Who said it?')
          .setRequired(true)
          .setMaxLength(100),
      ),
    );
}
