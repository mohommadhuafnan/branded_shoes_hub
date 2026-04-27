import { query } from '../lib/dsql.js';
import { requireAdmin } from '../lib/authServer.js';
import { productRowToClient } from '../lib/rowMappers.js';
import { getJsonBody } from '../lib/httpBody.js';
import slugify from 'slugify';

function searchParams(req) {
  return new URL(req.url || '/', 'http://localhost').searchParams;
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  try {
    if (req.method === 'GET') {
      const sp = searchParams(req);
      const page = Math.max(Number(sp.get('page') || 1), 1);
      const limit = Math.min(Math.max(Number(sp.get('limit') || 100), 1), 200);
      const search = (sp.get('search') || '').trim();
      const category = (sp.get('category') || '').trim();
      const featured = sp.get('featured');
      const admin = requireAdmin(req);
      const includeInactive = admin && sp.get('includeInactive') === 'true';

      const conditions = [];
      const params = [];
      let p = 1;

      if (!includeInactive) {
        conditions.push('is_active = true');
      }
      if (category) {
        conditions.push(`category ILIKE $${p++}`);
        params.push(`%${category}%`);
      }
      if (featured === 'true') {
        conditions.push('featured = true');
      }
      if (search) {
        conditions.push(`(name ILIKE $${p} OR description ILIKE $${p})`);
        params.push(`%${search}%`);
        p += 1;
      }

      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      const countSql = `SELECT COUNT(*)::int AS c FROM products ${where}`;
      const lim = p;
      const off = p + 1;
      const listSql = `SELECT * FROM products ${where} ORDER BY created_at DESC LIMIT $${lim} OFFSET $${off}`;
      const listParams = [...params, limit, (page - 1) * limit];

      const [countRes, listRes] = await Promise.all([query(countSql, params), query(listSql, listParams)]);

      const total = countRes.rows[0]?.c ?? 0;
      const data = listRes.rows.map(productRowToClient);
      return res.status(200).json({
        data,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
      });
    }

    if (req.method === 'POST') {
      if (!requireAdmin(req)) {
        return res.status(401).json({ message: 'Admin permission required.' });
      }
      const body = await getJsonBody(req);
      const name = String(body.name || '').trim();
      if (name.length < 2) {
        return res.status(400).json({ message: 'Name is required (min 2 chars).' });
      }
      const price = Number(body.price);
      const stock = Number(body.stock ?? 0);
      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({ message: 'Valid price is required.' });
      }
      const sizes = Array.isArray(body.sizes)
        ? body.sizes
        : String(body.sizes || '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
      const slugBase = slugify(name, { lower: true, strict: true });
      const slug = `${slugBase}-${Date.now()}`;
      const salePrice = body.salePrice != null && body.salePrice !== '' ? Number(body.salePrice) : null;

      const insert = `
        INSERT INTO products (
          name, slug, description, price, sale_price, image, images, stock, category, brand, sizes, is_active, featured, rating
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
        RETURNING *
      `;
      const values = [
        name,
        slug,
        String(body.description || ''),
        price,
        salePrice,
        String(body.image || ''),
        JSON.stringify(Array.isArray(body.images) ? body.images : []),
        Number.isFinite(stock) ? stock : 0,
        String(body.category || 'Uncategorized'),
        String(body.brand || 'Shoes Hub'),
        JSON.stringify(sizes.length ? sizes : ['40', '41', '42']),
        body.isActive !== false,
        !!body.featured,
        Math.min(5, Math.max(0, Number(body.rating ?? 4.5))),
      ];
      const r = await query(insert, values);
      return res.status(201).json(productRowToClient(r.rows[0]));
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: e.message || 'Server error' });
  }
}
