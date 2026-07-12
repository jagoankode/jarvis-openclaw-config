import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DATABASE_PATH || join(__dirname, '..', '..', 'data', 'auth.db.json');

/**
 * Simple JSON-file-backed store for local development/testing.
 * Replaces SQLite to avoid native compilation issues.
 *
 * Schema mirrors:
 *   users: { id, email, password_hash, full_name, role, is_active, created_at, updated_at }[]
 *   refresh_tokens: { id, user_id, token, expires_at, created_at }[]
 */
class JsonStore {
  constructor() {
    this._data = { users: [], refresh_tokens: [] };
    this._init();
  }

  _init() {
    const dir = dirname(DB_PATH);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    if (existsSync(DB_PATH)) {
      try {
        this._data = JSON.parse(readFileSync(DB_PATH, 'utf-8'));
      } catch {
        this._data = { users: [], refresh_tokens: [] };
      }
    }
    this._persist();
  }

  _persist() {
    writeFileSync(DB_PATH, JSON.stringify(this._data, null, 2), 'utf-8');
  }

  // --- Users ---

  findUserByEmail(email) {
    const normalized = email.toLowerCase().trim();
    return this._data.users.find((u) => u.email === normalized) || null;
  }

  findUserById(id) {
    return this._data.users.find((u) => u.id === id) || null;
  }

  insertUser(user) {
    this._data.users.push(user);
    this._persist();
    return user;
  }

  // --- Refresh Tokens ---

  findRefreshToken(token) {
    return this._data.refresh_tokens.find((rt) => rt.token === token) || null;
  }

  insertRefreshToken(rt) {
    this._data.refresh_tokens.push(rt);
    this._persist();
    return rt;
  }

  deleteRefreshToken(id) {
    const idx = this._data.refresh_tokens.findIndex((rt) => rt.id === id);
    if (idx !== -1) {
      this._data.refresh_tokens.splice(idx, 1);
      this._persist();
      return true;
    }
    return false;
  }

  deleteRefreshTokenByValue(token) {
    const idx = this._data.refresh_tokens.findIndex((rt) => rt.token === token);
    if (idx !== -1) {
      this._data.refresh_tokens.splice(idx, 1);
      this._persist();
      return true;
    }
    return false;
  }

  /**
   * Clear all data (for testing).
   */
  clear() {
    this._data = { users: [], refresh_tokens: [] };
    this._persist();
  }
}

// Singleton
let _instance = null;

/**
 * Get or initialize the JSON store singleton.
 * @returns {JsonStore}
 */
export function getDb() {
  if (!_instance) _instance = new JsonStore();
  return _instance;
}

/**
 * Close/clear the DB instance (for testing teardown).
 */
export function closeDb() {
  _instance = null;
}

export default { getDb, closeDb };
