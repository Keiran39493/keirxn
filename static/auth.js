const AUTH = {
  // SHA-256 hashes of the credentials (username + password kept separate)
  U_HASH: '5IYWU+2B66QLqWpll89MovsSne15Yb4e/HIjMs01WNY=',
  P_HASH: 'oYtbmZN0Ko2cd5UdNXWYmcr0T2l9eJqAZhBwXOydcO4=',

  SESSION_KEY: 'keirxn_auth',
  SESSION_DURATION_MS: 8 * 60 * 60 * 1000,

  async _sha256b64(str) {
    const buf = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(str)
    );
    return btoa(String.fromCharCode(...new Uint8Array(buf)));
  },

  async login(username, password) {
    const [uHash, pHash] = await Promise.all([
      this._sha256b64(username),
      this._sha256b64(password),
    ]);
    if (uHash !== this.U_HASH || pHash !== this.P_HASH) {
      throw new Error('Invalid credentials');
    }
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify({
      exp: Date.now() + this.SESSION_DURATION_MS,
    }));
  },

  verify() {
    try {
      const raw = sessionStorage.getItem(this.SESSION_KEY);
      if (!raw) return false;
      const { exp } = JSON.parse(raw);
      return typeof exp === 'number' && exp > Date.now();
    } catch {
      return false;
    }
  },

  logout() {
    sessionStorage.removeItem(this.SESSION_KEY);
    window.location.replace('login.html');
  },

  async guard() {
    if (!this.verify()) {
      window.location.replace('login.html');
      return false;
    }
    document.body.style.visibility = 'visible';
    return true;
  },
};
