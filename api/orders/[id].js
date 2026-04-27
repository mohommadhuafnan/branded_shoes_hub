import { query } from '../../lib/dsql.js';
import { requireAdmin } from '../../lib/authServer.js';
import { getJsonBody } from '../../lib/httpBody.js';

const ALLOWED = new Set(['Pending', 'Packed', 'Shipped', 'Delivered', 'Cancelled']);

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  const id = req.query?.id;
  if (!id) return res.status(400).json({ message: 'Missing order id' });

  if (req.method !== 'PATCH' && req.method !== 'PUT') {
    res.setHeader('Allow', 'PATCH, PUT');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!requireAdmin(req)) {
    return res.status(401).json({ message: 'Admin permission required.' });
  }

  try {
    const body = await getJsonBody(req);
    const status = String(body.status || '').trim();
    if (!ALLOWED.has(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const r = await query(`UPDATE orders SET status = $2 WHERE id = $1 RETURNING id`, [id, status]);
    if (!r.rows.length) return res.status(404).json({ message: 'Not found' });
    return res.status(200).json({ ok: true, id, status });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: e.message || 'Server error' });
  }
}
