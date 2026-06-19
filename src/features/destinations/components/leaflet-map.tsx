"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";

// CircleMarker avoids Leaflet's default marker-icon asset issues in bundlers.
export default function LeafletMap({
  lat,
  lng,
  name,
}: {
  lat: number;
  lng: number;
  name: string;
}) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={11}
      scrollWheelZoom={false}
      className="size-full"
      aria-label={`Map showing ${name}`}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CircleMarker
        center={[lat, lng]}
        radius={10}
        pathOptions={{
          color: "#8a6a3b",
          fillColor: "#c8a97e",
          fillOpacity: 0.9,
          weight: 2,
        }}
      >
        <Tooltip>{name}</Tooltip>
      </CircleMarker>
    </MapContainer>
  );
}
