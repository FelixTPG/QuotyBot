import { randomBytes } from 'node:crypto';
import cookieSession from 'cookie-session';
import express from 'express';
import { isDashboardConfigured, missingDashboardEnv } from '../config.js';
import { exchangeCode, fetchUser, getLoginUrl, hasModRole } from './auth.js';
import { registerRoutes } from './routes.js';
import { renderError } from './views.js';

export function startWebServer() {
  if (!isDashboardConfigured()) {
    console.warn(`⚠ Dashboard disabled — missing env: ${missingDashboardEnv().join(', ')}`);
    return;
  }

  const app = express();
  app.set('trust proxy', 1); // honour X-Forwarded-* from Caddy
  app.use(express.urlencoded({ extended: false }));
  app.use(
    cookieSession({
      name: 'quoty.sid',
      secret: process.env.SESSION_SECRET,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }),
  );

  app.get('/auth/login', (req, res) => {
    const state = randomBytes(16).toString('hex');
    req.session.oauthState = state;
    res.redirect(getLoginUrl(state));
  });

  app.get('/auth/callback', async (req, res) => {
    try {
      const { code, state } = req.query;
      if (!code || !state || state !== req.session.oauthState) {
        return res.status(400).send(renderError('Invalid login state — please try again.'));
      }
      req.session.oauthState = undefined;

      const token = await exchangeCode(code);
      const user = await fetchUser(token.access_token);
      const isMod = await hasModRole(token.access_token);

      req.session.user = { id: user.id, username: user.username, isMod };
      return res.redirect('/');
    } catch (err) {
      console.error('OAuth callback error:', err);
      return res.status(500).send(renderError('Login failed — please try again.'));
    }
  });

  app.post('/auth/logout', (req, res) => {
    req.session = null;
    res.redirect('/');
  });

  registerRoutes(app);

  const port = Number(process.env.DASHBOARD_PORT || 3000);
  app.listen(port, () => console.log(`✓ Dashboard on :${port}`));
}
