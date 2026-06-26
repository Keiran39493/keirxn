// ── Reference tables ────────────────────────────────────────────────
// HRV (RMSSD ms) — higher is better. Source: published population studies.
const HRV_REF = {
  '18-25': { p25: 47, p50: 65, p75: 88, p90: 115 },
  '26-35': { p25: 38, p50: 54, p75: 73, p90:  96 },
  '36-45': { p25: 30, p50: 43, p75: 59, p90:  78 },
  '46-55': { p25: 24, p50: 36, p75: 50, p90:  65 },
  '56-65': { p25: 20, p50: 29, p75: 41, p90:  55 },
  '66+':   { p25: 17, p50: 25, p75: 35, p90:  46 },
};

// Resting HR (bpm) — lower is better. p90 = elite (lowest HR achievable).
const HR_REF = {
  '18-25': { p90: 50, p75: 55, p50: 62, p25: 68 },
  '26-35': { p90: 50, p75: 56, p50: 63, p25: 69 },
  '36-45': { p90: 51, p75: 57, p50: 64, p25: 70 },
  '46-55': { p90: 52, p75: 58, p50: 65, p25: 71 },
  '56-65': { p90: 52, p75: 59, p50: 66, p25: 72 },
  '66+':   { p90: 53, p75: 59, p50: 67, p25: 73 },
};

// Sleep score (0-100) — higher is better.
const SLEEP_REF = {
  '18-25': { p25: 65, p50: 72, p75: 80, p90: 88 },
  '26-35': { p25: 63, p50: 70, p75: 78, p90: 86 },
  '36-45': { p25: 60, p50: 68, p75: 76, p90: 84 },
  '46-55': { p25: 57, p50: 65, p75: 73, p90: 82 },
  '56+':   { p25: 55, p50: 62, p75: 71, p90: 80 },
};

// ── Helpers ──────────────────────────────────────────────────────────
function ageKey(age, refObj) {
  if (!age) return null;
  const has = k => k in refObj;
  if (age < 26) return has('18-25') ? '18-25' : null;
  if (age < 36) return has('26-35') ? '26-35' : null;
  if (age < 46) return has('36-45') ? '36-45' : null;
  if (age < 56) return has('46-55') ? '46-55' : null;
  if (age < 66) return has('56-65') ? '56-65' : (has('56+') ? '56+' : null);
  return has('66+') ? '66+' : (has('56+') ? '56+' : null);
}

function calcPctHigher(val, refs) {
  if (val >= refs.p90) return Math.min(99, Math.round(90 + (val - refs.p90) / refs.p90 * 9));
  if (val >= refs.p75) return Math.round(75 + (val - refs.p75) / (refs.p90 - refs.p75) * 15);
  if (val >= refs.p50) return Math.round(50 + (val - refs.p50) / (refs.p75 - refs.p50) * 25);
  if (val >= refs.p25) return Math.round(25 + (val - refs.p25) / (refs.p50 - refs.p25) * 25);
  return Math.max(1, Math.round(val / refs.p25 * 25));
}

function calcPctLower(val, refs) {
  if (val <= refs.p90) return Math.min(99, Math.round(90 + (refs.p90 - val) / refs.p90 * 9));
  if (val <= refs.p75) return Math.round(75 + (refs.p75 - val) / (refs.p75 - refs.p90) * 15);
  if (val <= refs.p50) return Math.round(50 + (refs.p50 - val) / (refs.p50 - refs.p75) * 25);
  if (val <= refs.p25) return Math.round(25 + (refs.p25 - val) / (refs.p25 - refs.p50) * 25);
  return Math.max(1, Math.round(25 * refs.p25 / Math.max(val, 1)));
}

function pctMeta(pct) {
  if (pct === null || pct === undefined) return { label: '—', color: 'var(--text-dim)', bg: 'var(--bg)' };
  if (pct >= 90) return { label: 'Top 10%',       color: '#059669', bg: '#d1fae5' };
  if (pct >= 75) return { label: 'Top 25%',       color: '#10b981', bg: '#ecfdf5' };
  if (pct >= 50) return { label: 'Above Average', color: '#3b82f6', bg: '#eff6ff' };
  if (pct >= 25) return { label: 'Average',       color: '#f59e0b', bg: '#fffbeb' };
  return              { label: 'Below Average',   color: '#ef4444', bg: '#fef2f2' };
}

