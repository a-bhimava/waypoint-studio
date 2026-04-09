import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

// On Vercel serverless, only /tmp is writable
const dbPath = process.env.VERCEL ? "/tmp/data.db" : "data.db";
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");

// Auto-create tables (needed for Vercel where drizzle-kit push cannot run)
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL DEFAULT 'My Journey',
    mapbox_token TEXT NOT NULL DEFAULT '',
    map_style TEXT NOT NULL DEFAULT 'mapbox://styles/mapbox/standard',
    initial_lng REAL NOT NULL DEFAULT -79.9536,
    initial_lat REAL NOT NULL DEFAULT 40.451,
    initial_zoom REAL NOT NULL DEFAULT 14,
    initial_pitch REAL NOT NULL DEFAULT 45,
    initial_bearing REAL NOT NULL DEFAULT 0,
    scroll_per_segment INTEGER NOT NULL DEFAULT 200,
    finale_headline TEXT NOT NULL DEFAULT 'The End',
    finale_subtext TEXT NOT NULL DEFAULT 'Thank you for scrolling.',
    finale_tagline TEXT NOT NULL DEFAULT 'A Journey'
  );
  CREATE TABLE IF NOT EXISTS waypoints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    label TEXT NOT NULL DEFAULT 'New Place',
    description TEXT NOT NULL DEFAULT '',
    lng REAL NOT NULL DEFAULT 0,
    lat REAL NOT NULL DEFAULT 0,
    camera_zoom REAL NOT NULL DEFAULT 17,
    camera_pitch REAL NOT NULL DEFAULT 68,
    camera_bearing REAL NOT NULL DEFAULT 0,
    image_url TEXT NOT NULL DEFAULT '',
    theme TEXT NOT NULL DEFAULT 'day',
    is_final INTEGER NOT NULL DEFAULT 0
  );
`);

export const db = drizzle(sqlite);
