import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, API_BASE } from "./queryClient";
import type { Project, InsertProject, Waypoint, InsertWaypoint } from "@shared/schema";

// ── Project ──────────────────────────────────────
export function useProject() {
  return useQuery<Project>({ queryKey: ["/api/project"] });
}

export function useUpdateProject() {
  return useMutation({
    mutationFn: async (data: Partial<InsertProject>) => {
      const res = await apiRequest("PUT", "/api/project", data);
      return (await res.json()) as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/project"] });
    },
  });
}

// ── Waypoints ────────────────────────────────────
export function useWaypoints() {
  return useQuery<Waypoint[]>({ queryKey: ["/api/waypoints"] });
}

export function useCreateWaypoint() {
  return useMutation({
    mutationFn: async (data: Partial<InsertWaypoint>) => {
      const res = await apiRequest("POST", "/api/waypoints", data);
      return (await res.json()) as Waypoint;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/waypoints"] });
    },
  });
}

export function useUpdateWaypoint() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertWaypoint> }) => {
      const res = await apiRequest("PUT", `/api/waypoints/${id}`, data);
      return (await res.json()) as Waypoint;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/waypoints"] });
    },
  });
}

export function useDeleteWaypoint() {
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/waypoints/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/waypoints"] });
    },
  });
}

export function useReorderWaypoints() {
  return useMutation({
    mutationFn: async (order: number[]) => {
      const res = await apiRequest("POST", "/api/waypoints/reorder", { order });
      return (await res.json()) as Waypoint[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/waypoints"] });
    },
  });
}

// ── Export ────────────────────────────────────────
export async function downloadExport(projectName: string) {
  const res = await apiRequest("GET", "/api/export");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${projectName.replace(/\s+/g, "-").toLowerCase()}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Preview URL ──────────────────────────────────
export function getPreviewUrl() {
  return `${API_BASE}/api/preview`;
}

// ── Shareable URL (full, including origin) ───────
export function getShareUrl(): string {
  if (API_BASE) {
    return `${API_BASE}/api/preview`;
  }
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/preview`;
  }
  return "/api/preview";
}
