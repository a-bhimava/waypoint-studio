import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "./supabase";
import { useAuth } from "./auth-store";

// ── Types ────────────────────────────────────────
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

// ── Supabase row → local type helpers ────────────
function rowToProject(r: any): Project {
  return {
    id: r.id,
    name: r.name,
    mapboxToken: r.mapbox_token,
    mapStyle: r.map_style,
    initialLng: r.initial_lng,
    initialLat: r.initial_lat,
    initialZoom: r.initial_zoom,
    initialPitch: r.initial_pitch,
    initialBearing: r.initial_bearing,
    scrollPerSegment: r.scroll_per_segment,
    finaleHeadline: r.finale_headline,
    finaleSubtext: r.finale_subtext,
    finaleTagline: r.finale_tagline,
  };
}

function projectToRow(p: Partial<InsertProject>): Record<string, any> {
  const map: Record<string, string> = {
    name: "name", mapboxToken: "mapbox_token", mapStyle: "map_style",
    initialLng: "initial_lng", initialLat: "initial_lat", initialZoom: "initial_zoom",
    initialPitch: "initial_pitch", initialBearing: "initial_bearing",
    scrollPerSegment: "scroll_per_segment", finaleHeadline: "finale_headline",
    finaleSubtext: "finale_subtext", finaleTagline: "finale_tagline",
  };
  const row: Record<string, any> = {};
  for (const [k, v] of Object.entries(p)) {
    if (map[k]) row[map[k]] = v;
  }
  return row;
}

function rowToWaypoint(r: any): Waypoint {
  return {
    id: r.id, projectId: r.project_id, sortOrder: r.sort_order,
    label: r.label, description: r.description, lng: r.lng, lat: r.lat,
    cameraZoom: r.camera_zoom, cameraPitch: r.camera_pitch,
    cameraBearing: r.camera_bearing, imageUrl: r.image_url,
    theme: r.theme, isFinal: r.is_final,
  };
}

function waypointToRow(w: Partial<InsertWaypoint>): Record<string, any> {
  const map: Record<string, string> = {
    projectId: "project_id", sortOrder: "sort_order", label: "label",
    description: "description", lng: "lng", lat: "lat",
    cameraZoom: "camera_zoom", cameraPitch: "camera_pitch",
    cameraBearing: "camera_bearing", imageUrl: "image_url",
    theme: "theme", isFinal: "is_final",
  };
  const row: Record<string, any> = {};
  for (const [k, v] of Object.entries(w)) {
    if (map[k] !== undefined) row[map[k]] = v;
  }
  return row;
}

// ── Context ──────────────────────────────────────
interface DataContextType {
  project: Project;
  waypoints: Waypoint[];
  loading: boolean;
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
  const { user } = useAuth();
  const [project, setProject] = useState<Project>(DEFAULT_PROJECT);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [nextLocalId, setNextLocalId] = useState(1);
  const [loading, setLoading] = useState(false);
  const dbProjectId = useRef<number | null>(null);

  // ── Load from Supabase on login ──────────────
  useEffect(() => {
    if (!supabase || !user) return;
    setLoading(true);

    (async () => {
      // Get or create project
      let { data: proj } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!proj) {
        const { data: newProj } = await supabase
          .from("projects")
          .insert({ user_id: user.id })
          .select()
          .single();
        proj = newProj;
      }

      if (proj) {
        dbProjectId.current = proj.id;
        setProject(rowToProject(proj));

        const { data: wps } = await supabase
          .from("waypoints")
          .select("*")
          .eq("project_id", proj.id)
          .order("sort_order", { ascending: true });

        if (wps) setWaypoints(wps.map(rowToWaypoint));
      }
      setLoading(false);
    })();
  }, [user]);

  // ── Mutations ────────────────────────────────
  const updateProject = useCallback(
    (data: Partial<InsertProject>) => {
      setProject((prev) => ({ ...prev, ...data }));
      if (supabase && user && dbProjectId.current) {
        supabase
          .from("projects")
          .update(projectToRow(data))
          .eq("id", dbProjectId.current)
          .then();
      }
    },
    [user]
  );

  const createWaypoint = useCallback(
    (data: Partial<InsertWaypoint>): Waypoint => {
      const localId = nextLocalId;
      setNextLocalId((p) => p + 1);
      const wp: Waypoint = {
        id: localId,
        projectId: dbProjectId.current ?? 1,
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

      // Persist to Supabase and update local ID
      if (supabase && user && dbProjectId.current) {
        const row = waypointToRow(wp);
        row.project_id = dbProjectId.current;
        row.user_id = user.id;
        supabase
          .from("waypoints")
          .insert(row)
          .select()
          .single()
          .then(({ data: inserted }) => {
            if (inserted) {
              setWaypoints((prev) =>
                prev.map((w) =>
                  w.id === localId ? { ...w, id: inserted.id } : w
                )
              );
            }
          });
      }

      return wp;
    },
    [nextLocalId, waypoints.length, user]
  );

  const updateWaypoint = useCallback(
    (id: number, data: Partial<InsertWaypoint>) => {
      setWaypoints((prev) =>
        prev.map((wp) => (wp.id === id ? { ...wp, ...data } : wp))
      );
      if (supabase && user) {
        supabase.from("waypoints").update(waypointToRow(data)).eq("id", id).then();
      }
    },
    [user]
  );

  const deleteWaypoint = useCallback(
    (id: number) => {
      setWaypoints((prev) => prev.filter((wp) => wp.id !== id));
      if (supabase && user) {
        supabase.from("waypoints").delete().eq("id", id).then();
      }
    },
    [user]
  );

  const reorderWaypoints = useCallback(
    (order: number[]) => {
      setWaypoints((prev) => {
        const map = new Map(prev.map((wp) => [wp.id, wp]));
        return order
          .map((id, idx) => {
            const wp = map.get(id);
            return wp ? { ...wp, sortOrder: idx } : null;
          })
          .filter(Boolean) as Waypoint[];
      });
      if (supabase && user) {
        order.forEach((id, idx) => {
          supabase.from("waypoints").update({ sort_order: idx }).eq("id", id).then();
        });
      }
    },
    [user]
  );

  return (
    <DataContext.Provider
      value={{
        project,
        waypoints,
        loading,
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
