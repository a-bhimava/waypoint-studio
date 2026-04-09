import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8 relative overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center max-w-md text-center">
        {/* Logo */}
        <div className="mb-8">
          <svg
            className="w-16 h-16 text-primary"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Waypoint Studio"
          >
            {/* Outer ring */}
            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
            <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="1" opacity="0.15" />
            {/* Compass ticks */}
            <line x1="32" y1="4" x2="32" y2="10" stroke="currentColor" strokeWidth="1.5" />
            <line x1="32" y1="54" x2="32" y2="60" stroke="currentColor" strokeWidth="1.5" />
            <line x1="4" y1="32" x2="10" y2="32" stroke="currentColor" strokeWidth="1.5" />
            <line x1="54" y1="32" x2="60" y2="32" stroke="currentColor" strokeWidth="1.5" />
            {/* Waypoint pin */}
            <path
              d="M32 18 C26 18 21 23 21 28.5 C21 36 32 46 32 46 C32 46 43 36 43 28.5 C43 23 38 18 32 18Z"
              fill="currentColor"
              opacity="0.2"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle cx="32" cy="28" r="4" fill="currentColor" />
          </svg>
        </div>

        <h1 className="text-xl font-bold tracking-tight mb-2" data-testid="text-title">
          Waypoint Studio
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          Build immersive scrollytelling journeys with interactive maps.
          Add waypoints, customize camera angles, and export a ready-to-deploy website.
        </p>

        <Link href="/builder">
          <Button size="lg" className="gap-2" data-testid="button-start-building">
            <MapPin className="w-4 h-4" />
            Start Building
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>

        <p className="text-muted-foreground text-[10px] mt-12 leading-relaxed max-w-xs">
          Powered by Mapbox GL JS. You will need a free Mapbox access token to use the map editor.
        </p>
      </div>
    </div>
  );
}
