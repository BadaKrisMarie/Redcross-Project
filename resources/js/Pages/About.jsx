import React, { useState } from "react";
import { Link, Head } from "@inertiajs/react";

const RED = "#C8102E";
const NAVY = "#1A1464";
const WHITE = "#FFFFFF";
const LIGHT = "#FAF9F7";
const BORDER = "#EEEBE6";
const MUTED = "#888880";
const DARK = "#111111";

const DOT_BG = `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='1' fill='%23C8102E' fill-opacity='0.07'/%3E%3C/svg%3E")`;

function Nav() {
  return (
    <nav style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 48px", background: WHITE,
      borderBottom: `1px solid ${BORDER}`,
      position: "sticky", top: 0, zIndex: 100,
      backdropFilter: "blur(12px)",
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: "#FEE8EC", border: `1.5px solid #F5C0C8`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="9.5" y="3" width="5" height="18" rx="1.5" fill={RED}/>
            <rect x="3" y="9.5" width="18" height="5" rx="1.5" fill={RED}/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: RED, lineHeight: 1.25 }}>Rizal Chapter</div>
          <div style={{ fontSize: 11, fontWeight: 500, color: "#B05060", lineHeight: 1.25 }}>Muntinlupa City Branch</div>
        </div>
      </Link>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Link href="/" style={{
          textDecoration: "none", fontSize: 14, color: MUTED,
          fontWeight: 400, padding: "6px 14px", borderRadius: 8,
        }}>Home</Link>

        <Link href="/about" style={{
          textDecoration: "none", fontSize: 14, color: RED,
          fontWeight: 600, padding: "6px 14px", borderRadius: 8,
          background: "#FEE8EC",
        }}>About</Link>

        <a href="/#contact" style={{
          textDecoration: "none", fontSize: 14, color: MUTED,
          fontWeight: 400, padding: "6px 14px", borderRadius: 8,
        }}>Contact</a>

        <Link href="/login" style={{
          textDecoration: "none",
          fontSize: 13, fontWeight: 500, color: DARK,
          padding: "7px 18px", borderRadius: 8,
          border: `1px solid ${BORDER}`,
          marginLeft: 8,
        }}>Log In</Link>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <div style={{
      background: "linear-gradient(to right, #6b0a0a 0%, #3a0808 40%, #1a0303 70%, #0a0000 100%)",
      padding: "56px 48px 48px",
      position: "relative", overflow: "hidden",
    }}>
      {/* Grid texture */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(200,60,60,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(200,60,60,0.07) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
        pointerEvents: "none",
      }}/>

      {/* Curved background shapes */}
      <div style={{
        position: "absolute", right: -40, bottom: -60,
        width: 320, height: 320, borderRadius: "50%",
        background: "rgba(80,10,10,0.45)", pointerEvents: "none",
      }}/>
      <div style={{
        position: "absolute", right: 60, bottom: -80,
        width: 260, height: 260, borderRadius: "50%",
        background: "rgba(30,5,5,0.6)", pointerEvents: "none",
      }}/>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 48, alignItems: "center", position: "relative" }}>
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.10)", color: WHITE,
            fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", padding: "5px 12px", borderRadius: 100,
            marginBottom: 20, border: "1px solid rgba(255,255,255,0.22)",
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.7)", display: "inline-block" }}/>
            About Us
          </div>
          <h1 style={{
            fontSize: 38, fontWeight: 800, color: WHITE,
            lineHeight: 1.15, marginBottom: 16, letterSpacing: "-0.02em",
          }}>
            Rizal Chapter<br/>
            <span style={{ color: "rgba(255,255,255,0.50)" }}>Muntinlupa City Branch</span>
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.48)", lineHeight: 1.8, maxWidth: 460 }}>
            A local branch of the Philippine Red Cross committed to alleviating human suffering through coordinated relief efforts, community programs, and volunteer service.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
          {[
            { num: "9", label: "Barangays served" },
            { num: "500+", label: "Active volunteers" },
            { num: "24 / 7", label: "Emergency response" },
          ].map(({ num, label }) => (
            <div key={label} style={{
              background: "rgba(255,255,255,0.05)",
              border: "0.5px solid rgba(255,255,255,0.12)",
              borderRadius: 12, padding: "14px 24px",
              display: "flex", alignItems: "center", gap: 16,
            }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: WHITE, minWidth: 52 }}>{num}</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.50)", lineHeight: 1.4 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
      <div style={{ width: 20, height: 3, borderRadius: 2, background: RED }}/>
      <span style={{
        fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
        textTransform: "uppercase", color: RED,
      }}>{children}</span>
    </div>
  );
}

