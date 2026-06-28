// ── Notes crypto + state ───────────────────────────────────────────
const MODE_KEY   = 'keirxn_notes_mode';   // 'plain' | 'encrypted' | 'later' | null
const SALT_KEY   = 'keirxn_notes_salt';   // base64 salt
const VERIFY_KEY = 'keirxn_notes_verify'; // JSON {ct,iv}
const VERIFY_STR = 'keirxn_notes_v1';

let _cryptoKey = null; // AES-GCM CryptoKey (in-memory only)

function notesMode() { return localStorage.getItem(MODE_KEY); }
function isUnlocked() { return notesMode() === 'plain' || notesMode() === 'later' || _cryptoKey !== null; }

// ── Crypto helpers ─────────────────────────────────────────────────
function b64enc(arr) { return btoa(String.fromCharCode(...new Uint8Array(arr))); }
function b64dec(s)   { return Uint8Array.from(atob(s), c => c.charCodeAt(0)); }

async function deriveKey(password, salt) {
  const raw = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    raw,
    { name: 'AES-GCM', length: 256 },
    false, ['encrypt', 'decrypt']
  );
}

async function encryptStr(text, key) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, key, new TextEncoder().encode(text)
  );
  return { ct: b64enc(ct), iv: b64enc(iv) };
}

async function decryptStr(ct_b64, iv_b64, key) {
  const buf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: b64dec(iv_b64) }, key, b64dec(ct_b64)
  );
  return new TextDecoder().decode(buf);
}

// ── Encryption setup ───────────────────────────────────────────────
async function setupEncryption(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  _cryptoKey = await deriveKey(password, salt);
  const verify = await encryptStr(VERIFY_STR, _cryptoKey);
  localStorage.setItem(SALT_KEY,   b64enc(salt));
  localStorage.setItem(VERIFY_KEY, JSON.stringify(verify));
  localStorage.setItem(MODE_KEY,   'encrypted');
}

async function unlockWithPassword(password) {
  const salt   = b64dec(localStorage.getItem(SALT_KEY) || '');
  const verify = JSON.parse(localStorage.getItem(VERIFY_KEY) || '{}');
  if (!salt.length || !verify.ct) throw new Error('No encryption data found');
  const candidate = await deriveKey(password, salt);
  const plain = await decryptStr(verify.ct, verify.iv, candidate);
  if (plain !== VERIFY_STR) throw new Error('Incorrect password');
  _cryptoKey = candidate;
}

async function changePassword(oldPw, newPw) {
  await unlockWithPassword(oldPw); // validates old password
  const allNotes = await fetchNotesRaw();
  // re-encrypt all encrypted notes with new key before changing key
  const oldKey = _cryptoKey;
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const newKey = await deriveKey(newPw, salt);
  const rewrites = allNotes.filter(n => n.encrypted);
  for (const note of rewrites) {
    try {
      const plain = await decryptStr(note.body, note.iv, oldKey);
      const enc   = await encryptStr(plain, newKey);
      await fetch(`/api/notes/${note.id}`, { method: 'DELETE' });
      await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: note.title, body: enc.ct, encrypted: true, iv: enc.iv }),
      });
    } catch {}
  }
  _cryptoKey = newKey;
  const verify = await encryptStr(VERIFY_STR, newKey);
  localStorage.setItem(SALT_KEY,   b64enc(salt));
  localStorage.setItem(VERIFY_KEY, JSON.stringify(verify));
}

async function disableEncryption(password) {
  await unlockWithPassword(password);
  const allNotes = await fetchNotesRaw();
  for (const note of allNotes.filter(n => n.encrypted)) {
    try {
      const plain = await decryptStr(note.body, note.iv, _cryptoKey);
      await fetch(`/api/notes/${note.id}`, { method: 'DELETE' });
      await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: note.title, body: plain, encrypted: false }),
      });
    } catch {}
  }
  _cryptoKey = null;
  localStorage.setItem(MODE_KEY, 'plain');
  localStorage.removeItem(SALT_KEY);
  localStorage.removeItem(VERIFY_KEY);
}

// ── CRUD ───────────────────────────────────────────────────────────
async function fetchNotesRaw() {
  return fetch('/api/notes').then(r => r.json()).catch(() => []);
}

