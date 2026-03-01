import express from "express";
import cors from "cors";
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

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", db: err.message });
  }
});

// Routes
app.use("/api/warranties", warrantiesRouter);
app.use("/api/accounts", accountsRouter);
app.use("/api/pricing", pricingRouter);
app.use("/api/access-logs", accessLogsRouter);
app.use("/api/invoices", invoicesRouter);
app.use("/api/inspections", inspectionsRouter);
app.use("/api/claims", claimsRouter);
app.use("/api/auth", authRouter);

app.listen(PORT, () => console.log(`API server listening on port ${PORT}`));
