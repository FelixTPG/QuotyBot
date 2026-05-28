const esc = value =>
  String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));

const CSS = `
  :root {
    --bg: #0f0f10; --card: #1a1b1e; --card-2: #202225; --line: #2b2d31;
    --text: #e8e8ea; --muted: #9a9ba0; --blurple: #5865f2;
    --green: #57f287; --red: #ed4245; --amber: #faa61a;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--bg); color: var(--text);
    font: 15px/1.55 system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  }
  .wrap { max-width: 760px; margin: 0 auto; padding: 32px 20px 64px; }
  header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
  header h1 { font-size: 18px; font-weight: 650; margin: 0; letter-spacing: .2px; }
  header .who { color: var(--muted); font-size: 13px; }
  a { color: var(--blurple); text-decoration: none; }
  a:hover { text-decoration: underline; }
  .tabs { display: flex; gap: 6px; margin-bottom: 22px; flex-wrap: wrap; }
  .tab {
    padding: 6px 12px; border-radius: 999px; background: var(--card);
    color: var(--muted); font-size: 13px; border: 1px solid var(--line);
  }
  .tab.active { background: var(--blurple); color: #fff; border-color: var(--blurple); }
  .card { background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 18px; margin-bottom: 14px; }
  .quote-text { font-style: italic; }
  .quote-meta { color: var(--muted); font-size: 13px; margin-top: 8px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  .badge { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; padding: 2px 8px; border-radius: 6px; font-weight: 600; }
  .badge.pending { background: rgba(250,166,26,.15); color: var(--amber); }
  .badge.approved { background: rgba(87,242,135,.15); color: var(--green); }
  .badge.rejected { background: rgba(237,66,69,.15); color: var(--red); }
  .actions { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
  form.inline { display: inline; margin: 0; }
  button, .btn {
    font: inherit; font-size: 13px; cursor: pointer; border: 1px solid var(--line);
    background: var(--card-2); color: var(--text); padding: 7px 13px; border-radius: 9px;
  }
  button:hover, .btn:hover { border-color: var(--blurple); }
  button.green { background: rgba(87,242,135,.12); color: var(--green); border-color: transparent; }
  button.red { background: rgba(237,66,69,.12); color: var(--red); border-color: transparent; }
  button.primary { background: var(--blurple); color: #fff; border-color: var(--blurple); }
  .addbox { background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 18px; margin-bottom: 26px; }
  .addbox summary { cursor: pointer; color: var(--muted); font-size: 14px; }
  label { display: block; font-size: 12px; color: var(--muted); margin: 12px 0 5px; }
  input[type=text], textarea {
    width: 100%; background: var(--bg); border: 1px solid var(--line); border-radius: 9px;
    color: var(--text); padding: 9px 11px; font: inherit; resize: vertical;
  }
  input:focus, textarea:focus { outline: none; border-color: var(--blurple); }
  .empty { color: var(--muted); text-align: center; padding: 48px 0; }
  .login { text-align: center; padding: 80px 0; }
  .login p { color: var(--muted); }
`;

function layout(title, body) {
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title><style>${CSS}</style></head>
<body><main class="wrap">${body}</main></body></html>`;
}

export function renderLogin(user) {
  // user is set but lacks the mod role
  if (user) {
    return layout('Quoty · No access', `
      <div class="login">
        <h1>No access</h1>
        <p>Signed in as <strong>${esc(user.username)}</strong>, but you don't have the moderator role on this server.</p>
        <form class="inline" method="post" action="/auth/logout"><button>Log out</button></form>
      </div>`);
  }
  return layout('Quoty · Sign in', `
    <div class="login">
      <h1>Quoty · Moderation</h1>
      <p>Sign in with Discord to review and manage quotes.</p>
      <p><a class="btn primary" href="/auth/login">Sign in with Discord</a></p>
    </div>`);
}

export function renderError(message) {
  return layout('Quoty · Error', `
    <div class="login">
      <h1>Something went wrong</h1>
      <p>${esc(message)}</p>
      <p><a href="/">← Back</a></p>
    </div>`);
}

function quoteCard(q) {
  const actions = [];
  if (q.status !== 'approved') {
    actions.push(`<form class="inline" method="post" action="/quotes/${q.id}/approve"><button class="green">Approve</button></form>`);
  }
  if (q.status !== 'rejected') {
    actions.push(`<form class="inline" method="post" action="/quotes/${q.id}/reject"><button class="red">Reject</button></form>`);
  }
  actions.push(`<a class="btn" href="/quotes/${q.id}/edit">Edit</a>`);
  actions.push(`<form class="inline" method="post" action="/quotes/${q.id}/delete" onsubmit="return confirm('Delete quote #${q.id}?')"><button>Delete</button></form>`);

  return `<div class="card">
    <div class="quote-text">"${esc(q.text)}"</div>
    <div class="quote-meta">
      <span class="badge ${esc(q.status)}">${esc(q.status)}</span>
      <span>— ${esc(q.author)}</span>
      <span>· #${q.id}</span>
    </div>
    <div class="actions">${actions.join('')}</div>
  </div>`;
}

export function renderDashboard(quotes, filter, user, counts) {
  const tab = (key, label) => {
    const n = key === 'all'
      ? Object.values(counts).reduce((a, b) => a + b, 0)
      : counts[key] || 0;
    const active = filter === key ? ' active' : '';
    return `<a class="tab${active}" href="/?status=${key}">${label} ${n}</a>`;
  };

  const list = quotes.length
    ? quotes.map(quoteCard).join('')
    : '<div class="empty">No quotes here.</div>';

  return layout('Quoty · Moderation', `
    <header>
      <h1>Quoty · Moderation</h1>
      <span class="who">${esc(user.username)} ·
        <form class="inline" method="post" action="/auth/logout"><button>Log out</button></form>
      </span>
    </header>

    <details class="addbox">
      <summary>+ Add a quote</summary>
      <form method="post" action="/quotes">
        <label for="text">Quote</label>
        <textarea id="text" name="text" rows="3" maxlength="500" required></textarea>
        <label for="author">Author</label>
        <input id="author" type="text" name="author" maxlength="100" required>
        <div class="actions"><button class="primary" type="submit">Add quote</button></div>
      </form>
    </details>

    <div class="tabs">
      ${tab('all', 'All')}${tab('pending', 'Pending')}${tab('approved', 'Approved')}${tab('rejected', 'Rejected')}
    </div>

    ${list}`);
}

export function renderEdit(q, user) {
  return layout(`Quoty · Edit #${q.id}`, `
    <header>
      <h1>Edit quote #${q.id}</h1>
      <span class="who">${esc(user.username)}</span>
    </header>
    <form method="post" action="/quotes/${q.id}/edit" class="addbox">
      <label for="text">Quote</label>
      <textarea id="text" name="text" rows="3" maxlength="500" required>${esc(q.text)}</textarea>
      <label for="author">Author</label>
      <input id="author" type="text" name="author" maxlength="100" value="${esc(q.author)}" required>
      <div class="actions">
        <button class="primary" type="submit">Save</button>
        <a class="btn" href="/">Cancel</a>
      </div>
    </form>`);
}
