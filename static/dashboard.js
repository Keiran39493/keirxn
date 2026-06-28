// ── Boot ─────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  AUTH.guard().then(async ok => {
    if (!ok) return;
    document.getElementById("signout-btn")?.addEventListener("click", () => AUTH.logout());

    updateGreeting();
    await loadProfile();
    showPlaceholders();
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
    const res = await fetch("/api/profile");
    const p = await res.json();
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

function showPlaceholders() {
  document.querySelectorAll(".metric-card").forEach(el => el.classList.add("dim"));
  document.querySelectorAll(".metric-card .card-val").forEach(el => {
    el.textContent = "—";
    el.classList.remove("loading");
  });
  const container = document.getElementById("insights-list");
  if (container) container.innerHTML = `<p class="insights-empty">Data unavailable.</p>`;
}