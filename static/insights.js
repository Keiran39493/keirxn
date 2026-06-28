// ── Reference tables ─────────────────────────────────────────────────

const HRV_REF = {
  '18-25': { p25: 47, p50: 65, p75: 88, p90: 115 },
  '26-35': { p25: 38, p50: 54, p75: 73, p90:  96 },
  '36-45': { p25: 30, p50: 43, p75: 59, p90:  78 },
  '46-55': { p25: 24, p50: 36, p75: 50, p90:  65 },
  '56-65': { p25: 20, p50: 29, p75: 41, p90:  55 },
  '66+':   { p25: 17, p50: 25, p75: 35, p90:  46 },
};

// lower is better — p90 = lowest (best) HR
const HR_REF = {
  '18-25': { p90: 50, p75: 55, p50: 62, p25: 68 },
  '26-35': { p90: 50, p75: 56, p50: 63, p25: 69 },
  '36-45': { p90: 51, p75: 57, p50: 64, p25: 70 },
  '46-55': { p90: 52, p75: 58, p50: 65, p25: 71 },
  '56-65': { p90: 52, p75: 59, p50: 66, p25: 72 },
  '66+':   { p90: 53, p75: 59, p50: 67, p25: 73 },
};

const SLEEP_REF = {
  '18-25': { p25: 65, p50: 72, p75: 80, p90: 88 },
  '26-35': { p25: 63, p50: 70, p75: 78, p90: 86 },
  '36-45': { p25: 60, p50: 68, p75: 76, p90: 84 },
  '46-55': { p25: 57, p50: 65, p75: 73, p90: 82 },
  '56+':   { p25: 55, p50: 62, p75: 71, p90: 80 },
};

// ACSM norms, gender-stratified
const VO2_REF = {
  male: {
    '18-25': { p25: 38, p50: 44, p75: 50, p90: 56 },
    '26-35': { p25: 37, p50: 42, p75: 48, p90: 54 },
    '36-45': { p25: 34, p50: 40, p75: 46, p90: 51 },
    '46-55': { p25: 31, p50: 37, p75: 43, p90: 48 },
    '56-65': { p25: 27, p50: 33, p75: 39, p90: 44 },
    '66+':   { p25: 24, p50: 29, p75: 35, p90: 40 },
  },
  female: {
    '18-25': { p25: 33, p50: 39, p75: 44, p90: 49 },
    '26-35': { p25: 32, p50: 37, p75: 42, p90: 47 },
    '36-45': { p25: 29, p50: 34, p75: 39, p90: 44 },
    '46-55': { p25: 27, p50: 31, p75: 36, p90: 41 },
    '56-65': { p25: 23, p50: 28, p75: 33, p90: 37 },
    '66+':   { p25: 21, p50: 25, p75: 30, p90: 34 },
  },
};

// ── Percentile helpers ────────────────────────────────────────────────
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
  if (pct == null) return { label: '—', color: 'var(--text-dim)', bg: 'var(--bg)' };
  if (pct >= 90) return { label: 'Top 10%',       color: '#059669', bg: '#d1fae5' };
  if (pct >= 75) return { label: 'Top 25%',       color: '#10b981', bg: '#ecfdf5' };
  if (pct >= 50) return { label: 'Above Average', color: '#3b82f6', bg: '#eff6ff' };
  if (pct >= 25) return { label: 'Average',       color: '#f59e0b', bg: '#fffbeb' };
  return               { label: 'Below Average',  color: '#ef4444', bg: '#fef2f2' };
}

function goalHigher(val, refs, unit) {
  if (!refs) return 'Enter your age above to see a personalised target.';
  if (!val)  return `Target ${refs.p50}${unit} — average for your age group.`;
  if (val < refs.p25) return `Reach ${refs.p25}${unit} to enter the 25th percentile for your age.`;
  if (val < refs.p50) return `Reach ${refs.p50}${unit} to hit the average for your age group.`;
  if (val < refs.p75) return `Reach ${refs.p75}${unit} to enter the top 25% for your age.`;
  if (val < refs.p90) return `Reach ${refs.p90}${unit} to reach the top 10% for your age.`;
  return 'Elite level — top 10% for your age group. Maintain your habits.';
}

