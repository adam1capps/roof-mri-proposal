import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import pg from "pg";

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

    // Clear existing data (idempotent re-seed)
    await client.query(`
      TRUNCATE claim_events, claims, inspections, invoices, access_logs,
               pricing_submissions, warranty_db, roof_warranties, roofs,
               properties, property_managers, owners CASCADE
    `);

    // ── OWNERS ──
    const owners = [
      { id: "own-1", name: "Vanderbilt Capital Partners", contact: "Richard Vanderbilt III", email: "rvanderbilt@vcpartners.com", phone: "(615) 555-0100", notes: "Owns 12 commercial properties across Middle TN. Long-term hold strategy." },
      { id: "own-2", name: "Greenway Health Systems", contact: "Dr. Marcia Langford", email: "mlangford@greenwayhealthsys.com", phone: "(615) 555-0300", notes: "Healthcare REIT. Extremely sensitive to leaks — medical equipment and patient safety." },
      { id: "own-3", name: "Summit Retail Holdings", contact: "James Thornton", email: "jthornton@summitretail.com", phone: "(615) 555-0400", notes: "Strip mall portfolio. Price-sensitive, but understands warranty value after losing coverage on Cool Springs location." },
    ];
    for (const o of owners) {
      await client.query("INSERT INTO owners (id,name,contact,email,phone,notes) VALUES ($1,$2,$3,$4,$5,$6)", [o.id, o.name, o.contact, o.email, o.phone, o.notes]);
    }

    // ── PROPERTY MANAGERS ──
    const pms = [
      { id: "pm-1", owner_id: "own-1", name: "Cornerstone Property Management", contact: "Sarah Mitchell", email: "smitchell@cornerstonepm.com", phone: "(615) 555-0150", notes: "Manages 6 of VCP's Nashville properties" },
      { id: "pm-2", owner_id: "own-3", name: "Alliance Facility Services", contact: "Mike Rodriguez", email: "mrodriguez@alliancefs.com", phone: "(615) 555-0450", notes: "Handles all maintenance for Summit's retail portfolio" },
    ];
    for (const pm of pms) {
      await client.query("INSERT INTO property_managers (id,owner_id,name,contact,email,phone,notes) VALUES ($1,$2,$3,$4,$5,$6,$7)", [pm.id, pm.owner_id, pm.name, pm.contact, pm.email, pm.phone, pm.notes]);
    }

    // ── PROPERTIES ──
    const props = [
      { id: "prop-1", owner_id: "own-1", managed_by: "pm-1", name: "Riverside Office Complex", address: "1420 Commerce Blvd, Nashville, TN" },
      { id: "prop-2", owner_id: "own-1", managed_by: "pm-1", name: "Commerce Park Building A", address: "2200 West End Ave, Nashville, TN" },
      { id: "prop-3", owner_id: "own-2", managed_by: null, name: "Greenway Medical Center", address: "800 Medical Center Dr, Franklin, TN" },
      { id: "prop-4", owner_id: "own-3", managed_by: "pm-2", name: "Harding Pike Shopping Center", address: "4500 Harding Pike, Nashville, TN" },
      { id: "prop-5", owner_id: "own-3", managed_by: "pm-2", name: "Nolensville Road Plaza", address: "3200 Nolensville Rd, Nashville, TN" },
    ];
    for (const p of props) {
      await client.query("INSERT INTO properties (id,owner_id,managed_by,name,address) VALUES ($1,$2,$3,$4,$5)", [p.id, p.owner_id, p.managed_by, p.name, p.address]);
    }

    // ── ROOFS + WARRANTIES ──
    const roofsData = [
      { id: "r-1a", property_id: "prop-1", section: "Main Building — Flat", sq_ft: 22000, type: "TPO", installed: "2019-06-15",
        warranty: { manufacturer: "GAF", w_type: "NDL (No Dollar Limit)", start_date: "2019-06-15", end_date: "2039-06-15", status: "active", compliance: "current", next_insp: "2026-06-15", last_insp: "2025-12-10",
          coverage: ["Membrane material defects","Manufacturing flaws","Seam failure","Flashing defects"],
          exclusions: ["Foot traffic damage","Acts of God (wind >74mph)","Unauthorized modifications","Ponding water >48hrs"],
          requirements: ["Biannual inspection by certified contractor","Maintain drainage systems","Report damage within 30 days","No unauthorized penetrations"] }},
      { id: "r-1b", property_id: "prop-1", section: "Warehouse Wing", sq_ft: 35000, type: "EPDM", installed: "2017-03-20",
        warranty: { manufacturer: "Carlisle", w_type: "Material Only", start_date: "2017-03-20", end_date: "2032-03-20", status: "active", compliance: "at-risk", next_insp: "2026-03-20", last_insp: "2024-09-15",
          coverage: ["Membrane material defects","Adhesive failure"],
          exclusions: ["Workmanship","Foot traffic damage","Chemical exposure","Ponding water"],
          requirements: ["Annual inspection","Maintain all flashings","Professional repairs only"] }},
      { id: "r-2a", property_id: "prop-2", section: "Full Roof", sq_ft: 18000, type: "TPO", installed: "2021-04-10",
        warranty: { manufacturer: "GAF", w_type: "NDL (No Dollar Limit)", start_date: "2021-04-10", end_date: "2041-04-10", status: "active", compliance: "current", next_insp: "2026-10-10", last_insp: "2025-10-08",
          coverage: ["Material defects","Manufacturing flaws","Membrane failure"],
          exclusions: ["Foot traffic","Acts of God","Unauthorized modifications"],
          requirements: ["Biannual inspection","Maintain drainage","30-day damage reporting"] }},
      { id: "r-3a", property_id: "prop-3", section: "East Wing", sq_ft: 45000, type: "PVC", installed: "2020-09-01",
        warranty: { manufacturer: "Sika Sarnafil", w_type: "Full System", start_date: "2020-09-01", end_date: "2040-09-01", status: "active", compliance: "current", next_insp: "2026-09-01", last_insp: "2025-08-20",
          coverage: ["Full system warranty","Material and labor","Consequential damages up to $500K"],
          exclusions: ["Acts of God","Third-party damage","Unauthorized modifications"],
          requirements: ["Annual manufacturer inspection","Maintain rooftop equipment pads","Quarterly drain cleaning"] }},
      { id: "r-3b", property_id: "prop-3", section: "West Wing", sq_ft: 38000, type: "TPO", installed: "2018-11-15",
        warranty: { manufacturer: "Versico", w_type: "Material + Labor", start_date: "2018-11-15", end_date: "2033-11-15", status: "active", compliance: "at-risk", next_insp: "2026-05-15", last_insp: "2024-11-20",
          coverage: ["Membrane defects","Seam failure","Labor for warranty repairs"],
          exclusions: ["Ponding water","Foot traffic","HVAC damage"],
          requirements: ["Biannual inspection","No rooftop storage","Report leaks within 14 days"] }},
      { id: "r-4a", property_id: "prop-4", section: "Main Retail Strip", sq_ft: 52000, type: "Modified Bitumen", installed: "2015-08-10",
        warranty: { manufacturer: "Firestone", w_type: "Material Only", start_date: "2015-08-10", end_date: "2030-08-10", status: "active", compliance: "expired-inspection", next_insp: "2025-08-10", last_insp: "2023-08-15",
          coverage: ["Membrane material defects only"],
          exclusions: ["All workmanship","Ponding","Foot traffic","HVAC discharge"],
          requirements: ["Annual certified inspection","Professional repairs within 30 days of discovery"] }},
      { id: "r-5a", property_id: "prop-5", section: "Full Roof", sq_ft: 28000, type: "TPO", installed: "2022-03-15",
        warranty: { manufacturer: "GAF", w_type: "NDL", start_date: "2022-03-15", end_date: "2042-03-15", status: "active", compliance: "current", next_insp: "2026-09-15", last_insp: "2025-09-10",
          coverage: ["Full membrane coverage","Manufacturing defects","Seam integrity"],
          exclusions: ["Foot traffic","Unauthorized penetrations","Wind >74mph"],
          requirements: ["Biannual inspection","Maintain drainage","30-day reporting"] }},
    ];
    for (const r of roofsData) {
      await client.query("INSERT INTO roofs (id,property_id,section,sq_ft,type,installed) VALUES ($1,$2,$3,$4,$5,$6)", [r.id, r.property_id, r.section, r.sq_ft, r.type, r.installed]);
      const w = r.warranty;
      await client.query(
        "INSERT INTO roof_warranties (roof_id,manufacturer,w_type,start_date,end_date,status,compliance,next_insp,last_insp,coverage,exclusions,requirements) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)",
        [r.id, w.manufacturer, w.w_type, w.start_date, w.end_date, w.status, w.compliance, w.next_insp, w.last_insp, JSON.stringify(w.coverage), JSON.stringify(w.exclusions), JSON.stringify(w.requirements)]
      );
    }

    // ── WARRANTY DATABASE (223 options — coatings + single-ply) ──
    const warrantyDb = JSON.parse(readFileSync(join(__dirname, "warranty-data.json"), "utf8"));
    for (const w of warrantyDb) {
      await client.query(
        `INSERT INTO warranty_db (id,category,manufacturer,name,membranes,term,labor_covered,material_covered,consequential,dollar_cap,insp_freq,insp_by,transferable,ponding_excluded,wind_limit,strengths,weaknesses,best_for,rating,product_lines,warranty_name,thickness,installation_method,ndl,hail_coverage,min_roof_size,recover_eligible,recover_max_years,warranty_fee_per_sq,min_warranty_fee,reference_url,notes,maintenance_required,transfer_policy)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34)`,
        [w.id,w.category,w.manufacturer,w.name,JSON.stringify(w.membranes||[]),w.term,w.laborCovered,w.materialCovered,w.consequential,w.dollarCap,w.inspFreq,w.inspBy,w.transferable,w.pondingExcluded,w.windLimit,JSON.stringify(w.strengths||[]),JSON.stringify(w.weaknesses||[]),w.bestFor,w.rating,w.productLines||null,w.warrantyName||null,w.thickness||null,w.installationMethod||null,w.ndl||false,w.hailCoverage||null,w.minRoofSize||null,w.recoverEligible||null,w.recoverMaxYears||null,w.warrantyFeePerSq||null,w.minWarrantyFee||null,w.referenceUrl||null,w.notes||null,w.maintenanceRequired||null,w.transferPolicy||null]
      );
    }

    // ── PRICING SEED DATA ──
    // Updated IDs: w-gaf-ndl → WT-115 (GAF TPO Diamond Pledge 15-yr NDL)
    // c-gaco-sil-lm → WT-004 (GACO Silicone L&M NDL 20-yr)
    // c-henry-sil-gs → WT-051 (Henry Pro-Grade 988 Gold Seal 20-yr)
    // w-sika-fs → WT-167 (Sika Sarnafil PVC 20-yr NDL)
    const pricingSeed = [
      // GAF TPO Diamond Pledge NDL base fees
      { warranty_id:"WT-115",fee_type:"base",amount:2500,submitted_at:"2025-11-01T00:00:00Z" },
      { warranty_id:"WT-115",fee_type:"base",amount:2800,submitted_at:"2025-12-15T00:00:00Z" },
      { warranty_id:"WT-115",fee_type:"base",amount:2650,submitted_at:"2026-01-20T00:00:00Z" },
      // GAF TPO Diamond Pledge NDL psf fees
      { warranty_id:"WT-115",fee_type:"psf",amount:0.08,submitted_at:"2025-11-01T00:00:00Z" },
      { warranty_id:"WT-115",fee_type:"psf",amount:0.09,submitted_at:"2025-12-15T00:00:00Z" },
      { warranty_id:"WT-115",fee_type:"psf",amount:0.085,submitted_at:"2026-01-20T00:00:00Z" },
      // GACO Silicone L&M NDL 20-yr
      { warranty_id:"WT-004",fee_type:"base",amount:1800,submitted_at:"2025-10-10T00:00:00Z" },
      { warranty_id:"WT-004",fee_type:"base",amount:2100,submitted_at:"2025-11-22T00:00:00Z" },
      { warranty_id:"WT-004",fee_type:"base",amount:1950,submitted_at:"2026-01-05T00:00:00Z" },
      { warranty_id:"WT-004",fee_type:"psf",amount:0.06,submitted_at:"2025-10-10T00:00:00Z" },
      { warranty_id:"WT-004",fee_type:"psf",amount:0.07,submitted_at:"2025-11-22T00:00:00Z" },
      { warranty_id:"WT-004",fee_type:"psf",amount:0.065,submitted_at:"2026-01-05T00:00:00Z" },
      // Henry Pro-Grade 988 Gold Seal 20-yr
      { warranty_id:"WT-051",fee_type:"base",amount:2200,submitted_at:"2025-12-01T00:00:00Z" },
      { warranty_id:"WT-051",fee_type:"base",amount:2400,submitted_at:"2026-01-10T00:00:00Z" },
      { warranty_id:"WT-051",fee_type:"psf",amount:0.07,submitted_at:"2025-12-01T00:00:00Z" },
      { warranty_id:"WT-051",fee_type:"psf",amount:0.075,submitted_at:"2026-01-10T00:00:00Z" },
      // Sika Sarnafil PVC 20-yr NDL
      { warranty_id:"WT-167",fee_type:"base",amount:4500,submitted_at:"2025-09-15T00:00:00Z" },
      { warranty_id:"WT-167",fee_type:"base",amount:5000,submitted_at:"2025-11-10T00:00:00Z" },
      { warranty_id:"WT-167",fee_type:"base",amount:4800,submitted_at:"2026-02-01T00:00:00Z" },
      { warranty_id:"WT-167",fee_type:"psf",amount:0.14,submitted_at:"2025-09-15T00:00:00Z" },
      { warranty_id:"WT-167",fee_type:"psf",amount:0.15,submitted_at:"2025-11-10T00:00:00Z" },
      { warranty_id:"WT-167",fee_type:"psf",amount:0.145,submitted_at:"2026-02-01T00:00:00Z" },
    ];
    for (const p of pricingSeed) {
      await client.query(
        "INSERT INTO pricing_submissions (warranty_id,fee_type,amount,status,submitted_at) VALUES ($1,$2,$3,'active',$4)",
        [p.warranty_id, p.fee_type, p.amount, p.submitted_at]
      );
    }

    // ── ACCESS LOGS ──
    const accessLogs = [
      { id:"al-1",roof_id:"r-1a",person:"Mike Torres",company:"Nashville HVAC Pro",purpose:"HVAC unit service",date:"2025-12-08T09:30:00",duration:"2.5 hrs",notes:"Routine condenser service. Used ladder at NE access." },
      { id:"al-2",roof_id:"r-1a",person:"Unknown",company:"Unknown",purpose:"Unauthorized access",date:"2025-12-12T14:15:00",duration:"Unknown",notes:"QR not scanned. Camera showed individual on roof near HVAC unit." },
      { id:"al-3",roof_id:"r-1a",person:"Billy Hargrove",company:"Riverland Roofing",purpose:"MRI moisture scan",date:"2025-12-18T08:00:00",duration:"3 hrs",notes:"Full scan completed. Puncture found near NE HVAC unit." },
      { id:"al-4",roof_id:"r-3a",person:"David Kim",company:"Greenway Facilities",purpose:"Drain inspection",date:"2026-01-05T10:00:00",duration:"45 min",notes:"Quarterly drain cleaning per warranty requirements." },
      { id:"al-5",roof_id:"r-4a",person:"Jeff Simmons",company:"Pinnacle Signs",purpose:"Sign installation",date:"2025-11-20T13:00:00",duration:"4 hrs",notes:"New tenant signage. Penetrations made without contractor notification." },
      { id:"al-6",roof_id:"r-1b",person:"Sarah Mitchell",company:"Cornerstone PM",purpose:"Annual walkthrough",date:"2026-01-15T11:00:00",duration:"1 hr",notes:"PM inspection. Noted ponding near drain #3." },
    ];
    for (const a of accessLogs) {
      await client.query("INSERT INTO access_logs (id,roof_id,person,company,purpose,date,duration,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)", [a.id,a.roof_id,a.person,a.company,a.purpose,a.date,a.duration,a.notes]);
    }

    // ── INVOICES ──
    const invoices = [
      { id:"inv-1",roof_id:"r-1a",vendor:"Riverland Roofing",date:"2025-12-20",amount:4200,desc:"Seam repair — NE section near HVAC",flagged:true,flagReason:"Seam separation may be covered under GAF NDL warranty",status:"review" },
      { id:"inv-2",roof_id:"r-1b",vendor:"Acme Roofing",date:"2025-10-15",amount:1800,desc:"Flashing repair — west parapet",flagged:false,flagReason:null,status:"paid" },
      { id:"inv-3",roof_id:"r-3b",vendor:"Quality Roof Repair",date:"2025-09-22",amount:6500,desc:"Membrane patch — 200 sqft area",flagged:true,flagReason:"Membrane defect may fall under Versico Material + Labor coverage",status:"review" },
      { id:"inv-4",roof_id:"r-4a",vendor:"Pinnacle Roofing",date:"2025-11-30",amount:3200,desc:"Emergency leak repair — tenant space",flagged:true,flagReason:"Leak may be linked to unauthorized sign penetration — third-party liability, not warranty",status:"review" },
      { id:"inv-5",roof_id:"r-5a",vendor:"Riverland Roofing",date:"2026-01-10",amount:950,desc:"Drain basket replacement x3",flagged:false,flagReason:null,status:"paid" },
      { id:"inv-6",roof_id:"r-3a",vendor:"Sika Sarnafil Direct",date:"2025-07-18",amount:0,desc:"Warranty repair — manufacturer dispatched crew",flagged:false,flagReason:null,status:"warranty" },
    ];
    for (const inv of invoices) {
      await client.query("INSERT INTO invoices (id,roof_id,vendor,date,amount,description,flagged,flag_reason,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)", [inv.id,inv.roof_id,inv.vendor,inv.date,inv.amount,inv.desc,inv.flagged,inv.flagReason,inv.status]);
    }

    // ── INSPECTIONS ──
    const inspections = [
      { id:"insp-1",roof_id:"r-1a",date:"2025-12-10",inspector:"Billy Hargrove",company:"Riverland Roofing",type:"Biannual + MRI Scan",status:"completed",score:87,photos:24,moistureData:true,notes:"Puncture found near NE HVAC. Seam wear on south section. Drains clear." },
      { id:"insp-2",roof_id:"r-3a",date:"2025-08-20",inspector:"Adam G.",company:"Roof MRI",type:"Annual + MRI Scan",status:"completed",score:94,photos:18,moistureData:true,notes:"Excellent condition. All drains clear. No moisture detected." },
      { id:"insp-3",roof_id:"r-1a",date:"2026-06-15",inspector:"TBD",company:"TBD",type:"Biannual",status:"scheduled",score:null,photos:0,moistureData:false,notes:"Due per GAF NDL requirements." },
      { id:"insp-4",roof_id:"r-4a",date:"2025-08-10",inspector:"—",company:"—",type:"Annual",status:"overdue",score:null,photos:0,moistureData:false,notes:"OVERDUE. Last inspection Aug 2023. Warranty compliance at risk." },
      { id:"insp-5",roof_id:"r-1b",date:"2026-03-20",inspector:"TBD",company:"TBD",type:"Annual",status:"scheduled",score:null,photos:0,moistureData:false,notes:"Carlisle requires annual inspection." },
    ];
    for (const insp of inspections) {
      await client.query("INSERT INTO inspections (id,roof_id,date,inspector,company,type,status,score,photos,moisture_data,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)", [insp.id,insp.roof_id,insp.date,insp.inspector,insp.company,insp.type,insp.status,insp.score,insp.photos,insp.moistureData,insp.notes]);
    }

    // ── CLAIMS ──
    const claims = [
      { id:"cl-1",roof_id:"r-3b",manufacturer:"Versico",filed:"2025-10-01",amount:3200,status:"approved",desc:"Membrane delamination — 200 sqft area, west section",
        timeline:[
          { date:"2025-10-01",event:"Claim filed with Versico. Included MRI scan data, photos, and inspection report." },
          { date:"2025-10-08",event:"Versico acknowledged receipt. Assigned claim #VER-2025-4412." },
          { date:"2025-10-22",event:"Versico field rep inspected. Confirmed manufacturing defect in membrane batch." },
          { date:"2025-11-05",event:"Claim approved. $3,200 repair authorized under Material + Labor warranty." },
          { date:"2025-11-18",event:"Repair completed by Versico-authorized contractor." },
        ] },
      { id:"cl-2",roof_id:"r-1a",manufacturer:"GAF",filed:"2026-01-10",amount:4200,status:"in-progress",desc:"Seam separation near HVAC unit — potential third-party cause",
        timeline:[
          { date:"2026-01-10",event:"Claim filed with GAF. Included MRI scan showing moisture at seam, QR access log showing unauthorized roof access 12/12." },
          { date:"2026-01-15",event:"GAF acknowledged. Requested additional documentation on HVAC contractor visits." },
          { date:"2026-01-28",event:"Submitted HVAC service records and QR access log timeline. Awaiting field inspection." },
        ] },
    ];
    for (const cl of claims) {
      await client.query("INSERT INTO claims (id,roof_id,manufacturer,filed,amount,status,description) VALUES ($1,$2,$3,$4,$5,$6,$7)", [cl.id,cl.roof_id,cl.manufacturer,cl.filed,cl.amount,cl.status,cl.desc]);
      for (let i = 0; i < cl.timeline.length; i++) {
        await client.query("INSERT INTO claim_events (claim_id,date,event,sort_order) VALUES ($1,$2,$3,$4)", [cl.id, cl.timeline[i].date, cl.timeline[i].event, i]);
      }
    }

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
