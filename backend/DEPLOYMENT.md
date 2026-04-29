# Backend Deployment Checklist

## Environment Variables
- `MONGODB_URI` (preferred) or `MONGO_URI` (legacy)
- `JWT_SECRET`
- `ADMIN_SETUP_KEY`
- `CLIENT_ORIGIN`
- `PORT` (optional)
- `CLOUDINARY_CLOUD_NAME` (required for image upload on Vercel/serverless)
- `CLOUDINARY_API_KEY` (required for image upload on Vercel/serverless)
- `CLOUDINARY_API_SECRET` (required for image upload on Vercel/serverless)
- `CLOUDINARY_UPLOAD_FOLDER` (optional, default: `products`)

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