function goalLower(val, refs, unit) {
  if (!refs) return 'Enter your age above to see a personalised target.';
  if (!val)  return `Target ${refs.p50}${unit} — average for your age group.`;
  if (val > refs.p25) return `Reduce to ${refs.p25}${unit} to reach the 25th percentile.`;
  if (val > refs.p50) return `Reduce to ${refs.p50}${unit} to reach the average for your age.`;
  if (val > refs.p75) return `Reduce to ${refs.p75}${unit} to enter the top 25%.`;
  if (val > refs.p90) return `Reduce to ${refs.p90}${unit} to reach the top 10%.`;
  return 'Elite level — top 10% for your age group. Keep it up.';
}

// ── BMI ──────────────────────────────────────────────────────────────
function calcBMI(hCm, wKg) {
  if (!hCm || !wKg || hCm < 50) return null;
  return Math.round((wKg / Math.pow(hCm / 100, 2)) * 10) / 10;
}

function bmiMeta(bmi) {
  if (!bmi) return { label: '—', color: 'var(--text-dim)', tip: 'Enter your height and weight above.' };
  if (bmi < 18.5) return { label: 'Underweight',    color: '#3b82f6', tip: 'Increase caloric intake through nutrient-dense foods and add strength training to build lean mass.' };
  if (bmi < 25)   return { label: 'Healthy Weight', color: '#10b981', tip: 'BMI is in the optimal range. Maintain with consistent training and a performance-focused diet.' };
  if (bmi < 30)   return { label: 'Overweight',     color: '#f59e0b', tip: 'A 300–500 kcal/day deficit with regular cardio can drive 0.5–1 kg per week of fat loss.' };
  if (bmi < 35)   return { label: 'Obese Class I',  color: '#f97316', tip: 'Structured nutrition, cardio, and strength training is recommended.' };
  return           { label: 'Obese Class II+',       color: '#ef4444', tip: 'Consult a doctor or registered dietitian for a medically-guided plan.' };
}

// ── Body Fat (US Navy formula) ────────────────────────────────────────
function calcBodyFat(gender, hCm, waistCm, neckCm, hipCm) {
  if (!hCm || !waistCm || !neckCm) return null;
  if (gender === 'male') {
    const d = waistCm - neckCm;
    if (d <= 0) return null;
    return Math.round((86.010 * Math.log10(d) - 70.041 * Math.log10(hCm) + 36.76) * 10) / 10;
  }
  if (gender === 'female') {
    if (!hipCm) return null;
    const s = waistCm + hipCm - neckCm;
    if (s <= 0) return null;
    return Math.round((163.205 * Math.log10(s) - 97.684 * Math.log10(hCm) - 78.387) * 10) / 10;
  }
  return null;
}

function bfMeta(pct, gender) {
  if (pct == null) return { label: '—', color: 'var(--text-dim)', bg: 'var(--bg)', tip: gender ? 'Enter measurements above.' : 'Select your gender in the profile card.' };
  if (gender === 'male') {
    if (pct < 6)  return { label: 'Essential Fat', color: '#3b82f6', bg: '#eff6ff', tip: 'Near essential fat levels. Ensure caloric and hormonal balance is maintained.' };
    if (pct < 14) return { label: 'Athletic',      color: '#059669', bg: '#d1fae5', tip: 'Elite athlete range. Excellent body composition for speed and power sports.' };
    if (pct < 18) return { label: 'Fitness',       color: '#10b981', bg: '#ecfdf5', tip: 'Fit and healthy. Strong platform for most performance goals.' };
    if (pct < 25) return { label: 'Acceptable',    color: '#f59e0b', bg: '#fffbeb', tip: 'Within normal range but composition can be improved with targeted training and nutrition.' };
    return         { label: 'Obese',               color: '#ef4444', bg: '#fef2f2', tip: 'Elevated body fat increases cardiovascular risk and impairs power-to-weight ratio.' };
  }
  if (gender === 'female') {
    if (pct < 13) return { label: 'Essential Fat', color: '#3b82f6', bg: '#eff6ff', tip: 'Near essential fat. Important for hormonal health — ensure adequate caloric intake.' };
    if (pct < 21) return { label: 'Athletic',      color: '#059669', bg: '#d1fae5', tip: 'Elite athlete range. Excellent body composition.' };
    if (pct < 25) return { label: 'Fitness',       color: '#10b981', bg: '#ecfdf5', tip: 'Fit and healthy. Ideal for most performance goals.' };
    if (pct < 32) return { label: 'Acceptable',    color: '#f59e0b', bg: '#fffbeb', tip: 'Within normal range. Targeted training and nutrition can improve composition.' };
    return         { label: 'Obese',               color: '#ef4444', bg: '#fef2f2', tip: 'Elevated body fat increases cardiovascular risk and reduces relative strength.' };
  }
  return { label: `${pct}%`, color: 'var(--text)', bg: 'var(--bg)', tip: 'Select your gender in the profile card for a full classification.' };
}

