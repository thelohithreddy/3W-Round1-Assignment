# Social Post SaaS

Production-ready full-stack social feed for the **3W Full Stack Internship Assignment**. Mobile-first UI, JWT auth, Cloudinary images, likes, comments, notifications, and profile management — deployable to **Render + Vercel + MongoDB Atlas**.

## Features

### Core (assignment)
- Secure signup / login with validation
- JWT sessions (persist on refresh)
- Create posts: text, image, or both
- Global paginated feed + Load More
- Like / unlike (optimistic UI)
- Comments (bottom sheet)
- Delete own posts
- Profile: My Posts / Liked / Commented
- MongoDB: **only** `users` and `posts` collections

### SaaS polish
- Show / hide password on login & signup
- **Edit post** (text, replace/remove image)
- Post options menu: Edit · Delete
- Dark mode (header toggle)
- Notifications (new post from people you follow, follow, like, comment)
- Followers / following lists
- Share post (copy link + native share)
- Emoji picker on posts & comments
- Env validation on server start
- GitHub Actions CI (build check)
- Health endpoint: `GET /api/health`

## Tech stack

| Layer | Stack |
|-------|--------|
| Frontend | React 18, Vite, React Router, Axios, MUI, CSS |
| Backend | Node.js, Express, Mongoose, JWT, bcrypt, Multer |
| Database | MongoDB Atlas |
| Media | Cloudinary |

## Project structure

```
├── frontend/     # React app
├── backend/      # Express API
├── DEPLOY.md     # Step-by-step deploy guide
├── HOW_TO_RUN.md # Local Windows/PowerShell help
└── README.md
```

## Local setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas (or local MongoDB)
- Cloudinary account (required for image posts)

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set MONGO_URI, JWT_SECRET, Cloudinary keys
npm install
npm run dev
```

API: `http://localhost:5000` (or your `PORT` in `.env`)

### Frontend

```bash
cd frontend
cp .env.example .env
# VITE_API_BASE_URL must match backend port, e.g. http://localhost:5000/api
npm install
npm run dev
```

App: `http://localhost:5173`

> **Port tip:** If backend uses `5001`, set `VITE_API_BASE_URL=http://localhost:5001/api` in `frontend/.env`.

## Environment variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRE` | e.g. `7d` |
| `CLIENT_URL` | Frontend URL for CORS |
| `CLOUDINARY_*` | Image upload credentials |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | e.g. `http://localhost:5000/api` |

## API summary

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/signup` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |

### Posts
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/posts` | Feed (paginated) |
| POST | `/api/posts` | Create (multipart) |
| PATCH | `/api/posts/:id` | Edit own post |
| DELETE | `/api/posts/:id` | Delete own post |
| POST | `/api/posts/:id/like` | Toggle like |
| GET/POST | `/api/posts/:id/comments` | Comments |

### Users (extras)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/users/followers` | Your followers |
| GET | `/api/users/following` | Your following |
| GET | `/api/users/notifications` | Notifications |

## Deployment

See **[DEPLOY.md](./DEPLOY.md)** for Render + Vercel + Atlas checklist.

Quick summary:
1. Push to GitHub (no `.env` files).
2. Deploy backend on **Render** (`backend` root, `npm start`).
3. Deploy frontend on **Vercel** (`frontend` root, `npm run build`).
4. Set `VITE_API_BASE_URL` and `CLIENT_URL` to match live URLs.

## Data model note

Social graph and notifications are stored as **embedded arrays inside `users`** (not separate collections), to satisfy the two-collection rule while supporting follow/notify features.

## Screenshots

_Add: Login, Feed, Create Post, Edit Post, Comments, Profile, Notifications._

## Links

| Resource | URL |
|----------|-----|
| GitHub | _your-repo-url_ |
| Live app | _your-vercel-url_ |
| API | _your-render-url_ |

## License

MIT — 3W Full Stack internship assignment.
