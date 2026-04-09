import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Camera, X, Upload, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Waypoint, InsertWaypoint } from "@shared/schema";

interface WaypointEditorProps {
  waypoint: Waypoint;
  onUpdate: (data: Partial<InsertWaypoint>) => void;
  onClose: () => void;
  onCaptureCamera: () => void;
}

export function WaypointEditor({
  waypoint: wp,
  onUpdate,
  onClose,
  onCaptureCamera,
}: WaypointEditorProps) {
  const [label, setLabel] = useState(wp.label);
  const [description, setDescription] = useState(wp.description);
  const [imageUrl, setImageUrl] = useState(wp.imageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLabel(wp.label);
    setDescription(wp.description);
    setImageUrl(wp.imageUrl);
  }, [wp.id]);

  const nk = (field: string, val: number) => `${field}-${wp.id}-${val}`;

  const saveNum =
    (field: string) => (e: React.FocusEvent<HTMLInputElement>) => {
      const v = parseFloat(e.target.value);
      if (!isNaN(v)) onUpdate({ [field]: v });
    };

  // ── Image upload with client-side compression ──
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_W = 900;
        const MAX_H = 600;
        let w = img.width;
        let h = img.height;
        if (w > MAX_W) {
          h = (h * MAX_W) / w;
          w = MAX_W;
        }
        if (h > MAX_H) {
          w = (w * MAX_H) / h;
          h = MAX_H;
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        setImageUrl(dataUrl);
        onUpdate({ imageUrl: dataUrl });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    // Reset so the same file can be selected again
    e.target.value = "";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="border-t border-border bg-card shrink-0 max-h-[260px] overflow-y-auto"
      data-testid="waypoint-editor"
    >
      {/* ── Header ──────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/20 border-b border-border sticky top-0 z-10">
        <span className="text-xs font-medium text-muted-foreground">
          Editing Waypoint
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={onCaptureCamera}
            data-testid="button-capture-camera"
          >
            <Camera className="w-3 h-3" />
            Capture Current View
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onClose}
            data-testid="button-close-editor"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* ── Fields ──────────────────── */}
      <div className="px-4 py-3 flex gap-6">
        {/* LEFT: Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Label</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={() => onUpdate({ label })}
              placeholder="Place name"
              className="h-8 text-sm"
              data-testid="input-label"
            />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => onUpdate({ description })}
              placeholder="Tell the story of this place — what makes it special?"
              rows={2}
              className="text-sm resize-none"
              data-testid="input-description"
            />
          </div>
          {/* Image upload section */}
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Photo</Label>
            <div className="flex gap-2 items-start">
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex gap-1.5">
                  <Input
                    value={imageUrl.startsWith("data:") ? "(uploaded image)" : imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                    }}
                    onBlur={() => {
                      if (!imageUrl.startsWith("data:")) onUpdate({ imageUrl });
                    }}
                    placeholder="Paste URL or upload a file"
                    className="h-8 text-sm"
                    readOnly={imageUrl.startsWith("data:")}
                    data-testid="input-image-url"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                    data-testid="input-file-upload"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                    data-testid="button-upload-image"
                  >
                    <Upload className="w-3 h-3" />
                    Upload
                  </Button>
                </div>
                {imageUrl && imageUrl.startsWith("data:") && (
                  <button
                    onClick={() => {
                      setImageUrl("");
                      onUpdate({ imageUrl: "" });
                    }}
                    className="text-[10px] text-destructive hover:underline"
                  >
                    Remove uploaded image
                  </button>
                )}
              </div>
              {/* Thumbnail */}
              {imageUrl ? (
                <div className="w-16 h-12 rounded border border-border overflow-hidden shrink-0 bg-muted/30">
                  <img
                    src={imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                </div>
              ) : (
                <div className="w-16 h-12 rounded border border-dashed border-border flex items-center justify-center shrink-0">
                  <ImageIcon className="w-4 h-4 text-muted-foreground/30" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Position & Camera */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="grid grid-cols-5 gap-2">
            <div>
              <Label className="text-[11px] text-muted-foreground mb-1 block">Longitude</Label>
              <Input type="number" step="0.00001" key={nk("lng", wp.lng)} defaultValue={wp.lng} onBlur={saveNum("lng")} className="h-8 text-xs font-mono" data-testid="input-lng" />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground mb-1 block">Latitude</Label>
              <Input type="number" step="0.00001" key={nk("lat", wp.lat)} defaultValue={wp.lat} onBlur={saveNum("lat")} className="h-8 text-xs font-mono" data-testid="input-lat" />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground mb-1 block">Zoom</Label>
              <Input type="number" step="0.1" min={1} max={22} key={nk("zoom", wp.cameraZoom)} defaultValue={wp.cameraZoom} onBlur={saveNum("cameraZoom")} className="h-8 text-xs font-mono" data-testid="input-zoom" />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground mb-1 block">Pitch</Label>
              <Input type="number" step={1} min={0} max={85} key={nk("pitch", wp.cameraPitch)} defaultValue={wp.cameraPitch} onBlur={saveNum("cameraPitch")} className="h-8 text-xs font-mono" data-testid="input-pitch" />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground mb-1 block">Bearing</Label>
              <Input type="number" step={1} min={-180} max={180} key={nk("bear", wp.cameraBearing)} defaultValue={wp.cameraBearing} onBlur={saveNum("cameraBearing")} className="h-8 text-xs font-mono" data-testid="input-bearing" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <Label className="text-[11px] text-muted-foreground mb-1 block">Theme</Label>
              <Select value={wp.theme} onValueChange={(v) => onUpdate({ theme: v })}>
                <SelectTrigger className="h-8 w-28 text-xs" data-testid="select-theme"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dawn">Dawn</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="dusk">Dusk</SelectItem>
                  <SelectItem value="night">Night</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-3.5">
              <Switch checked={wp.isFinal} onCheckedChange={(v) => onUpdate({ isFinal: v })} data-testid="switch-finale" />
              <Label className="text-xs">Finale</Label>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