async function saveNote(title, body) {
  let stored = body, encrypted = false, iv = null;
  if (notesMode() === 'encrypted' && _cryptoKey) {
    const enc = await encryptStr(body, _cryptoKey);
    stored    = enc.ct;
    iv        = enc.iv;
    encrypted = true;
  }
  return fetch('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, body: stored, encrypted, iv }),
  }).then(r => r.json());
}

async function deleteNote(id) {
  return fetch(`/api/notes/${id}`, { method: 'DELETE' }).then(r => r.json());
}

async function decryptNoteBody(note) {
  if (!note.encrypted) return note.body;
  if (!_cryptoKey)     return null; // locked
  try { return await decryptStr(note.body, note.iv, _cryptoKey); }
  catch { return null; }
}

// ── Shared render helpers ──────────────────────────────────────────
function fmtNoteDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    + ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function notePreview(body, len = 120) {
  if (!body) return '';
  return body.length > len ? body.slice(0, len).trimEnd() + '…' : body;
}

function escHtmlNotes(s) {
  return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── DASHBOARD init ─────────────────────────────────────────────────
async function initDashboardNotes() {
  const mode = notesMode();

  if (mode === null) {
    showDashState('setup');
    bindSetupButtons();
  } else if (mode === 'encrypted' && !_cryptoKey) {
    showDashState('locked');
    bindUnlockForm();
  } else {
    showDashState('active');
    await loadAndRenderDash();
  }

  bindNotesSettingsModal();
}

function showDashState(state) {
  ['setup', 'locked', 'active'].forEach(s => {
    const el = document.getElementById(`notes-state-${s}`);
    if (el) el.style.display = s === state ? '' : 'none';
  });
  const settBtn = document.getElementById('notes-settings-btn');
  const encPill = document.getElementById('notes-enc-pill');
  if (settBtn) settBtn.style.display = state === 'active' ? '' : 'none';
  if (encPill && state === 'active') {
    const m = notesMode();
    encPill.textContent  = m === 'encrypted' ? '🔒 Encrypted' : m === 'later' ? 'Encryption off' : '';
    encPill.className    = 'notes-enc-pill' + (m === 'encrypted' ? ' enc-on' : ' enc-off');
  }
}

function bindSetupButtons() {
  document.getElementById('notes-setup-set-pw')?.addEventListener('click', () => {
    openModal('notes-pw-modal');
    showPwForm('setup');
  });
  document.getElementById('notes-setup-skip')?.addEventListener('click', () => {
    localStorage.setItem(MODE_KEY, 'plain');
    showDashState('active');
    loadAndRenderDash();
  });
  document.getElementById('notes-setup-later')?.addEventListener('click', () => {
    localStorage.setItem(MODE_KEY, 'later');
    showDashState('active');
    loadAndRenderDash();
  });
}

function bindUnlockForm() {
  const btn = document.getElementById('notes-unlock-btn');
  const inp = document.getElementById('notes-unlock-pw');
  const err = document.getElementById('notes-unlock-err');

  async function doUnlock() {
    err.textContent = '';
    btn.disabled    = true;
    try {
      await unlockWithPassword(inp.value);
      showDashState('active');
      loadAndRenderDash();
    } catch {
      err.textContent = 'Incorrect password.';
    } finally { btn.disabled = false; }
  }

  btn?.addEventListener('click', doUnlock);
  inp?.addEventListener('keydown', e => { if (e.key === 'Enter') doUnlock(); });
}

async function loadAndRenderDash() {
  const list   = document.getElementById('notes-dash-list');
  const empty  = document.getElementById('notes-dash-empty');
  if (!list) return;
  list.innerHTML = '<div class="notes-loading">Loading…</div>';

  const raw = await fetchNotesRaw();
  list.innerHTML = '';

  if (raw.length === 0) {
    if (empty) empty.style.display = '';
    return;
  }
  if (empty) empty.style.display = 'none';

  const preview5 = raw.slice(0, 5);
  for (const note of preview5) {
    const body = await decryptNoteBody(note);
    list.appendChild(buildNoteCard(note, body, 'dash'));
  }

  const viewAll = document.getElementById('notes-view-all');
  if (viewAll) viewAll.style.display = raw.length > 5 ? '' : 'none';
}

function buildNoteCard(note, body, context) {
  const card = document.createElement('div');
  card.className = 'note-card';
  card.dataset.id = note.id;

  const locked   = note.encrypted && body === null;
  const bodyHtml = locked
    ? '<span class="note-body-locked">🔒 Encrypted — unlock to view</span>'
    : `<p class="note-body-preview">${escHtmlNotes(notePreview(body))}</p>`;

  card.innerHTML = `
    <div class="note-card-top">
      <div class="note-card-title-row">
        <span class="note-card-title">${escHtmlNotes(note.title)}</span>
        ${note.encrypted ? '<span class="note-lock-icon">🔒</span>' : ''}
      </div>
      <button class="note-card-del" onclick="handleDeleteNote('${note.id}', '${context}')" title="Delete">×</button>
    </div>
    ${bodyHtml}
    <div class="note-card-date">${fmtNoteDate(note.created_at)}</div>
  `;
  return card;
}

async function handleDeleteNote(id, context) {
  if (!confirm('Delete this note?')) return;
  await deleteNote(id);
  if (context === 'dash')    loadAndRenderDash();
  if (context === 'logs')    loadAndRenderLogs();
}

// ── Save note (dashboard) ──────────────────────────────────────────
window.submitNote = async function() {
  const titleEl = document.getElementById('note-title');
  const bodyEl  = document.getElementById('note-body');
  const status  = document.getElementById('note-save-status');
  const btn     = document.getElementById('note-save-btn');

  const title = titleEl.value.trim();
  const body  = bodyEl.value.trim();
  if (!body) { status.textContent = 'Write something first.'; status.className = 'notes-save-status err'; return; }

  btn.disabled = true;
  status.textContent = '';
  try {
    await saveNote(title, body);
    titleEl.value = '';
    bodyEl.value  = '';
    status.textContent = 'Saved!';
    status.className   = 'notes-save-status ok';
    setTimeout(() => { status.textContent = ''; }, 2500);
    loadAndRenderDash();
  } catch {
    status.textContent = 'Error saving note.';
    status.className   = 'notes-save-status err';
  } finally { btn.disabled = false; }
};

// ── Notes sort state (Logs page) ──────────────────────────────────
let _sortField = 'date'; // 'date' | 'name'
let _sortDir   = { date: 'desc', name: 'asc' }; // per-field direction

window.setNotesSort = function(field) {
  if (_sortField === field) {
    // same field — toggle direction (like Windows File Explorer)
    _sortDir[field] = _sortDir[field] === 'asc' ? 'desc' : 'asc';
  } else {
    // new field — apply its last-used (or default) direction
    _sortField = field;
  }
  updateSortUI();
  loadAndRenderLogs();
};

function updateSortUI() {
  ['date', 'name'].forEach(f => {
    const btn   = document.getElementById(`nf-${f}`);
    const arrow = document.getElementById(`nf-${f}-arrow`);
    if (!btn) return;
    btn.classList.toggle('active', f === _sortField);
    if (arrow) arrow.textContent = _sortDir[f] === 'asc' ? '↑' : '↓';
  });
}

function sortNotes(notes) {
  return [...notes].sort((a, b) => {
    let cmp = 0;
    if (_sortField === 'date') {
      cmp = new Date(a.created_at) - new Date(b.created_at);
    } else {
      cmp = a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
    }
    return _sortDir[_sortField] === 'asc' ? cmp : -cmp;
  });
}

// ── LOGS init ──────────────────────────────────────────────────────
async function initLogsNotes() {
  const mode = notesMode();

  const section = document.getElementById('logs-notes-section');
  if (!section) return;

  updateSortUI();

  if (mode === null || (mode === 'encrypted' && !_cryptoKey)) {
    // Show a minimal unlock/setup prompt inline
    const msgEl = document.getElementById('logs-notes-msg');
    if (msgEl) {
      if (mode === null) {
        msgEl.innerHTML = 'Set up notes on the <a href="index.html">Dashboard</a> to start using them.';
      } else {
        msgEl.innerHTML = 'Notes are encrypted — <a href="index.html">go to Dashboard</a> to unlock.';
      }
      msgEl.style.display = '';
    }
    return;
  }

  loadAndRenderLogs();
}

async function loadAndRenderLogs() {
  const list  = document.getElementById('logs-notes-list');
  const empty = document.getElementById('logs-notes-empty');
  if (!list) return;

  list.innerHTML = '<div class="notes-loading">Loading…</div>';
  const raw    = await fetchNotesRaw();
  const sorted = sortNotes(raw);
  list.innerHTML = '';

  if (sorted.length === 0) {
    if (empty) empty.style.display = '';
    return;
  }
  if (empty) empty.style.display = 'none';

  for (const note of sorted) {
    const body = await decryptNoteBody(note);
    list.appendChild(buildNoteCard(note, body, 'logs'));
  }
}

// ── Settings modal ─────────────────────────────────────────────────
function bindNotesSettingsModal() {
  document.getElementById('notes-settings-btn')?.addEventListener('click', openNotesSettings);
  document.getElementById('notes-settings-close')?.addEventListener('click', () => closeModal('notes-settings-modal'));
  document.getElementById('notes-settings-overlay')?.addEventListener('click', () => closeModal('notes-settings-modal'));

  document.getElementById('ns-enable-enc-btn')?.addEventListener('click', () => {
    closeModal('notes-settings-modal');
    openModal('notes-pw-modal');
    showPwForm('setup');
  });

  document.getElementById('ns-change-pw-btn')?.addEventListener('click', () => {
    closeModal('notes-settings-modal');
    openModal('notes-pw-modal');
    showPwForm('change');
  });

  document.getElementById('ns-disable-enc-btn')?.addEventListener('click', () => {
    closeModal('notes-settings-modal');
    openModal('notes-pw-modal');
    showPwForm('disable');
  });

  // Password modal submit
  document.getElementById('notes-pw-close')?.addEventListener('click', () => closeModal('notes-pw-modal'));
  document.getElementById('notes-pw-overlay')?.addEventListener('click', () => closeModal('notes-pw-modal'));
  document.getElementById('notes-pw-submit')?.addEventListener('click', handlePwSubmit);
  document.getElementById('notes-pw-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') handlePwSubmit();
  });
  document.getElementById('notes-pw-confirm')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') handlePwSubmit();
  });
}

