import { useState } from "react";
import { Copy, Check, Share2, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getShareUrl } from "@/lib/hooks";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  waypointCount: number;
}

export function ShareDialog({ open, onOpenChange, waypointCount }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = getShareUrl();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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
              ? `Your journey with ${waypointCount} waypoint${waypointCount !== 1 ? "s" : ""} is ready to share.`
              : "Add some waypoints first, then share your journey with the world."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Copy link */}
          <div className="flex gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="font-mono text-[11px] h-9 bg-muted/30"
              data-testid="input-share-url"
            />
            <Button
              onClick={handleCopy}
              className="shrink-0 gap-1.5 h-9"
              data-testid="button-copy-link"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copied ? "Copied" : "Copy Link"}
            </Button>
          </div>

          {/* Open link */}
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary underline underline-offset-2 flex items-center gap-1 w-fit"
          >
            Open in new tab
            <ExternalLink className="w-3 h-3" />
          </a>

          {/* Explanation */}
          <div className="bg-muted/30 rounded-lg px-4 py-3 space-y-2">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Anyone with this link can view your scrollytelling experience. The link always reflects the latest version of your project.
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Want a standalone website? Use the "Export" button to download a ZIP you can host anywhere.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
