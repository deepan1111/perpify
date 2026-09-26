# Prep Vault — starter

Landing page + login/signup, with a free-credits mechanic (3 free credits on signup, used later to unlock a ₹59 pack).

## Structure
- `server/` — Express API (signup, login, JWT auth). Users are stored in memory for now — swap in MongoDB later.
- `client/` — React app (Vite). Pages: Landing, Login, Signup, Dashboard.

## Run it

**Backend**
```
cd server
cp .env.example .env
npm install
npm run dev
```
Runs on http://localhost:5000

**Frontend** (in a second terminal)
```
cd client
npm install
npm run dev
```
Runs on http://localhost:5173 and proxies `/api` calls to the backend.

## Notes
- Passwords are hashed with bcrypt; sessions are JWTs stored in `localStorage`.
- The user "database" is a plain in-memory array in `server/index.js` — restarting the server wipes it. Good enough to test the flow; swap for MongoDB/Mongoose when you're ready.
- Signup grants `FREE_SIGNUP_CREDITS` (default 3), shown on the dashboard after login.

## Next steps (not built yet)
- Actual pack content, purchase flow, ₹59 payment integration.
- Persistent database.
- Deducting a credit when a pack is unlocked.
