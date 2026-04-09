import { useState } from "react";
import { Copy, Check, Share2, Download, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useProject, useWaypoints, downloadExport, generatePreviewHtml } from "@/lib/hooks";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  waypointCount: number;
}

export function ShareDialog({ open, onOpenChange, waypointCount }: ShareDialogProps) {
  const { data: project } = useProject();
  const { data: waypoints = [] } = useWaypoints();
  const [exporting, setExporting] = useState(false);

  const handleExportZip = async () => {
    if (!project) return;
    setExporting(true);
    try {
      await downloadExport(project, waypoints);
    } finally {
      setExporting(false);
    }
  };

  const handleOpenPreview = () => {
    if (!project) return;
    const html = generatePreviewHtml(project, waypoints);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    // Clean up after a delay
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Share2 className="w-4 h-4 text-primary" />
            Share Your Journey
          </DialogTitle>
          <DialogDescription className="text-xs">
            {waypointCount > 0
              ? `Your journey with ${waypointCount} waypoint${waypointCount !== 1 ? "s" : ""} is ready.`
              : "Add some waypoints first to share your journey."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Preview in new tab */}
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12"
            onClick={handleOpenPreview}
            disabled={waypointCount === 0 || !project?.mapboxToken}
          >
            <ExternalLink className="w-4 h-4 text-primary" />
            <div className="text-left">
              <div className="text-sm font-medium">Open Live Preview</div>
              <div className="text-[10px] text-muted-foreground">View the full scrollytelling experience in a new tab</div>
            </div>
          </Button>

          {/* Export ZIP */}
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12"
            onClick={handleExportZip}
            disabled={waypointCount === 0 || exporting}
          >
            <Download className="w-4 h-4 text-primary" />
            <div className="text-left">
              <div className="text-sm font-medium">
                {exporting ? "Generating..." : "Download as Website"}
              </div>
              <div className="text-[10px] text-muted-foreground">Export a ZIP you can host anywhere (Vercel, Netlify, etc.)</div>
            </div>
          </Button>

          {/* Explanation */}
          <div className="bg-muted/30 rounded-lg px-4 py-3">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              The exported ZIP contains a complete static website — just upload it to any hosting service. Your Mapbox token, waypoints, descriptions, and photos are all included.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
