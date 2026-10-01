import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

const FALLBACK_CENTER = { lat: 14.3830, lng: 121.0480 }; // Muntinlupa City

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function ActivityLocationMap({
    latitude,
    longitude,
    radius = 100,
    locationName = 'Selected location',
    height = 280,
}) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const layerGroup = useRef(null);

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const hasCoords = !isNaN(lat) && !isNaN(lng);

    useEffect(() => {
        if (!mapRef.current) return;

        mapInstance.current = L.map(mapRef.current, {
            zoomControl: true,
            attributionControl: false,
        }).setView(
            [hasCoords ? lat : FALLBACK_CENTER.lat, hasCoords ? lng : FALLBACK_CENTER.lng],
            hasCoords ? 16 : 13
        );

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance.current);
        layerGroup.current = L.layerGroup().addTo(mapInstance.current);

        return () => {
            mapInstance.current?.remove();
            mapInstance.current = null;
        };
    }, []);

    useEffect(() => {
        if (!mapInstance.current || !layerGroup.current) return;

        layerGroup.current.clearLayers();

        if (!hasCoords) return;

        mapInstance.current.setView([lat, lng], 16);

        L.circleMarker([lat, lng], {
            radius: 8,
            color: '#dc2626',
            fillColor: '#dc2626',
            fillOpacity: 1,
            weight: 2,
        })
            .bindPopup(locationName || 'Activity location')
            .addTo(layerGroup.current);

        L.circle([lat, lng], {
            radius: parseFloat(radius) || 100,
            color: '#dc2626',
            weight: 1.5,
            fillColor: '#dc2626',
            fillOpacity: 0.12,
        }).addTo(layerGroup.current);
    }, [lat, lng, radius, locationName, hasCoords]);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-600" />
                    <span>Location & Geofence Radius Preview</span>
                </label>
                {hasCoords && (
                    <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                        {radius}m Radius Active
                    </span>
                )}
            </div>

            <div
                ref={mapRef}
                style={{ height }}
                className="w-full rounded-2xl overflow-hidden border border-gray-200 shadow-xs"
            />

            {!hasCoords && (
                <p className="text-[11px] text-gray-500">
                    Search an address or click "Detect GPS Location" above to preview the check-in geofence radius on the map.
                </p>
            )}
        </div>
    );
}
