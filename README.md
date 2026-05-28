# Quoty

A minimalist Discord bot that delivers short, impactful quotes — with a clean,
native-feeling UI built entirely on Discord's Components V2. Supports both
**server install** and **user install**, ships with a community submission flow,
and includes a Discord-OAuth2-protected **moderation dashboard**.

## Features

- **`/quote`** — a random quote, or a specific one via the optional `id` argument.
- **`/submit`** — submit a quote through a modal; submissions go into a review queue.
- **`/fortune`** — a random fortune from a bundled offline collection in the classic
  Unix *fortunes* format (the same source tradition as the Nothing "Fortunes" widget).
- **Moderation dashboard** — a web UI where moderators (gated by a Discord role)
  review pending submissions and manage the full quote library (add / edit / delete).
- **Components V2** throughout — containers, separators and buttons instead of
  legacy embeds.
- **User & guild install** — `integration_types: [0, 1]`, `contexts: [0, 1, 2]`,
  so it works in servers, DMs and private channels.

## Tech stack

- [discord.js](https://discord.js.org/) v14 (Components V2)
- Node's built-in [`node:sqlite`](https://nodejs.org/api/sqlite.html) — no native
  build step required
- [Express](https://expressjs.com/) 5 + `cookie-session` for the dashboard
- Discord OAuth2 for dashboard authentication

> **Requires Node.js 24+** (for stable `node:sqlite`).

## Project structure

```
index.js                 Bot client + interaction router; starts the dashboard
src/
  deploy.js              Slash-command registration
  config.js              Dashboard env detection
  database/index.js      SQLite schema, seeding, queries
  services/fortunes.js   Loads the local fortunes dataset (fortunes.txt)
  commands/              /quote, /submit, /fortune
  components/index.js    Button & modal handlers
  utils/builders.js      Components V2 message builders
  web/                   Express dashboard (auth, routes, server, views)
```

## Setup

### 1. Create the Discord application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
   and create an application.
2. **Bot** → copy the **token** (`DISCORD_TOKEN`).
3. **General Information** → copy the **Application ID** (`CLIENT_ID`).
4. **Installation** → enable both *Guild Install* and *User Install*.
5. For the dashboard: **OAuth2** → copy the **Client Secret** (`CLIENT_SECRET`)
   and add your redirect URIs (see below).

No privileged gateway intents are required.

### 2. Configure environment

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `DISCORD_TOKEN` | ✅ | Bot token |
| `CLIENT_ID` | ✅ | Application (client) ID |
| `DEV_GUILD_ID` | – | Register commands to one guild for **instant** updates (dev). Empty = global (can take ~1h to propagate). |
| `REVIEW_CHANNEL_ID` | – | Channel that receives a heads-up when a quote is submitted |
| `DASHBOARD_URL` | – | Public dashboard URL, shown as a link button in the notification |
| `CLIENT_SECRET` | dashboard | OAuth2 client secret |
| `GUILD_ID` | dashboard | Guild whose members may log in |
| `MOD_ROLE_ID` | dashboard | Role required to access the dashboard |
| `OAUTH_REDIRECT_URI` | dashboard | Must match a registered redirect URI |
| `SESSION_SECRET` | dashboard | Secret for signing session cookies (`openssl rand -hex 32`) |
| `DASHBOARD_PORT` | – | Dashboard port (default `3000`) |

The six `dashboard` variables are all-or-nothing: if any is missing, the dashboard
stays disabled and submissions are **auto-approved** (so the bot still works out of
the box). To grab `GUILD_ID` / `MOD_ROLE_ID`, enable **Developer Mode** in Discord
(Settings → Advanced) and right-click the server / role → *Copy ID*.

### 3. Register commands & run

```bash
npm install
npm run deploy   # registers /quote, /submit, /fortune
npm start
```

With `DEV_GUILD_ID` set, commands appear instantly in that guild.

## Moderation dashboard

The dashboard runs inside the bot process (no separate service).

1. Register your redirect URIs under **OAuth2** in the Developer Portal:
   - Dev: `http://localhost:3000/auth/callback`
   - Prod: `https://your-domain/auth/callback`
2. Set the six dashboard variables in `.env` (`OAUTH_REDIRECT_URI` must match exactly).
3. Start the bot and open `http://localhost:3000`.

Sign in with Discord — only members of `GUILD_ID` who hold `MOD_ROLE_ID` are granted
access. Submitted quotes stay `pending` until a moderator approves them; only
`approved` quotes appear via `/quote`.

## Docker

```bash
docker compose up -d --build
```

This builds and runs the bot + dashboard, persisting the SQLite database in the
`quoty_data` volume. The dashboard is published on `127.0.0.1:3000`.

### Reverse proxy (Caddy, nginx, …)

The app is reverse-proxy ready — it honours `X-Forwarded-*` headers and sets
`Secure` cookies under `NODE_ENV=production`. Caddy is **not** bundled; put your
own proxy in front of `127.0.0.1:3000` for TLS. See
[`Caddyfile.example`](./Caddyfile.example) for a reference snippet.

## Deployment (GitHub Actions)

`.github/workflows/deploy.yml` deploys on push to `master`: it rsyncs the repo to
your server over SSH and runs `docker compose up -d --build`, then re-registers the
slash commands. The `.env` is **not** synced — maintain it directly on the server.

Required repository secrets: `DEPLOY_SSH_KEY`, `DEPLOY_HOST`, `DEPLOY_USER`,
`DEPLOY_PATH` (and optionally `DEPLOY_PORT`).

## Notes

- `node:sqlite` is currently an experimental Node feature and prints a warning on
  startup — this is expected.
- Fortunes live in [`src/services/fortunes.txt`](src/services/fortunes.txt) in the
  Unix *fortune* format (entries separated by a `%` line, optional `-- Author`).
  Add your own or drop in files from the [bmc/fortunes](https://github.com/bmc/fortunes)
  database (CC BY 4.0).
