import { Router } from "express";
import pool from "../db.js";

const router = Router();

// GET /api/accounts — full nested hierarchy: owners → pms, properties → roofs → warranty
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const { rows: owners } = await pool.query("SELECT * FROM owners WHERE user_id = $1 ORDER BY name", [userId]);
    const { rows: pms } = await pool.query("SELECT * FROM property_managers WHERE user_id = $1 ORDER BY name", [userId]);
    const { rows: props } = await pool.query("SELECT * FROM properties WHERE user_id = $1 ORDER BY name", [userId]);
    const { rows: roofs } = await pool.query("SELECT r.*, rw.manufacturer, rw.w_type, rw.start_date, rw.end_date, rw.status AS w_status, rw.compliance, rw.next_insp, rw.last_insp, rw.coverage, rw.exclusions, rw.requirements FROM roofs r LEFT JOIN roof_warranties rw ON rw.roof_id = r.id WHERE r.user_id = $1 ORDER BY r.section", [userId]);

    const result = owners.map(o => ({
      id: o.id,
      name: o.name,
      contact: o.contact,
      email: o.email,
      phone: o.phone,
      notes: o.notes,
      isDemo: o.is_demo,
      pms: pms.filter(pm => pm.owner_id === o.id).map(pm => ({
        id: pm.id, name: pm.name, contact: pm.contact, email: pm.email, phone: pm.phone, notes: pm.notes,
      })),
      properties: props.filter(p => p.owner_id === o.id).map(p => ({
        id: p.id,
        name: p.name,
        address: p.address,
        managedBy: p.managed_by,
        roofs: roofs.filter(r => r.property_id === p.id).map(r => ({
          id: r.id,
          section: r.section,
          sqFt: r.sq_ft,
          type: r.type,
          installed: r.installed,
          warranty: {
            manufacturer: r.manufacturer,
            wType: r.w_type,
            start: r.start_date,
            end: r.end_date,
            status: r.w_status,
            compliance: r.compliance,
            nextInsp: r.next_insp,
            lastInsp: r.last_insp,
            coverage: r.coverage || [],
            exclusions: r.exclusions || [],
            requirements: r.requirements || [],
          },
        })),
      })),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/accounts — create a new owner with optional properties and roofs
router.post("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, contact, email, phone, notes, properties } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });

    const ownerId = `owner-${Date.now()}`;
    await pool.query(
      "INSERT INTO owners (id, user_id, name, contact, email, phone, notes) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [ownerId, userId, name, contact || null, email || null, phone || null, notes || null]
    );

    if (properties && Array.isArray(properties)) {
      for (const prop of properties) {
        const propId = `prop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        await pool.query(
          "INSERT INTO properties (id, user_id, owner_id, name, address) VALUES ($1, $2, $3, $4, $5)",
          [propId, userId, ownerId, prop.name, prop.address || null]
        );

        if (prop.roofs && Array.isArray(prop.roofs)) {
          for (const roof of prop.roofs) {
            const roofId = `roof-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
            await pool.query(
              "INSERT INTO roofs (id, user_id, property_id, section, sq_ft, type, installed) VALUES ($1, $2, $3, $4, $5, $6, $7)",
              [roofId, userId, propId, roof.section, roof.sqFt || null, roof.type || null, roof.installed || null]
            );

            if (roof.warranty) {
              const w = roof.warranty;
              await pool.query(
                `INSERT INTO roof_warranties (roof_id, manufacturer, w_type, start_date, end_date, status, compliance, next_insp, coverage, exclusions, requirements)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                [roofId, w.manufacturer || null, w.wType || null, w.start || null, w.end || null,
                 w.status || "active", w.compliance || "current", w.nextInsp || null,
                 JSON.stringify(w.coverage || []), JSON.stringify(w.exclusions || []), JSON.stringify(w.requirements || [])]
              );
            }
          }
        }
      }
    }

    res.json({ success: true, id: ownerId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/accounts/:ownerId/properties — add a property to an existing owner
router.post("/:ownerId/properties", async (req, res) => {
  try {
    const userId = req.user.id;
    const { ownerId } = req.params;

    // Verify ownership
    const { rows: ownerCheck } = await pool.query("SELECT id FROM owners WHERE id = $1 AND user_id = $2", [ownerId, userId]);
    if (ownerCheck.length === 0) return res.status(404).json({ error: "Owner not found" });

    const { name, address, roofs } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });

    const propId = `prop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    await pool.query(
      "INSERT INTO properties (id, user_id, owner_id, name, address) VALUES ($1, $2, $3, $4, $5)",
      [propId, userId, ownerId, name, address || null]
    );

    if (roofs && Array.isArray(roofs)) {
      for (const roof of roofs) {
        const roofId = `roof-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        await pool.query(
          "INSERT INTO roofs (id, user_id, property_id, section, sq_ft, type, installed) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [roofId, userId, propId, roof.section, roof.sqFt || null, roof.type || null, roof.installed || null]
        );

        if (roof.warranty) {
          const w = roof.warranty;
          await pool.query(
            `INSERT INTO roof_warranties (roof_id, manufacturer, w_type, start_date, end_date, status, compliance, next_insp, coverage, exclusions, requirements)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [roofId, w.manufacturer || null, w.wType || null, w.start || null, w.end || null,
             w.status || "active", w.compliance || "current", w.nextInsp || null,
             JSON.stringify(w.coverage || []), JSON.stringify(w.exclusions || []), JSON.stringify(w.requirements || [])]
          );
        }
      }
    }

    res.json({ success: true, id: propId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
