import { MapPin, Plus, ChevronUp, ChevronDown, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import type { Waypoint } from "@shared/schema";
import { cn } from "@/lib/utils";

const THEME_COLORS: Record<string, string> = {
  dawn: "bg-amber-400",
  day: "bg-sky-400",
  dusk: "bg-purple-400",
  night: "bg-indigo-400",
};

interface WaypointPanelProps {
  waypoints: Waypoint[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onAdd: () => void;
  onDelete: (id: number) => void;
  onReorder: (order: number[]) => void;
}

export function WaypointPanel({
  waypoints,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
  onReorder,
}: WaypointPanelProps) {
  const moveUp = (index: number) => {
    if (index === 0) return;
    const order = waypoints.map((w) => w.id);
    [order[index - 1], order[index]] = [order[index], order[index - 1]];
    onReorder(order);
  };

  const moveDown = (index: number) => {
    if (index === waypoints.length - 1) return;
    const order = waypoints.map((w) => w.id);
    [order[index], order[index + 1]] = [order[index + 1], order[index]];
    onReorder(order);
  };

  return (
    <div
      className="absolute top-16 left-4 bottom-4 w-64 md:w-72 glass-panel flex flex-col z-10 max-[640px]:hidden"
      data-testid="waypoint-panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Waypoints</span>
          <span className="text-xs text-muted-foreground">({waypoints.length})</span>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onAdd} data-testid="button-add-waypoint">
              <Plus className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add waypoint at map center</TooltipContent>
        </Tooltip>
      </div>

      {/* List */}
      <ScrollArea className="flex-1 px-2 custom-scrollbar">
        <div className="space-y-1 pb-2">
          {waypoints.length === 0 && (
            <div className="text-center py-8 px-4">
              <p className="text-muted-foreground text-xs leading-relaxed">
                Click the map to place your first waypoint, or tap the + button above.
              </p>
            </div>
          )}
          {waypoints.map((wp, idx) => (
            <button
              key={wp.id}
              onClick={() => onSelect(wp.id)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors group",
                wp.id === selectedId
                  ? "bg-primary/10 text-foreground"
                  : "hover:bg-muted/50 text-foreground"
              )}
              data-testid={`waypoint-item-${wp.id}`}
            >
              <GripVertical className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
              <span className="text-xs text-muted-foreground w-5 shrink-0 tabular-nums">{idx + 1}</span>
              <div className={cn("w-2 h-2 rounded-full shrink-0", THEME_COLORS[wp.theme] || "bg-sky-400")} />
              <span className="text-sm truncate flex-1">{wp.label}</span>

              {/* Reorder & delete controls */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); moveUp(idx); }}
                  className="p-0.5 rounded hover:bg-muted"
                  disabled={idx === 0}
                  data-testid={`button-move-up-${wp.id}`}
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); moveDown(idx); }}
                  className="p-0.5 rounded hover:bg-muted"
                  disabled={idx === waypoints.length - 1}
                  data-testid={`button-move-down-${wp.id}`}
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(wp.id); }}
                  className="p-0.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                  data-testid={`button-delete-${wp.id}`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>

      {/* Footer hint */}
      <div className="px-4 py-3 border-t border-card-border">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Click the map to add waypoints. Drag markers to reposition.
        </p>
      </div>
    </div>
  );
}
