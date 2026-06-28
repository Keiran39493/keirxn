// ── Widget definitions ─────────────────────────────────────────────
const WIDGET_DEFS = [
  { id: 'sleep_score',    label: 'Sleep Score',        unit: '/100',       color: '#6366f1', source: 'log'      },
  { id: 'body_battery',   label: 'Body Battery',       unit: '/100',       color: '#f59e0b', source: 'log'      },
  { id: 'vo2max',         label: 'VO₂ Max',            unit: 'mL/kg/min',  color: '#10b981', source: 'log'      },
  { id: 'weight_kg',      label: 'Weight',             unit: 'kg',         color: '#3b82f6', source: 'log'      },
  { id: 'waist_cm',       label: 'Waist',              unit: 'cm',         color: '#8b5cf6', source: 'log'      },
  { id: 'whtr',           label: 'Waist-to-Height',    unit: '',           color: '#ec4899', source: 'computed' },
  { id: 'bmi',            label: 'BMI',                unit: '',           color: '#14b8a6', source: 'computed' },
  { id: 'hrv_ms',         label: 'HRV',                unit: 'ms',         color: '#f97316', source: 'profile'  },
  { id: 'resting_hr_bpm', label: 'Resting HR',         unit: 'bpm',        color: '#ef4444', source: 'profile'  },
  { id: 'spo2',           label: 'SpO₂',              unit: '%',          color: '#06b6d4', source: 'profile'  },
];

const WIDGET_KEY     = 'keirxn_widgets';
const DEFAULT_WIDGETS = ['sleep_score', 'body_battery', 'vo2max', 'weight_kg'];

// ── State ──────────────────────────────────────────────────────────
let _logs    = {};
let _profile = {};

// ── Boot ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  AUTH.guard().then(async ok => {
    if (!ok) return;

    document.getElementById('signout-btn')?.addEventListener('click', () => AUTH.logout());
    document.getElementById('add-widget-btn').addEventListener('click', openPicker);
    document.getElementById('picker-close').addEventListener('click', closePicker);
    document.getElementById('picker-overlay').addEventListener('click', closePicker);

    updateGreeting();

    const [logs, profile] = await Promise.all([
      fetch('/api/logs').then(r => r.json()).catch(() => ({})),
      fetch('/api/profile').then(r => r.json()).catch(() => ({})),
    ]);

    _logs    = logs;
    _profile = profile;

    renderAvatar(profile.name);
    const nameEl = document.getElementById('dash-name');
    const first  = profile.name?.split(' ')[0];
    if (nameEl && first) nameEl.textContent = `, ${first}`;

    renderWidgets();
    initCalendar();
  });
});

