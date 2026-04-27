# Backend Deployment Checklist

## Environment Variables
- `MONGO_URI`
- `JWT_SECRET`
- `ADMIN_SETUP_KEY`
- `CLIENT_ORIGIN`
- `PORT` (optional)

## First-time Setup
1. Install packages: `npm install`
2. Start API: `npm run dev`
3. Seed admin account: `npm run seed:admin`

## API Endpoints
- Health: `GET /api/health`
- Products: `GET /api/products`
- Product upload: `POST /api/products/upload` (admin token)
- Orders create: `POST /api/orders`
- Orders manage: `GET /api/orders` and `PUT /api/orders/:id/status` (admin token)
- Dashboard: `GET /api/admin/dashboard` (admin token)
- Content: `GET /api/content` and `GET/PUT /api/admin/content` (admin token for PUT)