// ── Max Heart Rate & Training Zones ──────────────────────────────────
function calcMHR(age) {
  return age ? Math.round(208 - 0.7 * age) : null; // Tanaka formula
}

const ZONE_DEFS = [
  { id: 1, label: 'Recovery',    pLo: 0.50, pHi: 0.60, color: '#64748b', bg: '#f8fafc' },
  { id: 2, label: 'Aerobic Base',pLo: 0.60, pHi: 0.70, color: '#3b82f6', bg: '#eff6ff' },
  { id: 3, label: 'Aerobic Power',pLo:0.70, pHi: 0.80, color: '#10b981', bg: '#ecfdf5' },
  { id: 4, label: 'Threshold',   pLo: 0.80, pHi: 0.90, color: '#f59e0b', bg: '#fffbeb' },
  { id: 5, label: 'VO₂ Max',    pLo: 0.90, pHi: 1.00, color: '#ef4444', bg: '#fef2f2' },
];

function calcZones(mhr, rhr) {
  return ZONE_DEFS.map(z => {
    if (rhr) {
      const hrr = mhr - rhr;
      return { ...z, lo: Math.round(rhr + z.pLo * hrr), hi: Math.round(rhr + z.pHi * hrr) };
    }
    return { ...z, lo: Math.round(z.pLo * mhr), hi: Math.round(z.pHi * mhr) };
  });
}

// ── Blood Pressure ────────────────────────────────────────────────────
function bpMeta(sys, dia) {
  if (!sys || !dia) return null;
  if (sys < 120 && dia < 80)  return { label: 'Normal',             color: '#10b981', bg: '#ecfdf5', pos: 10, tip: 'Optimal blood pressure. Maintain with regular aerobic exercise and a balanced diet.' };
  if (sys < 130 && dia < 80)  return { label: 'Elevated',           color: '#3b82f6', bg: '#eff6ff', pos: 30, tip: 'Slightly above optimal. Lifestyle changes can prevent progression to hypertension.' };
  if (sys < 140 || dia < 90)  return { label: 'High — Stage 1',     color: '#f59e0b', bg: '#fffbeb', pos: 57, tip: 'Stage 1 hypertension. Lifestyle intervention required; discuss with a doctor.' };
  if (sys < 180 || dia < 120) return { label: 'High — Stage 2',     color: '#f97316', bg: '#fff7ed', pos: 78, tip: 'Stage 2 hypertension. Medical evaluation is recommended.' };
  return                       { label: 'Hypertensive Crisis',       color: '#ef4444', bg: '#fef2f2', pos: 96, tip: 'Seek immediate medical attention.' };
}

// ── SpO2 ──────────────────────────────────────────────────────────────
function spo2Meta(val) {
  if (val == null) return null;
  if (val >= 98) return { label: 'Excellent', color: '#059669', bg: '#d1fae5', pos: 92, tip: 'Optimal oxygen saturation.' };
  if (val >= 95) return { label: 'Normal',    color: '#10b981', bg: '#ecfdf5', pos: 68, tip: 'Normal range. No intervention required.' };
  if (val >= 90) return { label: 'Low',       color: '#f59e0b', bg: '#fffbeb', pos: 38, tip: 'Below normal. Consult a doctor if persistent or at rest.' };
  return               { label: 'Very Low',   color: '#ef4444', bg: '#fef2f2', pos: 10, tip: 'Seek medical attention.' };
}

