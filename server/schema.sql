-- Warranty Management App — PostgreSQL Schema

-- Owners
CREATE TABLE IF NOT EXISTS owners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT,
  email TEXT,
  phone TEXT,
  notes TEXT
);

-- Property Managers
CREATE TABLE IF NOT EXISTS property_managers (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact TEXT,
  email TEXT,
  phone TEXT,
  notes TEXT
);

-- Properties
CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  managed_by TEXT REFERENCES property_managers(id),
  name TEXT NOT NULL,
  address TEXT
);

-- Roofs
CREATE TABLE IF NOT EXISTS roofs (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  section TEXT NOT NULL,
  sq_ft INTEGER,
  type TEXT,
  installed DATE
);

-- Roof Warranties
CREATE TABLE IF NOT EXISTS roof_warranties (
  roof_id TEXT PRIMARY KEY REFERENCES roofs(id) ON DELETE CASCADE,
  manufacturer TEXT,
  w_type TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active',
  compliance TEXT DEFAULT 'current',
  next_insp DATE,
  last_insp DATE,
  coverage JSONB DEFAULT '[]',
  exclusions JSONB DEFAULT '[]',
  requirements JSONB DEFAULT '[]'
);

-- Warranty Database (223 warranty options — coatings + single-ply)
CREATE TABLE IF NOT EXISTS warranty_db (
  id TEXT PRIMARY KEY,
  category TEXT,
  manufacturer TEXT,
  name TEXT,
  membranes JSONB DEFAULT '[]',
  term INTEGER,
  labor_covered BOOLEAN DEFAULT false,
  material_covered BOOLEAN DEFAULT false,
  consequential BOOLEAN DEFAULT false,
  dollar_cap TEXT,
  insp_freq TEXT,
  insp_by TEXT,
  transferable BOOLEAN DEFAULT false,
  ponding_excluded BOOLEAN DEFAULT true,
  wind_limit TEXT,
  strengths JSONB DEFAULT '[]',
  weaknesses JSONB DEFAULT '[]',
  best_for TEXT,
  rating INTEGER,
  product_lines TEXT,
  warranty_name TEXT,
  thickness TEXT,
  installation_method TEXT,
  ndl BOOLEAN DEFAULT false,
  hail_coverage TEXT,
  min_roof_size TEXT,
  recover_eligible BOOLEAN,
  recover_max_years INTEGER,
  warranty_fee_per_sq NUMERIC(10,2),
  min_warranty_fee NUMERIC(10,2),
  reference_url TEXT,
  notes TEXT,
  maintenance_required TEXT,
  transfer_policy TEXT
);

-- Pricing Submissions (replaces Google Sheets)
CREATE TABLE IF NOT EXISTS pricing_submissions (
  id SERIAL PRIMARY KEY,
  warranty_id TEXT REFERENCES warranty_db(id),
  fee_type TEXT NOT NULL CHECK (fee_type IN ('base', 'psf')),
  amount NUMERIC(12,4) NOT NULL,
  status TEXT DEFAULT 'active',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_by TEXT DEFAULT 'App User',
  region_state TEXT,
  notes TEXT
);

-- Access Logs
CREATE TABLE IF NOT EXISTS access_logs (
  id TEXT PRIMARY KEY,
  roof_id TEXT REFERENCES roofs(id),
  person TEXT,
  company TEXT,
  purpose TEXT,
  date TIMESTAMPTZ,
  duration TEXT,
  notes TEXT
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  roof_id TEXT REFERENCES roofs(id),
  vendor TEXT,
  date DATE,
  amount NUMERIC(12,2) DEFAULT 0,
  description TEXT,
  flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  status TEXT DEFAULT 'review'
);

-- Inspections
CREATE TABLE IF NOT EXISTS inspections (
  id TEXT PRIMARY KEY,
  roof_id TEXT REFERENCES roofs(id),
  date DATE,
  inspector TEXT,
  company TEXT,
  type TEXT,
  status TEXT DEFAULT 'scheduled',
  score INTEGER,
  photos INTEGER DEFAULT 0,
  moisture_data BOOLEAN DEFAULT false,
  notes TEXT
);

-- Claims
CREATE TABLE IF NOT EXISTS claims (
  id TEXT PRIMARY KEY,
  roof_id TEXT REFERENCES roofs(id),
  manufacturer TEXT,
  filed DATE,
  amount NUMERIC(12,2) DEFAULT 0,
  status TEXT DEFAULT 'in-progress',
  description TEXT
);

-- Claim Timeline Events
CREATE TABLE IF NOT EXISTS claim_events (
  id SERIAL PRIMARY KEY,
  claim_id TEXT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  date DATE,
  event TEXT,
  sort_order INTEGER DEFAULT 0
);