function goalHigher(val, refs, unit) {
  if (!refs)  return 'Enter your age above to see personalised targets.';
  if (!val)   return `Target ${refs.p50}${unit} — the average for your age group.`;
  if (val < refs.p25) return `Reach ${refs.p25}${unit} to enter the 25th percentile for your age.`;
  if (val < refs.p50) return `Reach ${refs.p50}${unit} to hit the average for your age group.`;
  if (val < refs.p75) return `Reach ${refs.p75}${unit} to enter the top 25% for your age.`;
  if (val < refs.p90) return `Reach ${refs.p90}${unit} to reach the top 10% for your age.`;
  return 'Elite level — you are in the top 10% for your age group. Maintain your habits.';
}

function goalLower(val, refs, unit) {
  if (!refs)  return 'Enter your age above to see personalised targets.';
  if (!val)   return `Target ${refs.p50}${unit} — the average for your age group.`;
  if (val > refs.p25) return `Reduce to ${refs.p25}${unit} to reach the 25th percentile for your age.`;
  if (val > refs.p50) return `Reduce to ${refs.p50}${unit} to reach the average for your age group.`;
  if (val > refs.p75) return `Reduce to ${refs.p75}${unit} to enter the top 25% for your age.`;
  if (val > refs.p90) return `Reduce to ${refs.p90}${unit} to reach the top 10% for your age.`;
  return 'Elite level — you are in the top 10% for your age group. Keep it up.';
}

// ── BMI ──────────────────────────────────────────────────────────────
function calcBMI(hCm, wKg) {
  if (!hCm || !wKg || hCm < 50) return null;
  return Math.round((wKg / Math.pow(hCm / 100, 2)) * 10) / 10;
}

function bmiMeta(bmi) {
  if (!bmi) return { label: '—', color: 'var(--text-dim)', tip: 'Enter your height and weight above.' };
  if (bmi < 18.5) return { label: 'Underweight',   color: '#3b82f6', tip: 'Consider increasing caloric intake through nutrient-dense foods and strength training to build lean mass.' };
  if (bmi < 25)   return { label: 'Healthy Weight', color: '#10b981', tip: 'Your BMI is in the optimal range. Focus on maintaining this with consistent exercise and a balanced diet.' };
  if (bmi < 30)   return { label: 'Overweight',     color: '#f59e0b', tip: 'A moderate calorie deficit (300–500 kcal/day) with regular cardio can help. Aim for 0.5–1 kg per week of fat loss.' };
  if (bmi < 35)   return { label: 'Obese Class I',  color: '#f97316', tip: 'A structured plan combining nutrition, cardio, and strength training is recommended. Consider consulting a healthcare provider.' };
  return           { label: 'Obese Class II+',      color: '#ef4444', tip: 'Please consult a doctor or registered dietitian for a personalised, medically-guided plan.' };
}

// ── Unit conversion ───────────────────────────────────────────────────
const cmToFt  = cm  => +(cm  / 30.48).toFixed(1);
const ftToCm  = ft  => Math.round(ft * 30.48);
const kgToLbs = kg  => +(kg  * 2.20462).toFixed(1);
const lbsToKg = lbs => +(lbs / 2.20462).toFixed(1);

// ── DOM helpers ───────────────────────────────────────────────────────
const g  = id => document.getElementById(id);
const nv = id => { const v = parseFloat(g(id)?.value); return isNaN(v) ? null : v; };
const sv = id => g(id)?.value?.trim() || '';

// ── Profile state ─────────────────────────────────────────────────────
let _profile = {};
let _saveTimer;

async function loadProfile() {
  try { _profile = await fetch('/api/profile').then(r => r.json()); } catch { _profile = {}; }

  const set = (id, v) => { const el = g(id); if (el && v != null && v !== '') el.value = v; };
  const units = _profile.units || 'metric';
  set('ins-units',  units);

  if (units === 'imperial') {
    if (_profile.height_cm) set('ins-height', cmToFt(_profile.height_cm));
    if (_profile.weight_kg) set('ins-weight', kgToLbs(_profile.weight_kg));
  } else {
    set('ins-height', _profile.height_cm);
    set('ins-weight', _profile.weight_kg);
  }
  set('ins-name',   _profile.name);
  set('ins-age',    _profile.age);
  set('ins-gender', _profile.gender);

  updateLabels(units);
  refreshAll();
}

function schedSave() {
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(saveProfile, 1000);
}

