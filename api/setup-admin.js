import bcrypt from 'bcryptjs';
import { query } from '../lib/dsql.js';
import { getJsonBody } from '../lib/httpBody.js';

const getSetupKey = () =>
  process.env.ADMIN_SETUP_KEY || (process.env.NODE_ENV === 'production' ? '' : '1234');

/**
 * One-time or controlled bootstrap: creates an admin in app_users.
 * Requires ADMIN_SETUP_KEY (set in Vercel env, then rotate/remove after onboarding).
 */
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const setupKey = getSetupKey();
  if (!setupKey) {
    return res.status(503).json({ message: 'ADMIN_SETUP_KEY is not configured on the server.' });
  }

  try {
    const body = await getJsonBody(req);
    if (body.setupKey !== setupKey) {
      return res.status(403).json({ message: 'Invalid setup key' });
    }

    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const name = String(body.name || 'Admin').trim() || 'Admin';

    if (!email || !password || password.length < 6) {
      return res.status(400).json({ message: 'Valid email and password (min 6 chars) required' });
    }

    const existing = await query('SELECT id FROM app_users WHERE email = $1', [email]);
    if (existing.rows.length) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    await query(
      `INSERT INTO app_users (email, name, password_hash, role) VALUES ($1, $2, $3, 'admin')`,
      [email, name, password_hash]
    );

    return res.status(201).json({ ok: true, message: 'Admin created. Log in with /api/admin-login.' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: e.message || 'Server error' });
  }
}
