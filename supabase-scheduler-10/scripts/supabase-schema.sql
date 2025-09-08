-- Create tables for the scheduling application

-- Resources tables
CREATE TABLE IF NOT EXISTS crews (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'crew',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trucks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'truck',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trailers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'trailer',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS equipment (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'equipment',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Schedules table for saving board states
CREATE TABLE IF NOT EXISTS schedules (
  id TEXT PRIMARY KEY,
  time_created TIMESTAMP DEFAULT NOW(),
  html_content TEXT NOT NULL,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Locations table for saving location data
CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  locations JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_crews_name ON crews(name);
CREATE INDEX IF NOT EXISTS idx_trucks_name ON trucks(name);
CREATE INDEX IF NOT EXISTS idx_trailers_name ON trailers(name);
CREATE INDEX IF NOT EXISTS idx_equipment_name ON equipment(name);
CREATE INDEX IF NOT EXISTS idx_schedules_current ON schedules(is_current);
CREATE INDEX IF NOT EXISTS idx_schedules_time ON schedules(time_created DESC);
