import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet with React
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface Location {
  lat: number;
  lng: number;
  name?: string;
}

interface FlightMapProps {
  onLocationSelect: (pickup: Location | null, dropoff: Location | null) => void;
}

const FlightMap = ({ onLocationSelect }: FlightMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [pickupMarker, setPickupMarker] = useState<L.Marker | null>(null);
  const [dropoffMarker, setDropoffMarker] = useState<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on Bengaluru
    const map = L.map(mapRef.current).setView([12.9716, 77.5946], 12);

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Handle map clicks
    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      if (!pickupMarker) {
        // First click - set pickup
        const marker = L.marker([lat, lng], {
          icon: L.divIcon({
            className: "custom-marker",
            html: `<div class="w-8 h-8 bg-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white font-bold">P</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          }),
        }).addTo(map);

        setPickupMarker(marker);
        onLocationSelect({ lat, lng, name: "Pickup" }, null);
      } else if (!dropoffMarker) {
        // Second click - set dropoff
        const marker = L.marker([lat, lng], {
          icon: L.divIcon({
            className: "custom-marker",
            html: `<div class="w-8 h-8 bg-accent rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white font-bold">D</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          }),
        }).addTo(map);

        setDropoffMarker(marker);
        onLocationSelect({ lat: pickupMarker.getLatLng().lat, lng: pickupMarker.getLatLng().lng, name: "Pickup" }, { lat, lng, name: "Dropoff" });

        // Draw a line between markers
        L.polyline(
          [
            [pickupMarker.getLatLng().lat, pickupMarker.getLatLng().lng],
            [lat, lng],
          ],
          {
            color: "hsl(205 85% 45%)",
            weight: 3,
            opacity: 0.7,
            dashArray: "10, 10",
          }
        ).addTo(map);
      } else {
        // Reset on third click
        map.eachLayer((layer) => {
          if (layer instanceof L.Marker || layer instanceof L.Polyline) {
            map.removeLayer(layer);
          }
        });
        setPickupMarker(null);
        setDropoffMarker(null);
        onLocationSelect(null, null);
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [pickupMarker, dropoffMarker, onLocationSelect]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-xl overflow-hidden shadow-xl" />
      <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-border">
        <p className="text-sm font-medium text-foreground mb-2">Select Locations:</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-4 h-4 bg-primary rounded-full"></div>
          <span>1st click: Pickup</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <div className="w-4 h-4 bg-accent rounded-full"></div>
          <span>2nd click: Dropoff</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2 italic">3rd click: Reset</p>
      </div>
    </div>
  );
};

export default FlightMap;
