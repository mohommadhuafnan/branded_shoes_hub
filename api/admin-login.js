import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../lib/dsql.js';
import { getJsonBody } from '../lib/httpBody.js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: 'Server misconfiguration: JWT_SECRET missing' });
  }

  try {
    const body = await getJsonBody(req);
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const r = await query('SELECT id, name, email, password_hash, role FROM app_users WHERE email = $1', [email]);
    if (!r.rows.length) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = r.rows[0];
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'This account is not an admin account.' });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: String(user.id), role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    return res.status(200).json({
      token,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: e.message || 'Server error' });
  }
}
