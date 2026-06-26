// ── State ────────────────────────────────────────────────────────────
let _connected = false;
let _metrics   = null;

// ── Boot ─────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  AUTH.guard().then(async ok => {
    if (!ok) return;
    document.getElementById("signout-btn")?.addEventListener("click", () => AUTH.logout());

    updateGreeting();
    await loadProfile();
    await checkStatus();
  });
});

// ── Greeting ─────────────────────────────────────────────────────────
function updateGreeting() {
  const h = new Date().getHours();
  const greeting = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  const el = document.getElementById("dash-greeting");
  if (el) el.textContent = greeting;
}

async function loadProfile() {
  try {
    const p = await api("/api/profile");
    const name = p.name?.split(" ")[0];
    const el = document.getElementById("dash-name");
    if (el && name) el.textContent = `, ${name}`;
    renderAvatar(p.name);
  } catch {}
}

function renderAvatar(name) {
  const el = document.getElementById("nav-avatar");
  if (!el) return;
  const initials = name
    ? name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";
  el.textContent = initials;
}

// ── Garmin status ────────────────────────────────────────────────────
async function checkStatus() {
  try {
    const s = await api("/api/garmin/status");
    _connected = s.connected;
  } catch {
    _connected = false;
  }

  if (_connected) {
    hideConnectBanner();
    showSkeleton();
    await Promise.all([fetchMetrics(), fetchTrends()]);
  } else {
    showConnectBanner();
    showPlaceholders();
  }
}

function hideConnectBanner() {
  document.getElementById("connect-banner")?.classList.add("hidden");
}

function showConnectBanner() {
  document.getElementById("connect-banner")?.classList.remove("hidden");
}

function showSkeleton() {
  document.querySelectorAll(".metric-card .card-val").forEach(el => {
    el.textContent = "—";
    el.classList.add("loading");
  });
}

function showPlaceholders() {
  document.querySelectorAll(".metric-card").forEach(el => el.classList.add("dim"));
}

// ── Fetch metrics ─────────────────────────────────────────────────────
async function fetchMetrics() {
  try {
    _metrics = await api("/api/garmin/metrics");
    renderHero(_metrics);
    renderCards(_metrics);
    renderInsights(_metrics.insights || []);
  } catch (e) {
    console.error("metrics error:", e);
  }
}

async function fetchTrends() {
  try {
    const t = await api("/api/garmin/trends");
    renderCharts(t);
  } catch (e) {
    console.error("trends error:", e);
  }
}

// ── Hero section (ring gauges) ────────────────────────────────────────
function renderHero(m) {
  const bb    = m.body_battery?.current ?? null;
  const sleep = m.sleep?.score ?? null;
  const stress = m.stress?.avg ?? null;

  renderRing("ring-battery", bb,    "#f59e0b", bbLabel(bb));
  renderRing("ring-sleep",   sleep, "#6366f1", sleepLabel(sleep));
  renderRing("ring-stress",  stress ? (100 - stress) : null, "#10b981", stressLabel(stress));

  setVal("hero-battery-val",  bb    !== null ? bb    : "—");
  setVal("hero-sleep-val",    sleep !== null ? sleep : "—");
  setVal("hero-stress-val",   stress !== null ? stressText(stress) : "—");

  setVal("hero-battery-label",  bbLabel(bb));
  setVal("hero-sleep-label",    sleepLabel(sleep));
  setVal("hero-stress-label",   stressLabel(stress));
}

function renderRing(id, pct, color, label) {
  const el = document.getElementById(id);
  if (!el) return;
  const r    = 42;
  const circ = 2 * Math.PI * r;
  const fill = pct !== null ? Math.max(0, Math.min(100, pct)) : 0;
  const offset = circ * (1 - fill / 100);
  el.innerHTML = `
    <svg viewBox="0 0 100 100" class="ring-svg">
      <circle cx="50" cy="50" r="${r}" fill="none" stroke="#e8e8e8" stroke-width="9"/>
      <circle cx="50" cy="50" r="${r}" fill="none" stroke="${pct !== null ? color : '#e8e8e8'}"
        stroke-width="9" stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}"
        stroke-linecap="round" transform="rotate(-90 50 50)"
        style="transition:stroke-dashoffset 1s ease"/>
    </svg>`;
}

