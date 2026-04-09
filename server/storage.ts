import { projects, waypoints, type Project, type InsertProject, type Waypoint, type InsertWaypoint } from "../shared/schema";
import { db } from "./db";
import { eq, asc } from "drizzle-orm";

export interface IStorage {
  getProject(): Project;
  updateProject(data: Partial<InsertProject>): Project;
  getWaypoints(projectId: number): Waypoint[];
  getWaypoint(id: number): Waypoint | undefined;
  createWaypoint(data: InsertWaypoint): Waypoint;
  updateWaypoint(id: number, data: Partial<InsertWaypoint>): Waypoint | undefined;
  deleteWaypoint(id: number): void;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Ensure a default project exists
    const existing = db.select().from(projects).get();
    if (!existing) {
      db.insert(projects).values({ name: "My Journey" }).run();
    }
  }

  getProject(): Project {
    return db.select().from(projects).get()!;
  }

  updateProject(data: Partial<InsertProject>): Project {
    const project = this.getProject();
    db.update(projects).set(data).where(eq(projects.id, project.id)).run();
    return this.getProject();
  }

  getWaypoints(projectId: number): Waypoint[] {
    return db.select().from(waypoints).where(eq(waypoints.projectId, projectId)).orderBy(asc(waypoints.sortOrder)).all();
  }

  getWaypoint(id: number): Waypoint | undefined {
    return db.select().from(waypoints).where(eq(waypoints.id, id)).get();
  }

  createWaypoint(data: InsertWaypoint): Waypoint {
    return db.insert(waypoints).values(data).returning().get();
  }

  updateWaypoint(id: number, data: Partial<InsertWaypoint>): Waypoint | undefined {
    db.update(waypoints).set(data).where(eq(waypoints.id, id)).run();
    return this.getWaypoint(id);
  }

  deleteWaypoint(id: number): void {
    db.delete(waypoints).where(eq(waypoints.id, id)).run();
  }
}

export const storage = new DatabaseStorage();
