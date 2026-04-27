-- Run in Aurora DSQL Query Editor (or psql) once per cluster.
-- Aurora DSQL does not support JSONB — arrays/objects are stored as TEXT JSON.
-- Aurora DSQL does not support FOREIGN KEY — order_items.order_id matches orders.id in application only.

-- If a previous run failed, drop affected tables first (adjust if you have data to keep):
-- DROP TABLE IF EXISTS order_items;
-- DROP TABLE IF EXISTS orders CASCADE;
-- DROP TABLE IF EXISTS products CASCADE;
-- DROP TABLE IF EXISTS user_shop_state CASCADE;

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC(12,2) NOT NULL,
  sale_price NUMERIC(12,2),
  image TEXT DEFAULT '',
  images TEXT NOT NULL DEFAULT '[]',
  stock INT NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'Uncategorized',
  brand TEXT NOT NULL DEFAULT 'Shoes Hub',
  sizes TEXT NOT NULL DEFAULT '["40","41","42"]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  rating NUMERIC(3,1) NOT NULL DEFAULT 4.5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT products_slug_key UNIQUE (slug)
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  email TEXT DEFAULT '',
  customer_name TEXT NOT NULL,
  customer_phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  total_price NUMERIC(12,2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cod',
  status TEXT NOT NULL DEFAULT 'Pending',
  estimated_delivery_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  size TEXT DEFAULT '',
  quantity INT NOT NULL DEFAULT 1,
  price NUMERIC(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS site_content (
  singleton SMALLINT PRIMARY KEY DEFAULT 1,
  hero_title TEXT DEFAULT 'New Season Drops',
  hero_description TEXT DEFAULT 'Fresh styles, limited stock. Grab your size now.',
  hero_tag TEXT DEFAULT 'Up to 25% off',
  promo_title TEXT DEFAULT 'New season arrivals with premium comfort and sharp street style.',
  promo_description TEXT DEFAULT 'Use the filters on each page to sort by price, size, rating, and sale items.',
  whatsapp_number TEXT DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO site_content (singleton) VALUES (1)
ON CONFLICT (singleton) DO NOTHING;

CREATE TABLE IF NOT EXISTS user_shop_state (
  firebase_uid TEXT PRIMARY KEY,
  cart_items TEXT NOT NULL DEFAULT '[]',
  favorites TEXT NOT NULL DEFAULT '[]',
  settings TEXT NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin users for Vercel /api (replaces Mongo when using DSQL). Store email lowercased.
CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
