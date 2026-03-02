import { Router } from "express";
import pool from "../db.js";

const router = Router();

// GET /api/pricing — returns pricing grouped by warranty_id in pricingStore format
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const { rows } = await pool.query(
      "SELECT * FROM pricing_submissions WHERE user_id = $1 AND status = 'active' ORDER BY warranty_id, fee_type, submitted_at",
      [userId]
    );

    const store = {};
    for (const row of rows) {
      if (!store[row.warranty_id]) {
        store[row.warranty_id] = { baseFee: [], psfFee: [] };
      }
      const entry = {
        amount: parseFloat(row.amount),
        submittedAt: row.submitted_at,
        status: row.status,
      };
      if (row.fee_type === "base") {
        store[row.warranty_id].baseFee.push(entry);
      } else {
        store[row.warranty_id].psfFee.push(entry);
      }
    }

    res.json(store);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/pricing — submit a new pricing entry
router.post("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const { warrantyId, baseFee, psfFee, submittedBy, regionState, notes } = req.body;
    if (!warrantyId) return res.status(400).json({ error: "warrantyId required" });

    const results = [];

    if (baseFee != null && baseFee > 0) {
      const { rows } = await pool.query(
        "INSERT INTO pricing_submissions (user_id, warranty_id, fee_type, amount, submitted_by, region_state, notes) VALUES ($1, $2, 'base', $3, $4, $5, $6) RETURNING id",
        [userId, warrantyId, baseFee, submittedBy || "App User", regionState || null, notes || null]
      );
      results.push({ type: "base", id: rows[0].id });
    }

    if (psfFee != null && psfFee > 0) {
      const { rows } = await pool.query(
        "INSERT INTO pricing_submissions (user_id, warranty_id, fee_type, amount, submitted_by, region_state, notes) VALUES ($1, $2, 'psf', $3, $4, $5, $6) RETURNING id",
        [userId, warrantyId, psfFee, submittedBy || "App User", regionState || null, notes || null]
      );
      results.push({ type: "psf", id: rows[0].id });
    }

    res.json({ success: true, submissions: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
