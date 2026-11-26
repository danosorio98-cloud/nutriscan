const PREFIX = 'nutriscan_';

export const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); }
    catch (e) { console.error('storage.set', e); }
  },
  remove(key) {
    try { localStorage.removeItem(PREFIX + key); }
    catch {}
  }
};

// ── User profile persistence ──────────────────────────────────────────────────
export function loadUserProfile() {
  return storage.get('user', null);
}

export function saveUserProfile(profile) {
  storage.set('user', profile);
}

// ── Scan history ──────────────────────────────────────────────────────────────
export function loadHistory() {
  return storage.get('history', []);
}

export function saveHistory(history) {
  storage.set('history', history);
}

export function addHistoryItem(item) {
  const history = loadHistory();
  const next = [item, ...history].slice(0, 100); // keep 100 max
  saveHistory(next);
  return next;
}

// ── Recipes cache ─────────────────────────────────────────────────────────────
export function loadRecipesCache(profileId) {
  return storage.get(`recipes_${profileId}`, null);
}

export function saveRecipesCache(profileId, data) {
  storage.set(`recipes_${profileId}`, { data, ts: Date.now() });
}

// ── Top foods cache ───────────────────────────────────────────────────────────
export function loadFoodsCache(profileId) {
  return storage.get(`foods_${profileId}`, null);
}

export function saveFoodsCache(profileId, data) {
  storage.set(`foods_${profileId}`, { data, ts: Date.now() });
}
