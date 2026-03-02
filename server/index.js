import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import pool from "./db.js";
import warrantiesRouter from "./routes/warranties.js";
import accountsRouter from "./routes/accounts.js";
import pricingRouter from "./routes/pricing.js";
import accessLogsRouter from "./routes/accessLogs.js";
import invoicesRouter from "./routes/invoices.js";
import inspectionsRouter from "./routes/inspections.js";
import claimsRouter from "./routes/claims.js";
import authRouter from "./routes/auth.js";

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "warranty-mgmt-dev-secret-change-in-prod";
const APP_URL = process.env.APP_URL || "http://localhost:5173";

// CORS — allow frontend origin(s)
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests from the configured APP_URL and common Render URLs
    const allowed = [
      APP_URL,
      "https://warranty-app-kofu.onrender.com",
      "http://localhost:5173",
    ];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked request from origin: ${origin}`);
      callback(null, true); // Allow all origins in current phase; tighten later
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// JWT authentication middleware — protects business routes
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }
  try {
    const decoded = jwt.verify(auth.slice(7), JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Health check (public)
app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", db: err.message });
  }
});

// Auth routes (public — handles its own auth internally)
app.use("/api/auth", authRouter);

// Protected business routes — require valid JWT
app.use("/api/warranties", requireAuth, warrantiesRouter);
app.use("/api/accounts", requireAuth, accountsRouter);
app.use("/api/pricing", requireAuth, pricingRouter);
app.use("/api/access-logs", requireAuth, accessLogsRouter);
app.use("/api/invoices", requireAuth, invoicesRouter);
app.use("/api/inspections", requireAuth, inspectionsRouter);
app.use("/api/claims", requireAuth, claimsRouter);

app.listen(PORT, () => console.log(`API server listening on port ${PORT}`));
