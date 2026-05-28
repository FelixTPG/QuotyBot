// Environment variables the OAuth2 dashboard needs to run.
export const DASHBOARD_ENV = [
  'CLIENT_ID',
  'CLIENT_SECRET',
  'GUILD_ID',
  'MOD_ROLE_ID',
  'OAUTH_REDIRECT_URI',
  'SESSION_SECRET',
];

export const missingDashboardEnv = () => DASHBOARD_ENV.filter(key => !process.env[key]);

// Review only happens when the dashboard is fully configured. Otherwise there
// is no one to approve submissions, so they are published immediately.
export const isDashboardConfigured = () => missingDashboardEnv().length === 0;
