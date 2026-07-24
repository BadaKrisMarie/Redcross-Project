import React, { useEffect, useRef, useState } from 'react';

const POLL_INTERVAL_MS = 10000;
const DEFAULT_CENTER = [14.4081, 121.0415]; // Muntinlupa City, PH - used before any markers exist
const LEAFLET_CSS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

// Volunteer is considered "nasa lokasyon" once they're within this many meters
// of the activity's registered coordinates. GPS on phones can easily drift
// 20-50m indoors/under trees, so 100m is a forgiving-but-still-useful radius.
const GEOFENCE_RADIUS_METERS = 100;

// Loads Leaflet's CSS + JS from a CDN once and reuses it across mounts, instead of
// injecting duplicate tags if this component re-mounts. No API key needed - unlike
// Google Maps, Leaflet + OpenStreetMap tiles are free with no signup required.
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

// Straight-line distance in meters between two lat/lng points (Haversine).
// This isn't a routed/road distance - just how far apart the two pins are -
// which is exactly what a geofence check needs.
function distanceInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth radius in meters
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Small colored dot marker (no external icon images needed) so we can recolor
// per-status without depending on another CDN for marker-color variants.
function makeDotIcon(color) {
    const L = window.L;
    return L.divIcon({
        className: '',
        html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.4);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        popupAnchor: [0, -8],
    });
}

