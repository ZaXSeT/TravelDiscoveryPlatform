"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";

export interface RoutePoint {
  lat: number;
  lng: number;
  label: string;
  index: number;
}

function numberIcon(n: number): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:9999px;background:#c8a97e;color:#1a1408;font:600 12px/1 sans-serif;border:2px solid #ffffff;box-shadow:0 1px 4px rgba(0,0,0,.45)">${n}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length === 1) {
      map.setView(positions[0]!, 12);
    } else if (positions.length > 1) {
      map.fitBounds(positions, { padding: [40, 40] });
    }
  }, [map, positions]);
  return null;
}

export default function TripRouteLeaflet({ points }: { points: RoutePoint[] }) {
  const positions = points.map((p) => [p.lat, p.lng] as [number, number]);
  const center = positions[0] ?? ([20, 0] as [number, number]);

  return (
    <MapContainer
      center={center}
      zoom={11}
      scrollWheelZoom={false}
      className="size-full"
      aria-label="Trip route map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {positions.length > 1 && (
        <Polyline
          positions={positions}
          pathOptions={{ color: "#c8a97e", weight: 3, dashArray: "6 8", opacity: 0.9 }}
        />
      )}
      {points.map((p) => (
        <Marker key={p.index} position={[p.lat, p.lng]} icon={numberIcon(p.index)}>
          <Tooltip>{`${p.index}. ${p.label}`}</Tooltip>
        </Marker>
      ))}
      <FitBounds positions={positions} />
    </MapContainer>
  );
}
