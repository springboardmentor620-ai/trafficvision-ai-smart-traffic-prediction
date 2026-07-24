"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Script from "next/script";
import { DashboardShell } from "@/components/DashboardShell";
import { useAuth } from "@/lib/auth-context";
import * as api from "@/lib/api";

declare global {
  interface Window {
    google: any;
    initTrafficMap?: () => void;
  }
}

const LEVEL_COLORS: Record<string, string> = {
  low: "#22D9A8",
  moderate: "#F5A623",
  high: "#F5A623",
  severe: "#EF4C54",
};
const NO_DATA_COLOR = "#7C8AAE";

function markerIcon(color: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r="10" fill="${color}" stroke="white" stroke-width="2"/>
    </svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: typeof window !== "undefined" && window.google ? new window.google.maps.Size(28, 28) : undefined,
  };
}

function LiveMapContent() {
  const { token } = useAuth();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const hasFitBoundsRef = useRef(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [roads, setRoads] = useState<api.LiveRoadStatus[]>([]);
  const [error, setError] = useState<string | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const fetchRoads = useCallback(async () => {
    if (!token) return;
    try {
      const summary = await api.getLiveMonitoring(token);
      setRoads(summary.roads);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load road data");
    }
  }, [token]);

  useEffect(() => {
    fetchRoads();
    const interval = setInterval(fetchRoads, 15000);
    return () => clearInterval(interval);
  }, [fetchRoads]);

  useEffect(() => {
    if (!scriptLoaded || !mapRef.current || mapInstanceRef.current) return;
    if (!window.google) return;

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 12.9716, lng: 77.6000 },
      zoom: 11,
      mapId: "DEMO_MAP_ID",
    });
  }, [scriptLoaded]);

  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const infoWindow = new window.google.maps.InfoWindow();
    const bounds = new window.google.maps.LatLngBounds();
    let plotted = 0;

    roads.forEach((road) => {
      if (road.latitude == null || road.longitude == null) return;

      const color = road.congestion_level ? LEVEL_COLORS[road.congestion_level] : NO_DATA_COLOR;
      const position = { lat: road.latitude, lng: road.longitude };

      const marker = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        icon: markerIcon(color),
        title: road.road_name,
      });

      marker.addListener("click", () => {
        infoWindow.setContent(`
          <div style="font-family: sans-serif; font-size: 13px; color: #111;">
            <strong>${road.road_name}</strong><br/>
            ${road.zone ?? ""}<br/>
            ${road.vehicle_count != null ? `${road.vehicle_count} vehicles` : "No data yet"}<br/>
            ${road.congestion_level ? `Congestion: ${road.congestion_level}` : ""}
          </div>
        `);
        infoWindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
      bounds.extend(position);
      plotted += 1;
    });

    if (plotted > 0 && !hasFitBoundsRef.current) {
      mapInstanceRef.current.fitBounds(bounds);
      hasFitBoundsRef.current = true;
    }
  }, [roads]);

  if (!apiKey) {
    return (
      <div className="bg-surface2 border border-border border-dashed rounded-xl p-6 text-center">
        <p className="text-sm text-ink mb-1">Google Maps API key not configured</p>
        <p className="text-xs text-muted">
          Add <code className="text-caution">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to{" "}
          <code className="text-caution">frontend/.env.local</code> and restart the dev server.
        </p>
      </div>
    );
  }

  const roadsWithoutCoords = roads.filter((r) => r.latitude == null || r.longitude == null);

  return (
    <div className="flex flex-col gap-4">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker`}
        onLoad={() => setScriptLoaded(true)}
      />

      <div>
        <h1 className="text-lg font-medium text-ink">Live map</h1>
        <p className="text-sm text-muted">Roads plotted by location, colored by congestion level</p>
      </div>

      {error && (
        <p className="text-sm text-congest bg-congest/10 border border-congest/30 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {roadsWithoutCoords.length > 0 && (
        <p className="text-xs text-muted bg-surface2 border border-border rounded-md px-3 py-2">
          {roadsWithoutCoords.length} road(s) don&apos;t have coordinates set yet and won&apos;t appear on the map:{" "}
          {roadsWithoutCoords.map((r) => r.road_name).join(", ")}
        </p>
      )}

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div ref={mapRef} style={{ width: "100%", height: "500px" }} />
      </div>

      <div className="flex items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: LEVEL_COLORS.low }} /> Low
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: LEVEL_COLORS.moderate }} /> Moderate/High
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: LEVEL_COLORS.severe }} /> Severe
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: NO_DATA_COLOR }} /> No data
        </span>
      </div>
    </div>
  );
}

export default function LiveMapPage() {
  return (
    <DashboardShell>
      <LiveMapContent />
    </DashboardShell>
  );
}