import { query, withConnection } from '../lib/dsql.js';
import { requireAdmin } from '../lib/authServer.js';
import { orderRowWithItems } from '../lib/rowMappers.js';
import { getJsonBody } from '../lib/httpBody.js';

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
  try {
    if (req.method === 'GET') {
      if (!requireAdmin(req)) {
        return res.status(401).json({ message: 'Admin permission required.' });
      }
      const ordersRes = await query(
        `SELECT * FROM orders ORDER BY created_at DESC LIMIT 500`
      );
      const ids = ordersRes.rows.map((r) => r.id);
      if (!ids.length) {
        return res.status(200).json({ data: [] });
      }
      const itemsRes = await query(
        `SELECT * FROM order_items WHERE order_id = ANY($1::uuid[])`,
        [ids]
      );
      const byOrder = groupItemsByOrderId(itemsRes.rows);
      const data = ordersRes.rows.map((o) => orderRowWithItems(o, byOrder.get(o.id) || []));
      return res.status(200).json({ data });
    }

    if (req.method === 'POST') {
      const body = await getJsonBody(req);
      const customerName = String(body.customerName || '').trim();
      if (!customerName) {
        return res.status(400).json({ message: 'customerName is required' });
      }
      const items = Array.isArray(body.items) ? body.items : [];
      const totalPrice = Number(body.totalPrice ?? 0);

      const result = await withConnection(async (client) => {
        const ins = await client.query(
          `INSERT INTO orders (
            user_id, email, customer_name, customer_phone, address, city,
            total_price, payment_method, status
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
          RETURNING *`,
          [
            body.userId || null,
            String(body.customerEmail || body.email || ''),
            customerName,
            String(body.customerPhone || ''),
            String(body.address || ''),
            String(body.city || ''),
            totalPrice,
            String(body.paymentMethod || 'cod'),
            String(body.status || 'Pending'),
          ]
        );
        const order = ins.rows[0];
        for (const it of items) {
          await client.query(
            `INSERT INTO order_items (order_id, product_id, product_name, size, quantity, price)
             VALUES ($1,$2,$3,$4,$5,$6)`,
            [
              order.id,
              String(it.productId || ''),
              String(it.productName || ''),
              String(it.size || ''),
              Number(it.quantity || 1),
              Number(it.price || 0),
            ]
          );
        }
        const itemsR = await client.query(`SELECT * FROM order_items WHERE order_id = $1`, [order.id]);
        return orderRowWithItems(order, itemsR.rows);
      });

      return res.status(201).json(result);
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: e.message || 'Server error' });
  }
}
