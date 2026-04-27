import { parseJsonArray } from './jsonText.js';

export function productRowToClient(row) {
  const images = parseJsonArray(row.images, []);
  const sizes = parseJsonArray(row.sizes, ['40', '41', '42']);
  return {
    _id: row.id,
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? '',
    price: Number(row.price),
    salePrice: row.sale_price != null ? Number(row.sale_price) : null,
    image: row.image ?? '',
    images,
    stock: Number(row.stock ?? 0),
    category: row.category ?? 'Uncategorized',
    brand: row.brand ?? 'Shoes Hub',
    sizes: sizes.length ? sizes : ['40', '41', '42'],
    isActive: row.is_active,
    featured: row.featured,
    rating: Number(row.rating ?? 4.5),
    createdAt: row.created_at,
    active: row.is_active,
  };
}

export function siteRowToClient(row) {
  if (!row) return null;
  return {
    heroTitle: row.hero_title,
    heroDescription: row.hero_description,
    heroTag: row.hero_tag,
    promoTitle: row.promo_title,
    promoDescription: row.promo_description,
    whatsappNumber: row.whatsapp_number ?? '',
  };
}

export function orderRowWithItems(orderRow, itemRows) {
  return {
    _id: orderRow.id,
    id: orderRow.id,
    customerName: orderRow.customer_name,
    customerEmail: orderRow.email,
    customerPhone: orderRow.customer_phone,
    address: orderRow.address,
    city: orderRow.city,
    totalPrice: Number(orderRow.total_price),
    paymentMethod: orderRow.payment_method,
    status: orderRow.status,
    estimatedDeliveryDate: orderRow.estimated_delivery_date,
    createdAt: orderRow.created_at,
    items: (itemRows || []).map((it) => ({
      productId: it.product_id,
      productName: it.product_name,
      size: it.size,
      quantity: it.quantity,
      price: Number(it.price),
    })),
  };
}
