import React, { useEffect, useRef, useState } from 'react';

const POLL_INTERVAL_MS = 10000;
const DEFAULT_CENTER = [14.4081, 121.0415]; // Muntinlupa City, PH - used before any markers exist
const LEAFLET_CSS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

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

export default function LiveLocationMap() {
    const mapDivRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef({}); // user_id -> Leaflet marker
    const pollTimeoutRef = useRef(null);

    const [mapReady, setMapReady] = useState(false);
    const [mapError, setMapError] = useState(false);
    const [activeCount, setActiveCount] = useState(0);
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
                updateMarkers(data.locations || []);
                setActiveCount((data.locations || []).length);
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

        locations.forEach((loc) => {
            seenUserIds.add(loc.user_id);
            const latlng = [loc.latitude, loc.longitude];
            const popupContent = `
                <div style="font-family: sans-serif; font-size: 13px; line-height: 1.5;">
                    <strong>${loc.user_name}</strong><br/>
                    ${loc.activity_name} — ${loc.location_name}<br/>
                    <span style="color:#888;">Last update: ${loc.last_ping_at}</span>
                </div>
            `;

            if (markersRef.current[loc.user_id]) {
                // Existing marker - just move it, don't recreate (avoids flicker).
                markersRef.current[loc.user_id].setLatLng(latlng);
                markersRef.current[loc.user_id].setPopupContent(popupContent);
            } else {
                const marker = L.marker(latlng).addTo(mapRef.current).bindPopup(popupContent);
                markersRef.current[loc.user_id] = marker;
            }
        });

        // Remove markers for volunteers who are no longer active (timed out, or
        // their pings went stale).
        Object.keys(markersRef.current).forEach((userId) => {
            if (!seenUserIds.has(Number(userId))) {
                mapRef.current.removeLayer(markersRef.current[userId]);
                delete markersRef.current[userId];
            }
        });
    };

    return (
        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e8e8e8', overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e8e8e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '16px', color: '#111', fontWeight: '600', textTransform: 'uppercase' }}>
                    Live Volunteer Locations
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>
                    {mapReady && `${activeCount} active now`}
                    {lastUpdated && ` · updated ${lastUpdated.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true })}`}
                </div>
            </div>

            {mapError ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#991b1b', fontSize: '14px' }}>
                    Hindi na-load ang map. Siguraduhing may access sa internet ang device na ito.
                </div>
            ) : (
                <div ref={mapDivRef} style={{ width: '100%', height: '420px' }} />
            )}

            {mapReady && activeCount === 0 && (
                <div style={{ padding: '12px 24px', fontSize: '12px', color: '#9ca3af', borderTop: '1px solid #f0f0f0' }}>
                    Walang kasalukuyang naka-check-in na volunteer.
                </div>
            )}
        </div>
    );
}
