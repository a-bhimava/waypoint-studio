-- Waypoint Studio — Supabase Database Setup
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- Then set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Vercel env vars.

-- ── Projects table ────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My Journey',
  mapbox_token TEXT NOT NULL DEFAULT '',
  map_style TEXT NOT NULL DEFAULT 'mapbox://styles/mapbox/standard',
  initial_lng FLOAT8 NOT NULL DEFAULT -79.9536,
  initial_lat FLOAT8 NOT NULL DEFAULT 40.451,
  initial_zoom FLOAT8 NOT NULL DEFAULT 14,
  initial_pitch FLOAT8 NOT NULL DEFAULT 45,
  initial_bearing FLOAT8 NOT NULL DEFAULT 0,
  scroll_per_segment INT NOT NULL DEFAULT 200,
  finale_headline TEXT NOT NULL DEFAULT 'The End',
  finale_subtext TEXT NOT NULL DEFAULT 'Thank you for scrolling.',
  finale_tagline TEXT NOT NULL DEFAULT 'A Journey',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Waypoints table ───────────────────────────────
CREATE TABLE IF NOT EXISTS waypoints (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  label TEXT NOT NULL DEFAULT 'New Place',
  description TEXT NOT NULL DEFAULT '',
  lng FLOAT8 NOT NULL DEFAULT 0,
  lat FLOAT8 NOT NULL DEFAULT 0,
  camera_zoom FLOAT8 NOT NULL DEFAULT 17,
  camera_pitch FLOAT8 NOT NULL DEFAULT 68,
  camera_bearing FLOAT8 NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL DEFAULT '',
  theme TEXT NOT NULL DEFAULT 'day',
  is_final BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row Level Security ────────────────────────────
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE waypoints ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users manage own projects"
  ON projects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own waypoints"
  ON waypoints FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Indexes ───────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_waypoints_project ON waypoints(project_id);
CREATE INDEX IF NOT EXISTS idx_waypoints_user ON waypoints(user_id);