// ── Respiratory Rate ──────────────────────────────────────────────────
function respMeta(val) {
  if (val == null) return null;
  if (val < 12)               return { label: 'Low',      color: '#3b82f6', bg: '#eff6ff', pos: 90, tip: 'Below normal range. May reflect very high aerobic conditioning or measurement timing.' };
  if (val <= 16)              return { label: 'Optimal',  color: '#059669', bg: '#d1fae5', pos: 75, tip: 'Excellent resting respiratory rate — reflects efficient breathing mechanics and high fitness.' };
  if (val <= 20)              return { label: 'Normal',   color: '#10b981', bg: '#ecfdf5', pos: 55, tip: 'Normal adult resting range.' };
  if (val <= 25)              return { label: 'Elevated', color: '#f59e0b', bg: '#fffbeb', pos: 32, tip: 'Slightly above normal. May indicate post-exercise measurement, stress, or early illness.' };
  return                       { label: 'High',           color: '#ef4444', bg: '#fef2f2', pos: 12, tip: 'Persistently elevated rate warrants medical evaluation.' };
}

// ── Stress Level ──────────────────────────────────────────────────────
function stressMeta(val) {
  if (val == null) return null;
  if (val < 26) return { label: 'Low — Resting', color: '#10b981', bg: '#ecfdf5', pos: 13, tip: 'Optimal recovery state. Autonomic nervous system is well balanced.' };
  if (val < 51) return { label: 'Moderate',       color: '#3b82f6', bg: '#eff6ff', pos: 38, tip: 'Normal physiological stress. Body is handling demands effectively.' };
  if (val < 76) return { label: 'High',           color: '#f59e0b', bg: '#fffbeb', pos: 63, tip: 'Elevated stress impairs training adaptation, sleep quality, and recovery rate.' };
  return               { label: 'Very High',      color: '#ef4444', bg: '#fef2f2', pos: 88, tip: 'Chronic high stress elevates cortisol, suppresses immune function, and halts muscle repair.' };
}

// ── Waist-to-Height Ratio ─────────────────────────────────────────────
function calcWHtR(waistCm, hCm) {
  if (!waistCm || !hCm) return null;
  return Math.round((waistCm / hCm) * 1000) / 1000;
}