// ── Greeting ──────────────────────────────────────────────────────
function updateGreeting() {
  const h = new Date().getHours();
  const el = document.getElementById('dash-greeting');
  if (el) el.textContent = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function renderAvatar(name) {
  const el = document.getElementById('nav-avatar');
  if (!el) return;
  el.textContent = name
    ? name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';
}

// ── Widget config persistence ──────────────────────────────────────
function getConfig() {
  try {
    const raw = localStorage.getItem(WIDGET_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...DEFAULT_WIDGETS];
}

function saveConfig(ids) {
  localStorage.setItem(WIDGET_KEY, JSON.stringify(ids));
}

// ── Data resolution ────────────────────────────────────────────────
function resolveWidget(def) {
  if (def.source === 'log') {
    const sorted = Object.keys(_logs).sort().reverse();
    for (const date of sorted) {
      const v = _logs[date][def.id];
      if (v != null) return { value: v, date };
    }
    return null;
  }

  if (def.source === 'profile') {
    const v = _profile[def.id];
    return v != null ? { value: v, date: null } : null;
  }

  if (def.id === 'whtr') {
    const hCm = _profile.height_cm;
    if (!hCm) return { value: null, date: null, hint: 'Set height in Profile' };
    const sorted = Object.keys(_logs).sort().reverse();
    for (const date of sorted) {
      const w = _logs[date].waist_cm;
      if (w != null) {
        const ratio = (w / hCm).toFixed(3);
        return { value: ratio, date };
      }
    }
    return { value: null, date: null, hint: 'Log waist measurement' };
  }

  if (def.id === 'bmi') {
    const hCm = _profile.height_cm;
    if (!hCm) return { value: null, date: null, hint: 'Set height in Profile' };
    const hM  = hCm / 100;
    let weight = _profile.weight_kg;
    let date   = null;
    if (!weight) {
      const sorted = Object.keys(_logs).sort().reverse();
      for (const d of sorted) {
        if (_logs[d].weight_kg != null) { weight = _logs[d].weight_kg; date = d; break; }
      }
    }
    if (!weight) return { value: null, date: null, hint: 'Log weight' };
    return { value: (weight / (hM * hM)).toFixed(1), date };
  }

  return null;
}

// ── Render widget grid ─────────────────────────────────────────────
function renderWidgets() {
  const ids    = getConfig();
  const grid   = document.getElementById('widget-grid');
  const empty  = document.getElementById('widget-empty');

  grid.innerHTML = '';

  if (ids.length === 0) {
    empty.style.display = '';
    return;
  }
  empty.style.display = 'none';

  ids.forEach(id => {
    const def = WIDGET_DEFS.find(d => d.id === id);
    if (!def) return;
    grid.appendChild(buildWidgetCard(def));
  });
}

function buildWidgetCard(def) {
  const result = resolveWidget(def);
  const value  = result?.value;
  const date   = result?.date;
  const hint   = result?.hint;

  const card = document.createElement('div');
  card.className = 'widget-card';
  card.style.setProperty('--wcolor', def.color);

  const valStr  = value != null ? value : '—';
  const unitStr = value != null ? def.unit : '';
  const dateStr = date  ? dateBadge(date) : (hint || (def.source === 'profile' ? 'From profile' : 'No data yet'));

  card.innerHTML = `
    <div class="widget-header">
      <span class="widget-label">${def.label}</span>
      <button class="widget-remove" onclick="removeWidget('${def.id}')" title="Remove">×</button>
    </div>
    <div class="widget-val${value == null ? ' widget-no-data' : ''}">${valStr}</div>
    ${unitStr ? `<div class="widget-unit">${unitStr}</div>` : ''}
    <div class="widget-date">${dateStr}</div>
  `;
  return card;
}

function dateBadge(iso) {
  const today = new Date().toISOString().slice(0, 10);
  if (iso === today) return 'Today';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// ── Add / remove ───────────────────────────────────────────────────
function removeWidget(id) {
  const ids = getConfig().filter(i => i !== id);
  saveConfig(ids);
  renderWidgets();
}

function addWidget(id) {
  const ids = getConfig();
  if (!ids.includes(id)) ids.push(id);
  saveConfig(ids);
  closePicker();
  renderWidgets();
}

// ── Picker modal ───────────────────────────────────────────────────
function openPicker() {
  const active  = getConfig();
  const available = WIDGET_DEFS.filter(d => !active.includes(d.id));

  const grid    = document.getElementById('picker-grid');
  const allDone = document.getElementById('picker-all-added');

  grid.innerHTML = '';

  if (available.length === 0) {
    allDone.style.display = '';
  } else {
    allDone.style.display = 'none';
    available.forEach(def => {
      const item = document.createElement('button');
      item.className = 'picker-item';
      item.innerHTML = `
        <span class="picker-dot" style="background:${def.color}"></span>
        <span class="picker-label">${def.label}</span>
        ${def.unit ? `<span class="picker-unit">${def.unit}</span>` : ''}
      `;
      item.addEventListener('click', () => addWidget(def.id));
      grid.appendChild(item);
    });
  }

  document.getElementById('picker-overlay').classList.remove('hidden');
  document.getElementById('picker-modal').classList.remove('hidden');
}

function closePicker() {
  document.getElementById('picker-overlay').classList.add('hidden');
  document.getElementById('picker-modal').classList.add('hidden');
}
