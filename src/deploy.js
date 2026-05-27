import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const commandFiles = readdirSync(join(__dirname, 'commands')).filter(f => f.endsWith('.js'));
const commands = [];

for (const file of commandFiles) {
  const url = pathToFileURL(join(__dirname, 'commands', file)).href;
  const cmd = await import(url);
  // Explicitly enforce integration_types and contexts on every command
  commands.push({
    ...cmd.data.toJSON(),
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  });
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

console.log(`Deploying ${commands.length} command(s)...`);
const deployed = await rest.put(
  Routes.applicationCommands(process.env.CLIENT_ID),
  { body: commands },
);
console.log(`✓ Deployed ${deployed.length} command(s)`);