const photos = [
  {
    title: "Community Outreach",
    location: "Muntinlupa City",
    desc: "Red Cross volunteers conduct community outreach activities in Muntinlupa, providing assistance, guidance, and support to residents, especially families and children in need.",
    fullDesc: "Our Community Outreach program reaches the most vulnerable sectors of Muntinlupa City. Volunteers regularly visit barangays to provide basic health consultations, distribute relief goods, and conduct community education sessions. This program has touched thousands of lives across the 9 barangays we serve, ensuring that no family is left behind during times of need.",
    accent: "#C8102E",
    tagLabel: "Outreach",
    tagBg: "rgba(0,0,0,0.25)",
    tagColor: "#fde8eb",
    placeholderBg: "linear-gradient(135deg, #c4606e 0%, #9e3a4a 100%)",
  },
  {
    title: "Relief Distribution",
    location: "Cupang, Muntinlupa",
    desc: "Volunteers distribute relief goods during a coordinated humanitarian operation in Muntinlupa, ensuring timely aid and strengthening community resilience.",
    fullDesc: "During disasters and calamities, our Relief Distribution team mobilizes rapidly to deliver food packs, water, hygiene kits, and other essential supplies to affected families. Our logistics network ensures that aid reaches even the most hard-to-reach areas of Muntinlupa within hours of a disaster declaration. We coordinate closely with local government units for maximum efficiency.",
    accent: "#1A1464",
    tagLabel: "Relief",
    tagBg: "rgba(0,0,0,0.22)",
    tagColor: "#d8ddf8",
    placeholderBg: "linear-gradient(135deg, #5a6aaa 0%, #3a4880 100%)",
  },
  {
    title: "Community Assistance",
    location: "Bayanan Community, Muntinlupa",
    desc: "Red Cross volunteers visit neighborhoods in Muntinlupa to deliver essential aid and check on residents.",
    fullDesc: "Our Community Assistance program provides ongoing support to marginalized communities in Muntinlupa. Volunteers conduct regular welfare checks, provide psychosocial support, and connect residents with government services and other humanitarian organizations. Special attention is given to elderly residents, persons with disabilities, and families affected by poverty or displacement.",
    accent: "#0A6E3A",
    tagLabel: "Assistance",
    tagBg: "rgba(0,0,0,0.22)",
    tagColor: "#c8eedd",
    placeholderBg: "linear-gradient(135deg, #4a9e70 0%, #2a7050 100%)",
  },
];

function Modal({ photo, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 999,
        background: "rgba(0,0,0,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: WHITE, borderRadius: 20,
          width: "100%", maxWidth: 540,
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{
          height: 220, background: photo.placeholderBg,
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative",
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "rgba(255,255,255,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(4px)",
          }}>
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
              <rect x="11" y="3" width="6" height="22" rx="2" fill={photo.accent} opacity="0.8"/>
              <rect x="3" y="11" width="22" height="6" rx="2" fill={photo.accent} opacity="0.8"/>
            </svg>
          </div>

          <div style={{
            position: "absolute", top: 12, left: 12,
            background: "rgba(255,255,255,0.92)",
            border: `1px solid ${photo.accent}33`,
            color: photo.accent,
            fontSize: 9, fontWeight: 700, letterSpacing: "0.07em",
            padding: "4px 10px", borderRadius: 100, textTransform: "uppercase",
          }}>
            Philippine Red Cross
          </div>

          <div style={{
            position: "absolute", bottom: 12, right: 12,
            background: photo.tagBg, color: photo.tagColor,
            fontSize: 10, fontWeight: 600, letterSpacing: "0.05em",
            padding: "4px 10px", borderRadius: 100, textTransform: "uppercase",
            border: `1px solid ${photo.tagColor}22`,
          }}>
            {photo.tagLabel}
          </div>

          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 12, right: 12,
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(0,0,0,0.35)", border: "none",
              color: WHITE, fontSize: 18, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              lineHeight: 1,
            }}
          >×</button>
        </div>

        <div style={{ padding: "24px 28px 28px" }}>
          <div style={{ width: 32, height: 3, borderRadius: 2, background: photo.accent, marginBottom: 14 }}/>
          <div style={{ fontSize: 20, fontWeight: 800, color: DARK, marginBottom: 6 }}>{photo.title}</div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 12, color: photo.accent, fontWeight: 600, marginBottom: 16,
          }}>
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
              <path d="M7 1C4.79 1 3 2.79 3 5c0 3.25 4 8 4 8s4-4.75 4-8c0-2.21-1.79-4-4-4z" fill={photo.accent}/>
              <circle cx="7" cy="5" r="1.5" fill="white"/>
            </svg>
            {photo.location}
          </div>
          <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, margin: "0 0 24px" }}>
            {photo.fullDesc}
          </p>
          <Link
            href="/register"
            style={{
              display: "inline-block",
              background: photo.accent, color: WHITE,
              padding: "11px 24px", borderRadius: 10,
              fontSize: 13, fontWeight: 700, textDecoration: "none",
              letterSpacing: "-0.01em",
            }}
          >
            Volunteer Now →
          </Link>
        </div>
      </div>
    </div>
  );
}

