import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Users, Activity, Clock } from 'lucide-react';

const POLL_INTERVAL_MS = 10000;
const DEFAULT_CENTER = [14.4081, 121.0415]; // Muntinlupa City, PH
const LEAFLET_CSS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
const GEOFENCE_RADIUS_METERS = 100;

let leafletLoadingPromise = null;

function loadLeaflet() {
    if (window.L) return Promise.resolve();
    if (leafletLoadingPromise) return leafletLoadingPromise;

    leafletLoadingPromise = new Promise((resolve, reject) => {
        if (!document.querySelector(`link[href="${LEAFLET_CSS_URL}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = LEAFLET_CSS_URL;
            document.head.appendChild(link);
        }

        const script = document.createElement('script');
        script.src = LEAFLET_JS_URL;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Leaflet script.'));
        document.head.appendChild(script);
    });

    return leafletLoadingPromise;
}

function distanceInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function makeDotIcon(color) {
    const L = window.L;
    return L.divIcon({
        className: '',
        html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 6px rgba(0,0,0,0.35);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        popupAnchor: [0, -8],
    });
}

function makeFlagIcon() {
    const L = window.L;
    return L.divIcon({
        className: '',
        html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="#dc2626" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35));"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="#ffffff"/></svg>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -22],
    });
}

const STATUS_COLORS = {
    inside: '#2563eb', // blue - at location
    left: '#dc2626',   // red - left location
};

const STATUS_LABELS = {
    inside: 'At Location',
    left: 'Left Location',
};

export default function LiveLocationMap() {
    const mapDivRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef({});
    const destMarkersRef = useRef({});
    const pollTimeoutRef = useRef(null);
    const hasAutoFitRef = useRef(false);

    const [mapReady, setMapReady] = useState(false);
    const [mapError, setMapError] = useState(false);
    const [activeCount, setActiveCount] = useState(0);
    const [statusCounts, setStatusCounts] = useState({ inside: 0, left: 0 });
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        loadLeaflet()
            .then(() => {
                if (!mapDivRef.current || mapRef.current) return;
                const L = window.L;
                mapRef.current = L.map(mapDivRef.current).setView(DEFAULT_CENTER, 13);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 19,
                }).addTo(mapRef.current);

                setTimeout(() => {
                    if (mapRef.current) {
                        mapRef.current.invalidateSize();
                        mapRef.current.setView(DEFAULT_CENTER, 13);
                    }
                }, 200);

                setMapReady(true);
            })
            .catch(() => setMapError(true));

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!mapReady) return;

        const poll = async () => {
            try {
                const res = await fetch(route('admin.attendance.live-locations'));
                const data = await res.json();
                const locations = data.locations || [];
                updateMarkers(locations);
                setActiveCount(locations.length);
                setLastUpdated(new Date());
            } catch (err) {
                console.error('Failed to fetch live locations:', err);
            } finally {
                pollTimeoutRef.current = setTimeout(poll, POLL_INTERVAL_MS);
            }
        };

        poll();
        return () => {
            if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mapReady]);

    const updateMarkers = (locations) => {
        const L = window.L;
        const seenUserIds = new Set();
        const seenActivityIds = new Set();
        const counts = { inside: 0, left: 0 };

        locations.forEach((loc) => {
            seenUserIds.add(loc.user_id);
            const latlng = [loc.latitude, loc.longitude];
            const hasDestination = loc.activity_latitude != null && loc.activity_longitude != null;
            const destLatLng = hasDestination ? [loc.activity_latitude, loc.activity_longitude] : null;

            const existing = markersRef.current[loc.user_id];

            let status = 'inside';
            let distanceLabel = '';
            if (hasDestination) {
                const meters = distanceInMeters(loc.latitude, loc.longitude, loc.activity_latitude, loc.activity_longitude);
                distanceLabel = meters >= 1000 ? `${(meters / 1000).toFixed(1)}km` : `${Math.round(meters)}m`;
                status = meters <= GEOFENCE_RADIUS_METERS ? 'inside' : 'left';
            }
            counts[status] += 1;

            const popupContent = `
                <div style="font-family: sans-serif; font-size: 12px; line-height: 1.5; padding: 2px;">
                    <strong style="font-size: 13px; color: #111;">${loc.user_name}</strong><br/>
                    <span style="color:#555;">${loc.activity_name} — ${loc.location_name}</span><br/>
                    <span style="color:${STATUS_COLORS[status]}; font-weight:700;">${STATUS_LABELS[status]}</span>
                    ${hasDestination ? ` · ${distanceLabel} from location` : ''}<br/>
                    <span style="color:#888; font-size: 11px;">Last update: ${loc.last_ping_at}</span>
                </div>
            `;

            if (existing) {
                existing.marker.setLatLng(latlng);
                existing.marker.setIcon(makeDotIcon(STATUS_COLORS[status]));
                existing.marker.setPopupContent(popupContent);

                if (hasDestination) {
                    if (existing.polyline) {
                        existing.polyline.setLatLngs([latlng, destLatLng]);
                    } else {
                        existing.polyline = L.polyline([latlng, destLatLng], {
                            color: STATUS_COLORS[status],
                            weight: 3,
                            dashArray: '6, 8',
                            opacity: 0.8,
                        }).addTo(mapRef.current);
                    }
                    existing.polyline.setStyle({ color: STATUS_COLORS[status] });
                } else if (existing.polyline) {
                    mapRef.current.removeLayer(existing.polyline);
                    existing.polyline = null;
                }

                existing.prevStatus = status;
            } else {
                const marker = L.marker(latlng, { icon: makeDotIcon(STATUS_COLORS[status]) })
                    .addTo(mapRef.current)
                    .bindPopup(popupContent);

                let polyline = null;
                if (hasDestination) {
                    polyline = L.polyline([latlng, destLatLng], {
                        color: STATUS_COLORS[status],
                        weight: 3,
                        dashArray: '6, 8',
                        opacity: 0.8,
                    }).addTo(mapRef.current);
                }

                markersRef.current[loc.user_id] = { marker, polyline, prevStatus: status };
            }

            if (hasDestination && !seenActivityIds.has(loc.activity_id)) {
                seenActivityIds.add(loc.activity_id);
                if (!destMarkersRef.current[loc.activity_id]) {
                    const destMarker = L.marker(destLatLng, { icon: makeFlagIcon() })
                        .addTo(mapRef.current)
                        .bindPopup(`
                            <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
                                <strong>${loc.activity_name}</strong><br/>
                                ${loc.location_name}<br/>
                                <span style="color:#666; font-size:11px;">Geofence perimeter: ${GEOFENCE_RADIUS_METERS}m</span>
                            </div>
                        `);
                    destMarkersRef.current[loc.activity_id] = destMarker;
                }
            }
        });

        Object.keys(markersRef.current).forEach((userId) => {
            const numId = Number(userId);
            if (!seenUserIds.has(numId)) {
                const { marker, polyline } = markersRef.current[userId];
                mapRef.current.removeLayer(marker);
                if (polyline) mapRef.current.removeLayer(polyline);
                delete markersRef.current[userId];
            }
        });

        Object.keys(destMarkersRef.current).forEach((actId) => {
            const numId = Number(actId);
            if (!seenActivityIds.has(numId)) {
                mapRef.current.removeLayer(destMarkersRef.current[actId]);
                delete destMarkersRef.current[actId];
            }
        });

        if (!hasAutoFitRef.current && locations.length > 0) {
            const L = window.L;
            const points = [];
            locations.forEach((loc) => {
                points.push([loc.latitude, loc.longitude]);
                if (loc.activity_latitude != null && loc.activity_longitude != null) {
                    points.push([loc.activity_latitude, loc.activity_longitude]);
                }
            });
            if (points.length === 1) {
                mapRef.current.setView(points[0], 16);
            } else {
                mapRef.current.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 16 });
            }
            hasAutoFitRef.current = true;
        }

        setStatusCounts(counts);
    };

    return (
        <div className="bg-white rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 leading-tight">
                            Live Volunteer Locations
                        </h3>
                        <p className="text-[11px] text-gray-400">
                            Real-time geofenced GPS tracking during active sessions
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-500">
                    {lastUpdated && (
                        <span className="flex items-center gap-1 text-[11px] text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>
                                Updated {lastUpdated.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </span>
                        </span>
                    )}
                </div>
            </div>

            {/* Status Legend Pills */}
            {mapReady && activeCount > 0 && (
                <div className="px-5 py-2.5 bg-gray-50/60 border-b border-gray-100 flex items-center gap-4 text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-blue-700">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                        <span>At Location:</span>
                        <strong className="font-bold">{statusCounts.inside}</strong>
                    </span>
                    <span className="flex items-center gap-1.5 text-red-700">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
                        <span>Left Location:</span>
                        <strong className="font-bold">{statusCounts.left}</strong>
                    </span>
                </div>
            )}

            {/* Map Canvas */}
            {mapError ? (
                <div className="p-12 text-center text-xs text-red-600">
                    The interactive map could not be loaded. Please ensure an active internet connection.
                </div>
            ) : (
                <div ref={mapDivRef} className="w-full h-[400px] z-0" />
            )}

            {mapReady && activeCount === 0 && (
                <div className="px-5 py-3 text-xs text-gray-400 bg-gray-50/40 border-t border-gray-100 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" />
                    <span>There are currently no active checked-in volunteers being tracked.</span>
                </div>
            )}
        </div>
    );
}