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

const GREEN = 0x57f287;
const AMBER = 0xfaa61a;

export function buildQuoteMessage(quote, { showButtons = true } = {}) {
  const container = {
    type: ComponentType.Container,
    components: [
      { type: ComponentType.TextDisplay, content: `*"${quote.text}"*` },
      { type: ComponentType.Separator, spacing: 1, divider: false },
      { type: ComponentType.TextDisplay, content: `— **${quote.author}**` },
      { type: ComponentType.TextDisplay, content: `-# #${quote.id}` },
    ],
  };

  if (showButtons) {
    container.components.push(
      { type: ComponentType.Separator, spacing: 1, divider: true },
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
    );
  }

  return { flags: MessageFlags.IsComponentsV2, components: [container] };
}

export function buildFortuneMessage(fortune) {
  return {
    flags: MessageFlags.IsComponentsV2,
    components: [
      {
        type: ComponentType.Container,
        components: [
          { type: ComponentType.TextDisplay, content: `*"${fortune.text}"*` },
          { type: ComponentType.Separator, spacing: 1, divider: false },
          { type: ComponentType.TextDisplay, content: `— **${fortune.author}**` },
          { type: ComponentType.TextDisplay, content: '-# via Quotable' },
          { type: ComponentType.Separator, spacing: 1, divider: true },
          {
            type: ComponentType.ActionRow,
            components: [
              new ButtonBuilder()
                .setCustomId('fortune_new')
                .setLabel('New fortune')
                .setStyle(ButtonStyle.Secondary)
                .toJSON(),
            ],
          },
        ],
      },
    ],
  };
}

export function buildSubmittedMessage(id, pending) {
  return {
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    components: [
      {
        type: ComponentType.Container,
        accent_color: pending ? AMBER : GREEN,
        components: [
          {
            type: ComponentType.TextDisplay,
            content: pending
              ? `**Quote #${id} submitted** — pending review. It'll appear once approved.`
              : `**Quote #${id} added** — it's live!`,
          },
        ],
      },
    ],
  };
}

// Posted to the review channel as a heads-up (no action buttons — review happens
// in the web dashboard). Includes a link button when DASHBOARD_URL is set.
export function buildReviewNotification(quote, dashboardUrl) {
  const container = {
    type: ComponentType.Container,
    accent_color: AMBER,
    components: [
      { type: ComponentType.TextDisplay, content: `**New submission · #${quote.id}** — pending review` },
      { type: ComponentType.Separator, spacing: 1, divider: true },
      { type: ComponentType.TextDisplay, content: `*"${quote.text}"*` },
      { type: ComponentType.Separator, spacing: 1, divider: false },
      { type: ComponentType.TextDisplay, content: `— **${quote.author}**` },
      { type: ComponentType.TextDisplay, content: `-# Submitted by <@${quote.submitted_by}>` },
    ],
  };

  if (dashboardUrl) {
    container.components.push(
      { type: ComponentType.Separator, spacing: 1, divider: true },
      {
        type: ComponentType.ActionRow,
        components: [
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel('Open dashboard')
            .setURL(dashboardUrl)
            .toJSON(),
        ],
      },
    );
  }

  return { flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] }, components: [container] };
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
