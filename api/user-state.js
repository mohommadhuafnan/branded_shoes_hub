import { query } from '../lib/dsql.js';
import { getFirebaseUidFromRequest } from '../lib/authServer.js';
import { getJsonBody } from '../lib/httpBody.js';
import { parseJsonArray, parseJsonObject } from '../lib/jsonText.js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  const uid = getFirebaseUidFromRequest(req);
  if (!uid) {
    return res.status(401).json({ message: 'Sign in required' });
  }

  try {
    if (req.method === 'GET') {
      const r = await query(
        `SELECT cart_items, favorites, settings FROM user_shop_state WHERE firebase_uid = $1`,
        [uid]
      );
      const row = r.rows[0];
      if (!row) {
        return res.status(200).json({ cartItems: [], favorites: [], settings: {} });
      }
      return res.status(200).json({
        cartItems: parseJsonArray(row.cart_items, []),
        favorites: parseJsonArray(row.favorites, []),
        settings: parseJsonObject(row.settings, {}),
      });
    }

    if (req.method === 'PUT') {
      const b = await getJsonBody(req);
      const cartItems = Array.isArray(b.cartItems) ? b.cartItems : [];
      const favorites = Array.isArray(b.favorites) ? b.favorites : [];
      const settings = b.settings && typeof b.settings === 'object' ? b.settings : {};

      await query(
        `INSERT INTO user_shop_state (firebase_uid, cart_items, favorites, settings, updated_at)
         VALUES ($1, $2, $3, $4, now())
         ON CONFLICT (firebase_uid) DO UPDATE SET
           cart_items = EXCLUDED.cart_items,
           favorites = EXCLUDED.favorites,
           settings = EXCLUDED.settings,
           updated_at = now()`,
        [uid, JSON.stringify(cartItems), JSON.stringify(favorites), JSON.stringify(settings)]
      );
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: e.message || 'Server error' });
  }
}