function PhotoCard({ photo, onOpen }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onOpen}
      style={{
        background: WHITE, borderRadius: 18, overflow: "hidden",
        border: `1px solid ${hovered ? photo.accent + "44" : BORDER}`,
        transform: hovered ? "translateY(-6px) scale(1.01)" : "translateY(0) scale(1)",
        boxShadow: hovered
          ? `0 20px 48px rgba(0,0,0,0.12), 0 0 0 3px ${photo.accent}18`
          : "0 2px 8px rgba(0,0,0,0.05)",
        transition: "all 0.28s cubic-bezier(0.34,1.56,0.64,1)",
        cursor: "pointer",
      }}
    >
      <div style={{
        height: 200, background: photo.placeholderBg,
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: "rgba(255,255,255,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(4px)",
        }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="11" y="3" width="6" height="22" rx="2" fill={photo.accent} opacity="0.8"/>
            <rect x="3" y="11" width="22" height="6" rx="2" fill={photo.accent} opacity="0.8"/>
          </svg>
        </div>

        <div style={{
          position: "absolute", top: 12, left: 12,
          background: "rgba(255,255,255,0.92)",
          border: `1px solid ${photo.accent}33`,
          color: photo.accent, fontSize: 9, fontWeight: 700,
          letterSpacing: "0.07em", padding: "4px 10px",
          borderRadius: 100, textTransform: "uppercase",
        }}>
          Philippine Red Cross
        </div>

        <div style={{
          position: "absolute", bottom: 12, right: 12,
          background: photo.tagBg, color: photo.tagColor,
          fontSize: 10, fontWeight: 600, letterSpacing: "0.05em",
          padding: "4px 10px", borderRadius: 100, textTransform: "uppercase",
          border: `1px solid ${photo.tagColor}22`,
        }}>
          {photo.tagLabel}
        </div>

        {hovered && (
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(0,0,0,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{
              background: WHITE, color: photo.accent,
              fontSize: 12, fontWeight: 700, padding: "8px 18px",
              borderRadius: 100, letterSpacing: "0.05em",
            }}>View Details</div>
          </div>
        )}
      </div>

      <div style={{ padding: "18px 20px 22px" }}>
        <div style={{ width: 28, height: 3, borderRadius: 2, background: photo.accent, marginBottom: 12 }}/>
        <div style={{ fontSize: 15, fontWeight: 700, color: DARK, marginBottom: 4, letterSpacing: "-0.01em" }}>
          {photo.title}
        </div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          fontSize: 11, color: photo.accent, fontWeight: 600, marginBottom: 10,
        }}>
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
            <path d="M7 1C4.79 1 3 2.79 3 5c0 3.25 4 8 4 8s4-4.75 4-8c0-2.21-1.79-4-4-4z" fill={photo.accent}/>
            <circle cx="7" cy="5" r="1.5" fill="white"/>
          </svg>
          {photo.location}
        </div>
        <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.7 }}>{photo.desc}</div>
      </div>
    </div>
  );
}

export default function About() {
  const [activeModal, setActiveModal] = useState(null);

  return (
    <>
      <Head title="About" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;0,14..32,800&display=swap" rel="stylesheet"/>

      <div style={{
        fontFamily: "'Inter', sans-serif",
        background: LIGHT, backgroundImage: DOT_BG,
        color: DARK, minHeight: "100vh",
      }}>
        <Nav />
        <Hero />

        <div style={{ padding: "40px 48px 60px" }}>
          <SectionLabel>Our Work in Action</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {photos.map((photo, i) => (
              <PhotoCard
                key={photo.title}
                photo={photo}
                onOpen={() => setActiveModal(i)}
              />
            ))}
          </div>
        </div>
      </div>

      {activeModal !== null && (
        <Modal
          photo={photos[activeModal]}
          onClose={() => setActiveModal(null)}
        />
      )}
    </>
  );
}