// Spinning 3D globe made from the site logo, in the spirit of donut.c.
//  * Every page: the browser tab icon spins (Chrome / Edge / Firefox; Safari keeps the still icon).
//  * Pages with <pre id="ascii-globe">: an ASCII-shaded version is drawn there.
// The logo is wrapped onto a sphere: front half shows the logo, back half shows it again (unmirrored).
(function () {
  const TEX = 128; // texture resolution sampled from the logo
  const TILT = -0.35; // axial tilt in radians
  const SPIN_MS = 6000; // one full turn
  const LIGHT = norm([-0.55, 0.6, 0.7]);
  const RAMP = " .,-~:;=!*#$@";
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function norm(v) {
    const l = Math.hypot(v[0], v[1], v[2]);
    return [v[0] / l, v[1] / l, v[2] / l];
  }

  const img = new Image();
  img.src = "/assets/favicon.png";
  img.onload = () => {
    const c = document.createElement("canvas");
    c.width = c.height = TEX;
    const g = c.getContext("2d");
    g.drawImage(img, 0, 0, TEX, TEX);
    let data;
    try { data = g.getImageData(0, 0, TEX, TEX).data; } catch (e) { return; } // e.g. file:// pages
    startFavicon(data);
    const pre = document.getElementById("ascii-globe");
    if (pre) startAscii(pre, data);
  };

  // Map a screen point (x, y in -1..1, y up) at a given angle to the logo's colour and shading.
  // Returns null outside the sphere; otherwise [r, g, b, alpha, shade].
  function shadePoint(tex, x, y, angle) {
    const d = x * x + y * y;
    if (d > 1) return null;
    const z = Math.sqrt(1 - d);
    // Undo tilt (around X), then spin (around Y) to get the point in logo space.
    const ct = Math.cos(-TILT), st = Math.sin(-TILT);
    const y1 = y * ct - z * st, z1 = y * st + z * ct;
    const ca = Math.cos(-angle), sa = Math.sin(-angle);
    const px = x * ca + z1 * sa, pz = -x * sa + z1 * ca, py = y1;
    const u = pz >= 0 ? (1 + px) / 2 : (1 - px) / 2;
    const v = (1 - py) / 2;
    const i = (Math.min(TEX - 1, (v * TEX) | 0) * TEX + Math.min(TEX - 1, (u * TEX) | 0)) * 4;
    const diffuse = Math.max(0, x * LIGHT[0] + y * LIGHT[1] + z * LIGHT[2]);
    return [tex[i], tex[i + 1], tex[i + 2], tex[i + 3] / 255, 0.25 + 0.75 * diffuse];
  }

  function angleAt(t) {
    return still ? 0.6 : ((t % SPIN_MS) / SPIN_MS) * Math.PI * 2;
  }

  function startFavicon(tex) {
    const S = 64;
    const c = document.createElement("canvas");
    c.width = c.height = S;
    const g = c.getContext("2d");
    const out = g.createImageData(S, S);
    document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]').forEach((l) => l.remove());
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    document.head.appendChild(link);

    function frame() {
      const a = angleAt(performance.now());
      for (let py = 0; py < S; py++) {
        for (let px = 0; px < S; px++) {
          const o = (py * S + px) * 4;
          const s = shadePoint(tex, ((px + 0.5) / S) * 2 - 1, 1 - ((py + 0.5) / S) * 2, a);
          if (!s || s[3] < 0.1) { out.data[o + 3] = 0; continue; }
          const k = 0.45 + 0.75 * s[4];
          out.data[o] = Math.min(255, s[0] * k);
          out.data[o + 1] = Math.min(255, s[1] * k);
          out.data[o + 2] = Math.min(255, s[2] * k);
          out.data[o + 3] = 255 * s[3];
        }
      }
      g.putImageData(out, 0, 0);
      link.href = c.toDataURL("image/png");
    }
    frame();
    if (!still) setInterval(frame, 100);
  }

  function startAscii(pre, tex) {
    const COLS = 64, ROWS = 32; // characters are ~0.6 wide : 1.2 tall, so this grid is square on screen
    const last = RAMP.length - 1;

    function weight(s) {
      if (s[3] < 0.1) return 0.12; // gaps between the swooshes: faint
      return s[0] + s[1] + s[2] < 400 ? 1 : 0.72; // dark blue vs light blue
    }

    function frame(t) {
      const a = angleAt(t);
      let txt = "";
      for (let r = 0; r < ROWS; r++) {
        for (let col = 0; col < COLS; col++) {
          const s = shadePoint(tex, ((col + 0.5) / COLS) * 2 - 1, 1 - ((r + 0.5) / ROWS) * 2, a);
          txt += s ? RAMP[Math.max(1, Math.min(last, Math.round(s[4] * weight(s) * last)))] : " ";
        }
        txt += "\n";
      }
      pre.textContent = txt;
    }

    if (still) return frame(0);
    let prev = 0;
    (function loop(t) {
      if (t - prev > 33) { frame(t); prev = t; } // ~30 fps; rAF pauses in background tabs
      requestAnimationFrame(loop);
    })(0);
  }
})();
