import { Router } from "express";
import pool from "../db.js";

const router = Router();

// GET /api/inspections
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const { rows } = await pool.query("SELECT * FROM inspections WHERE user_id = $1 ORDER BY date DESC", [userId]);
    res.json(rows.map(r => ({
      id: r.id,
      roofId: r.roof_id,
      date: r.date,
      inspector: r.inspector,
      company: r.company,
      type: r.type,
      status: r.status,
      score: r.score,
      photos: r.photos,
      moistureData: r.moisture_data,
      notes: r.notes,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/inspections — schedule a new inspection
router.post("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const { roofId, date, inspector, company, type, notes } = req.body;
    if (!roofId || !date || !type) return res.status(400).json({ error: "roofId, date, and type are required" });

    // Verify user owns this roof
    const { rows: roofCheck } = await pool.query("SELECT id FROM roofs WHERE id = $1 AND user_id = $2", [roofId, userId]);
    if (roofCheck.length === 0) return res.status(404).json({ error: "Roof not found" });

    const inspId = `insp-${Date.now()}`;
    await pool.query(
      "INSERT INTO inspections (id, user_id, roof_id, date, inspector, company, type, status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
      [inspId, userId, roofId, date, inspector || null, company || null, type, "scheduled", notes || null]
    );

    res.json({ success: true, id: inspId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/inspections/:id — update an inspection (e.g., mark completed with score)
router.put("/:id", async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, score, photos, moistureData, notes } = req.body;
    const fields = [];
    const params = [];
    let idx = 1;

    if (status !== undefined) { fields.push(`status = $${idx++}`); params.push(status); }
    if (score !== undefined) { fields.push(`score = $${idx++}`); params.push(score); }
    if (photos !== undefined) { fields.push(`photos = $${idx++}`); params.push(photos); }
    if (moistureData !== undefined) { fields.push(`moisture_data = $${idx++}`); params.push(moistureData); }
    if (notes !== undefined) { fields.push(`notes = $${idx++}`); params.push(notes); }

    if (fields.length === 0) return res.status(400).json({ error: "No fields to update" });

    params.push(req.params.id, userId);
    await pool.query(`UPDATE inspections SET ${fields.join(", ")} WHERE id = $${idx} AND user_id = $${idx + 1}`, params);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