// ── Metric cards ──────────────────────────────────────────────────────
function renderCards(m) {
  document.querySelectorAll(".metric-card").forEach(el => el.classList.remove("dim", "loading"));
  document.querySelectorAll(".metric-card .card-val").forEach(el => el.classList.remove("loading"));

  const stats = m.stats || {};
  const hrv   = m.hrv   || {};
  const vo2   = m.vo2max || {};
  const spo2  = m.spo2  || {};
  const resp  = m.respiration || {};

  fillCard("card-hrv",       hrv.last_night,         "ms",    hrvStatus(hrv),     "#10b981");
  fillCard("card-vo2",       vo2.value,               " ml/kg/min", vo2Status(vo2.value), "#3b82f6");
  fillCard("card-hr",        stats.resting_hr,        " bpm",  hrStatus(stats.resting_hr), "#ef4444");
  fillCard("card-steps",     fmtSteps(stats.steps),   "",      stepsStatus(stats.steps, stats.step_goal), "#8b5cf6");
  fillCard("card-spo2",      spo2.avg,                "%",     spo2Status(spo2.avg), "#ec4899");
  fillCard("card-resp",      resp.avg_waking,         " br/m", respStatus(resp.avg_waking), "#06b6d4");
  fillCard("card-calories",  stats.calories,          " kcal", "",                "#f97316");
  fillCard("card-fitness-age", vo2.fitness_age,       " yrs",  "",                "#3b82f6");
}

function fillCard(id, value, unit, status, color) {
  const card = document.getElementById(id);
  if (!card) return;
  const valEl    = card.querySelector(".card-val");
  const statusEl = card.querySelector(".card-status");
  if (valEl) {
    valEl.textContent = value !== null && value !== undefined ? `${value}${unit}` : "—";
    valEl.style.color = value !== null && value !== undefined ? color : "var(--text-dim)";
  }
  if (statusEl) statusEl.textContent = status || "";
}

// ── Insights ──────────────────────────────────────────────────────────
function renderInsights(insights) {
  const container = document.getElementById("insights-list");
  if (!container) return;
  container.innerHTML = "";

  if (!insights.length) {
    container.innerHTML = `<p class="insights-empty">Connect Garmin to see personalised insights.</p>`;
    return;
  }

  insights.forEach(ins => {
    const div = document.createElement("div");
    div.className = `insight-card insight-${ins.type}`;
    div.innerHTML = `
      <div class="insight-icon">${insightIcon(ins.icon)}</div>
      <div class="insight-body">
        <div class="insight-title">${ins.title}</div>
        <div class="insight-text">${ins.body}</div>
        ${ins.action ? `<div class="insight-action">→ ${ins.action}</div>` : ""}
      </div>`;
    container.appendChild(div);
  });
}

// ── Trend charts ──────────────────────────────────────────────────────
function renderCharts(t) {
  if (!window.Chart) return;
  const opts = (color, label, max) => ({
    type: "line",
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { mode: "index" } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 }, color: "#9a9a9a" } },
        y: { grid: { color: "#f0f0f0" }, ticks: { font: { size: 11 }, color: "#9a9a9a" },
             min: 0, max: max || undefined },
      },
      elements: { point: { radius: 3, hitRadius: 8 }, line: { tension: 0.4, borderWidth: 2 } },
    },
  });

  const makeDataset = (data, color) => ({
    data,
    borderColor: color,
    backgroundColor: color + "18",
    fill: true,
  });

  const days = t.days || [];

  buildChart("chart-hrv", days, t.hrv, "#10b981", "HRV (ms)", null, opts);
  buildChart("chart-sleep", days, t.sleep, "#6366f1", "Sleep Score", 100, opts);
  buildChart("chart-battery", days, t.body_battery, "#f59e0b", "Body Battery", 100, opts);
  buildChart("chart-stress", days, t.stress, "#ef4444", "Stress", 100, opts);
}

function buildChart(canvasId, labels, data, color, label, maxY, optsFn) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !data) return;
  if (canvas._chart) canvas._chart.destroy();

  const config = optsFn(color, label, maxY);
  config.data = {
    labels,
    datasets: [{
      data,
      borderColor: color,
      backgroundColor: color + "18",
      fill: true,
      spanGaps: true,
    }],
  };
  canvas._chart = new window.Chart(canvas, config);
}

// ── Connect modal ─────────────────────────────────────────────────────
function openConnectModal() {
  document.getElementById("connect-modal")?.classList.remove("hidden");
  document.getElementById("modal-overlay")?.classList.remove("hidden");
  document.getElementById("modal-email")?.focus();
}

function closeConnectModal() {
  document.getElementById("connect-modal")?.classList.add("hidden");
  document.getElementById("modal-overlay")?.classList.add("hidden");
  document.getElementById("modal-mfa")?.classList.add("hidden");
}