let _pwFormMode = 'setup';

function showPwForm(mode) {
  _pwFormMode = mode;
  const oldRow  = document.getElementById('notes-pw-old-row');
  const confRow = document.getElementById('notes-pw-conf-row');
  const title   = document.getElementById('notes-pw-modal-title');
  const err     = document.getElementById('notes-pw-err');
  const desc    = document.getElementById('notes-pw-desc');

  ['notes-pw-input', 'notes-pw-confirm', 'notes-pw-old'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  if (err) err.textContent = '';

  if (mode === 'setup') {
    if (title)  title.textContent = 'Set a password';
    if (desc)   desc.textContent  = 'All future notes will be encrypted with this password. It is never sent to the server.';
    if (oldRow) oldRow.style.display  = 'none';
    if (confRow) confRow.style.display = '';
  } else if (mode === 'change') {
    if (title)  title.textContent = 'Change password';
    if (desc)   desc.textContent  = 'All existing encrypted notes will be re-encrypted with the new password.';
    if (oldRow) oldRow.style.display  = '';
    if (confRow) confRow.style.display = '';
  } else if (mode === 'disable') {
    if (title)  title.textContent = 'Remove encryption';
    if (desc)   desc.textContent  = 'Enter your current password. All notes will be decrypted and stored as plain text.';
    if (oldRow) oldRow.style.display  = '';
    if (confRow) confRow.style.display = 'none';
  }
}

async function handlePwSubmit() {
  const err    = document.getElementById('notes-pw-err');
  const btn    = document.getElementById('notes-pw-submit');
  const pw     = document.getElementById('notes-pw-input')?.value || '';
  const conf   = document.getElementById('notes-pw-confirm')?.value || '';
  const oldPw  = document.getElementById('notes-pw-old')?.value || '';
  err.textContent = '';
  btn.disabled    = true;

  try {
    if (_pwFormMode === 'setup') {
      if (pw.length < 6) throw new Error('Password must be at least 6 characters.');
      if (pw !== conf)   throw new Error('Passwords do not match.');
      await setupEncryption(pw);
      closeModal('notes-pw-modal');
      showDashState('active');
      loadAndRenderDash();

    } else if (_pwFormMode === 'change') {
      if (!oldPw)      throw new Error('Enter your current password.');
      if (pw.length < 6) throw new Error('New password must be at least 6 characters.');
      if (pw !== conf) throw new Error('Passwords do not match.');
      btn.textContent = 'Re-encrypting…';
      await changePassword(oldPw, pw);
      closeModal('notes-pw-modal');
      loadAndRenderDash();

    } else if (_pwFormMode === 'disable') {
      if (!oldPw) throw new Error('Enter your current password.');
      btn.textContent = 'Decrypting…';
      await disableEncryption(oldPw);
      closeModal('notes-pw-modal');
      showDashState('active');
      loadAndRenderDash();
    }
  } catch (e) {
    err.textContent = e.message || 'Something went wrong.';
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Confirm';
  }
}

function openNotesSettings() {
  const mode = notesMode();
  const enableRow  = document.getElementById('ns-enable-row');
  const changeRow  = document.getElementById('ns-change-row');
  const disableRow = document.getElementById('ns-disable-row');

  if (enableRow)  enableRow.style.display  = (mode !== 'encrypted') ? '' : 'none';
  if (changeRow)  changeRow.style.display  = (mode === 'encrypted') ? '' : 'none';
  if (disableRow) disableRow.style.display = (mode === 'encrypted') ? '' : 'none';

  openModal('notes-settings-modal');
}

// ── Modal helpers ──────────────────────────────────────────────────
function openModal(id) {
  document.getElementById(id + '-overlay')?.classList.remove('hidden');
  document.getElementById(id)?.classList.remove('hidden');
}
function closeModal(id) {
  document.getElementById(id + '-overlay')?.classList.add('hidden');
  document.getElementById(id)?.classList.add('hidden');
}

// â”€â”€ NOTES PAGE init â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let _pageSort   = 'date';
let _pageSearch = '';
let _pageNotes  = [];
let _pageEditId = null;

async function initNotesPage() {
  const mode = notesMode();
  if (mode === null) {
    showPageState('setup');
    bindPageSetupButtons();
  } else if (mode === 'encrypted' && !_cryptoKey) {
    showPageState('locked');
    bindPageUnlockForm();
  } else {
    showPageState('active');
    await loadAndRenderPage();
  }
  bindPageModals();
  bindComposeModal();
}

function showPageState(state) {
  ['setup', 'locked', 'active'].forEach(s => {
    const el = document.getElementById('np-state-' + s);
    if (el) el.style.display = s === state ? '' : 'none';
  });
  const fab = document.getElementById('np-fab');
  if (fab) fab.style.display = state === 'active' ? '' : 'none';
}

function bindPageSetupButtons() {
  document.getElementById('np-setup-set-pw')?.addEventListener('click', () => {
    openModal('np-pw-modal');
    showNpPwForm('setup');
  });
  document.getElementById('np-setup-skip')?.addEventListener('click', () => {
    localStorage.setItem(MODE_KEY, 'plain');
    showPageState('active');
    loadAndRenderPage();
  });
  document.getElementById('np-setup-later')?.addEventListener('click', () => {
    localStorage.setItem(MODE_KEY, 'later');
    showPageState('active');
    loadAndRenderPage();
  });
}

function bindPageUnlockForm() {
  const btn = document.getElementById('np-unlock-btn');
  const inp = document.getElementById('np-unlock-pw');
  const err = document.getElementById('np-unlock-err');
  async function doUnlock() {
    if (err) err.textContent = '';
    if (btn) btn.disabled = true;
    try {
      await unlockWithPassword(inp.value);
      showPageState('active');
      await loadAndRenderPage();
    } catch {
      if (err) err.textContent = 'Incorrect password.';
    } finally { if (btn) btn.disabled = false; }
  }
  btn?.addEventListener('click', doUnlock);
  inp?.addEventListener('keydown', e => { if (e.key === 'Enter') doUnlock(); });
}

window.setPageSort = function(field) {
  _pageSort = field;
  document.querySelectorAll('.np-sort-tab').forEach(t => t.classList.remove('active'));
  const tab = document.getElementById(field === 'alpha' ? 'npt-alpha' : 'npt-date');
  if (tab) tab.classList.add('active');
  renderPageList();
};

async function loadAndRenderPage() {
  const list = document.getElementById('np-list');
  if (!list) return;
  list.innerHTML = '<div style="padding:40px 0;text-align:center;color:var(--text-dim);font-size:0.85rem">Loadingâ€¦</div>';
  const raw = await fetchNotesRaw();
  _pageNotes = await Promise.all(raw.map(async n => ({ ...n, _body: await decryptNoteBody(n) })));
  renderPageList();
}

function renderPageList() {
  const list  = document.getElementById('np-list');
  const empty = document.getElementById('np-empty');
  if (!list) return;

  const query = _pageSearch.toLowerCase().trim();
  let notes   = _pageNotes;
  if (query) {
    notes = notes.filter(n =>
      (n.title || '').toLowerCase().includes(query) ||
      (n._body  || '').toLowerCase().includes(query)
    );
  }

  list.innerHTML = '';
  if (notes.length === 0) {
    if (empty) empty.style.display = '';
    return;
  }
  if (empty) empty.style.display = 'none';

  const groups = _pageSort === 'alpha' ? _groupByAlpha(notes) : _groupByDate(notes);
  for (const { label, notes: grp } of groups) {
    const header = document.createElement('div');
    header.className = 'np-group-header';
    header.textContent = label;
    list.appendChild(header);
    grp.forEach(n => list.appendChild(_buildPageCard(n)));
  }
}

function _groupByDate(notes) {
  const now        = new Date();
  const startOf    = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const todayStart = startOf(now);
  const ystStart   = new Date(todayStart); ystStart.setDate(todayStart.getDate() - 1);
  const weekStart  = new Date(todayStart); weekStart.setDate(todayStart.getDate() - 7);
  const monthStart = new Date(todayStart); monthStart.setDate(todayStart.getDate() - 30);

  const sorted   = [...notes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const assigned = new Set();
  const buckets  = [
    { label: 'Today',        test: d => d >= todayStart },
    { label: 'Yesterday',    test: d => d >= ystStart   && d < todayStart },
    { label: 'This Week',    test: d => d >= weekStart  && d < ystStart },
    { label: 'Last 30 Days', test: d => d >= monthStart && d < weekStart },
    { label: 'Older',        test: () => true },
  ];
  const groups = [];
  for (const { label, test } of buckets) {
    const grp = sorted.filter(n => !assigned.has(n.id) && test(new Date(n.created_at)));
    if (grp.length) { grp.forEach(n => assigned.add(n.id)); groups.push({ label, notes: grp }); }
  }
  return groups;
}

function _groupByAlpha(notes) {
  const sorted = [...notes].sort((a, b) => {
    const ta = (a.title || '').trim()[0]?.toUpperCase() || '#';
    const tb = (b.title || '').trim()[0]?.toUpperCase() || '#';
    if (ta === '#' && tb !== '#') return 1;
    if (tb === '#' && ta !== '#') return -1;
    return ta.localeCompare(tb) || (a.title || '').localeCompare(b.title || '');
  });
  const map = new Map();
  for (const n of sorted) {
    const first = (n.title || '').trim()[0]?.toUpperCase() || '#';
    const key   = /^[A-Z]$/.test(first) ? first : '#';
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(n);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b))
    .map(([label, notes]) => ({ label, notes }));
}

function _fmtPageDate(iso) {
  if (!iso) return '';
  const d   = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const yst = new Date(now); yst.setDate(now.getDate() - 1);
  if (d.toDateString() === yst.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function _buildPageCard(note) {
  const card     = document.createElement('div');
  card.className = 'np-card';
  const title    = note.title || 'Untitled';
  const bodyLine = (note.encrypted && note._body === null)
    ? 'ðŸ”’ Encrypted'
    : ((note._body || '').split('\n')[0].slice(0, 80));
  card.innerHTML =
    '<div class="np-card-title">' + escHtmlNotes(title) + '</div>' +
    '<div class="np-card-meta">' +
      '<span class="np-card-meta-date">' + _fmtPageDate(note.created_at) + '</span>' +
      '<span class="np-card-meta-preview">' + escHtmlNotes(bodyLine) + '</span>' +
    '</div>';
  card.addEventListener('click', () => openComposeModal(note));
  return card;
}

// â”€â”€ Compose/Edit modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function bindComposeModal() {
  document.getElementById('np-fab')?.addEventListener('click', () => openComposeModal(null));
  document.getElementById('np-compose-back')?.addEventListener('click', closeComposeModal);
  document.getElementById('np-compose-overlay')?.addEventListener('click', closeComposeModal);
  document.getElementById('np-compose-save')?.addEventListener('click', saveComposeModal);
  document.getElementById('np-compose-del')?.addEventListener('click', deleteFromCompose);

  const searchEl = document.getElementById('np-search');
  if (searchEl) {
    searchEl.addEventListener('input', e => { _pageSearch = e.target.value; renderPageList(); });
  }
}

function openComposeModal(note) {
  _pageEditId = note ? note.id : null;
  const titleEl = document.getElementById('nc-title');
  const bodyEl  = document.getElementById('nc-body');
  const tsEl    = document.getElementById('nc-timestamp');
  const delBtn  = document.getElementById('np-compose-del');
  if (titleEl) titleEl.value = note ? (note.title || '') : '';
  if (bodyEl)  bodyEl.value  = note ? (note._body  || '') : '';
  if (tsEl)    tsEl.textContent = note
    ? 'Created ' + fmtNoteDate(note.created_at) + (note.updated_at ? '  Â·  Edited ' + fmtNoteDate(note.updated_at) : '')
    : '';
  if (delBtn) delBtn.style.display = note ? '' : 'none';
  openModal('np-compose-modal');
  setTimeout(() => (note ? bodyEl?.focus() : titleEl?.focus()), 80);
}

function closeComposeModal() {
  closeModal('np-compose-modal');
  _pageEditId = null;
}

async function saveComposeModal() {
  const titleEl = document.getElementById('nc-title');
  const bodyEl  = document.getElementById('nc-body');
  const saveBtn = document.getElementById('np-compose-save');
  const title   = (titleEl?.value || '').trim();
  const body    = (bodyEl?.value  || '').trim();
  if (!body) return;
  if (saveBtn) saveBtn.disabled = true;
  try {
    if (_pageEditId) {
      let stored = body, encrypted = false, iv = null;
      if (notesMode() === 'encrypted' && _cryptoKey) {
        const enc = await encryptStr(body, _cryptoKey);
        stored = enc.ct; iv = enc.iv; encrypted = true;
      }
      await fetch('/api/notes/' + _pageEditId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body: stored, encrypted, iv }),
      });
    } else {
      await saveNote(title, body);
    }
    closeComposeModal();
    await loadAndRenderPage();
  } catch {
    alert('Error saving note.');
  } finally {
    if (saveBtn) saveBtn.disabled = false;
  }
}

