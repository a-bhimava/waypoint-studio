import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ── Project settings ──────────────────────────────
export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().default("My Journey"),
  mapboxToken: text("mapbox_token").notNull().default(""),
  mapStyle: text("map_style").notNull().default("mapbox://styles/mapbox/standard"),
  initialLng: real("initial_lng").notNull().default(-79.9536),
  initialLat: real("initial_lat").notNull().default(40.451),
  initialZoom: real("initial_zoom").notNull().default(14),
  initialPitch: real("initial_pitch").notNull().default(45),
  initialBearing: real("initial_bearing").notNull().default(0),
  scrollPerSegment: integer("scroll_per_segment").notNull().default(200),
  finaleHeadline: text("finale_headline").notNull().default("The End"),
  finaleSubtext: text("finale_subtext").notNull().default("Thank you for scrolling."),
  finaleTagline: text("finale_tagline").notNull().default("A Journey"),
});

export const insertProjectSchema = createInsertSchema(projects).omit({ id: true });
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// ── Waypoints ──────────────────────────────────────
export const waypoints = sqliteTable("waypoints", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  label: text("label").notNull().default("New Place"),
  description: text("description").notNull().default(""),
  lng: real("lng").notNull().default(0),
  lat: real("lat").notNull().default(0),
  cameraZoom: real("camera_zoom").notNull().default(17),
  cameraPitch: real("camera_pitch").notNull().default(68),
  cameraBearing: real("camera_bearing").notNull().default(0),
  imageUrl: text("image_url").notNull().default(""),
  theme: text("theme").notNull().default("day"),
  isFinal: integer("is_final", { mode: "boolean" }).notNull().default(false),
});

export const insertWaypointSchema = createInsertSchema(waypoints).omit({ id: true });
export type InsertWaypoint = z.infer<typeof insertWaypointSchema>;
export type Waypoint = typeof waypoints.$inferSelect;
