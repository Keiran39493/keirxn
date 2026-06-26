document.addEventListener("DOMContentLoaded", () => {
  AUTH.guard().then(async ok => {
    if (!ok) return;
    document.getElementById("signout-btn")?.addEventListener("click", () => AUTH.logout());
    await loadAndPopulate();
    wireForm();
  });
});

async function loadAndPopulate() {
  try {
    const p = await fetch("/api/profile").then(r => r.json());
    const set = (id, val) => { const el = document.getElementById(id); if (el && val !== undefined) el.value = val; };
    set("pf-name",         p.name);
    set("pf-dob",          p.dob);
    set("pf-gender",       p.gender);
    set("pf-height",       p.height_cm);
    set("pf-weight",       p.weight_kg);
    set("pf-units",        p.units || "metric");
    set("pf-goals",        p.goals);
    set("pf-garmin-email", p.garmin_email);

    // Avatar
    renderAvatar(p.name);
    const navEl = document.getElementById("nav-avatar");
    if (navEl) renderAvatar(p.name, navEl);
  } catch (e) {
    console.error("profile load failed:", e);
  }
}

function renderAvatar(name, el) {
  const target = el || document.getElementById("pf-avatar");
  if (!target) return;
  const initials = name
    ? name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";
  target.textContent = initials;
}

function wireForm() {
  const form = document.getElementById("profile-form");
  if (!form) return;

  // Live avatar preview
  document.getElementById("pf-name")?.addEventListener("input", e => {
    renderAvatar(e.target.value);
  });

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const btn    = document.getElementById("pf-save-btn");
    const status = document.getElementById("pf-status");

    btn.disabled    = true;
    btn.textContent = "Saving…";
    if (status) status.textContent = "";

    const data = {
      name:       document.getElementById("pf-name")?.value.trim() || undefined,
      dob:        document.getElementById("pf-dob")?.value || undefined,
      gender:     document.getElementById("pf-gender")?.value || undefined,
      height_cm:  parseFloat(document.getElementById("pf-height")?.value) || undefined,
      weight_kg:  parseFloat(document.getElementById("pf-weight")?.value) || undefined,
      units:      document.getElementById("pf-units")?.value || "metric",
      goals:      document.getElementById("pf-goals")?.value.trim() || undefined,
    };

    // Remove undefined keys
    Object.keys(data).forEach(k => data[k] === undefined && delete data[k]);

    try {
      await fetch("/api/profile", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      });
      if (status) { status.textContent = "Saved"; status.className = "pf-status-ok"; }
    } catch {
      if (status) { status.textContent = "Save failed"; status.className = "pf-status-err"; }
    } finally {
      btn.disabled    = false;
      btn.textContent = "Save changes";
      setTimeout(() => { if (status) status.textContent = ""; }, 3000);
    }
  });

  // Garmin reconnect
  document.getElementById("btn-reconnect")?.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}