async function deleteFromCompose() {
  if (!_pageEditId) return;
  if (!confirm('Delete this note?')) return;
  await deleteNote(_pageEditId);
  closeComposeModal();
  await loadAndRenderPage();
}

// â”€â”€ Notes page modals â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function bindPageModals() {
  document.getElementById('np-settings-btn')?.addEventListener('click', openNotesPageSettings);
  document.getElementById('np-pw-close')?.addEventListener('click', () => closeModal('np-pw-modal'));
  document.getElementById('np-pw-modal-overlay')?.addEventListener('click', () => closeModal('np-pw-modal'));
  document.getElementById('np-pw-submit')?.addEventListener('click', handleNpPwSubmit);
  document.getElementById('np-pw-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleNpPwSubmit();
  });
  document.getElementById('np-settings-close')?.addEventListener('click', () => closeModal('np-settings-modal'));
  document.getElementById('np-settings-modal-overlay')?.addEventListener('click', () => closeModal('np-settings-modal'));
  document.getElementById('np-enable-enc-btn')?.addEventListener('click', () => {
    closeModal('np-settings-modal');
    openModal('np-pw-modal');
    showNpPwForm('setup');
  });
  document.getElementById('np-change-pw-btn')?.addEventListener('click', () => {
    closeModal('np-settings-modal');
    openModal('np-pw-modal');
    showNpPwForm('change');
  });
  document.getElementById('np-disable-enc-btn')?.addEventListener('click', () => {
    closeModal('np-settings-modal');
    openModal('np-pw-modal');
    showNpPwForm('disable');
  });
}

