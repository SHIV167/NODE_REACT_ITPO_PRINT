import crypto from 'node:crypto';
import { pool } from './db.js';

const query = (text, params) => pool.query(text, params);

const SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8 hours

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const test = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return test.length === expected.length && crypto.timingSafeEqual(test, expected);
}

export async function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  await query(
    'INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)',
    [token, userId, new Date(Date.now() + SESSION_TTL_MS)]
  );
  return token;
}

export async function getSessionUser(token) {
  if (!token) return null;
  const { rows } = await query(
    `SELECT u.id, u.username, u.full_name, u.role
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token = $1 AND s.expires_at > NOW()`,
    [token]
  );
  return rows[0] || null;
}

export async function destroySession(token) {
  if (token) await query('DELETE FROM sessions WHERE token = $1', [token]);
}

const COOKIE_NAME = 'pp_session';

export function parseCookies(req) {
  const header = req.headers.cookie || '';
  const out = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx > 0) out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return out;
}

export async function authMiddleware(req, res, next) {
  const token = parseCookies(req)[COOKIE_NAME];
  const user = await getSessionUser(token);
  if (!user) return res.status(401).json({ error: 'Authentication required' });
  req.user = user;
  req.sessionToken = token;
  next();
}

export { COOKIE_NAME };
