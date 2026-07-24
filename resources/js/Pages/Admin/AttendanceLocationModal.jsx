import React, { useEffect, useRef, useState } from 'react';

const LEAFLET_CSS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

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

// Shows one attendance record's check-in location on a small map inside a modal.
// Pass `record` (an attendance row with latitude/longitude, user, activity, date,
// time_in) and `onClose`. Renders nothing if record is null.
export default function AttendanceLocationModal({ record, onClose }) {
    const mapDivRef = useRef(null);
    const mapRef = useRef(null);
    const [mapReady, setMapReady] = useState(false);
    const [mapError, setMapError] = useState(false);

    const hasCoords = record && record.latitude != null && record.longitude != null;

    useEffect(() => {
        if (!record || !hasCoords) return;

        setMapReady(false);
        setMapError(false);

        loadLeaflet()
            .then(() => {
                if (!mapDivRef.current) return;
                const L = window.L;
                const lat = parseFloat(record.latitude);
                const lng = parseFloat(record.longitude);

                if (mapRef.current) {
                    mapRef.current.remove();
                    mapRef.current = null;
                }

                mapRef.current = L.map(mapDivRef.current).setView([lat, lng], 16);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 19,
                }).addTo(mapRef.current);
                L.marker([lat, lng]).addTo(mapRef.current)
                    .bindPopup(`${record.user?.name ?? 'Volunteer'}<br/>${record.activity?.name ?? ''}`)
                    .openPopup();

                setMapReady(true);
            })
            .catch(() => setMapError(true));

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [record]);

    if (!record) return null;

    const formatTime = (datetime) => {
        if (!datetime) return '—';
        return new Date(datetime).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 1000, padding: '20px',
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'white', borderRadius: '10px', width: '100%', maxWidth: '560px',
                    overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                }}
            >
                <div style={{
                    padding: '18px 22px', borderBottom: '1px solid #e8e8e8',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <div>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#111' }}>
                            {record.user?.name ?? '—'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                            {record.activity?.name ?? 'No activity'} · {formatDate(record.date)} · {formatTime(record.time_in)}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            fontSize: '20px', color: '#9ca3af', lineHeight: 1, padding: '4px',
                        }}
                    >×</button>
                </div>

                {hasCoords ? (
                    <div ref={mapDivRef} style={{ width: '100%', height: '320px' }} />
                ) : (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                        No Location record for attendance.
                    </div>
                )}

                {mapError && (
                    <div style={{ padding: '12px 22px', color: '#ff0000', fontSize: '12px', borderTop: '1px solid #f0f0f0' }}>
                        Hindi na-load ang map. Siguraduhing may access sa internet.
                    </div>
                )}
            </div>
        </div>
    );
}
