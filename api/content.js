import { query } from '../lib/dsql.js';
import { requireAdmin } from '../lib/authServer.js';
import { siteRowToClient } from '../lib/rowMappers.js';
import { getJsonBody } from '../lib/httpBody.js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  try {
    if (req.method === 'GET') {
      const r = await query('SELECT * FROM site_content WHERE singleton = 1');
      const row = r.rows[0];
      return res.status(200).json(siteRowToClient(row) || {});
    }

    if (req.method === 'PUT') {
      if (!requireAdmin(req)) {
        return res.status(401).json({ message: 'Admin permission required.' });
      }
      const b = await getJsonBody(req);
      await query(
        `UPDATE site_content SET
          hero_title = COALESCE($2, hero_title),
          hero_description = COALESCE($3, hero_description),
          hero_tag = COALESCE($4, hero_tag),
          promo_title = COALESCE($5, promo_title),
          promo_description = COALESCE($6, promo_description),
          whatsapp_number = COALESCE($7, whatsapp_number),
          updated_at = now()
        WHERE singleton = 1`,
        [
          1,
          b.heroTitle ?? null,
          b.heroDescription ?? null,
          b.heroTag ?? null,
          b.promoTitle ?? null,
          b.promoDescription ?? null,
          b.whatsappNumber ?? null,
        ]
      );
      const r = await query('SELECT * FROM site_content WHERE singleton = 1');
      return res.status(200).json(siteRowToClient(r.rows[0]));
    }

    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: e.message || 'Server error' });
  }
}
