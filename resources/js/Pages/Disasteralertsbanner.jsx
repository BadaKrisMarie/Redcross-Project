import React, { useEffect, useState } from "react";
const RED = "#ff0000";
export default function DisasterAlertsBanner() {
  const [alerts, setAlerts] = useState([]);
  const fetchAlerts = () => {
    fetch("/api/disaster-alerts")
      .then((res) => res.json())
      .then((data) => setAlerts(data.alerts || []))
      .catch(() => {});
  };
  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  if (alerts.length === 0) return null;
  return (
    <div>
      {alerts.map((alert) => {
        const isEarthquake = alert.type === "earthquake";
        return (
          <div key={alert.id} style={{ background: RED, fontFamily: "'Inter', sans-serif" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "18px 36px" }}>
              <div style={{ width: 52, height: 52, background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: RED, flexShrink: 0 }}>+</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", marginBottom: 2 }}>
                  {isEarthquake ? "Lindol Alert" : "Bagyo Alert"}
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: "white", textTransform: "uppercase", letterSpacing: 0.5, lineHeight: 1.1 }}>
                  {alert.title}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>Emergency Appeal</div>
                {alert.signal_number && (
                  <div style={{ fontSize: 16, fontWeight: 900, color: "white", textTransform: "uppercase", lineHeight: 1.1 }}>Signal No. {alert.signal_number}</div>
                )}
                {isEarthquake && alert.magnitude && (
                  <div style={{ fontSize: 16, fontWeight: 900, color: "white", textTransform: "uppercase", lineHeight: 1.1 }}>Magnitude {alert.magnitude}</div>
                )}
              </div>
            </div>
            <div style={{ background: "white", padding: "24px 36px", display: "flex", gap: 24, flexWrap: "wrap", borderTop: "1px solid #eee" }}>
              {alert.image_url && (
                <img src={alert.image_url} alt={`${alert.title} track map`} style={{ maxWidth: 320, width: "100%", height: "auto", borderRadius: 6, flexShrink: 0, background: "white", border: "1px solid #eee" }} />
              )}
              {isEarthquake && alert.location && (
                <div style={{ minWidth: 200, flexShrink: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(0,0,0,0.5)", marginBottom: 4 }}>Location</div>
                  <div style={{ fontSize: 15, color: "black", fontWeight: 600 }}>{alert.location}</div>
                </div>
              )}
              <div style={{ flex: 1, minWidth: 260 }}>
                <p style={{ color: "#222", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                  {alert.description}
                </p>
                {alert.source_url && (
                  <a href={alert.source_url} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 12, color: "white", background: RED, padding: "8px 16px", borderRadius: 4, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>Full Bulletin &rarr;</a>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
