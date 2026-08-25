import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const FALLBACK_CENTER = { lat: 14.3830, lng: 121.0480 };

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
    height = 320,
}) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const layerGroup = useRef(null);

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const hasCoords = !isNaN(lat) && !isNaN(lng);

    useEffect(() => {
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
            color: '#CC0000',
            fillColor: '#CC0000',
            fillOpacity: 1,
            weight: 1,
        })
            .bindPopup(locationName || 'Activity location')
            .addTo(layerGroup.current);

        L.circle([lat, lng], {
            radius: parseFloat(radius) || 100,
            color: '#CC0000',
            weight: 1,
            fillOpacity: 0.08,
        }).addTo(layerGroup.current);
    }, [lat, lng, radius, locationName, hasCoords]);

    return (
        <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
                Location Preview
            </label>
            <div
                ref={mapRef}
                style={{
                    width: '100%',
                    height,
                    borderRadius: 8,
                    overflow: 'hidden',
                    border: '1px solid #D1D5DB',
                }}
            />
            {!hasCoords && (
                <p style={{ fontSize: 12, color: '#6B7280', marginTop: 6 }}>
                    Search an address or use "Use My Location" to preview the geofence area here.
                </p>
            )}
        </div>
    );
}
