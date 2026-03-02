import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import pg from "pg";
import bcrypt from "bcryptjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

async function seed() {
  const client = await pool.connect();
  try {
    // Run schema
    const schema = readFileSync(join(__dirname, "schema.sql"), "utf8");
    await client.query(schema);
    console.log("Schema created.");

    // ── CREATE A DEMO USER ──
    const demoUserId = "user-demo-seed";
    const demoCompany = "My Roofing Company";
    const passwordHash = await bcrypt.hash("password123", 12);
    await client.query(
      `INSERT INTO users (id, first_name, last_name, email, password_hash, company_name, company_type, email_verified)
       VALUES ($1, 'Demo', 'User', 'demo@example.com', $2, $3, 'Roofing Contractor', true)
       ON CONFLICT (email) DO NOTHING`,
      [demoUserId, passwordHash, demoCompany]
    );
    console.log("Demo user created (demo@example.com / password123).");

    // ── WARRANTY DATABASE (223 options — coatings + single-ply) — shared, no user_id ──
    const warrantyDb = JSON.parse(readFileSync(join(__dirname, "warranty-data.json"), "utf8"));
    for (const w of warrantyDb) {
      await client.query(
        `INSERT INTO warranty_db (id,category,manufacturer,name,membranes,term,labor_covered,material_covered,consequential,dollar_cap,insp_freq,insp_by,transferable,ponding_excluded,wind_limit,strengths,weaknesses,best_for,rating,product_lines,warranty_name,thickness,installation_method,ndl,hail_coverage,min_roof_size,recover_eligible,recover_max_years,warranty_fee_per_sq,min_warranty_fee,reference_url,notes,maintenance_required,transfer_policy)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34)`,
        [w.id,w.category,w.manufacturer,w.name,JSON.stringify(w.membranes||[]),w.term,w.laborCovered,w.materialCovered,w.consequential,w.dollarCap,w.inspFreq,w.inspBy,w.transferable,w.pondingExcluded,w.windLimit,JSON.stringify(w.strengths||[]),JSON.stringify(w.weaknesses||[]),w.bestFor,w.rating,w.productLines||null,w.warrantyName||null,w.thickness||null,w.installationMethod||null,w.ndl||false,w.hailCoverage||null,w.minRoofSize||null,w.recoverEligible||null,w.recoverMaxYears||null,w.warrantyFeePerSq||null,w.minWarrantyFee||null,w.referenceUrl||null,w.notes||null,w.maintenanceRequired||null,w.transferPolicy||null]
      );
    }
    console.log(`Loaded ${warrantyDb.length} warranty options.`);

    // ── SEED DEMO DATA FOR THE TEST USER ──
    // Using the demoData module
    const { seedDemoData } = await import("./demoData.js");
    await seedDemoData(demoUserId, demoCompany);
    console.log("Demo data seeded for test user.");

    console.log("Seed complete! All data loaded.");
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
