import { Router } from "express";
import pool from "../db.js";

const router = Router();

// Map a warranty_db row from snake_case DB columns to camelCase JS
function mapWarranty(w) {
  return {
    id: w.id,
    category: w.category,
    manufacturer: w.manufacturer,
    name: w.name,
    membranes: w.membranes || [],
    term: w.term,
    laborCovered: w.labor_covered,
    materialCovered: w.material_covered,
    consequential: w.consequential,
    dollarCap: w.dollar_cap,
    inspFreq: w.insp_freq,
    inspBy: w.insp_by,
    transferable: w.transferable,
    pondingExcluded: w.ponding_excluded,
    windLimit: w.wind_limit,
    strengths: w.strengths || [],
    weaknesses: w.weaknesses || [],
    bestFor: w.best_for,
    rating: w.rating,
    productLines: w.product_lines,
    warrantyName: w.warranty_name,
    thickness: w.thickness,
    installationMethod: w.installation_method,
    ndl: w.ndl,
    hailCoverage: w.hail_coverage,
    minRoofSize: w.min_roof_size,
    recoverEligible: w.recover_eligible,
    recoverMaxYears: w.recover_max_years,
    warrantyFeePerSq: w.warranty_fee_per_sq,
    minWarrantyFee: w.min_warranty_fee,
    referenceUrl: w.reference_url,
    notes: w.notes,
    maintenanceRequired: w.maintenance_required,
    transferPolicy: w.transfer_policy,
  };
}

// GET /api/warranties — the full warranty options database (223 items)
router.get("/", async (req, res) => {
  try {
    const { category, membrane } = req.query;
    let query = "SELECT * FROM warranty_db";
    const params = [];
    const conditions = [];
    if (category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }
    if (membrane) {
      params.push(membrane);
      conditions.push(`membranes @> $${params.length}::jsonb`);
    }
    if (conditions.length) query += " WHERE " + conditions.join(" AND ");
    query += " ORDER BY rating DESC, name";

    const { rows } = await pool.query(query, params);
    res.json(rows.map(mapWarranty));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/warranties/:id
router.get("/:id", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM warranty_db WHERE id = $1", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(mapWarranty(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
