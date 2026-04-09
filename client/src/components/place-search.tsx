import { useState, useRef, useEffect } from "react";
import { Search, MapPin, X } from "lucide-react";

interface PlaceResult {
  name: string;
  fullName: string;
  lng: number;
  lat: number;
}

interface PlaceSearchProps {
  token: string;
  onSelect: (name: string, lng: number, lat: number) => void;
}

export function PlaceSearch({ token, onSelect }: PlaceSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const search = (q: string) => {
    clearTimeout(timerRef.current);
    if (q.length < 2 || !token) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${token}&limit=5&types=poi,place,address,neighborhood,locality`;
        const res = await fetch(url);
        const data = await res.json();
        const places: PlaceResult[] = (data.features || []).map((f: any) => ({
          name: f.text,
          fullName: f.place_name,
          lng: f.center[0],
          lat: f.center[1],
        }));
        setResults(places);
        setOpen(places.length > 0);
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 280);
  };

  const handleSelect = (place: PlaceResult) => {
    onSelect(place.name, place.lng, place.lat);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative" data-testid="place-search">
      <div className="flex items-center gap-1 bg-muted/40 rounded-md px-2 h-7 border border-transparent focus-within:border-primary/40 transition-colors">
        <Search className="w-3 h-3 text-muted-foreground shrink-0" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            search(e.target.value);
          }}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search for a place..."
          className="bg-transparent text-xs h-full w-36 focus:w-52 transition-all outline-none placeholder:text-muted-foreground/50"
          data-testid="input-place-search"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setOpen(false);
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-popover border border-popover-border rounded-lg shadow-xl z-50 overflow-hidden">
          {loading && (
            <div className="px-3 py-2 text-xs text-muted-foreground">Searching...</div>
          )}
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => handleSelect(r)}
              className="w-full text-left px-3 py-2 hover:bg-muted/60 transition-colors flex items-start gap-2 border-b border-border last:border-0"
            >
              <MapPin className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-medium truncate">{r.name}</div>
                <div className="text-[10px] text-muted-foreground truncate">{r.fullName}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Reverse geocode coordinates to get a place name */
export async function reverseGeocode(
  lng: number,
  lat: number,
  token: string
): Promise<string> {
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&limit=1&types=poi,neighborhood,locality,place`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.features?.[0]) {
      return data.features[0].text || data.features[0].place_name?.split(",")[0] || "New Place";
    }
  } catch {}
  return "New Place";
}
