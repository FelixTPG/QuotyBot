import { addApproved, countByStatus, deleteQuote, getAll, getAnyById, setStatus, updateQuote } from '../database/index.js';
import { requireMod } from './auth.js';
import { renderDashboard, renderEdit, renderError, renderLogin } from './views.js';

const STATUSES = ['pending', 'approved', 'rejected'];

export function registerRoutes(app) {
  app.get('/', (req, res) => {
    const user = req.session?.user;
    if (!user?.isMod) return res.send(renderLogin(user));

    const filter = STATUSES.includes(req.query.status) ? req.query.status : 'all';
    const quotes = getAll(filter === 'all' ? null : filter);
    res.send(renderDashboard(quotes, filter, user, countByStatus()));
  });

  app.post('/quotes', requireMod, (req, res) => {
    const text = (req.body.text || '').trim();
    const author = (req.body.author || '').trim();
    if (text && author) addApproved(text, author, req.session.user.id);
    res.redirect('/');
  });

  app.post('/quotes/:id/approve', requireMod, (req, res) => {
    setStatus(Number(req.params.id), 'approved');
    res.redirect(backTo(req));
  });

  app.post('/quotes/:id/reject', requireMod, (req, res) => {
    setStatus(Number(req.params.id), 'rejected');
    res.redirect(backTo(req));
  });

  app.post('/quotes/:id/delete', requireMod, (req, res) => {
    deleteQuote(Number(req.params.id));
    res.redirect(backTo(req));
  });

  app.get('/quotes/:id/edit', requireMod, (req, res) => {
    const quote = getAnyById(Number(req.params.id));
    if (!quote) return res.status(404).send(renderError('Quote not found.'));
    res.send(renderEdit(quote, req.session.user));
  });

  app.post('/quotes/:id/edit', requireMod, (req, res) => {
    const text = (req.body.text || '').trim();
    const author = (req.body.author || '').trim();
    if (text && author) updateQuote(Number(req.params.id), text, author);
    res.redirect('/');
  });
}

// Return to the same filtered view the action was triggered from.
function backTo(req) {
  const referer = req.get('referer');
  return referer && referer.includes('/?') ? referer : '/';
}