// Flag-style marker for the activity's fixed destination point.
function makeFlagIcon() {
    const L = window.L;
    return L.divIcon({
        className: '',
        html: `<div style="font-size:22px;line-height:22px;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.5));">📍</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 22],
        popupAnchor: [0, -20],
    });
}

const STATUS_COLORS = {
    inside: '#16a34a',    // green -on location
    outside: '#2563eb',   // blue - on the way
    left: '#dc2626',      // red - exit the location (was inside, now isn't)
};

const STATUS_LABELS = {
    inside: 'On Location',
    outside: 'On the Way',
    left: 'Left Location',
};

export default function LiveLocationMap() {
    const mapDivRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef({});     // user_id -> { marker, polyline, prevStatus }
    const destMarkersRef = useRef({}); // activity_id -> Leaflet marker (destination pin)
    const pollTimeoutRef = useRef(null);
    const hasAutoFitRef = useRef(false); // only auto-zoom to markers once, so we don't yank the admin's view every poll

    const [mapReady, setMapReady] = useState(false);
    const [mapError, setMapError] = useState(false);
    const [activeCount, setActiveCount] = useState(0);
    const [statusCounts, setStatusCounts] = useState({ inside: 0, outside: 0, left: 0 });
    const [lastUpdated, setLastUpdated] = useState(null);

    // Load Leaflet, then initialize the map once.
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

                // Leaflet measures the container's pixel size the instant it's created.
                // If that happens before the surrounding layout (flex/tabs/etc.) has
                // settled, it locks in the wrong size and the map renders zoomed out
                // to whatever it thinks the world looks like. Re-measuring shortly
                // after mount fixes that without needing to touch surrounding layout.
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

    // Poll the live-locations endpoint and update markers, once the map is ready.
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
        const counts = { inside: 0, outside: 0, left: 0 };

        locations.forEach((loc) => {
            seenUserIds.add(loc.user_id);
            const latlng = [loc.latitude, loc.longitude];
            const hasDestination = loc.activity_latitude != null && loc.activity_longitude != null;
            const destLatLng = hasDestination ? [loc.activity_latitude, loc.activity_longitude] : null;

            const existing = markersRef.current[loc.user_id];
            const wasInside = existing?.prevStatus === 'inside';

            // Work out geofence status for this ping.
            let status = 'outside';
            let distanceLabel = '';
            if (hasDestination) {
                const meters = distanceInMeters(loc.latitude, loc.longitude, loc.activity_latitude, loc.activity_longitude);
                distanceLabel = meters >= 1000 ? `${(meters / 1000).toFixed(1)}km` : `${Math.round(meters)}m`;
                if (meters <= GEOFENCE_RADIUS_METERS) {
                    status = 'inside';
                } else {
                    status = wasInside ? 'left' : 'outside';
                }
            }
            counts[status] += 1;

            const popupContent = `
                <div style="font-family: sans-serif; font-size: 13px; line-height: 1.5;">
                    <strong>${loc.user_name}</strong><br/>
                    ${loc.activity_name} — ${loc.location_name}<br/>
                    <span style="color:${STATUS_COLORS[status]}; font-weight:600;">${STATUS_LABELS[status]}</span>
                    ${hasDestination ? ` · ${distanceLabel} mula sa lokasyon` : ''}<br/>
                    <span style="color:#888;">Last update: ${loc.last_ping_at}</span>
                </div>
            `;

            if (existing) {
                // Existing marker - just move it, don't recreate (avoids flicker).
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

            // One destination pin per activity (not per volunteer) so multiple
            // volunteers on the same activity don't stack duplicate flags.
            if (hasDestination && !seenActivityIds.has(loc.activity_id)) {
                seenActivityIds.add(loc.activity_id);
                if (destMarkersRef.current[loc.activity_id]) {
                    destMarkersRef.current[loc.activity_id].setLatLng(destLatLng);
                } else {
                    destMarkersRef.current[loc.activity_id] = L.marker(destLatLng, { icon: makeFlagIcon() })
                        .addTo(mapRef.current)
                        .bindPopup(`
                            <div style="font-family: sans-serif; font-size: 13px;">
                                <strong>${loc.activity_name}</strong><br/>
                                ${loc.location_name}
                            </div>
                        `);
                }
            }
        });

        // Remove markers + polylines for volunteers who are no longer active
        // (timed out, or their pings went stale).
        Object.keys(markersRef.current).forEach((userId) => {
            if (!seenUserIds.has(Number(userId))) {
                const entry = markersRef.current[userId];
                mapRef.current.removeLayer(entry.marker);
                if (entry.polyline) mapRef.current.removeLayer(entry.polyline);
                delete markersRef.current[userId];
            }
        });

        // Remove destination pins for activities no one is currently pinging for.
        Object.keys(destMarkersRef.current).forEach((activityId) => {
            if (!seenActivityIds.has(Number(activityId))) {
                mapRef.current.removeLayer(destMarkersRef.current[activityId]);
                delete destMarkersRef.current[activityId];
            }
        });

        // First time we see any active locations, zoom the map to actually show
        // them instead of leaving the admin staring at the default city-wide view.
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
        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e8e8e8', overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e8e8e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '16px', color: '#111', fontWeight: '600', textTransform: 'uppercase' }}>
                    Live Volunteer Locations
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>
                    {lastUpdated && `updated ${lastUpdated.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true })}`}
                </div>
            </div>

            {mapReady && activeCount > 0 && (
                <div style={{ padding: '10px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', gap: '16px', fontSize: '12px', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: STATUS_COLORS.inside, display: 'inline-block' }} />
                        Nasa lokasyon: <strong>{statusCounts.inside}</strong>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: STATUS_COLORS.outside, display: 'inline-block' }} />
                        Papunta pa: <strong>{statusCounts.outside}</strong>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: STATUS_COLORS.left, display: 'inline-block' }} />
                        Lumabas: <strong>{statusCounts.left}</strong>
                    </span>
                </div>
            )}

            {mapError ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#ff0000', fontSize: '14px' }}>
                   The map could not be loaded. Make sure this device has access to the internet.
                </div>
            ) : (
                <div ref={mapDivRef} style={{ width: '100%', height: '420px' }} />
            )}

            {mapReady && activeCount === 0 && (
                <div style={{ padding: '12px 24px', fontSize: '12px', color: '#9ca3af', borderTop: '1px solid #f0f0f0' }}>
                    There are no volunteers currently checked in.
                </div>
            )}
        </div>
    );
}