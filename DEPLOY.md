# Deployment checklist (GitHub → Live)

## Before you push to GitHub

1. **Never commit** `backend/.env` or `frontend/.env` (already in `.gitignore`).
2. Run locally:
   ```bash
   cd backend && npm install && npm run dev
   cd frontend && npm install && npm run dev
   ```
3. Test: signup → login → create post (text + image) → like → comment → edit post → delete → logout.

## GitHub

```bash
git init
git add .
git commit -m "Social Post SaaS - full stack internship project"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## MongoDB Atlas

1. Create free cluster + database user.
2. Network access: `0.0.0.0/0` (demo) or restrict later.
3. Copy connection string → `MONGO_URI`.

## Cloudinary

1. Create free account.
2. Copy cloud name, API key, API secret into Render env vars.

## Render (backend)

| Setting | Value |
|--------|--------|
| Root directory | `backend` |
| Build | `npm install` |
| Start | `npm start` |
| Health check path | `/api/health` |

**Environment variables:**

```
PORT=5000
MONGO_URI=...
JWT_SECRET=long_random_string
JWT_EXPIRE=7d
CLIENT_URL=https://your-frontend.vercel.app
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
NODE_ENV=production
```

Note: Render sets `PORT` automatically; your app uses `process.env.PORT`.

## Vercel (frontend)

| Setting | Value |
|--------|--------|
| Root directory | `frontend` |
| Build | `npm run build` |
| Output | `dist` |

**Environment variable:**

```
VITE_API_BASE_URL=https://your-app.onrender.com/api
```

Redeploy frontend after backend URL is known. Update Render `CLIENT_URL` to match Vercel URL.

## After deploy

- [ ] Login works on live site
- [ ] Image posts work (Cloudinary configured)
- [ ] Update README.md with live URLs
