/**
 * One-time migration: MongoDB (mongoose models) → PostgreSQL (Aurora DSQL / RDS-style PG).
 *
 * Requires in backend/.env or shell:
 *   MONGO_URI
 *   PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD (and PGSSLMODE=require if needed)
 *
 * Run from backend folder: npm run migrate:postgres
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const { Client } = require('pg');
const slugify = require('slugify');

const Product = require('../models/Product');
const Order = require('../models/Order');

async function pgClient() {
  const client = new Client({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT || 5432),
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl:
      String(process.env.PGSSLMODE || '').toLowerCase() === 'require'
        ? { rejectUnauthorized: false }
        : false,
  });
  await client.connect();
  return client;
}

async function migrateProducts(client) {
  const products = await Product.find({});
  let n = 0;
  for (const p of products) {
    const name = String(p.name || '').trim();
    if (name.length < 2) continue;
    let slug = String(p.slug || '')
      .trim()
      .toLowerCase();
    if (!slug) slug = slugify(name, { lower: true, strict: true }) + '-' + Date.now();
    const price = Number(p.price);
    const stock = Number(p.stock ?? 0);
    if (!Number.isFinite(price)) continue;

    const salePrice =
      p.salePrice != null && p.salePrice !== '' ? Number(p.salePrice) : null;
    const sizes = Array.isArray(p.sizes) && p.sizes.length ? p.sizes : ['40', '41', '42'];
    const images = Array.isArray(p.images) ? p.images : [];

    await client.query(
      `INSERT INTO products (
        name, slug, description, price, sale_price, image, images, stock, category, brand, sizes, is_active, featured, rating, created_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7::text,$8,$9,$10,$11::text,$12,$13,$14,$15)
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        price = EXCLUDED.price,
        sale_price = EXCLUDED.sale_price,
        image = EXCLUDED.image,
        images = EXCLUDED.images,
        stock = EXCLUDED.stock,
        category = EXCLUDED.category,
        brand = EXCLUDED.brand,
        sizes = EXCLUDED.sizes,
        is_active = EXCLUDED.is_active,
        featured = EXCLUDED.featured,
        rating = EXCLUDED.rating`,
      [
        name,
        slug,
        String(p.description || ''),
        price,
        salePrice,
        String(p.image || ''),
        JSON.stringify(images),
        Number.isFinite(stock) ? stock : 0,
        String(p.category || 'Uncategorized'),
        String(p.brand || 'Shoes Hub'),
        JSON.stringify(sizes),
        p.isActive !== false,
        !!p.featured,
        Math.min(5, Math.max(0, Number(p.rating ?? 4.5))),
        p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
      ],
    );
    n += 1;
  }
  console.log(`Products migrated/updated: ${n}`);
}

async function migrateOrders(client) {
  const orders = await Order.find({});
  let n = 0;
  for (const o of orders) {
    const customerName = String(o.customerName || '').trim();
    if (!customerName) continue;

    const totalPrice = Number(o.totalPrice ?? 0);
    const ins = await client.query(
      `INSERT INTO orders (
        user_id, email, customer_name, customer_phone, address, city,
        total_price, payment_method, status, estimated_delivery_date, created_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING id`,
      [
        o.user ? String(o.user) : null,
        String(o.email || ''),
        customerName,
        String(o.customerPhone || ''),
        String(o.address || ''),
        String(o.city || ''),
        totalPrice,
        String(o.paymentMethod || 'cod'),
        String(o.status || 'Pending'),
        o.estimatedDeliveryDate ? new Date(o.estimatedDeliveryDate).toISOString() : null,
        o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
      ],
    );
    const orderId = ins.rows[0].id;
    const items = Array.isArray(o.items) ? o.items : [];
    for (const it of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, size, quantity, price)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          orderId,
          String(it.productId || ''),
          String(it.productName || ''),
          String(it.size || ''),
          Number(it.quantity || 1),
          Number(it.price || 0),
        ],
      );
    }
    n += 1;
  }
  console.log(`Orders migrated: ${n}`);
}

async function run() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required');
  if (!process.env.PGHOST || !process.env.PGDATABASE || !process.env.PGUSER) {
    throw new Error('PGHOST, PGDATABASE, PGUSER (and usually PGPASSWORD) are required');
  }

  await mongoose.connect(process.env.MONGO_URI);
  const client = await pgClient();

  try {
    await migrateProducts(client);
    await migrateOrders(client);
    console.log('Done.');
  } finally {
    await client.end();
    await mongoose.disconnect();
  }
}

run().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
