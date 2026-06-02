# How to run the app (Windows)

Your project folder is:

`C:\Users\chari\OneDrive\Graph6\Desktop\3W – Full Stack copy`

`frontend` and `backend` are **directly inside** this folder (no extra nested copy).

---

## Option 1 — PowerShell (two terminals)

**Terminal 1 — API**

```powershell
cd "C:\Users\chari\OneDrive\Graph6\Desktop\3W – Full Stack copy\backend"
npm run dev
```

**Terminal 2 — React app**

```powershell
cd "C:\Users\chari\OneDrive\Graph6\Desktop\3W – Full Stack copy\frontend"
npm run dev
```

Then open: **http://localhost:5173**

---

## Option 2 — From the folder you already have open

If your prompt shows:

`PS ...\3W – Full Stack copy>`

Run:

```powershell
cd frontend
npm run dev
```

(Use `cd backend` then `npm run dev` in another terminal for the API.)

---

## Option 3 — Scripts (easiest)

Right-click → **Run with PowerShell**, or in terminal from project root:

```powershell
.\start-backend.ps1
```

```powershell
.\start-frontend.ps1
```

---

## Common mistake

Do **not** paste a path alone like:

`C:\Users\...\frontend`

PowerShell treats that as a command and errors. Always use **`cd`** first:

```powershell
cd "C:\Users\chari\OneDrive\Graph6\Desktop\3W – Full Stack copy\frontend"
```

Paths with spaces must be in **quotes**.
