import { query } from '../../lib/dsql.js';
import { requireAdmin } from '../../lib/authServer.js';
import { productRowToClient } from '../../lib/rowMappers.js';
import { getJsonBody } from '../../lib/httpBody.js';
import { parseJsonArray } from '../../lib/jsonText.js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  const id = req.query?.id;
  if (!id) {
    return res.status(400).json({ message: 'Missing product id' });
  }

  try {
    if (req.method === 'GET') {
      const r = await query('SELECT * FROM products WHERE id = $1', [id]);
      if (!r.rows.length) return res.status(404).json({ message: 'Not found' });
      return res.status(200).json(productRowToClient(r.rows[0]));
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      if (!requireAdmin(req)) {
        return res.status(401).json({ message: 'Admin permission required.' });
      }
      const cur = await query('SELECT * FROM products WHERE id = $1', [id]);
      if (!cur.rows.length) return res.status(404).json({ message: 'Not found' });
      const row = cur.rows[0];
      const body = await getJsonBody(req);

      const sizes = Array.isArray(body.sizes)
        ? body.sizes
        : String(body.sizes ?? '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);

      const name = body.name != null ? String(body.name) : row.name;
      const description = body.description != null ? String(body.description) : row.description;
      const price = body.price != null ? Number(body.price) : Number(row.price);
      let salePrice = row.sale_price;
      if (Object.prototype.hasOwnProperty.call(body, 'salePrice')) {
        salePrice = body.salePrice === '' || body.salePrice === null ? null : Number(body.salePrice);
      }
      const image = body.image != null ? String(body.image) : row.image;
      const imagesJson =
        body.images != null ? JSON.stringify(body.images) : JSON.stringify(parseJsonArray(row.images, []));
      const stock = body.stock != null ? Number(body.stock) : row.stock;
      const category = body.category != null ? String(body.category) : row.category;
      const brand = body.brand != null ? String(body.brand) : row.brand;
      const sizesJson = JSON.stringify(
        sizes.length ? sizes : parseJsonArray(row.sizes, ['40', '41', '42']),
      );
      const isActive = body.isActive != null ? Boolean(body.isActive) : row.is_active;
      const featured = body.featured != null ? Boolean(body.featured) : row.featured;
      const rating =
        body.rating != null ? Math.min(5, Math.max(0, Number(body.rating))) : Number(row.rating);

      const r = await query(
        `UPDATE products SET
          name = $2, description = $3, price = $4, sale_price = $5, image = $6, images = $7,
          stock = $8, category = $9, brand = $10, sizes = $11, is_active = $12, featured = $13, rating = $14
        WHERE id = $1
        RETURNING *`,
        [
          id,
          name,
          description,
          price,
          salePrice,
          image,
          imagesJson,
          stock,
          category,
          brand,
          sizesJson,
          isActive,
          featured,
          rating,
        ]
      );
      return res.status(200).json(productRowToClient(r.rows[0]));
    }

    if (req.method === 'DELETE') {
      if (!requireAdmin(req)) {
        return res.status(401).json({ message: 'Admin permission required.' });
      }
      const r = await query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
      if (!r.rows.length) return res.status(404).json({ message: 'Not found' });
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, PUT, PATCH, DELETE');
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: e.message || 'Server error' });
  }
}