async function submitConnect() {
  const email    = document.getElementById("modal-email")?.value.trim();
  const password = document.getElementById("modal-password")?.value;
  const errEl    = document.getElementById("modal-error");
  const btn      = document.getElementById("modal-submit");

  if (!email || !password) { showModalError("Enter email and password."); return; }

  btn.disabled   = true;
  btn.textContent = "Connecting…";
  if (errEl) errEl.textContent = "";

  try {
    const res = await api("/api/garmin/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.status === "mfa_required") {
      document.getElementById("connect-form")?.classList.add("hidden");
      document.getElementById("modal-mfa")?.classList.remove("hidden");
      document.getElementById("modal-mfa-input")?.focus();
    } else if (res.status === "connected") {
      closeConnectModal();
      _connected = true;
      hideConnectBanner();
      showSkeleton();
      await Promise.all([fetchMetrics(), fetchTrends()]);
    } else {
      showModalError(res.error || "Connection failed.");
    }
  } catch (e) {
    showModalError("Connection failed. Is the server running?");
  } finally {
    btn.disabled    = false;
    btn.textContent = "Connect";
  }
}

async function submitMFA() {
  const code  = document.getElementById("modal-mfa-input")?.value.trim();
  const errEl = document.getElementById("modal-error");
  if (!code) { showModalError("Enter the code from your email."); return; }

  const btn = document.getElementById("modal-mfa-submit");
  btn.disabled = true;
  if (errEl) errEl.textContent = "";

  try {
    const res = await api("/api/garmin/mfa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (res.status === "connected") {
      closeConnectModal();
      _connected = true;
      hideConnectBanner();
      await Promise.all([fetchMetrics(), fetchTrends()]);
    } else {
      showModalError(res.error || "Invalid code.");
    }
  } catch {
    showModalError("Verification failed.");
  } finally {
    btn.disabled = false;
  }
}

function showModalError(msg) {
  const el = document.getElementById("modal-error");
  if (el) el.textContent = msg;
}

// ── Helper: fetch wrapper ─────────────────────────────────────────────
async function api(url, opts = {}) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Status/label helpers ──────────────────────────────────────────────
function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val ?? "—";
}

function bbLabel(v)      { if (v === null || v === undefined) return "—"; return v >= 75 ? "High" : v >= 50 ? "Good" : v >= 26 ? "Fair" : "Low"; }
function sleepLabel(v)   { if (v === null || v === undefined) return "—"; return v >= 85 ? "Excellent" : v >= 70 ? "Good" : v >= 55 ? "Fair" : "Poor"; }
function stressLabel(v)  { if (v === null || v === undefined) return "—"; return v < 26 ? "Rest" : v < 51 ? "Low" : v < 76 ? "Medium" : "High"; }
function stressText(v)   { if (v === null || v === undefined) return "—"; return stressLabel(v); }
function hrvStatus(hrv)  {
  const { last_night: ln, weekly_avg: avg } = hrv;
  if (!ln) return "";
  if (!avg) return `${ln} ms`;
  const pct = Math.round(((ln - avg) / avg) * 100);
  return pct >= 0 ? `↑ ${pct}% vs avg` : `↓ ${Math.abs(pct)}% vs avg`;
}
function vo2Status(v)    { if (!v) return ""; return v >= 55 ? "Elite" : v >= 47 ? "Excellent" : v >= 41 ? "Good" : v >= 35 ? "Average" : "Below avg"; }
function hrStatus(v)     { if (!v) return ""; return v < 50 ? "Athletic" : v < 60 ? "Excellent" : v < 70 ? "Good" : v < 80 ? "Normal" : "Elevated"; }
function spo2Status(v)   { if (!v) return ""; return v >= 95 ? "Normal" : v >= 90 ? "Low" : "Concerning"; }
function respStatus(v)   { if (!v) return ""; return v >= 12 && v <= 20 ? "Normal" : "Atypical"; }
function stepsStatus(s, g) {
  if (!s) return "";
  if (!g) return `${fmtSteps(s)} steps`;
  return `${Math.round((s / g) * 100)}% of goal`;
}
function fmtSteps(n)     { return n ? n.toLocaleString() : null; }

// ── Icons ─────────────────────────────────────────────────────────────
function insightIcon(name) {
  const icons = {
    heart:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    moon:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
    battery: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="18" height="10" rx="2"/><line x1="22" y1="11" x2="22" y2="13"/></svg>`,
    zap:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    wind:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>`,
    clock:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    check:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    activity:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  };
  return icons[name] || icons.activity;
}
