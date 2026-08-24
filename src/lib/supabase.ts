import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase Integration & PostgreSQL Schema Helper
 * 
 * This module manages Supabase client configuration via NEXT_PUBLIC_SUPABASE_URL and
 * NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variables with localStorage fallback.
 * It provides database inspection utilities and the full PostgreSQL DDL schema definition.
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  source?: 'env' | 'localStorage' | 'none';
}

const SUPABASE_CONFIG_KEY = 'palma_tech_supabase_config';

export function isValidSupabaseUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (
    trimmed === 'NEXT_PUBLIC_SUPABASE_URL' ||
    trimmed === 'VITE_SUPABASE_URL' ||
    trimmed.includes('your-project') ||
    trimmed.includes('placeholder')
  ) {
    return false;
  }
  return trimmed.startsWith('https://') || trimmed.startsWith('http://');
}

/**
 * Retrieve Supabase configuration prioritizing environment variables:
 * 1. NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 * 2. VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
 * 3. localStorage user settings fallback
 */
export function getSupabaseConfig(): SupabaseConfig {
  let envUrl = '';
  let envKey = '';

  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      envUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || '';
      envKey =
        import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
        import.meta.env.VITE_SUPABASE_ANON_KEY ||
        '';
    }
  } catch {
    // Ignore meta env resolution errors
  }

  if (!envUrl && typeof process !== 'undefined' && process.env) {
    envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    envKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      '';
  }

  if (isValidSupabaseUrl(envUrl) && envKey && !envKey.includes('NEXT_PUBLIC_SUPABASE')) {
    return {
      url: envUrl.trim(),
      anonKey: envKey.trim(),
      isConnected: true,
      source: 'env',
    };
  }

  // Fallback to localStorage saved config
  try {
    const saved = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (isValidSupabaseUrl(parsed.url) && parsed.anonKey) {
        return {
          url: parsed.url.trim(),
          anonKey: parsed.anonKey.trim(),
          isConnected: true,
          source: 'localStorage',
        };
      }
    }
  } catch (e) {
    console.error('Failed to read Supabase config from localStorage', e);
  }

  return {
    url: '',
    anonKey: '',
    isConnected: false,
    source: 'none',
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  const config: SupabaseConfig = {
    url,
    anonKey,
    isConnected: !!(url && anonKey),
    source: 'localStorage',
  };
  localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
  cachedClient = null;
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const config = getSupabaseConfig();
  if (config.url && config.anonKey) {
    try {
      cachedClient = createClient(config.url, config.anonKey, {
        auth: { persistSession: false },
      });
      return cachedClient;
    } catch (e) {
      console.error('Error instantiating Supabase client:', e);
    }
  }
  return null;
}

export const supabase = getSupabaseClient();

/**
 * Inspection interface for verifying database tables in Supabase
 */
export interface TableInspectionResult {
  table: string;
  exists: boolean;
  error?: string;
}

export interface SupabaseInspectionReport {
  isConnected: boolean;
  configSource: 'env' | 'localStorage' | 'none';
  url: string;
  existingTables: string[];
  missingTables: string[];
  tableDetails: TableInspectionResult[];
  statusMessage: string;
}

export const EXPECTED_PLANTATION_TABLES = [
  'farm_blocks',
  'workers',
  'attendance_records',
  'daily_work_reports',
  'farm_inspections',
  'pest_disease_reports',
  'harvest_records',
  'inventory_items',
  'equipment_fleet',
  'expense_records',
];

/**
 * Inspects the existing Supabase PostgreSQL database to determine
 * what tables already exist and what tables are still needed.
 */
