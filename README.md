# Shoes Hub Deployment Guide

This project has two parts:
- Frontend: React + Vite (can be hosted on Vercel)
- Backend: Express + MongoDB (must be hosted separately for 24/7 uptime)

If your backend runs only on your local PC, your public website will stop working when your PC is off.

## 1) Run Locally

### Frontend
1. Install dependencies:
   - `npm install`
2. Create `.env.local` in project root:
   - `VITE_API_URL=http://localhost:5000/api`
3. Start frontend:
   - `npm run dev`

### Backend
1. Open a second terminal:
   - `cd backend`
   - `npm install`
2. Create `backend/.env`:
   - `MONGODB_URI=your_mongodb_connection_string`
   - `JWT_SECRET=your_long_random_secret`
   - `ADMIN_SETUP_KEY=your_long_random_secret`
   - `CLIENT_ORIGIN=http://localhost:5173`
   - `PORT=5000`
3. Start backend:
   - `npm run dev`

## 2) Production (24/7) Setup

You need both frontend and backend hosted online.

### A. Host backend (Render/Railway/EC2/etc.)
Deploy the `backend` folder as a Node service and set:
- `MONGODB_URI`
- `JWT_SECRET`
- `ADMIN_SETUP_KEY`
- `CLIENT_ORIGIN=https://your-vercel-domain.vercel.app`

After deploy, note your backend URL, for example:
- `https://shoes-hub-api.onrender.com`

Test it:
- `https://shoes-hub-api.onrender.com/api/health`

### B. Host frontend (Vercel)
In Vercel project environment variables set:
- `VITE_API_URL=https://shoes-hub-api.onrender.com/api`

Then redeploy frontend.

## 3) Why products were not visible

Common causes:
- Frontend used `localhost` API URL in production.
- Backend was running only on local machine.
- Uploaded product images were saved as `/uploads/...` but backend host was not reachable publicly.

This project now normalizes relative image paths using the configured API host, so `/uploads/...` can render correctly when backend is hosted.

## 4) Important note about image uploads

Current uploads are saved on backend disk (`backend/uploads`).
On many cloud hosts, local disk is temporary. For reliable production, move images to cloud storage (Cloudinary, S3, Supabase Storage, etc.).

## 5) Quick checklist

- Backend `api/health` works online.
- `VITE_API_URL` points to backend online URL.
- MongoDB is cloud-hosted (MongoDB Atlas recommended).
- Frontend and backend CORS origin values are correct.
- Admin adds product and product appears immediately on public site.