let _npPwFormMode = 'setup';

function showNpPwForm(mode) {
  _npPwFormMode = mode;
  const oldRow  = document.getElementById('np-pw-old-row');
  const confRow = document.getElementById('np-pw-conf-row');
  const title   = document.getElementById('np-pw-modal-title');
  const err     = document.getElementById('np-pw-err');
  const desc    = document.getElementById('np-pw-desc');
  ['np-pw-input', 'np-pw-confirm', 'np-pw-old'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  if (err) err.textContent = '';
  const cfgs = {
    setup:   { title: 'Set a password',    desc: 'Future notes will be encrypted. Your password is never sent to the server.', showOld: false, showConf: true  },
    change:  { title: 'Change password',   desc: 'All existing encrypted notes will be re-encrypted.',                          showOld: true,  showConf: true  },
    disable: { title: 'Remove encryption', desc: 'Enter your current password to decrypt all notes.',                           showOld: true,  showConf: false },
  };
  const cfg = cfgs[mode] || cfgs.setup;
  if (title)  title.textContent = cfg.title;
  if (desc)   desc.textContent  = cfg.desc;
  if (oldRow) oldRow.style.display  = cfg.showOld  ? '' : 'none';
  if (confRow) confRow.style.display = cfg.showConf ? '' : 'none';
}

async function handleNpPwSubmit() {
  const err   = document.getElementById('np-pw-err');
  const btn   = document.getElementById('np-pw-submit');
  const pw    = document.getElementById('np-pw-input')?.value   || '';
  const conf  = document.getElementById('np-pw-confirm')?.value || '';
  const oldPw = document.getElementById('np-pw-old')?.value     || '';
  if (err) err.textContent = '';
  if (btn) btn.disabled = true;
  try {
    if (_npPwFormMode === 'setup') {
      if (pw.length < 6) throw new Error('Password must be at least 6 characters.');
      if (pw !== conf)   throw new Error('Passwords do not match.');
      await setupEncryption(pw);
      closeModal('np-pw-modal');
      showPageState('active');
      await loadAndRenderPage();
    } else if (_npPwFormMode === 'change') {
      if (!oldPw)        throw new Error('Enter your current password.');
      if (pw.length < 6) throw new Error('New password must be at least 6 characters.');
      if (pw !== conf)   throw new Error('Passwords do not match.');
      if (btn) btn.textContent = 'Re-encryptingâ€¦';
      await changePassword(oldPw, pw);
      closeModal('np-pw-modal');
      await loadAndRenderPage();
    } else if (_npPwFormMode === 'disable') {
      if (!oldPw) throw new Error('Enter your current password.');
      if (btn) btn.textContent = 'Decryptingâ€¦';
      await disableEncryption(oldPw);
      closeModal('np-pw-modal');
      showPageState('active');
      await loadAndRenderPage();
    }
  } catch (e) {
    if (err) err.textContent = e.message || 'Something went wrong.';
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Confirm'; }
  }
}

window.openNotesPageSettings = function() {
  const mode = notesMode();
  const enableRow  = document.getElementById('np-enable-row');
  const changeRow  = document.getElementById('np-change-row');
  const disableRow = document.getElementById('np-disable-row');
  if (enableRow)  enableRow.style.display  = mode !== 'encrypted' ? '' : 'none';
  if (changeRow)  changeRow.style.display  = mode === 'encrypted' ? '' : 'none';
  if (disableRow) disableRow.style.display = mode === 'encrypted' ? '' : 'none';
  openModal('np-settings-modal');
};

