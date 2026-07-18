import { useEffect, useState } from "react";

/**
 * Fetches recent disaster alerts from /api/disaster-alerts and shows
 * them as a dismissible banner strip. Renders nothing if there are no
 * active alerts or the request fails.
 */
export default function DisasterAlertsBanner() {
    const [alerts, setAlerts] = useState([]);
    const [dismissed, setDismissed] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        fetch("/api/disaster-alerts")
            .then((res) => (res.ok ? res.json() : { alerts: [] }))
            .then((data) => {
                if (!cancelled) {
                    setAlerts(data.alerts || []);
                }
            })
            .catch(() => {
                if (!cancelled) setAlerts([]);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) return null;

    const visibleAlerts = alerts.filter((a) => !dismissed.includes(a.id));

    if (visibleAlerts.length === 0) return null;

    const severityStyle = (type) => {
        if (type === "earthquake") return "bg-red-700 border-red-900";
        if (type === "typhoon") return "bg-red-600 border-red-800";
        return "bg-gray-700 border-gray-900"; // weather-advisory / default
    };

    return (
        <div className="w-full">
            {visibleAlerts.map((alert) => (
                <div
                    key={alert.id}
                    className={`w-full ${severityStyle(
                        alert.type
                    )} border-b text-white px-4 py-3 flex items-center justify-between`}
                >
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-sm uppercase tracking-wide">
                            {alert.source} Alert
                        </span>
                        <p className="text-sm">
                            {alert.title}
                            {alert.source_url && (
                                <a
                                    href={alert.source_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 underline font-semibold hover:text-red-100"
                                >
                                    Learn more
                                </a>
                            )}
                        </p>
                    </div>
                    <button
                        onClick={() =>
                            setDismissed((prev) => [...prev, alert.id])
                        }
                        className="text-white/80 hover:text-white text-lg leading-none px-2"
                        aria-label="Dismiss alert"
                    >
                        x
                    </button>
                </div>
            ))}
        </div>
    );
}
