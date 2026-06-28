// ── State ──────────────────────────────────────────────────────────
let ALL_LOGS   = {};
let CHART_OBJ  = {};
const TODAY    = new Date().toISOString().slice(0, 10);

// ── Boot ───────────────────────────────────────────────────────────
AUTH.guard().then(ok => {
  if (!ok) return;

  document.getElementById('signout-btn')
    .addEventListener('click', () => AUTH.logout());

  document.getElementById('log-date').textContent =
    new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  loadAvatarInitials();
  fetchLogs();
});

// ── Helpers ────────────────────────────────────────────────────────
function loadAvatarInitials() {
  fetch('/api/profile').then(r => r.json()).then(p => {
    const el = document.getElementById('nav-avatar');
    if (el && p.name) {
      el.textContent = p.name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
    }
  }).catch(() => {});
}

// ── Fetch & render ─────────────────────────────────────────────────
function fetchLogs() {
  fetch('/api/logs')
    .then(r => r.json())
    .then(data => {
      ALL_LOGS = data || {};
      prefillToday();
      renderCharts();
      renderHistory();
    })
    .catch(() => {
      setStatus('Could not load logs.', true);
    });
}

function prefillToday() {
  const entry = ALL_LOGS[TODAY];
  if (!entry) {
    document.getElementById('log-form-label').textContent = 'Log Today';
    return;
  }
  document.getElementById('log-form-label').textContent = 'Update Today\'s Log';
  if (entry.vo2max       != null) document.getElementById('log-vo2').value    = entry.vo2max;
  if (entry.sleep_score  != null) document.getElementById('log-sleep').value  = entry.sleep_score;
  if (entry.body_battery != null) document.getElementById('log-battery').value = entry.body_battery;
  if (entry.weight_kg    != null) document.getElementById('log-weight').value = entry.weight_kg;
  if (entry.waist_cm     != null) document.getElementById('log-waist').value  = entry.waist_cm;
  if (entry.notes)                document.getElementById('log-notes').value  = entry.notes;
}

// ── Submit ─────────────────────────────────────────────────────────
function submitLog() {
  const vo2    = parseFloat(document.getElementById('log-vo2').value)    || null;
  const sleep  = parseFloat(document.getElementById('log-sleep').value)  || null;
  const battery = parseFloat(document.getElementById('log-battery').value) || null;
  const weight  = parseFloat(document.getElementById('log-weight').value) || null;
  const waist   = parseFloat(document.getElementById('log-waist').value)  || null;
  const notes  = document.getElementById('log-notes').value.trim();

  const btn = document.getElementById('log-submit-btn');
  btn.disabled = true;

  fetch('/api/logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vo2max: vo2, sleep_score: sleep, body_battery: battery, weight_kg: weight, waist_cm: waist, notes }),
  })
    .then(r => r.json())
    .then(() => {
      setStatus('Saved!', false);
      setTimeout(() => setStatus(''), 3000);
      fetchLogs();
    })
    .catch(() => setStatus('Error saving.', true))
    .finally(() => { btn.disabled = false; });
}

function setStatus(msg, isErr = false) {
  const el = document.getElementById('log-status');
  el.textContent = msg;
  el.className = 'log-status' + (msg ? (isErr ? ' err' : ' ok') : '');
}

// ── Charts ─────────────────────────────────────────────────────────
const CHART_DEFS = [
  { id: 'chart-sleep',  key: 'sleep_score',  label: 'Sleep Score', color: '#6366f1' },
  { id: 'chart-battery', key: 'body_battery', label: 'Body Battery', color: '#f59e0b' },
  { id: 'chart-vo2',    key: 'vo2max',       label: 'VO₂ Max', color: '#10b981' },
  { id: 'chart-weight', key: 'weight_kg',    label: 'Weight (kg)', color: '#3b82f6' },
];

