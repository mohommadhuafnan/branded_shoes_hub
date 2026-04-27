import { query } from '../lib/dsql.js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false });
  }
  try {
    await query('SELECT 1 AS ok');
    return res.status(200).json({ ok: true, database: true });
  } catch (e) {
    return res.status(503).json({ ok: false, database: false, message: e.message || 'unavailable' });
  }
}
