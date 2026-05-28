const DISCORD_API = 'https://discord.com/api/v10';

export function getLoginUrl(state) {
  const params = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    redirect_uri: process.env.OAUTH_REDIRECT_URI,
    response_type: 'code',
    scope: 'identify guilds.members.read',
    state,
  });
  return `https://discord.com/oauth2/authorize?${params}`;
}

export async function exchangeCode(code) {
  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.OAUTH_REDIRECT_URI,
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
  return res.json();
}

export async function fetchUser(accessToken) {
  const res = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`User fetch failed: ${res.status}`);
  return res.json();
}

// Verifies the user belongs to GUILD_ID and carries MOD_ROLE_ID.
// Requires the `guilds.members.read` OAuth scope.
export async function hasModRole(accessToken) {
  const res = await fetch(`${DISCORD_API}/users/@me/guilds/${process.env.GUILD_ID}/member`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 404) return false; // not a member of the guild
  if (!res.ok) throw new Error(`Member fetch failed: ${res.status}`);

  const member = await res.json();
  return Array.isArray(member.roles) && member.roles.includes(process.env.MOD_ROLE_ID);
}

export function requireMod(req, res, next) {
  if (req.session?.user?.isMod) return next();
  return res.redirect('/');
}
