import { createContext, useContext, useState, useCallback } from "react";

// ── Types (mirroring shared/schema.ts without importing server code) ──
export interface Project {
  id: number;
  name: string;
  mapboxToken: string;
  mapStyle: string;
  initialLng: number;
  initialLat: number;
  initialZoom: number;
  initialPitch: number;
  initialBearing: number;
  scrollPerSegment: number;
  finaleHeadline: string;
  finaleSubtext: string;
  finaleTagline: string;
}

export interface Waypoint {
  id: number;
  projectId: number;
  sortOrder: number;
  label: string;
  description: string;
  lng: number;
  lat: number;
  cameraZoom: number;
  cameraPitch: number;
  cameraBearing: number;
  imageUrl: string;
  theme: string;
  isFinal: boolean;
}

export type InsertProject = Omit<Project, "id">;
export type InsertWaypoint = Omit<Waypoint, "id">;

const DEFAULT_PROJECT: Project = {
  id: 1,
  name: "My Journey",
  mapboxToken: "",
  mapStyle: "mapbox://styles/mapbox/standard",
  initialLng: -79.9536,
  initialLat: 40.451,
  initialZoom: 14,
  initialPitch: 45,
  initialBearing: 0,
  scrollPerSegment: 200,
  finaleHeadline: "The End",
  finaleSubtext: "Thank you for scrolling.",
  finaleTagline: "A Journey",
};

// ── Context ──────────────────────────────────────
interface DataContextType {
  project: Project;
  waypoints: Waypoint[];
  updateProject: (data: Partial<InsertProject>) => void;
  createWaypoint: (data: Partial<InsertWaypoint>) => Waypoint;
  updateWaypoint: (id: number, data: Partial<InsertWaypoint>) => void;
  deleteWaypoint: (id: number) => void;
  reorderWaypoints: (order: number[]) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function useDataStore(): DataContextType {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useDataStore must be used inside DataProvider");
  return ctx;
}

// ── Provider ─────────────────────────────────────
export function DataProvider({ children }: { children: React.ReactNode }) {
  const [project, setProject] = useState<Project>(DEFAULT_PROJECT);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [nextId, setNextId] = useState(1);

  const updateProject = useCallback((data: Partial<InsertProject>) => {
    setProject((prev) => ({ ...prev, ...data }));
  }, []);

  const createWaypoint = useCallback(
    (data: Partial<InsertWaypoint>): Waypoint => {
      const id = nextId;
      setNextId((prev) => prev + 1);
      const wp: Waypoint = {
        id,
        projectId: 1,
        sortOrder: waypoints.length,
        label: data.label ?? "New Place",
        description: data.description ?? "",
        lng: data.lng ?? 0,
        lat: data.lat ?? 0,
        cameraZoom: data.cameraZoom ?? 17,
        cameraPitch: data.cameraPitch ?? 68,
        cameraBearing: data.cameraBearing ?? 0,
        imageUrl: data.imageUrl ?? "",
        theme: data.theme ?? "day",
        isFinal: data.isFinal ?? false,
      };
      setWaypoints((prev) => [...prev, wp]);
      return wp;
    },
    [nextId, waypoints.length]
  );

  const updateWaypoint = useCallback(
    (id: number, data: Partial<InsertWaypoint>) => {
      setWaypoints((prev) =>
        prev.map((wp) => (wp.id === id ? { ...wp, ...data } : wp))
      );
    },
    []
  );

  const deleteWaypoint = useCallback((id: number) => {
    setWaypoints((prev) => prev.filter((wp) => wp.id !== id));
  }, []);

  const reorderWaypoints = useCallback((order: number[]) => {
    setWaypoints((prev) => {
      const map = new Map(prev.map((wp) => [wp.id, wp]));
      return order
        .map((id, idx) => {
          const wp = map.get(id);
          return wp ? { ...wp, sortOrder: idx } : null;
        })
        .filter(Boolean) as Waypoint[];
    });
  }, []);

  return (
    <DataContext.Provider
      value={{
        project,
        waypoints,
        updateProject,
        createWaypoint,
        updateWaypoint,
        deleteWaypoint,
        reorderWaypoints,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
