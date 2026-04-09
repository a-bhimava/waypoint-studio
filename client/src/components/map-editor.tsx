import { useRef, useEffect, useCallback } from "react";
import type { Waypoint } from "@shared/schema";
import { MapPin } from "lucide-react";

// mapbox-gl is loaded via CDN in index.html
declare const mapboxgl: typeof import("mapbox-gl").default;

interface MapEditorProps {
  token: string;
  mapStyle: string;
  initialView: {
    lng: number;
    lat: number;
    zoom: number;
    pitch: number;
    bearing: number;
  };
  waypoints: Waypoint[];
  selectedId: number | null;
  onMapClick: (lng: number, lat: number) => void;
  onSelectWaypoint: (id: number) => void;
  onMarkerDrag: (id: number, lng: number, lat: number) => void;
  mapRef: React.MutableRefObject<mapboxgl.Map | null>;
}

export function MapEditor({
  token,
  mapStyle,
  initialView,
  waypoints,
  selectedId,
  onMapClick,
  onSelectWaypoint,
  onMarkerDrag,
  mapRef,
}: MapEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<number, mapboxgl.Marker>>(new Map());

  // Store latest callbacks in refs so marker event handlers stay up to date
  const onSelectRef = useRef(onSelectWaypoint);
  onSelectRef.current = onSelectWaypoint;
  const onDragRef = useRef(onMarkerDrag);
  onDragRef.current = onMarkerDrag;
  const onClickRef = useRef(onMapClick);
  onClickRef.current = onMapClick;

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || !token) return;

    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: mapStyle,
      center: [initialView.lng, initialView.lat],
      zoom: initialView.zoom,
      pitch: initialView.pitch,
      bearing: initialView.bearing,
    });

    map.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    mapRef.current = map;

    map.on("click", (e) => {
      onClickRef.current(e.lngLat.lng, e.lngLat.lat);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
  }, [token, mapStyle]);

  // Sync markers with waypoint data
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const waypointMap = new Map(waypoints.map((w) => [w.id, w]));

    // Remove markers for deleted waypoints
    for (const [id, marker] of markersRef.current) {
      if (!waypointMap.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    }

    // Add or update markers
    for (const wp of waypoints) {
      const existing = markersRef.current.get(wp.id);
      if (existing) {
        // Update position if changed
        const pos = existing.getLngLat();
        if (Math.abs(pos.lng - wp.lng) > 0.00001 || Math.abs(pos.lat - wp.lat) > 0.00001) {
          existing.setLngLat([wp.lng, wp.lat]);
        }
        // Update visual state
        const el = existing.getElement();
        if (wp.id === selectedId) {
          el.classList.add("selected");
        } else {
          el.classList.remove("selected");
        }
        // Update label
        const labelEl = el.querySelector(".marker-label");
        if (labelEl && labelEl.textContent !== wp.label) {
          labelEl.textContent = wp.label;
        }
      } else {
        // Create new marker
        const el = document.createElement("div");
        el.className = `waypoint-marker${wp.id === selectedId ? " selected" : ""}`;
        el.innerHTML = `<div class="marker-dot"></div><span class="marker-label">${wp.label}</span>`;

        const wpId = wp.id;
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          onSelectRef.current(wpId);
        });

        const marker = new mapboxgl.Marker({ element: el, draggable: true })
          .setLngLat([wp.lng, wp.lat])
          .addTo(map);

        marker.on("dragend", () => {
          const lngLat = marker.getLngLat();
          onDragRef.current(wpId, lngLat.lng, lngLat.lat);
        });

        markersRef.current.set(wp.id, marker);
      }
    }
  }, [waypoints, selectedId]);

  // Fly to selected waypoint
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const wp = waypoints.find((w) => w.id === selectedId);
    if (!wp) return;
    map.flyTo({
      center: [wp.lng, wp.lat],
      zoom: wp.cameraZoom,
      pitch: wp.cameraPitch,
      bearing: wp.cameraBearing,
      duration: 1200,
    });
  }, [selectedId]);

  // No token — show onboarding prompt
  if (!token) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, hsl(225 30% 7%), hsl(225 35% 12%))" }}
        data-testid="map-placeholder"
      >
        <div className="text-center max-w-sm p-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Mapbox Token Required</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-5">
            Open Settings and paste your Mapbox access token to load the interactive map.
          </p>
          <a
            href="https://account.mapbox.com/access-tokens/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-sm underline underline-offset-2"
            data-testid="link-mapbox-token"
          >
            Get a free token at mapbox.com
          </a>
        </div>
      </div>
    );
  }

  return <div ref={containerRef} className="absolute inset-0" data-testid="map-container" />;
}
