import { Router } from "express";
import pool from "../db.js";

const router = Router();

// GET /api/access-logs
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const { rows } = await pool.query("SELECT * FROM access_logs WHERE user_id = $1 ORDER BY date DESC", [userId]);
    res.json(rows.map(r => ({
      id: r.id,
      roofId: r.roof_id,
      person: r.person,
      company: r.company,
      purpose: r.purpose,
      date: r.date,
      duration: r.duration,
      notes: r.notes,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/access-logs — log a new roof access entry
router.post("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const { roofId, person, company, purpose, date, duration, notes } = req.body;
    if (!roofId || !person) return res.status(400).json({ error: "roofId and person are required" });

    // Verify user owns this roof
    const { rows: roofCheck } = await pool.query("SELECT id FROM roofs WHERE id = $1 AND user_id = $2", [roofId, userId]);
    if (roofCheck.length === 0) return res.status(404).json({ error: "Roof not found" });

    const logId = `log-${Date.now()}`;
    await pool.query(
      "INSERT INTO access_logs (id, user_id, roof_id, person, company, purpose, date, duration, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
      [logId, userId, roofId, person, company || null, purpose || null, date || new Date().toISOString(), duration || null, notes || null]
    );

    res.json({ success: true, id: logId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
