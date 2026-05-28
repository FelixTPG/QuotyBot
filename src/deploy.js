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
  commands.push(cmd.data.toJSON());
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// DEV_GUILD_ID → register to a single guild (updates appear instantly, great for
// development). Otherwise register globally (works with user-install everywhere,
// but new commands/args can take up to an hour to propagate).
const devGuildId = process.env.DEV_GUILD_ID;

let route;
let body;
if (devGuildId) {
  // Guild-scoped commands don't use integration_types/contexts.
  route = Routes.applicationGuildCommands(process.env.CLIENT_ID, devGuildId);
  body = commands.map(({ integration_types, contexts, ...rest }) => rest);
} else {
  route = Routes.applicationCommands(process.env.CLIENT_ID);
  body = commands.map(cmd => ({ ...cmd, integration_types: [0, 1], contexts: [0, 1, 2] }));
}

console.log(`Deploying ${body.length} command(s)${devGuildId ? ` to guild ${devGuildId}` : ' globally'}...`);
const deployed = await rest.put(route, { body });
console.log(
  `✓ Deployed ${deployed.length} command(s) — ${devGuildId ? 'visible instantly' : 'global, may take up to ~1h to appear'}`,
);