export async function inspectSupabaseDatabase(): Promise<SupabaseInspectionReport> {
  const config = getSupabaseConfig();
  const client = getSupabaseClient();

  if (!client || !config.isConnected) {
    return {
      isConnected: false,
      configSource: config.source || 'none',
      url: config.url || 'Not configured',
      existingTables: [],
      missingTables: EXPECTED_PLANTATION_TABLES,
      tableDetails: EXPECTED_PLANTATION_TABLES.map((table) => ({
        table,
        exists: false,
        error: 'Supabase client not configured with URL & Key',
      })),
      statusMessage: 'Supabase credentials missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variables or configure via modal.',
    };
  }

  const existingTables: string[] = [];
  const missingTables: string[] = [];
  const tableDetails: TableInspectionResult[] = [];

  for (const table of EXPECTED_PLANTATION_TABLES) {
    try {
      // Query 1 row or head check to test if table exists in public schema
      const { error } = await client.from(table).select('*', { count: 'exact', head: true });

      if (!error) {
        existingTables.push(table);
        tableDetails.push({ table, exists: true });
      } else {
        const errMsg = error.message || error.details || JSON.stringify(error);
        if (
          error.code === '42P01' ||
          error.code === 'PGRST205' ||
          errMsg.includes('does not exist') ||
          errMsg.includes('not found')
        ) {
          missingTables.push(table);
          tableDetails.push({ table, exists: false, error: 'Table does not exist in public schema' });
        } else {
          // Table exists but maybe permission / empty / RLS notice
          existingTables.push(table);
          tableDetails.push({ table, exists: true, error: `Accessible with notice: ${errMsg}` });
        }
      }
    } catch (err: any) {
      missingTables.push(table);
      tableDetails.push({ table, exists: false, error: err?.message || 'Connection or query error' });
    }
  }

  const statusMessage =
    existingTables.length === EXPECTED_PLANTATION_TABLES.length
      ? `Successfully connected to Supabase (${config.url}). All ${existingTables.length} required plantation tables are fully provisioned!`
      : `Connected to Supabase (${config.url}). ${existingTables.length} tables found, ${missingTables.length} tables needed.`;

  return {
    isConnected: true,
    configSource: config.source || 'env',
    url: config.url,
    existingTables,
    missingTables,
    tableDetails,
    statusMessage,
  };
}

