import { query } from '../lib/dsql.js';
import { getFirebaseUidFromRequest } from '../lib/authServer.js';
import { orderRowWithItems } from '../lib/rowMappers.js';

function groupItemsByOrderId(itemRows) {
  const map = new Map();
  for (const row of itemRows) {
    if (!map.has(row.order_id)) map.set(row.order_id, []);
    map.get(row.order_id).push(row);
  }
  return map;
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const uid = getFirebaseUidFromRequest(req);
  if (!uid) {
    return res.status(401).json({ message: 'Login required' });
  }

  try {
    const ordersRes = await query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100`,
      [uid],
    );
    const ids = ordersRes.rows.map((r) => r.id);
    if (!ids.length) {
      return res.status(200).json([]);
    }
    const itemsRes = await query(`SELECT * FROM order_items WHERE order_id = ANY($1::uuid[])`, [ids]);
    const byOrder = groupItemsByOrderId(itemsRes.rows);
    const data = ordersRes.rows.map((o) => orderRowWithItems(o, byOrder.get(o.id) || []));
    return res.status(200).json(data);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: e.message || 'Server error' });
  }
}
