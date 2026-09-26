import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const FREE_SIGNUP_CREDITS = Number(process.env.FREE_SIGNUP_CREDITS || 3);

// --- Temporary in-memory "database" ---
// Swap this out for MongoDB (you already know Mongoose) once the flow is validated.
// Shape: { id, name, email, passwordHash, credits, createdAt }
const users = [];
let nextId = 1;

function findUserByEmail(email) {
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

function toPublicUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = users.find((u) => u.id === payload.sub);
    if (!user) return res.status(401).json({ error: "User not found" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// --- Routes ---

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  if (findUserByEmail(email)) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: nextId++,
    name,
    email,
    passwordHash,
    credits: FREE_SIGNUP_CREDITS,
    createdAt: new Date().toISOString(),
  };
  users.push(user);

  const token = signToken(user);
  res.status(201).json({ token, user: toPublicUser(user) });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = findUserByEmail(email);
  if (!user) return res.status(401).json({ error: "Invalid email or password" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid email or password" });

  const token = signToken(user);
  res.json({ token, user: toPublicUser(user) });
});

app.get("/api/auth/me", authMiddleware, (req, res) => {
  res.json({ user: toPublicUser(req.user) });
});

app.listen(PORT, () => {
  console.log(`Prep Vault API running on http://localhost:${PORT}`);
});
