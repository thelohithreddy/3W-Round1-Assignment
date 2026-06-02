# Image uploads — with or without Cloudinary

## Option A: No Cloudinary account (local development only)

You can post images **right now** on your computer without signing up anywhere.

1. Make sure `backend/.env` does **not** have empty Cloudinary lines, or leave them commented out.
2. Restart backend:
   ```powershell
   cd backend
   npm run dev
   ```
3. You should see:
   ```
   📁 Cloudinary not set — images will save to backend/uploads/ (local dev only).
   ```
4. Create a post with an image — it will work.

Images are stored in `backend/uploads/` and served at `http://localhost:5000/uploads/...` (or port 5001 if you use that).

**Important:** Local uploads do **not** work on Render/Vercel after deploy. You will need Cloudinary before submission if the assignment requires deployed image posts.

---

## Option B: Free Cloudinary (required for deployment)

When you deploy to **Render**, use Cloudinary (free tier is enough).

1. Sign up: https://cloudinary.com/users/register_free  
   (Google sign-in is fastest — about 2 minutes.)
2. Open **Dashboard** → copy:
   - Cloud name  
   - API Key  
   - API Secret  
3. Add to `backend/.env`:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Restart backend — Cloudinary is used automatically instead of local folder.

Same keys go into **Render** environment variables when you deploy.

---

## Troubleshooting

| Problem | Fix |
|--------|-----|
| Image broken in feed | Backend must be running; URL must match your `PORT` |
| Still says api_key | Restart backend after code update; clear old error |
| Works locally, not online | Add Cloudinary on Render (Option B) |
