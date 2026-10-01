import React, { useEffect, useRef, useState } from 'react';
import { X, MapPin } from 'lucide-react';

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
    }, [record, hasCoords]);

    if (!record) return null;

    const formatTime = (datetime) => {
        if (!datetime) return '-';
        return new Date(datetime).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
                <div className="p-4 sm:p-5 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <div className="text-sm font-bold text-gray-900">
                            {record.user?.name ?? '-'}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                            {record.activity?.name ?? 'No activity'} · {formatDate(record.date)} · {formatTime(record.time_in)}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {hasCoords ? (
                    <div ref={mapDivRef} className="w-full h-80" />
                ) : (
                    <div className="py-16 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
                        <MapPin className="w-8 h-8 text-gray-300" />
                        <span>No location coordinates recorded for this check-in.</span>
                    </div>
                )}

                {mapError && (
                    <div className="p-3 bg-red-50 text-red-700 text-xs border-t border-red-100">
                        Failed to load the map. Please ensure internet connectivity.
                    </div>
                )}
            </div>
        </div>
    );
}
