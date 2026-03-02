import { Router } from "express";
import pool from "../db.js";

const router = Router();

// GET /api/claims — includes timeline events
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const { rows: claims } = await pool.query("SELECT * FROM claims WHERE user_id = $1 ORDER BY filed DESC", [userId]);

    // Only fetch events for this user's claims
    const claimIds = claims.map(c => c.id);
    let events = [];
    if (claimIds.length > 0) {
      const { rows } = await pool.query(
        "SELECT * FROM claim_events WHERE claim_id = ANY($1) ORDER BY claim_id, sort_order",
        [claimIds]
      );
      events = rows;
    }

    const eventMap = {};
    for (const e of events) {
      if (!eventMap[e.claim_id]) eventMap[e.claim_id] = [];
      eventMap[e.claim_id].push({ date: e.date, event: e.event });
    }

    res.json(claims.map(c => ({
      id: c.id,
      roofId: c.roof_id,
      manufacturer: c.manufacturer,
      filed: c.filed,
      amount: parseFloat(c.amount),
      status: c.status,
      desc: c.description,
      timeline: eventMap[c.id] || [],
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/claims — file a new warranty claim
router.post("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const { roofId, manufacturer, amount, description } = req.body;
    if (!roofId || !manufacturer) return res.status(400).json({ error: "roofId and manufacturer are required" });

    // Verify user owns this roof
    const { rows: roofCheck } = await pool.query("SELECT id FROM roofs WHERE id = $1 AND user_id = $2", [roofId, userId]);
    if (roofCheck.length === 0) return res.status(404).json({ error: "Roof not found" });

    const claimId = `claim-${Date.now()}`;
    const filed = new Date().toISOString().split("T")[0];

    await pool.query(
      "INSERT INTO claims (id, user_id, roof_id, manufacturer, filed, amount, status, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [claimId, userId, roofId, manufacturer, filed, amount || 0, "in-progress", description || null]
    );

    // Create initial timeline event
    await pool.query(
      "INSERT INTO claim_events (claim_id, date, event, sort_order) VALUES ($1, $2, $3, $4)",
      [claimId, filed, "Claim filed", 0]
    );

    res.json({ success: true, id: claimId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/claims/:id/status — update claim status
router.put("/:id/status", async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "status is required" });

    // Verify user owns this claim
    const { rows: claimCheck } = await pool.query("SELECT id FROM claims WHERE id = $1 AND user_id = $2", [req.params.id, userId]);
    if (claimCheck.length === 0) return res.status(404).json({ error: "Claim not found" });

    await pool.query("UPDATE claims SET status = $1 WHERE id = $2 AND user_id = $3", [status, req.params.id, userId]);

    // Add timeline event
    const date = new Date().toISOString().split("T")[0];
    const { rows } = await pool.query("SELECT MAX(sort_order) AS max_order FROM claim_events WHERE claim_id = $1", [req.params.id]);
    const nextOrder = (rows[0]?.max_order || 0) + 1;
    const eventText = status === "approved" ? "Claim approved" : status === "denied" ? "Claim denied" : `Status updated to ${status}`;
    await pool.query(
      "INSERT INTO claim_events (claim_id, date, event, sort_order) VALUES ($1, $2, $3, $4)",
      [req.params.id, date, eventText, nextOrder]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
