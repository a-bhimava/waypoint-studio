import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  Settings, Eye, Download, Compass, Share2, Plus,
  ChevronUp, ChevronDown, Trash2, MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { MapEditor } from "@/components/map-editor";
import { WaypointEditor } from "@/components/waypoint-editor";
import { SettingsDialog } from "@/components/settings-dialog";
import { ShareDialog } from "@/components/share-dialog";

import {
  useProject,
  useUpdateProject,
  useWaypoints,
  useCreateWaypoint,
  useUpdateWaypoint,
  useDeleteWaypoint,
  useReorderWaypoints,
  downloadExport,
  generatePreviewHtml,
} from "@/lib/hooks";

// mapbox-gl loaded via CDN
declare const mapboxgl: typeof import("mapbox-gl").default;

export default function Builder() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const { toast } = useToast();

  const { data: project, isLoading: projectLoading } = useProject();
  const { data: waypoints = [] } = useWaypoints();

  const updateProject = useUpdateProject();
  const createWp = useCreateWaypoint();
  const updateWp = useUpdateWaypoint();
  const deleteWp = useDeleteWaypoint();
  const reorderWp = useReorderWaypoints();

  const selectedWaypoint = waypoints.find((w) => w.id === selectedId) ?? null;
  const selectedIdx = waypoints.findIndex((w) => w.id === selectedId);

  // Auto-open settings if no token
  useEffect(() => {
    if (project && !project.mapboxToken) setSettingsOpen(true);
  }, [project?.mapboxToken]);

  // Resize map when bottom panel appears/disappears
  useEffect(() => {
    const map = mapRef.current;
    if (map) {
      const t = setTimeout(() => map.resize(), 320);
      return () => clearTimeout(t);
    }
  }, [selectedId]);

  // ── Handlers ─────────────────────────────────────
  const addWaypoint = useCallback(
    (lng: number, lat: number) => {
      const map = mapRef.current;
      createWp.mutate(
        {
          lng,
          lat,
          label: `Waypoint ${waypoints.length + 1}`,
          cameraZoom: map?.getZoom() ?? 17,
          cameraPitch: map?.getPitch() ?? 68,
          cameraBearing: map?.getBearing() ?? 0,
        },
        { onSuccess: (wp) => setSelectedId(wp.id) }
      );
    },
    [waypoints.length, createWp]
  );

  const handleMapClick = useCallback(
    (lng: number, lat: number) => addWaypoint(lng, lat),
    [addWaypoint]
  );

  const handleAddAtCenter = useCallback(() => {
    const map = mapRef.current;
    if (map) {
      const c = map.getCenter();
      addWaypoint(c.lng, c.lat);
    } else {
      addWaypoint(project?.initialLng ?? 0, project?.initialLat ?? 0);
    }
  }, [addWaypoint, project]);

  const handleMarkerDrag = useCallback(
    (id: number, lng: number, lat: number) => {
      updateWp.mutate({ id, data: { lng, lat } });
    },
    [updateWp]
  );

  const handleCaptureCamera = useCallback(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    updateWp.mutate({
      id: selectedId,
      data: {
        cameraZoom: map.getZoom(),
        cameraPitch: map.getPitch(),
        cameraBearing: map.getBearing(),
      },
    });
    toast({ title: "Camera captured", description: "Current view saved to this waypoint" });
  }, [selectedId, updateWp, toast]);

  const handleExport = useCallback(async () => {
    if (!project) return;
    try {
      await downloadExport(project, waypoints);
      toast({ title: "Export complete", description: "ZIP downloaded successfully" });
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    }
  }, [project, waypoints, toast]);

  const handleMoveUp = () => {
    if (selectedIdx <= 0) return;
    const order = waypoints.map((w) => w.id);
    [order[selectedIdx - 1], order[selectedIdx]] = [order[selectedIdx], order[selectedIdx - 1]];
    reorderWp.mutate(order);
  };

  const handleMoveDown = () => {
    if (selectedIdx < 0 || selectedIdx >= waypoints.length - 1) return;
    const order = waypoints.map((w) => w.id);
    [order[selectedIdx], order[selectedIdx + 1]] = [order[selectedIdx + 1], order[selectedIdx]];
    reorderWp.mutate(order);
  };

  const handleDeleteSelected = () => {
    if (!selectedId) return;
    const id = selectedId;
    setSelectedId(null);
    deleteWp.mutate(id);
  };

  // ── Loading ──────────────────────────────────────
  if (projectLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="w-48 h-4" />
          <Skeleton className="w-32 h-3" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-background" data-testid="builder-page">
      {/* ═══ Top Toolbar ═══════════════════════════ */}
      <div className="flex items-center justify-between px-4 h-12 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2.5">
          <Link href="/">
            <span className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
              <Compass className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Waypoint Studio</span>
            </span>
          </Link>
          <span className="text-border text-xs">|</span>
          <span className="text-sm text-muted-foreground truncate max-w-[160px]" data-testid="text-project-name">
            {project?.name}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setSettingsOpen(true)} data-testid="button-settings">
            <Settings className="w-3.5 h-3.5" /> Settings
          </Button>
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setPreviewOpen(true)} data-testid="button-preview">
            <Eye className="w-3.5 h-3.5" /> Preview
          </Button>
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={handleExport} data-testid="button-export">
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
          <Button size="sm" className="h-8 gap-1.5 text-xs ml-1" onClick={() => setShareOpen(true)} data-testid="button-share">
            <Share2 className="w-3.5 h-3.5" /> Share
          </Button>
        </div>
      </div>

      {/* ═══ Waypoint Tab Bar ═════════════════════ */}
      <div className="flex items-center gap-1.5 px-4 h-10 border-b border-border bg-card/50 overflow-x-auto shrink-0 custom-scrollbar">
        {waypoints.map((wp, idx) => (
          <button
            key={wp.id}
            onClick={() => setSelectedId(wp.id === selectedId ? null : wp.id)}
            className={cn(
              "shrink-0 px-3 py-1 rounded-md text-xs flex items-center gap-1.5 transition-colors border",
              wp.id === selectedId
                ? "bg-primary/15 text-primary border-primary/30"
                : "bg-transparent text-foreground border-transparent hover:bg-muted/60"
            )}
            data-testid={`tab-waypoint-${wp.id}`}
          >
            <span className="font-mono text-[10px] text-muted-foreground">{idx + 1}</span>
            <span className="truncate max-w-[100px]">{wp.label}</span>
          </button>
        ))}

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleAddAtCenter}
              className="shrink-0 px-2.5 py-1 rounded-md text-xs flex items-center gap-1 text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
              data-testid="button-add-waypoint"
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          </TooltipTrigger>
          <TooltipContent>Add waypoint at map center</TooltipContent>
        </Tooltip>

        {/* Reorder & delete for selected waypoint */}
        {selectedId && (
          <div className="ml-auto flex items-center gap-0.5 shrink-0 pl-3 border-l border-border">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleMoveUp} disabled={selectedIdx <= 0}>
                  <ChevronUp className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Move up</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleMoveDown} disabled={selectedIdx >= waypoints.length - 1}>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Move down</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={handleDeleteSelected}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete waypoint</TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>

      {/* ═══ Map Area ═════════════════════════════ */}
      <div className="relative flex-1 min-h-[40vh]">
        <MapEditor
          token={project?.mapboxToken ?? ""}
          mapStyle={project?.mapStyle ?? "mapbox://styles/mapbox/standard"}
          initialView={{
            lng: project?.initialLng ?? -79.9536,
            lat: project?.initialLat ?? 40.451,
            zoom: project?.initialZoom ?? 14,
            pitch: project?.initialPitch ?? 45,
            bearing: project?.initialBearing ?? 0,
          }}
          waypoints={waypoints}
          selectedId={selectedId}
          onTokenSave={(t) => updateProject.mutate({ mapboxToken: t })}
          onMapClick={handleMapClick}
          onSelectWaypoint={setSelectedId}
          onMarkerDrag={handleMarkerDrag}
          mapRef={mapRef}
        />

        {/* Onboarding: no waypoints yet */}
        {waypoints.length === 0 && project?.mapboxToken && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="glass-panel px-8 py-6 text-center max-w-xs">
              <MapPin className="w-10 h-10 mx-auto mb-4 text-primary opacity-80" />
              <p className="text-sm font-medium mb-1">Click anywhere on the map</p>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                to place your first waypoint, or use the "Add" button above
              </p>
              <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
                Add descriptions and photos to each waypoint, then share your journey with a link
              </p>
            </div>
          </div>
        )}

        {/* Share CTA when waypoints exist but nothing selected */}
        {waypoints.length > 0 && !selectedId && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
            <div className="glass-panel px-5 py-2.5 flex items-center gap-4">
              <span className="text-xs text-muted-foreground">
                {waypoints.length} waypoint{waypoints.length !== 1 ? "s" : ""} ready
              </span>
              <Button size="sm" className="h-7 text-xs gap-1.5" onClick={() => setShareOpen(true)}>
                <Share2 className="w-3 h-3" />
                Share Journey
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={() => setPreviewOpen(true)}>
                <Eye className="w-3 h-3" />
                Preview
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ═══ Bottom Editor Panel ══════════════════ */}
      <AnimatePresence>
        {selectedWaypoint && (
          <WaypointEditor
            key={selectedWaypoint.id}
            waypoint={selectedWaypoint}
            onUpdate={(data) => updateWp.mutate({ id: selectedWaypoint.id, data })}
            onClose={() => setSelectedId(null)}
            onCaptureCamera={handleCaptureCamera}
          />
        )}
      </AnimatePresence>

      {/* ═══ Dialogs ═════════════════════════════ */}
      {project && (
        <>
          <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} project={project} />
          <ShareDialog open={shareOpen} onOpenChange={setShareOpen} waypointCount={waypoints.length} />
        </>
      )}

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-6xl p-0 gap-0 overflow-hidden" style={{ height: "85vh" }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold">Preview — Scroll to explore your journey</span>
          </div>
          {previewOpen && project && (
            <iframe
              srcDoc={generatePreviewHtml(project, waypoints)}
              className="w-full border-0"
              style={{ height: "calc(85vh - 49px)" }}
              sandbox="allow-scripts allow-same-origin"
              title="Preview"
              data-testid="preview-iframe"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