function whtrMeta(ratio) {
  if (ratio == null) return null;
  if (ratio < 0.35) return { label: 'Very Lean',      color: '#3b82f6', bg: '#eff6ff', pos: 10, tip: 'Very low central adiposity. Ensure energy balance supports training load.' };
  if (ratio < 0.50) return { label: 'Healthy',        color: '#10b981', bg: '#ecfdf5', pos: 42, tip: 'Optimal range — lowest associated cardiovascular and metabolic risk.' };
  if (ratio < 0.60) return { label: 'Increased Risk', color: '#f59e0b', bg: '#fffbeb', pos: 65, tip: 'Central adiposity beginning to elevate cardiovascular and metabolic risk.' };
  return                   { label: 'High Risk',      color: '#ef4444', bg: '#fef2f2', pos: 86, tip: 'Strong predictor of cardiovascular disease, type 2 diabetes, and reduced athletic capacity.' };
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

// ── Profile ───────────────────────────────────────────────────────────
let _profile = {};
let _saveTimer;

async function loadProfile() {
  try { _profile = await fetch('/api/profile').then(r => r.json()); } catch { _profile = {}; }

  const set = (id, v) => { const el = g(id); if (el && v != null && v !== '') el.value = v; };
  const units = _profile.units || 'metric';
  set('ins-units', units);

  if (units === 'imperial') {
    if (_profile.height_cm) set('ins-height', cmToFt(_profile.height_cm));
    if (_profile.weight_kg) set('ins-weight', kgToLbs(_profile.weight_kg));
  } else {
    set('ins-height', _profile.height_cm);
    set('ins-weight', _profile.weight_kg);
  }
  set('ins-name',    _profile.name);
  set('ins-age',     _profile.age);
  set('ins-gender',  _profile.gender);

  set('ins-vo2',     _profile.vo2max);
  set('ins-hrv',     _profile.hrv_ms);
  set('ins-hr',      _profile.resting_hr_bpm);
  set('ins-battery', _profile.body_battery);
  set('ins-sleep',   _profile.sleep_score);
  set('ins-stress',  _profile.stress_level);
  set('ins-bp-sys',  _profile.bp_systolic);
  set('ins-bp-dia',  _profile.bp_diastolic);
  set('ins-spo2',    _profile.spo2);
  set('ins-resp',    _profile.respiratory_rate);
  set('ins-waist',   _profile.waist_cm);
  set('ins-neck',    _profile.neck_cm);
  set('ins-hip',     _profile.hip_cm);

  const navEl = g('nav-avatar');
  if (navEl && _profile.name) {
    navEl.textContent = _profile.name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  updateLabels(units);
  refreshAll();
}

function schedSave() {
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(saveProfile, 1000);
}

async function saveProfile() {
  const units = sv('ins-units');
  const h = nv('ins-height'), w = nv('ins-weight');
  let hCm, wKg;
  if (units === 'imperial') { hCm = h ? ftToCm(h) : null; wKg = w ? lbsToKg(w) : null; }
  else                      { hCm = h; wKg = w; }

  const data = {
    name: sv('ins-name'), age: nv('ins-age'), gender: sv('ins-gender'),
    height_cm: hCm, weight_kg: wKg, units,
    vo2max:           nv('ins-vo2'),
    hrv_ms:           nv('ins-hrv'),
    resting_hr_bpm:   nv('ins-hr'),
    body_battery:     nv('ins-battery'),
    sleep_score:      nv('ins-sleep'),
    stress_level:     nv('ins-stress'),
    bp_systolic:      nv('ins-bp-sys'),
    bp_diastolic:     nv('ins-bp-dia'),
    spo2:             nv('ins-spo2'),
    respiratory_rate: nv('ins-resp'),
    waist_cm:         nv('ins-waist'),
    neck_cm:          nv('ins-neck'),
    hip_cm:           nv('ins-hip'),
  };
  Object.keys(data).forEach(k => (data[k] === null || data[k] === '') && delete data[k]);
  try {
    await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    _profile = { ..._profile, ...data };
  } catch {}
}

function updateLabels(units) {
  const hl = g('height-label'), wl = g('weight-label');
  if (hl) hl.textContent = units === 'imperial' ? 'Height (ft)' : 'Height (cm)';
  if (wl) wl.textContent = units === 'imperial' ? 'Weight (lbs)' : 'Weight (kg)';
}

// ── Master refresh ────────────────────────────────────────────────────
function refreshAll() {
  const age    = nv('ins-age');
  const gender = sv('ins-gender');
  const units  = sv('ins-units');
  let hCm = nv('ins-height'), wKg = nv('ins-weight');
  if (units === 'imperial') { hCm = hCm ? ftToCm(hCm) : null; wKg = wKg ? lbsToKg(wKg) : null; }

  updateBMI(hCm, wKg);
  updateVO2(age, gender);
  updateMHR(age);
  updateHRV(age);
  updateHR(age);
  updateBattery();
  updateSleep(age);
  updateStress();
  updateBP();
  updateSpO2();
  updateResp();
  updateBodyFat(hCm, gender);
  updateWHtR(hCm);
}

// ── Update functions ──────────────────────────────────────────────────
function updateBMI(hCm, wKg) {
  const bmi  = calcBMI(hCm, wKg);
  const meta = bmiMeta(bmi);
  const el = g('bmi-value'), lbl = g('bmi-label'), tip = g('bmi-tip');
  if (el)  { el.textContent = bmi ? bmi.toFixed(1) : '—'; el.style.color = bmi ? meta.color : 'var(--text-dim)'; }
  if (lbl) { lbl.textContent = meta.label; lbl.style.color = meta.color; }
  if (tip)   tip.textContent = meta.tip;
}

function updateVO2(age, gender) {
  const val  = nv('ins-vo2');
  const gKey = gender === 'female' ? 'female' : 'male';
  const byAge = VO2_REF[gKey];
  const refs = age ? byAge[ageKey(age, byAge)] : null;
  const pct  = (refs && val != null) ? calcPctHigher(val, refs) : null;
  const meta = pctMeta(pct);
  setBadge('vo2-badge', pct, meta);
  setAvg('vo2-avg', age, refs, ' mL/kg/min', false);
  renderBar('vo2-bar', pct, refs, false);
  setGoal('vo2-goal', goalHigher(val, refs, ' mL/kg/min'));
}

function updateMHR(age) {
  const mhr  = calcMHR(age);
  const valEl = g('mhr-value'), ctx = g('mhr-context'), zonesEl = g('mhr-zones');
  if (!mhr) {
    if (valEl) valEl.textContent = '—';
    if (ctx)   ctx.textContent   = 'Enter your age in the profile card above.';
    if (zonesEl) zonesEl.innerHTML = '';
    return;
  }
  if (valEl) valEl.textContent = mhr;
  if (ctx)   ctx.textContent   = 'Estimated via Tanaka formula (208 − 0.7 × age). Enter resting HR below for Karvonen-method zones.';
  const rhr   = nv('ins-hr');
  const zones = calcZones(mhr, rhr);
  if (zonesEl) {
    zonesEl.innerHTML = zones.map(z => `
      <div class="ins-zone-card" style="background:${z.bg};border:1px solid ${z.color}30">
        <div class="ins-zone-num" style="color:${z.color}">Z${z.id}</div>
        <div class="ins-zone-label">${z.label}</div>
        <div class="ins-zone-range" style="color:${z.color}">${z.lo}–${z.hi}</div>
        <div class="ins-zone-pct">${Math.round(z.pLo*100)}–${Math.round(z.pHi*100)}%</div>
      </div>`).join('');
  }
}

function updateHRV(age) {
  const val  = nv('ins-hrv');
  const refs = age ? HRV_REF[ageKey(age, HRV_REF)] : null;
  const pct  = (refs && val != null) ? calcPctHigher(val, refs) : null;
  const meta = pctMeta(pct);
  setBadge('hrv-badge', pct, meta);
  setAvg('hrv-avg', age, refs, ' ms', false);
  renderBar('hrv-bar', pct, refs, false);
  setGoal('hrv-goal', goalHigher(val, refs, ' ms'));
}

function updateHR(age) {
  const val  = nv('ins-hr');
  const refs = age ? HR_REF[ageKey(age, HR_REF)] : null;
  const pct  = (refs && val != null) ? calcPctLower(val, refs) : null;
  const meta = pctMeta(pct);
  setBadge('hr-badge', pct, meta);
  setAvg('hr-avg', age, refs, ' bpm', true);
  renderBar('hr-bar', pct, refs, true);
  setGoal('hr-goal', goalLower(val, refs, ' bpm'));
  updateMHR(age); // zones update when RHR changes
}

function updateBattery() {
  const v = nv('ins-battery');
  const el = g('battery-level'), tip = g('battery-context');
  if (!el) return;
  if (v === null) {
    el.textContent = '—'; el.style.color = 'var(--text-dim)';
    el.style.background = 'var(--bg)'; el.style.borderColor = 'var(--border)';
    if (tip) tip.textContent = '';
    const fill = g('battery-bar')?.querySelector('.batt-fill');
    if (fill) fill.style.width = '0%';
    return;
  }
  const levels = [
    { max: 25,  label: 'Critically Low', color: '#ef4444', bg: '#fef2f2', text: 'Energy reserves nearly depleted. Avoid strenuous exercise. Rest and prioritise sleep.' },
    { max: 50,  label: 'Low',            color: '#f97316', bg: '#fff7ed', text: 'Limited reserves. Light activity only — allow full recovery overnight.' },
    { max: 75,  label: 'Good',           color: '#3b82f6', bg: '#eff6ff', text: 'Good energy available. Moderate to high-intensity training is viable.' },
    { max: 101, label: 'High',           color: '#10b981', bg: '#ecfdf5', text: 'Excellent reserves. Ideal for peak-output sessions or competition.' },
  ];
  const lvl = levels.find(l => v < l.max);
  if (lvl) {
    el.textContent = lvl.label; el.style.color = lvl.color;
    el.style.background = lvl.bg; el.style.borderColor = lvl.color + '33';
    if (tip) tip.textContent = lvl.text;
  }
  const fill = g('battery-bar')?.querySelector('.batt-fill');
  if (fill) { fill.style.width = `${Math.min(100, v)}%`; fill.style.background = lvl?.color; }
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

function updateStress() {
  const val = nv('ins-stress');
  const cat = stressMeta(val);
  applyCatBadge('stress-badge', 'stress-detail', cat);
  renderRangeBar('stress-range', cat?.pos ?? null,
    ['Low', 'Moderate', 'High', 'Very High'],
    ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']);
}

function updateBP() {
  const cat = bpMeta(nv('ins-bp-sys'), nv('ins-bp-dia'));
  applyCatBadge('bp-badge', 'bp-detail', cat);
  renderRangeBar('bp-range', cat?.pos ?? null,
    ['Normal', 'Elevated', 'Stage 1', 'Stage 2', 'Crisis'],
    ['#10b981', '#3b82f6', '#f59e0b', '#f97316', '#ef4444']);
}

function updateSpO2() {
  const cat = spo2Meta(nv('ins-spo2'));
  applyCatBadge('spo2-badge', 'spo2-detail', cat);
  renderRangeBar('spo2-range', cat?.pos ?? null,
    ['Very Low', 'Low', 'Normal', 'Excellent'],
    ['#ef4444', '#f59e0b', '#10b981', '#059669']);
}

function updateResp() {
  const cat = respMeta(nv('ins-resp'));
  applyCatBadge('resp-badge', 'resp-detail', cat);
  renderRangeBar('resp-range', cat?.pos ?? null,
    ['High', 'Elevated', 'Normal', 'Optimal'],
    ['#ef4444', '#f59e0b', '#10b981', '#059669']);
}

function updateBodyFat(hCm, gender) {
  const waist = nv('ins-waist'), neck = nv('ins-neck'), hip = nv('ins-hip');
  const pct  = calcBodyFat(gender, hCm, waist, neck, hip);
  const meta = bfMeta(pct, gender);
  const valEl = g('bf-value'), badge = g('bf-badge'), tip = g('bf-tip');
  const hipGrp = g('hip-group');
  if (hipGrp) hipGrp.style.display = gender === 'female' ? '' : 'none';
  if (valEl) { valEl.textContent = pct != null ? `${pct}%` : '—'; valEl.style.color = meta.color; }
  if (badge) {
    badge.textContent = meta.label; badge.style.color = meta.color;
    badge.style.background = meta.bg;
    badge.style.borderColor = meta.color !== 'var(--text-dim)' ? meta.color + '33' : 'var(--border)';
  }
  if (tip) tip.textContent = meta.tip;
}

function updateWHtR(hCm) {
  const waist = nv('ins-waist');
  const ratio = calcWHtR(waist, hCm);
  const meta  = whtrMeta(ratio);
  const valEl = g('whtr-value');
  if (valEl) { valEl.textContent = ratio != null ? ratio.toFixed(3) : '—'; valEl.style.color = meta?.color ?? 'var(--text-dim)'; }
  applyCatBadge('whtr-badge', 'whtr-detail', meta);
  renderRangeBar('whtr-range', meta?.pos ?? null,
    ['High Risk', 'Increased Risk', 'Healthy', 'Very Lean'],
    ['#ef4444', '#f59e0b', '#10b981', '#3b82f6']);
}

// ── Render helpers ────────────────────────────────────────────────────
function setBadge(id, pct, meta) {
  const el = g(id); if (!el) return;
  el.textContent       = pct != null ? `${pct}th percentile · ${meta.label}` : '—';
  el.style.background  = meta.bg;
  el.style.color       = meta.color;
  el.style.borderColor = pct != null ? meta.color + '33' : 'var(--border)';
}

function applyCatBadge(badgeId, detailId, cat) {
  const badge = g(badgeId), detail = g(detailId);
  if (!badge) return;
  if (!cat) {
    badge.textContent = '—'; badge.style.color = 'var(--text-dim)';
    badge.style.background = 'var(--bg)'; badge.style.borderColor = 'var(--border)';
    if (detail) detail.textContent = '';
    return;
  }
  badge.textContent = cat.label; badge.style.color = cat.color;
  badge.style.background = cat.bg; badge.style.borderColor = cat.color + '33';
  if (detail) detail.textContent = cat.tip;
}

function setAvg(id, age, refs, unit, lowerBetter) {
  const el = g(id); if (!el) return;
  if (!age)  { el.textContent = 'Enter your age to see age-adjusted percentiles.'; return; }
  if (!refs) { el.textContent = 'No reference data for this age range.'; return; }
  el.textContent = `Age-group average: ${refs.p50}${unit}${lowerBetter ? ' (lower is better)' : ''}`;
}

function setGoal(id, text) { const el = g(id); if (el) el.textContent = text; }

function renderBar(containerId, pct, refs) {
  const el = g(containerId); if (!el) return;
  const p = Math.max(1, Math.min(99, pct ?? 1));
  const ticks = refs
    ? [{ pos: 25, label: refs.p25 }, { pos: 50, label: refs.p50 }, { pos: 75, label: refs.p75 }, { pos: 90, label: refs.p90 }]
    : [];
  el.innerHTML = `
    <div class="ins-pct-track">
      <div class="ins-pct-dot" style="left:${p}%"></div>
      ${ticks.map(t => `<div class="ins-pct-tick-line" style="left:${t.pos}%"></div>`).join('')}
    </div>
    <div class="ins-pct-ticks">
      ${ticks.map(t => `<div class="ins-pct-tick" style="left:${t.pos}%">
        <span style="display:block;color:var(--text-dim);font-size:0.55rem">P${t.pos}</span>
        <span>${t.label}</span>
      </div>`).join('')}
    </div>`;
}

function renderRangeBar(containerId, pos, labels, colors) {
  const el = g(containerId); if (!el) return;
  el.innerHTML = `
    <div style="position:relative;margin-bottom:10px">
      <div style="display:flex;height:10px;border-radius:6px;overflow:hidden">
        ${colors.map(c => `<div style="flex:1;background:${c}"></div>`).join('')}
      </div>
      ${pos != null ? `<div style="position:absolute;top:-3px;left:${pos}%;transform:translateX(-50%);width:16px;height:16px;background:var(--surface);border:2.5px solid var(--text);border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.2);transition:left 0.35s ease"></div>` : ''}
    </div>
    <div style="display:flex">
      ${labels.map((l, i) => `<div style="flex:1;font-size:0.6rem;font-weight:600;color:${colors[i]};text-align:center;line-height:1.3">${l}</div>`).join('')}
    </div>`;
}

// ── Boot ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  AUTH.guard().then(async ok => {
    if (!ok) return;
    g('signout-btn')?.addEventListener('click', () => AUTH.logout());
    await loadProfile();

    ['ins-name', 'ins-age', 'ins-gender'].forEach(id =>
      g(id)?.addEventListener('input', () => { refreshAll(); schedSave(); }));

    ['ins-height', 'ins-weight'].forEach(id =>
      g(id)?.addEventListener('input', () => { refreshAll(); schedSave(); }));

    g('ins-units')?.addEventListener('change', () => {
      const nu = sv('ins-units'), prevMetric = _profile.units !== 'imperial';
      const h = nv('ins-height'), w = nv('ins-weight');
      if (nu === 'imperial' && prevMetric) {
        if (h) g('ins-height').value = cmToFt(h);
        if (w) g('ins-weight').value = kgToLbs(w);
      } else if (nu === 'metric' && !prevMetric) {
        if (h) g('ins-height').value = ftToCm(h);
        if (w) g('ins-weight').value = lbsToKg(w);
      }
      _profile.units = nu;
      updateLabels(nu);
      refreshAll();
      schedSave();
    });

    ['ins-vo2', 'ins-hrv', 'ins-hr', 'ins-battery', 'ins-sleep',
     'ins-stress', 'ins-bp-sys', 'ins-bp-dia', 'ins-spo2', 'ins-resp',
     'ins-waist', 'ins-neck', 'ins-hip'].forEach(id =>
      g(id)?.addEventListener('input', () => { refreshAll(); schedSave(); }));
  });
});