function renderCharts() {
  const sorted  = Object.keys(ALL_LOGS).sort();
  const hasData = sorted.some(d =>
    CHART_DEFS.some(def => ALL_LOGS[d][def.key] != null)
  );

  const section = document.getElementById('charts-section');
  const noData  = document.getElementById('no-chart-data');

  if (!hasData) {
    section.style.display = 'none';
    noData.style.display  = 'block';
    return;
  }
  section.style.display = '';
  noData.style.display  = 'none';

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const textColor = isDark ? '#4a4a4a' : '#9a9a9a';

  CHART_DEFS.forEach(def => {
    const labels = [];
    const values = [];

    sorted.forEach(date => {
      const v = ALL_LOGS[date][def.key];
      if (v != null) {
        labels.push(fmtDate(date));
        values.push(v);
      }
    });

    const canvas = document.getElementById(def.id);
    if (!canvas) return;

    if (CHART_OBJ[def.id]) {
      CHART_OBJ[def.id].destroy();
    }

    CHART_OBJ[def.id] = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data: values,
          borderColor: def.color,
          backgroundColor: def.color + '18',
          borderWidth: 2,
          pointRadius: labels.length < 20 ? 4 : 2,
          pointBackgroundColor: def.color,
          tension: 0.35,
          fill: true,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: items => items[0].label,
              label: item => item.parsed.y,
            },
          },
        },
        scales: {
          x: {
            ticks: { color: textColor, font: { size: 10 }, maxTicksLimit: 8 },
            grid:  { color: gridColor },
          },
          y: {
            ticks: { color: textColor, font: { size: 10 } },
            grid:  { color: gridColor },
            beginAtZero: false,
          },
        },
      },
    });
  });
}

function fmtDate(iso) {
  const [, m, d] = iso.split('-');
  return `${parseInt(d)} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(m)-1]}`;
}

// ── History ────────────────────────────────────────────────────────
function renderHistory() {
  const container = document.getElementById('log-history');
  const sorted = Object.keys(ALL_LOGS).sort().reverse();

  if (sorted.length === 0) {
    container.innerHTML = '<p class="log-empty-msg">No entries yet. Log your first day above.</p>';
    return;
  }

  const list = document.createElement('div');
  list.className = 'log-history-list';

  sorted.forEach(date => {
    const entry = ALL_LOGS[date];
    list.appendChild(buildEntryEl(date, entry));
  });

  container.innerHTML = '';
  container.appendChild(list);
}

function buildEntryEl(date, entry) {
  const el = document.createElement('div');
  el.className = 'log-entry';
  el.dataset.date = date;

  const isToday = date === TODAY;
  const label   = isToday ? 'Today' : fmtDateFull(date);

  const chips = [];
  if (entry.vo2max       != null) chips.push({ label: 'VO₂ Max',      val: entry.vo2max + ' mL/kg/min' });
  if (entry.sleep_score  != null) chips.push({ label: 'Sleep',        val: entry.sleep_score + '/100' });
  if (entry.body_battery != null) chips.push({ label: 'Battery',      val: entry.body_battery + '/100' });
  if (entry.weight_kg    != null) chips.push({ label: 'Weight',       val: entry.weight_kg + ' kg' });
  if (entry.waist_cm     != null) chips.push({ label: 'Waist',        val: entry.waist_cm + ' cm' });

  const chipsHTML = chips.map(c =>
    `<span class="log-chip"><span class="log-chip-label">${c.label}</span>${c.val}</span>`
  ).join('');

  const notesHTML = entry.notes
    ? `<div class="log-entry-notes">${escHtml(entry.notes)}</div>`
    : '';

  el.innerHTML = `
    <div class="log-entry-top">
      <span class="log-entry-date">${label}</span>
      <button class="log-entry-delete" onclick="deleteEntry('${date}')">Delete</button>
    </div>
    <div class="log-chips">${chipsHTML || '<span class="log-chip" style="color:var(--text-dim)">No metrics</span>'}</div>
    ${notesHTML}
  `;

  return el;
}

function fmtDateFull(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
  });
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function deleteEntry(date) {
  if (!confirm(`Delete log for ${date}?`)) return;
  fetch(`/api/logs/${date}`, { method: 'DELETE' })
    .then(() => fetchLogs())
    .catch(() => setStatus('Error deleting.', true));
}