async function saveProfile() {
  const units = sv('ins-units');
  let hCm, wKg;
  const h = nv('ins-height'), w = nv('ins-weight');
  if (units === 'imperial') { hCm = h ? ftToCm(h) : null; wKg = w ? lbsToKg(w) : null; }
  else                      { hCm = h; wKg = w; }

  const data = { name: sv('ins-name'), age: nv('ins-age'), gender: sv('ins-gender'),
                 height_cm: hCm, weight_kg: wKg, units };
  Object.keys(data).forEach(k => (data[k] === null || data[k] === '') && delete data[k]);
  try {
    await fetch('/api/profile', { method: 'POST',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    _profile = { ..._profile, ...data };
  } catch {}
}

function updateLabels(units) {
  const hl = g('height-label'), wl = g('weight-label');
  if (hl) hl.textContent = units === 'imperial' ? 'Height (ft)' : 'Height (cm)';
  if (wl) wl.textContent = units === 'imperial' ? 'Weight (lbs)' : 'Weight (kg)';
}

// ── Garmin auto-fill ──────────────────────────────────────────────────
async function tryFetchGarmin() {
  try {
    const s = await fetch('/api/garmin/status').then(r => r.json());
    if (!s.connected) return;
    const m = await fetch('/api/garmin/metrics').then(r => r.json());
    const fill = (id, v) => { const el = g(id); if (el && !el.value && v != null) { el.value = v; } };
    fill('ins-hrv',     m.hrv?.last_night);
    fill('ins-hr',      m.stats?.resting_hr);
    fill('ins-battery', m.body_battery?.current);
    fill('ins-sleep',   m.sleep?.score);
    const chip = g('garmin-chip');
    if (chip) { chip.textContent = `Synced · ${s.email}`; chip.style.color = '#10b981'; chip.style.borderColor = '#10b981'; }
    refreshAll();
  } catch {}
}

// ── Rendering ─────────────────────────────────────────────────────────
function refreshAll() {
  const age = nv('ins-age');
  const units = sv('ins-units');
  let hCm = nv('ins-height'), wKg = nv('ins-weight');
  if (units === 'imperial') { hCm = hCm ? ftToCm(hCm) : null; wKg = wKg ? lbsToKg(wKg) : null; }

  updateBMI(hCm, wKg);
  updateHRV(age);
  updateHR(age);
  updateBattery();
  updateSleep(age);
}

function updateBMI(hCm, wKg) {
  const bmi  = calcBMI(hCm, wKg);
  const meta = bmiMeta(bmi);
  const el   = g('bmi-value'), lbl = g('bmi-label'), tip = g('bmi-tip');
  if (el)  { el.textContent  = bmi ? bmi.toFixed(1) : '—'; el.style.color = bmi ? meta.color : 'var(--text-dim)'; }
  if (lbl) { lbl.textContent = meta.label; lbl.style.color = meta.color; }
  if (tip)   tip.textContent = meta.tip;
}

function updateHRV(age) {
  const val  = nv('ins-hrv');
  const refs = age ? HRV_REF[ageKey(age, HRV_REF)] : null;
  const pct  = (refs && val != null) ? calcPctHigher(val, refs) : null;
  const meta = pctMeta(pct);
  setBadge('hrv-badge', pct, meta);
  setAvg('hrv-avg',  age, refs, 'ms', false);
  renderBar('hrv-bar', pct, refs, false);
  setGoal('hrv-goal', goalHigher(val, refs, ' ms'));
}

function updateHR(age) {
  const val  = nv('ins-hr');
  const refs = age ? HR_REF[ageKey(age, HR_REF)] : null;
  const pct  = (refs && val != null) ? calcPctLower(val, refs) : null;
  const meta = pctMeta(pct);
  setBadge('hr-badge', pct, meta);
  setAvg('hr-avg', age, refs, 'bpm', true);
  renderBar('hr-bar', pct, refs, true);
  setGoal('hr-goal', goalLower(val, refs, ' bpm'));
}

function updateBattery() {
  const v   = nv('ins-battery');
  const el  = g('battery-level');
  const tip = g('battery-context');
  if (!el) return;
  if (v === null) { el.textContent = '—'; el.style.color = 'var(--text-dim)'; if (tip) tip.textContent = ''; return; }

  const levels = [
    { max: 25,  label: 'Critically Low', color: '#ef4444', text: 'Energy is nearly depleted. Avoid strenuous exercise. Prioritise rest and sleep.' },
    { max: 50,  label: 'Low',            color: '#f97316', text: 'Limited energy. Stick to light activity and allow recovery tonight.' },
    { max: 75,  label: 'Good',           color: '#3b82f6', text: 'Good energy reserves available. You can handle moderate to high activity.' },
    { max: 101, label: 'High',           color: '#10b981', text: 'Excellent reserves. Ideal for high-intensity training or demanding mental work.' },
  ];
  const lvl = levels.find(l => v < l.max);
  if (lvl) {
    el.textContent = lvl.label; el.style.color = lvl.color;
    if (tip) tip.textContent = lvl.text;
  }

  // Fill battery bar segments
  const bar = g('battery-bar');
  if (bar) {
    const fill = bar.querySelector('.batt-fill');
    if (fill) { fill.style.width = `${Math.min(100, v)}%`; fill.style.background = lvl?.color || '#10b981'; }
  }
}

function updateSleep(age) {
  const val  = nv('ins-sleep');
  const refs = age ? SLEEP_REF[ageKey(age, SLEEP_REF)] : null;
  const pct  = (refs && val != null) ? calcPctHigher(val, refs) : null;
  const meta = pctMeta(pct);
  setBadge('sleep-badge', pct, meta);
  setAvg('sleep-avg', age, refs, '/100', false);
  renderBar('sleep-bar', pct, refs, false);
  setGoal('sleep-goal', goalHigher(val, refs, '/100'));
}

function setBadge(id, pct, meta) {
  const el = g(id); if (!el) return;
  el.textContent         = pct != null ? `${pct}th percentile · ${meta.label}` : '—';
  el.style.background    = meta.bg;
  el.style.color         = meta.color;
  el.style.borderColor   = pct != null ? meta.color + '33' : 'var(--border)';
}

function setAvg(id, age, refs, unit, lowerBetter) {
  const el = g(id); if (!el) return;
  if (!age)  { el.textContent = 'Enter your age to see age-adjusted percentiles.'; return; }
  if (!refs) { el.textContent = 'No reference data for this age range.'; return; }
  el.textContent = `Average for your age group: ${refs.p50}${unit}${lowerBetter ? ' — lower is better' : ''}`;
}

function setGoal(id, text) { const el = g(id); if (el) el.textContent = text; }

function renderBar(containerId, pct, refs, lowerBetter) {
  const el = g(containerId); if (!el) return;
  const p = Math.max(1, Math.min(99, pct || 1));
  // For lower-is-better HR, flip the visual so "good" (high percentile) is still on the right
  const dotPos = p;

  const ticks = refs
    ? [{ pos: 25, label: refs.p25 }, { pos: 50, label: refs.p50 }, { pos: 75, label: refs.p75 }, { pos: 90, label: refs.p90 }]
    : [];

  el.innerHTML = `
    <div class="ins-pct-track">
      <div class="ins-pct-dot" style="left:${dotPos}%"></div>
      ${ticks.map(t => `<div class="ins-pct-tick-line" style="left:${t.pos}%"></div>`).join('')}
    </div>
    <div class="ins-pct-ticks">
      ${ticks.map(t => `<div class="ins-pct-tick" style="left:${t.pos}%">
        <span style="display:block;color:var(--text-dim);font-size:0.55rem">P${t.pos === 25 ? 25 : t.pos === 50 ? 50 : t.pos === 75 ? 75 : 90}</span>
        <span>${t.label}</span>
      </div>`).join('')}
    </div>
  `;
}

// ── Boot ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  AUTH.guard().then(async ok => {
    if (!ok) return;
    g('signout-btn')?.addEventListener('click', () => AUTH.logout());

    await loadProfile();
    await tryFetchGarmin();

    // Profile fields
    ['ins-name', 'ins-age', 'ins-gender'].forEach(id =>
      g(id)?.addEventListener('input', () => { refreshAll(); schedSave(); }));

    ['ins-height', 'ins-weight'].forEach(id =>
      g(id)?.addEventListener('input', () => { refreshAll(); schedSave(); }));

    // Units toggle — convert existing values
    g('ins-units')?.addEventListener('change', () => {
      const newUnits = sv('ins-units');
      const prevMetric = _profile.units !== 'imperial';
      const h = nv('ins-height'), w = nv('ins-weight');
      if (newUnits === 'imperial' && prevMetric) {
        if (h) g('ins-height').value = cmToFt(h);
        if (w) g('ins-weight').value = kgToLbs(w);
      } else if (newUnits === 'metric' && !prevMetric) {
        if (h) g('ins-height').value = ftToCm(h);
        if (w) g('ins-weight').value = lbsToKg(w);
      }
      _profile.units = newUnits;
      updateLabels(newUnits);
      refreshAll();
      schedSave();
    });

    // Metric inputs
    g('ins-hrv')?.    addEventListener('input', () => updateHRV(nv('ins-age')));
    g('ins-hr')?.     addEventListener('input', () => updateHR(nv('ins-age')));
    g('ins-battery')?.addEventListener('input', () => updateBattery());
    g('ins-sleep')?.  addEventListener('input', () => updateSleep(nv('ins-age')));
  });
});
