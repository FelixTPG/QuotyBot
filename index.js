import 'dotenv/config';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { handleComponent } from './src/components/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const commandFiles = readdirSync(join(__dirname, 'src/commands')).filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
  const url = pathToFileURL(join(__dirname, 'src/commands', file)).href;
  const cmd = await import(url);
  client.commands.set(cmd.data.name, cmd);
}

client.once('ready', c => console.log(`✓ ${c.user.tag} ready`));

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    const cmd = client.commands.get(interaction.commandName);
    if (!cmd) return;
    try {
      await cmd.execute(interaction);
    } catch (err) {
      console.error(err);
      const payload = { content: 'Something went wrong.', ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(payload);
      } else {
        await interaction.reply(payload);
      }
    }
  } else if (interaction.isButton() || interaction.isModalSubmit()) {
    await handleComponent(interaction);
  }
});

client.login(process.env.DISCORD_TOKEN);