export const SUPABASE_POSTGRES_SCHEMA_SQL = `-- Commercial 500-Hectare Palm Plantation Database Schema
-- Compatible with Supabase PostgreSQL, Row Level Security (RLS), and Realtime

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Farm Blocks Table (500 ha divided into blocks)
CREATE TABLE IF NOT EXISTS farm_blocks (
  id VARCHAR(50) PRIMARY KEY,
  block_number INT NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  area_ha NUMERIC(6,2) NOT NULL DEFAULT 25.0,
  palm_age_years INT NOT NULL,
  planting_year INT NOT NULL,
  total_palms INT NOT NULL DEFAULT 3450,
  terrain VARCHAR(50) NOT NULL CHECK (terrain IN ('Flat', 'Undulating', 'Coastal Alluvial', 'Peat')),
  assigned_supervisor VARCHAR(100),
  assigned_workers_count INT DEFAULT 0,
  current_activity VARCHAR(150),
  inspection_status VARCHAR(50) DEFAULT 'Passed',
  pest_status VARCHAR(50) DEFAULT 'Clear',
  last_activity_date DATE,
  target_yield_tonnes NUMERIC(8,2) DEFAULT 52.5,
  actual_yield_tonnes_month NUMERIC(8,2) DEFAULT 0,
  coordinates_x NUMERIC(5,2) DEFAULT 0,
  coordinates_y NUMERIC(5,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Workers Table
CREATE TABLE IF NOT EXISTS workers (
  id VARCHAR(50) PRIMARY KEY,
  worker_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(30),
  role VARCHAR(50) NOT NULL,
  assigned_block_id VARCHAR(50) REFERENCES farm_blocks(id) ON DELETE SET NULL,
  employment_status VARCHAR(50) DEFAULT 'Active',
  joined_date DATE NOT NULL,
  daily_rate NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Daily Attendance Table
CREATE TABLE IF NOT EXISTS attendance_records (
  id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  date DATE NOT NULL,
  worker_id VARCHAR(50) REFERENCES workers(id) ON DELETE CASCADE,
  worker_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('Present', 'Absent', 'On Leave', 'Late')),
  check_in_time VARCHAR(20),
  assigned_block_id VARCHAR(50) REFERENCES farm_blocks(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Daily Work Reports Table
CREATE TABLE IF NOT EXISTS daily_work_reports (
  id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  date DATE NOT NULL,
  worker_id VARCHAR(50) REFERENCES workers(id) ON DELETE CASCADE,
  worker_name VARCHAR(100) NOT NULL,
  block_id VARCHAR(50) REFERENCES farm_blocks(id) ON DELETE CASCADE,
  task_performed VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  quantity_completed NUMERIC(10,2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  hours_worked NUMERIC(4,2) NOT NULL,
  problems_encountered TEXT,
  materials_used JSONB,
  photo_evidence_url TEXT,
  supervisor_approval VARCHAR(20) DEFAULT 'Pending' CHECK (supervisor_approval IN ('Pending', 'Approved', 'Rejected')),
  approved_by VARCHAR(100),
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Farm Inspections Table
CREATE TABLE IF NOT EXISTS farm_inspections (
  id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  date DATE NOT NULL,
  block_id VARCHAR(50) REFERENCES farm_blocks(id) ON DELETE CASCADE,
  inspector_name VARCHAR(100) NOT NULL,
  general_condition_score INT CHECK (general_condition_score BETWEEN 1 AND 5),
  palm_health_score INT CHECK (palm_health_score BETWEEN 1 AND 5),
  weed_control_score INT CHECK (weed_control_score BETWEEN 1 AND 5),
  pest_presence VARCHAR(20) NOT NULL,
  disease_presence VARCHAR(50) NOT NULL,
  drainage_status VARCHAR(50) NOT NULL,
  road_status VARCHAR(50) NOT NULL,
  worker_safety_ppe VARCHAR(50) NOT NULL,
  equipment_condition VARCHAR(50) NOT NULL,
  recommendations TEXT,
  photo_url TEXT,
  status VARCHAR(30) DEFAULT 'Completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Pest & Disease Incidents Table
CREATE TABLE IF NOT EXISTS pest_disease_reports (
  id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  date DATE NOT NULL,
  block_id VARCHAR(50) REFERENCES farm_blocks(id) ON DELETE CASCADE,
  reported_by VARCHAR(100) NOT NULL,
  pest_disease_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
  affected_area_ha NUMERIC(6,2) NOT NULL,
  affected_trees_count INT NOT NULL,
  description TEXT NOT NULL,
  photo_url TEXT,
  recommended_action TEXT,
  status VARCHAR(30) DEFAULT 'Reported' CHECK (status IN ('Reported', 'In Treatment', 'Resolved')),
  treated_date DATE,
  treated_by VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Harvest Management Table
CREATE TABLE IF NOT EXISTS harvest_records (
  id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  date DATE NOT NULL,
  block_id VARCHAR(50) REFERENCES farm_blocks(id) ON DELETE CASCADE,
  quantity_tonnes NUMERIC(8,2) NOT NULL,
  bunch_count INT NOT NULL,
  average_bunch_weight_kg NUMERIC(6,2) NOT NULL,
  worker_count INT NOT NULL,
  harvest_team VARCHAR(100) NOT NULL,
  transport_truck_number VARCHAR(50) NOT NULL,
  receiving_mill_location VARCHAR(150) NOT NULL,
  ripe_percentage INT NOT NULL DEFAULT 90,
  underripe_percentage INT NOT NULL DEFAULT 5,
  long_stalk_percentage INT NOT NULL DEFAULT 5,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Inventory & Inputs Table
CREATE TABLE IF NOT EXISTS inventory_items (
  id VARCHAR(50) PRIMARY KEY,
  item_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL,
  current_stock NUMERIC(10,2) NOT NULL DEFAULT 0,
  unit VARCHAR(30) NOT NULL,
  minimum_stock_level NUMERIC(10,2) NOT NULL DEFAULT 10,
  supplier VARCHAR(100),
  unit_cost NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  last_restocked_date DATE,
  location VARCHAR(100),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Equipment & Machinery Fleet Table
CREATE TABLE IF NOT EXISTS equipment_fleet (
  id VARCHAR(50) PRIMARY KEY,
  equipment_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  operator_name VARCHAR(100),
  condition VARCHAR(30) NOT NULL,
  fuel_usage_liters_month NUMERIC(8,2) DEFAULT 0,
  current_status VARCHAR(50) NOT NULL,
  last_maintenance_date DATE,
  next_service_due DATE,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Financial Expense Records Table
CREATE TABLE IF NOT EXISTS expense_records (
  id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  date DATE NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  block_id VARCHAR(50) REFERENCES farm_blocks(id) ON DELETE SET NULL,
  person_responsible VARCHAR(100) NOT NULL,
  receipt_photo_url TEXT,
  approval_status VARCHAR(20) DEFAULT 'Approved',
  approved_by VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Realtime Enablement for Supabase Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE daily_work_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE pest_disease_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE harvest_records;
ALTER PUBLICATION supabase_realtime ADD TABLE attendance_records;
`;
