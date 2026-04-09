import { useCallback } from "react";
import { useDataStore } from "./data-store";
import type { Project, Waypoint, InsertProject, InsertWaypoint } from "./data-store";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { ENGINE_CSS, ENGINE_JS, ENGINE_HTML_HEAD, ENGINE_HTML_BODY } from "./templates";

// Re-export types so existing imports still work
export type { Project, Waypoint, InsertProject, InsertWaypoint };

// ── Project ──────────────────────────────────────
export function useProject() {
  const { project } = useDataStore();
  return { data: project, isLoading: false };
}

export function useUpdateProject() {
  const { updateProject } = useDataStore();
  return {
    mutate: (data: Partial<InsertProject>) => updateProject(data),
    isPending: false,
  };
}

// ── Waypoints ────────────────────────────────────
export function useWaypoints() {
  const { waypoints } = useDataStore();
  return { data: waypoints, isLoading: false };
}

export function useCreateWaypoint() {
  const { createWaypoint } = useDataStore();
  return {
    mutate: (
      data: Partial<InsertWaypoint>,
      options?: { onSuccess?: (wp: Waypoint) => void }
    ) => {
      const wp = createWaypoint(data);
      options?.onSuccess?.(wp);
    },
    isPending: false,
  };
}

export function useUpdateWaypoint() {
  const { updateWaypoint } = useDataStore();
  return {
    mutate: ({ id, data }: { id: number; data: Partial<InsertWaypoint> }) => {
      updateWaypoint(id, data);
    },
    isPending: false,
  };
}

export function useDeleteWaypoint() {
  const { deleteWaypoint } = useDataStore();
  return {
    mutate: (id: number) => deleteWaypoint(id),
    isPending: false,
  };
}

export function useReorderWaypoints() {
  const { reorderWaypoints } = useDataStore();
  return {
    mutate: (order: number[]) => reorderWaypoints(order),
    isPending: false,
  };
}

// ── Config generation (shared by export + preview) ──
function generateConfigJs(project: Project, wps: Waypoint[]): string {
  const waypoints = wps.map((wp) => ({
    id: wp.label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    coords: { lng: wp.lng, lat: wp.lat },
    camera: { zoom: wp.cameraZoom, pitch: wp.cameraPitch, bearing: wp.cameraBearing },
    label: wp.label,
    description: wp.description,
    image: wp.imageUrl || "",
    theme: wp.theme,
    ...(wp.isFinal ? { isFinal: true } : {}),
  }));

  return `const WAYPOINT_CONFIG = ${JSON.stringify(
    {
      mapbox: {
        accessToken: project.mapboxToken || "YOUR_MAPBOX_TOKEN_HERE",
        style: project.mapStyle,
        initialView: {
          lng: project.initialLng,
          lat: project.initialLat,
          zoom: project.initialZoom,
          pitch: project.initialPitch,
          bearing: project.initialBearing,
        },
      },
      settings: {
        scrollPerSegment: project.scrollPerSegment,
        easeDuration: 180,
        preloaderText: "Loading your journey…",
        preloaderDuration: 2200,
      },
      waypoints,
      finale: {
        headline: project.finaleHeadline,
        subtext: project.finaleSubtext,
        tagline: project.finaleTagline,
      },
    },
    null,
    2
  )};\n`;
}

// ── Preview HTML (generated client-side) ─────────
export function generatePreviewHtml(project: Project, waypoints: Waypoint[]): string {
  const configJs = generateConfigJs(project, waypoints);
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${project.name} — Preview</title>
${ENGINE_HTML_HEAD}
<style>${ENGINE_CSS}</style>
</head><body>
${ENGINE_HTML_BODY}
<script>${configJs}</script>
<script>${ENGINE_JS}</script>
</body></html>`;
}

// ── Export ZIP (generated client-side) ────────────
export async function downloadExport(project: Project, waypoints: Waypoint[]) {
  const configJs = generateConfigJs(project, waypoints);
  const zip = new JSZip();
  zip.file("config.js", configJs);
  zip.file("style.css", ENGINE_CSS);
  zip.file("engine.js", ENGINE_JS);
  zip.file(
    "index.html",
    `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${project.name}</title>
${ENGINE_HTML_HEAD}
<link rel="stylesheet" href="style.css" />
<script src="config.js"><\/script>
</head><body>
${ENGINE_HTML_BODY}
<script src="engine.js"><\/script>
</body></html>`
  );
  zip.folder("images");
  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `${project.name.replace(/\s+/g, "-").toLowerCase()}.zip`);
}

// ── Preview URL is no longer needed — we use srcdoc ──
export function getPreviewUrl(): string {
  return ""; // Unused; builder uses generatePreviewHtml + srcdoc instead
}

// ── Share URL ────────────────────────────────────
// In client-only mode there is no server preview endpoint.
// The share dialog explains this and points to Export instead.
export function getShareUrl(): string {
  return typeof window !== "undefined" ? window.location.href : "";
}
