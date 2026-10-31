// Shared masthead, sidebar and footer. Edit PROFILE / NAV here once and every page updates.
(function () {
  const PROFILE = {
    name: "Keiran Moores",
    handle: "keiranmoores",
    title: "System Engineer",
    affiliation: "Universität Liechtenstein",
    bio: "Cybersecurity · Artificial Intelligence · Networking",
    links: [
      { label: "Universität Liechtenstein", href: "https://www.uni.li", icon: "building" },
      { label: "Email", href: "mailto:keiranmoores@gmail.com", icon: "mail" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/keiranmoores/", icon: "user" },
      { label: "GitHub", href: "https://github.com/Keiran39493", icon: "code" },
    ],
  };

  // Support calendar. Dates are "YYYY-MM-DD".
  //  - workdays: days of the week you're normally available (0 = Sun ... 6 = Sat)
  //  - requested: dates someone has already requested (shown as "Requested", can't be picked)
  //  - unavailable: holidays / days off
  const AVAILABILITY = {
    workdays: [1, 2, 3, 4, 5],
    requested: [],
    unavailable: [],
    monthsAhead: 2,
    formspree: "xeaalyka",
  };

  const NAV = [
    ["Home", "index.html"],
    ["Reviews", "reviews.html"],
    ["Products", "products.html"],
    ["Gallery", "gallery.html"],
    ["Services", "service.html"],
    ["CV", "cv.html"],
    ["Blog", "blog.html"],
  ];

  const ICONS = {
    building: '<path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 10h.01M15 10h.01"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3M15 8l2 2"/>',
    scholar: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
    id: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 9v6M12 9h2a3 3 0 0 1 0 6h-2z"/>',
    code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 5-6 8-6s7 2 8 6"/>',
    play: '<rect x="2" y="5" width="20" height="14" rx="3"/><path d="m10 9 5 3-5 3z"/>',
  };
  const icon = (n) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ""}</svg>`;

  const here = location.pathname.split("/").pop() || "index.html";

  const masthead = `
    <header class="masthead"><div class="masthead-inner">
      <a class="site-title" href="index.html"><code>whoami</code> — ${PROFILE.name}</a>
      <nav class="nav" aria-label="Main">
        ${NAV.map(([t, h]) => `<a href="${h}"${h === here ? ' class="active" aria-current="page"' : ""}>${t}</a>`).join("")}
      </nav>
    </div></header>`;

  const initials = PROFILE.name.split(" ").map((w) => w[0]).join("");
  const sidebar = `
    <svg class="avatar" viewBox="0 0 160 160" role="img" aria-label="Profile photo placeholder">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#4f8fd6"/><stop offset="1" stop-color="#2a4f86"/></linearGradient></defs>
      <circle cx="80" cy="80" r="80" fill="url(#g)"/>
      <text x="80" y="96" text-anchor="middle" font-family="system-ui, sans-serif" font-size="48" font-weight="600" fill="#fff">${initials}</text>
    </svg>
    <div>
      <h2 class="author-name">${PROFILE.name}</h2>
      <p class="author-title">${PROFILE.title}</p>
      <p class="author-bio">${PROFILE.bio}</p>
    </div>
    <div class="follow-label">Follow</div>
    <ul class="author-links">
      ${PROFILE.links.map((l) => `<li><a href="${l.href}">${icon(l.icon)}${l.label}</a></li>`).join("")}
    </ul>
    <div class="cal" id="support-cal">
      <div class="follow-label">Support availability</div>
      <div class="cal-head">
        <button type="button" class="cal-nav" data-step="-1" aria-label="Previous month">‹</button>
        <span class="cal-month" aria-live="polite"></span>
        <button type="button" class="cal-nav" data-step="1" aria-label="Next month">›</button>
      </div>
      <div class="cal-grid" role="grid"></div>
      <ul class="cal-legend">
        <li><i class="dot avail"></i>Available</li>
        <li><i class="dot req"></i>Requested</li>
        <li><i class="dot off"></i>Unavailable</li>
      </ul>
      <p class="cal-hint">Click an available day to request support.</p>
    </div>`;

  const dialog = `
    <dialog class="cal-dialog" id="cal-dialog" aria-labelledby="cal-dialog-title">
      <form class="review-form" method="dialog" novalidate>
        <h2 id="cal-dialog-title">Request support</h2>
        <p class="cal-picked"></p>
        <input type="hidden" name="requested_date">
        <input type="hidden" name="_subject" value="Support request">
        <input type="hidden" name="form_type" value="support-request">
        <label>Your name <span class="req">*</span><input type="text" name="name" required autocomplete="name"></label>
        <label>Email <span class="req">*</span><input type="email" name="email" required autocomplete="email"></label>
        <label>Company <span class="opt">(optional)</span><input type="text" name="company" autocomplete="organization"></label>
        <div class="form-row two">
          <label>Time
            <select name="time"><option>Any time</option><option>Morning</option><option>Afternoon</option></select>
          </label>
          <label>Support type
            <select name="support_type"><option>Remote</option><option>On-site</option></select>
          </label>
        </div>
        <label>What do you need help with? <span class="req">*</span>
          <textarea name="details" rows="4" required minlength="5"></textarea>
        </label>
        <input type="text" name="_gotcha" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
        <p class="form-msg" role="status" aria-live="polite"></p>
        <div class="cal-actions">
          <button type="button" class="btn cal-cancel">Cancel</button>
          <button type="submit" class="btn-solid">Send request</button>
        </div>
      </form>
    </dialog>`;

  const footer = `
    <footer class="footer"><div class="footer-inner">
      <span>© ${new Date().getFullYear()} ${PROFILE.name}</span>
      <span><button class="theme-toggle" type="button">Toggle theme</button></span>
    </div></footer>`;

  document.body.insertAdjacentHTML("afterbegin", masthead);
  const side = document.querySelector(".sidebar");
  if (side) side.innerHTML = sidebar;
  document.body.insertAdjacentHTML("beforeend", footer);
  if (side) { document.body.insertAdjacentHTML("beforeend", dialog); initCalendar(); }

  function initCalendar() {
    const cal = document.getElementById("support-cal");
    const grid = cal.querySelector(".cal-grid");
    const label = cal.querySelector(".cal-month");
    const dlg = document.getElementById("cal-dialog");
    const form = dlg.querySelector("form");
    const msg = form.querySelector(".form-msg");
    const sendBtn = form.querySelector("button[type=submit]");
    const pad = (n) => String(n).padStart(2, "0");
    const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    const last = new Date(today.getFullYear(), today.getMonth() + AVAILABILITY.monthsAhead, 1);
    const requested = new Set(AVAILABILITY.requested);
    try { JSON.parse(localStorage.getItem("myRequests") || "[]").forEach((d) => requested.add(d)); } catch (e) {}
    const off = new Set(AVAILABILITY.unavailable);
    let view = new Date(first);

    function status(d) {
      const k = ymd(d);
      if (d <= today || off.has(k) || !AVAILABILITY.workdays.includes(d.getDay())) return "off";
      if (requested.has(k)) return "req";
      return "avail";
    }

    function render() {
      label.textContent = view.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
      cal.querySelector('[data-step="-1"]').disabled = view <= first;
      cal.querySelector('[data-step="1"]').disabled = view >= last;
      const names = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
      let html = names.map((n) => `<span class="cal-dow">${n}</span>`).join("");
      const lead = (new Date(view.getFullYear(), view.getMonth(), 1).getDay() + 6) % 7;
      html += "<span></span>".repeat(lead);
      const days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
      for (let i = 1; i <= days; i++) {
        const d = new Date(view.getFullYear(), view.getMonth(), i);
        const s = status(d);
        const words = { avail: "available", req: "already requested", off: "unavailable" }[s];
        const full = d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
        html += `<button type="button" class="cal-day ${s}${ymd(d) === ymd(today) ? " today" : ""}" data-date="${ymd(d)}"
          ${s === "avail" ? "" : "disabled"} aria-label="${full}, ${words}">${i}</button>`;
      }
      grid.innerHTML = html;
    }

    cal.addEventListener("click", (e) => {
      const nav = e.target.closest(".cal-nav");
      if (nav) { view.setMonth(view.getMonth() + Number(nav.dataset.step)); render(); return; }
      const day = e.target.closest(".cal-day.avail");
      if (!day) return;
      const d = new Date(day.dataset.date + "T00:00:00");
      form.elements.requested_date.value = day.dataset.date;
      form.querySelector(".cal-picked").textContent =
        d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
      msg.textContent = ""; msg.className = "form-msg";
      sendBtn.disabled = false; sendBtn.textContent = "Send request";
      form.hidden = false;
      dlg.showModal();
    });

    form.querySelector(".cal-cancel").addEventListener("click", () => dlg.close());
    dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        msg.textContent = "Please add your name, email and what you need help with.";
        msg.className = "form-msg err";
        form.reportValidity();
        return;
      }
      sendBtn.disabled = true; sendBtn.textContent = "Sending…"; msg.textContent = "";
      try {
        const res = await fetch("https://formspree.io/f/" + AVAILABILITY.formspree, {
          method: "POST", body: new FormData(form), headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(res.status);
        const date = form.elements.requested_date.value;
        requested.add(date);
        try {
          const mine = JSON.parse(localStorage.getItem("myRequests") || "[]");
          localStorage.setItem("myRequests", JSON.stringify([...new Set([...mine, date])]));
        } catch (e) {}
        form.reset();
        render();
        msg.textContent = "Thanks! Your request was sent. I'll confirm by email.";
        msg.className = "form-msg ok";
        sendBtn.textContent = "Sent";
        setTimeout(() => dlg.close(), 2500);
      } catch (err) {
        msg.textContent = "Sorry, that didn't send. Please try again or email me directly.";
        msg.className = "form-msg err";
        sendBtn.disabled = false; sendBtn.textContent = "Send request";
      }
    });

    render();
  }

  // Theme toggle (remembered per browser)
  const root = document.documentElement;
  try { const t = localStorage.getItem("theme"); if (t) root.dataset.theme = t; } catch (e) {}
  document.querySelector(".theme-toggle").addEventListener("click", () => {
    const dark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
  });

  // Generic tag filter: <div class="filters" data-target="#list"> with buttons[data-filter]
  document.querySelectorAll(".filters").forEach((bar) => {
    const list = document.querySelector(bar.dataset.target);
    bar.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      bar.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b));
      const f = b.dataset.filter;
      list.querySelectorAll(".item").forEach((it) => {
        it.hidden = f !== "all" && !(it.dataset.kind || "").split(" ").includes(f);
      });
      list.querySelectorAll(".year").forEach((y) => {
        let n = y.nextElementSibling, any = false;
        while (n && !n.classList.contains("year")) { if (!n.hidden) any = true; n = n.nextElementSibling; }
        y.hidden = !any;
      });
    });
  });
})();
