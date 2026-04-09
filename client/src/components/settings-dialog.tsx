import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUpdateProject } from "@/lib/hooks";
import type { Project, InsertProject } from "@shared/schema";

const MAP_STYLES = [
  { value: "mapbox://styles/mapbox/standard", label: "Standard" },
  { value: "mapbox://styles/mapbox/streets-v12", label: "Streets" },
  { value: "mapbox://styles/mapbox/outdoors-v12", label: "Outdoors" },
  { value: "mapbox://styles/mapbox/light-v11", label: "Light" },
  { value: "mapbox://styles/mapbox/dark-v11", label: "Dark" },
  { value: "mapbox://styles/mapbox/satellite-v9", label: "Satellite" },
  { value: "mapbox://styles/mapbox/satellite-streets-v12", label: "Satellite Streets" },
];

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
}

export function SettingsDialog({ open, onOpenChange, project }: SettingsDialogProps) {
  const updateProject = useUpdateProject();

  const [name, setName] = useState(project.name);
  const [token, setToken] = useState(project.mapboxToken);
  const [finaleHeadline, setFinaleHeadline] = useState(project.finaleHeadline);
  const [finaleSubtext, setFinaleSubtext] = useState(project.finaleSubtext);
  const [finaleTagline, setFinaleTagline] = useState(project.finaleTagline);

  useEffect(() => {
    if (open) {
      setName(project.name);
      setToken(project.mapboxToken);
      setFinaleHeadline(project.finaleHeadline);
      setFinaleSubtext(project.finaleSubtext);
      setFinaleTagline(project.finaleTagline);
    }
  }, [open, project]);

  const save = (data: Partial<InsertProject>) => {
    updateProject.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-base">Project Settings</DialogTitle>
          <DialogDescription className="text-xs">
            Configure your scrollytelling project
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="px-6 pb-6 max-h-[65vh] custom-scrollbar">
          <div className="space-y-6 pt-2">
            {/* ── Project ────────────────── */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project</h3>
              <div className="space-y-1.5">
                <Label className="text-xs">Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => save({ name })}
                  data-testid="input-project-name"
                />
              </div>
            </div>

            <Separator />

            {/* ── Mapbox ─────────────────── */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mapbox</h3>
              <div className="space-y-1.5">
                <Label className="text-xs">Access Token</Label>
                <Input
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  onBlur={() => save({ mapboxToken: token })}
                  placeholder="pk.eyJ1Ijoi..."
                  className="font-mono text-xs"
                  data-testid="input-mapbox-token"
                />
                <p className="text-[10px] text-muted-foreground">
                  <a
                    href="https://account.mapbox.com/access-tokens/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2"
                  >
                    Get a free token
                  </a>{" "}
                  from your Mapbox account
                </p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Map Style</Label>
                <Select
                  value={project.mapStyle}
                  onValueChange={(v) => save({ mapStyle: v })}
                >
                  <SelectTrigger data-testid="select-map-style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MAP_STYLES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* ── Initial View ────────────── */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Initial View</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Longitude</Label>
                  <Input
                    type="number"
                    step="0.001"
                    defaultValue={project.initialLng}
                    onBlur={(e) => save({ initialLng: parseFloat(e.target.value) || 0 })}
                    className="font-mono text-xs"
                    data-testid="input-initial-lng"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Latitude</Label>
                  <Input
                    type="number"
                    step="0.001"
                    defaultValue={project.initialLat}
                    onBlur={(e) => save({ initialLat: parseFloat(e.target.value) || 0 })}
                    className="font-mono text-xs"
                    data-testid="input-initial-lat"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs">Zoom</Label>
                  <span className="text-xs font-mono text-muted-foreground">{project.initialZoom}</span>
                </div>
                <Slider
                  defaultValue={[project.initialZoom]}
                  min={1}
                  max={22}
                  step={0.5}
                  onValueCommit={(v) => save({ initialZoom: v[0] })}
                  data-testid="slider-initial-zoom"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs">Pitch</Label>
                  <span className="text-xs font-mono text-muted-foreground">{project.initialPitch}&deg;</span>
                </div>
                <Slider
                  defaultValue={[project.initialPitch]}
                  min={0}
                  max={85}
                  step={1}
                  onValueCommit={(v) => save({ initialPitch: v[0] })}
                  data-testid="slider-initial-pitch"
                />
              </div>
            </div>

            <Separator />

            {/* ── Scrolling ──────────────── */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Scrolling</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs">Scroll Per Segment (vh)</Label>
                  <span className="text-xs font-mono text-muted-foreground">{project.scrollPerSegment}</span>
                </div>
                <Slider
                  defaultValue={[project.scrollPerSegment]}
                  min={100}
                  max={500}
                  step={10}
                  onValueCommit={(v) => save({ scrollPerSegment: v[0] })}
                  data-testid="slider-scroll-segment"
                />
              </div>
            </div>

            <Separator />

            {/* ── Finale ─────────────────── */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Finale Message</h3>
              <div className="space-y-1.5">
                <Label className="text-xs">Headline</Label>
                <Input
                  value={finaleHeadline}
                  onChange={(e) => setFinaleHeadline(e.target.value)}
                  onBlur={() => save({ finaleHeadline })}
                  data-testid="input-finale-headline"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Subtext</Label>
                <Textarea
                  value={finaleSubtext}
                  onChange={(e) => setFinaleSubtext(e.target.value)}
                  onBlur={() => save({ finaleSubtext })}
                  rows={2}
                  data-testid="input-finale-subtext"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Tagline</Label>
                <Input
                  value={finaleTagline}
                  onChange={(e) => setFinaleTagline(e.target.value)}
                  onBlur={() => save({ finaleTagline })}
                  data-testid="input-finale-tagline"
                />
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
