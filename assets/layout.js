// Shared masthead, sidebar and footer. Edit PROFILE / NAV here once and every page updates.
(function () {
  const PROFILE = {
    name: "Keiran Moores",
    handle: "keiranmoores",
    title: "Assistant Professor",
    affiliation: "Northbridge Institute of Technology",
    bio: "Cybersecurity · Machine Learning · Networking",
    links: [
      { label: "Universität Liechtenstein", href: "https://www.uni.li", icon: "building" },
      { label: "Email", href: "mailto:keiranmoores@gmail.com", icon: "mail" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/keiranmoores/", icon: "user" },
      { label: "GitHub", href: "https://github.com/Keiran39493", icon: "code" },
    ],
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
    </ul>`;

  const footer = `
    <footer class="footer"><div class="footer-inner">
      <span>© ${new Date().getFullYear()} ${PROFILE.name}. Placeholder content.</span>
      <span><button class="theme-toggle" type="button">Toggle theme</button></span>
    </div></footer>`;

  document.body.insertAdjacentHTML("afterbegin", masthead);
  const side = document.querySelector(".sidebar");
  if (side) side.innerHTML = sidebar;
  document.body.insertAdjacentHTML("beforeend", footer);

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
