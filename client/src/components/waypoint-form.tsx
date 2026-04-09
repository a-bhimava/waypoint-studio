import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Camera, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Waypoint, InsertWaypoint } from "@shared/schema";

interface WaypointFormProps {
  waypoint: Waypoint;
  onUpdate: (data: Partial<InsertWaypoint>) => void;
  onClose: () => void;
  onCaptureCamera: () => void;
}

export function WaypointForm({ waypoint, onUpdate, onClose, onCaptureCamera }: WaypointFormProps) {
  const [label, setLabel] = useState(waypoint.label);
  const [description, setDescription] = useState(waypoint.description);
  const [imageUrl, setImageUrl] = useState(waypoint.imageUrl);
  const [zoom, setZoom] = useState(waypoint.cameraZoom);
  const [pitch, setPitch] = useState(waypoint.cameraPitch);
  const [bearing, setBearing] = useState(waypoint.cameraBearing);

  // Sync from prop when waypoint changes
  useEffect(() => {
    setLabel(waypoint.label);
    setDescription(waypoint.description);
    setImageUrl(waypoint.imageUrl);
    setZoom(waypoint.cameraZoom);
    setPitch(waypoint.cameraPitch);
    setBearing(waypoint.cameraBearing);
  }, [waypoint.id, waypoint.cameraZoom, waypoint.cameraPitch, waypoint.cameraBearing]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="absolute top-16 right-4 bottom-4 w-80 glass-panel flex flex-col z-10"
      data-testid="waypoint-form"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Edit Waypoint</span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose} data-testid="button-close-form">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-4 custom-scrollbar">
        <div className="space-y-5 pb-4">
          {/* Label */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Label</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={() => onUpdate({ label })}
              placeholder="Place name"
              data-testid="input-label"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => onUpdate({ description })}
              placeholder="Tell the story of this place..."
              rows={3}
              data-testid="input-description"
            />
          </div>

          <Separator />

          {/* Coordinates */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Coordinates</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-0.5">Lng</p>
                <Input
                  value={waypoint.lng.toFixed(5)}
                  readOnly
                  className="text-xs font-mono bg-muted/30"
                  data-testid="input-lng"
                />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-0.5">Lat</p>
                <Input
                  value={waypoint.lat.toFixed(5)}
                  readOnly
                  className="text-xs font-mono bg-muted/30"
                  data-testid="input-lat"
                />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">Drag the marker on the map to reposition</p>
          </div>

          <Separator />

          {/* Camera */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Camera</Label>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={onCaptureCamera}
                data-testid="button-capture-camera"
              >
                <Camera className="w-3 h-3" />
                Capture View
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Zoom</span>
                  <span className="text-xs font-mono text-muted-foreground">{zoom.toFixed(1)}</span>
                </div>
                <Slider
                  value={[zoom]}
                  min={1}
                  max={22}
                  step={0.1}
                  onValueChange={(v) => setZoom(v[0])}
                  onValueCommit={(v) => onUpdate({ cameraZoom: v[0] })}
                  data-testid="slider-zoom"
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Pitch</span>
                  <span className="text-xs font-mono text-muted-foreground">{pitch.toFixed(0)}&deg;</span>
                </div>
                <Slider
                  value={[pitch]}
                  min={0}
                  max={85}
                  step={1}
                  onValueChange={(v) => setPitch(v[0])}
                  onValueCommit={(v) => onUpdate({ cameraPitch: v[0] })}
                  data-testid="slider-pitch"
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Bearing</span>
                  <span className="text-xs font-mono text-muted-foreground">{bearing.toFixed(0)}&deg;</span>
                </div>
                <Slider
                  value={[bearing]}
                  min={-180}
                  max={180}
                  step={1}
                  onValueChange={(v) => setBearing(v[0])}
                  onValueCommit={(v) => onUpdate({ cameraBearing: v[0] })}
                  data-testid="slider-bearing"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Image URL */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Image URL</Label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onBlur={() => onUpdate({ imageUrl })}
              placeholder="https://example.com/photo.jpg"
              data-testid="input-image-url"
            />
            {imageUrl && (
              <div className="mt-2 rounded-lg overflow-hidden border border-border aspect-video bg-muted/30">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
            )}
          </div>

          {/* Theme */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Theme</Label>
            <Select
              value={waypoint.theme}
              onValueChange={(v) => onUpdate({ theme: v })}
            >
              <SelectTrigger data-testid="select-theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dawn">Dawn</SelectItem>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="dusk">Dusk</SelectItem>
                <SelectItem value="night">Night</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Finale toggle */}
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Finale waypoint</Label>
            <Switch
              checked={waypoint.isFinal}
              onCheckedChange={(v) => onUpdate({ isFinal: v })}
              data-testid="switch-finale"
            />
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  );
}
