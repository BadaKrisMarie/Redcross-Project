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
  const [openTooltip, setOpenTooltip] = useState(null);

  return (
    <nav style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 48px",
      background: "#ffffff",
      borderBottom: "1px solid rgba(200,16,46,0.12)",
      position: "sticky", top: 0, zIndex: 100,
      fontFamily: "Inter, sans-serif",
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <div style={{
          width: 34, height: 34, borderRadius: 4,
          background: "#DC2626",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontSize: 20, fontWeight: 900,
        }}>+</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#111111", lineHeight: 1.2 }}>Rizal Chapter</div>
          <div style={{ fontSize: 10, color: "#888880" }}>Muntinlupa City Branch</div>
        </div>
      </Link>

      <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
        <Link href="/" style={{
          textDecoration: "none", fontSize: 13, color: "#444444",
          fontWeight: 500, padding: "4px 10px", borderRadius: 6,
        }}>Home</Link>

        {/* ABOUT with tooltip */}
        <div
          style={{ position: "relative" }}
          onMouseEnter={() => setOpenTooltip("about")}
          onMouseLeave={() => setOpenTooltip(null)}
        >
          <Link href="/about" style={{
            textDecoration: "none", fontSize: 13, color: "#DC2626",
            fontWeight: 600, padding: "4px 10px", borderRadius: 6,
            background: "rgba(220,38,38,0.08)",
          }}>About</Link>

          {openTooltip === "about" && (
            <div style={{
              position: "absolute", top: "calc(100% + 10px)", left: "50%",
              transform: "translateX(-50%)",
              background: "#1a1a1a", borderRadius: 8,
              padding: "10px 14px", minWidth: 180, zIndex: 200,
              pointerEvents: "none",
            }}>
              {/* Arrow */}
              <div style={{
                position: "absolute", top: -6, left: "50%", transform: "translateX(-50%)",
                borderLeft: "6px solid transparent", borderRight: "6px solid transparent",
                borderBottom: "6px solid #1a1a1a",
              }}/>
              {[
                { label: "Who We Are", desc: "Our story & background" },
                { label: "Our Mission", desc: "Vision, mission & values" },
                { label: "Our Team", desc: "Meet our volunteers" },
                { label: "Our History", desc: "Years of service" },
              ].map((item, i) => (
                <div key={item.label} style={{
                  padding: "5px 0",
                  borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
                }}>
                  <div style={{
                    fontSize: 13, color: i === 0 ? "#fff" : "#ccc",
                    fontWeight: i === 0 ? 600 : 500,
                    lineHeight: 1.3,
                  }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: "#888", marginTop: 1 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CONTACT with tooltip */}
        <div
          style={{ position: "relative" }}
          onMouseEnter={() => setOpenTooltip("contact")}
          onMouseLeave={() => setOpenTooltip(null)}
        >
          <Link href="/contact" style={{
            textDecoration: "none", fontSize: 13, color: "#444444",
            fontWeight: 500, padding: "4px 10px", borderRadius: 6,
          }}>Contact</Link>

          {openTooltip === "contact" && (
            <div style={{
              position: "absolute", top: "calc(100% + 10px)", left: "50%",
              transform: "translateX(-50%)",
              background: "#1a1a1a", borderRadius: 8,
              padding: "10px 14px", minWidth: 180, zIndex: 200,
              pointerEvents: "none",
            }}>
              {/* Arrow */}
              <div style={{
                position: "absolute", top: -6, left: "50%", transform: "translateX(-50%)",
                borderLeft: "6px solid transparent", borderRight: "6px solid transparent",
                borderBottom: "6px solid #1a1a1a",
              }}/>
              {[
                { label: "Get in Touch", desc: "Send us a message" },
                { label: "Email Us", desc: "rizalchapter@redcross.org.ph" },
                { label: "Call Us", desc: "Hotline & emergency numbers" },
                { label: "Visit Our Office", desc: "Muntinlupa City Branch" },
              ].map((item, i) => (
                <div key={item.label} style={{
                  padding: "5px 0",
                  borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
                }}>
                  <div style={{
                    fontSize: 13, color: i === 0 ? "#fff" : "#ccc",
                    fontWeight: i === 0 ? 600 : 500,
                    lineHeight: 1.3,
                  }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: "#888", marginTop: 1 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Link href="/login" style={{
          textDecoration: "none",
          fontSize: 12, fontWeight: 600, color: "#ffffff",
          padding: "8px 18px", borderRadius: 6,
          background: "#DC2626",
        }}>Log In</Link>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <div style={{
      backgroundImage: "linear-gradient(to right, rgba(107,10,10,0.92) 0%, rgba(58,8,8,0.88) 40%, rgba(26,3,3,0.85) 70%, rgba(0,0,0,0.88) 100%), url('https://scontent.fmnl8-1.fna.fbcdn.net/v/t39.30808-6/486253255_122117910200759224_1850104524729330657_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeEw-GcRpW6cF5CDYZ9ZRKZCzVUqOFhpoWXNVSo4WGmhZdHvRS7hLlmRZAbBesLg5GtZF2pP5w207rnDSsD4mH7B&_nc_ohc=eVZESyEoYO4Q7kNvwEBArtn&_nc_oc=Ado0XUsrxF7BC6HChAYWkzAqIXZ-DonRNp8s9hd5dKnQXNTXCNQPLK2MvFg8S8wQFaQueWEYEymxkLTcW5RCws-Y&_nc_zt=23&_nc_ht=scontent.fmnl8-1.fna&_nc_gid=0wJy12mi8ditc1tsAhoFkw&_nc_ss=782a8&oh=00_Af4XeMez1nXhvjGANkLOhozhl2igOmv-c8KFBIfhOlLVmw&oe=6A1AC1F7')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      padding: "56px 48px 48px",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(200,60,60,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(200,60,60,0.07) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
        pointerEvents: "none",
      }}/>
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
    image: "https://scontent.fmnl9-3.fna.fbcdn.net/v/t39.30808-6/579912457_122161425698759224_5026736243262263116_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeGhOEnRV-eh6mXSLEAdZ8L94OVOzjvE3c3g5U7OO8TdzZPUF3iITgkM93516fqpXaq3RyLi9EmyjdkWO50RfDsT&_nc_ohc=KP2a6Z3VHAMQ7kNvwH4yWOP&_nc_oc=AdqK7J_EzW7mqAmEesRsSzJusT1EVjHofgo-g1osQmBeIOnM990-IktlXAZ2gMVQtJA&_nc_zt=23&_nc_ht=scontent.fmnl9-3.fna&_nc_gid=pCiwzN-BEIZtMURihogm5A&_nc_ss=7a2a8&oh=00_Af5EMqKQ6VcWU26OrrvKlmlk8eLjj6uOtB3VPwPkttWxKQ&oe=6A1AA184",
  },
  {
    title: "Relief Distribution",
    location: "Cupang, Muntinlupa",
    desc: "Volunteers distribute relief goods during a coordinated humanitarian operation in Muntinlupa, ensuring timely aid and strengthening community resilience.",
    fullDesc: "During disasters and calamities, our Relief Distribution team mobilizes rapidly to deliver food packs, water, hygiene kits, and other essential supplies to affected families. Our logistics network ensures that aid reaches even the most hard-to-reach areas of Muntinlupa within hours of a disaster declaration. We coordinate closely with local government units for maximum efficiency.",
    accent: "#1A1464",
    tagLabel: "Relief",
    image: "https://scontent.fmnl9-1.fna.fbcdn.net/v/t39.30808-6/525541462_122144559482759224_7305491659323059505_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeGd-2hqIPnTydhWQTiCxdcpskBCB6y-7jSyQEIHrL7uNLEGjI5Vn4kzpvuuKI9lFf6K2lWDgPj7VC4ZGRIsyLdq&_nc_ohc=aUnmDE865UcQ7kNvwHmyfAV&_nc_oc=Adqt_1wumq-qM3WRFIbzhv-KoOLHmAwlUyLtHigroieYUbkipD9zVz8lswtQHHtpsfM&_nc_zt=23&_nc_ht=scontent.fmnl9-1.fna&_nc_gid=NZxX_aRFwd9YrAinJWef7A&_nc_ss=7a2a8&oh=00_Af78MVUODKUNApl8rzyQ-NzlncZzxnIXrq-AlHF6B8e-1g&oe=6A1A9E6B",
  },
  {
    title: "Community Assistance",
    location: "Bayanan Community, Muntinlupa",
    desc: "Red Cross volunteers visit neighborhoods in Muntinlupa to deliver essential aid and check on residents.",
    fullDesc: "Our Community Assistance program provides ongoing support to marginalized communities in Muntinlupa. Volunteers conduct regular welfare checks, provide psychosocial support, and connect residents with government services and other humanitarian organizations. Special attention is given to elderly residents, persons with disabilities, and families affected by poverty or displacement.",
    accent: "#0A6E3A",
    tagLabel: "Assistance",
    image: "https://scontent.fmnl8-1.fna.fbcdn.net/v/t39.30808-6/518412380_122142059048759224_7797772017153258644_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeHK7K4qe-W4MlWbpf6EKiLsgYc2IzPTZpmBhzYjM9NmmTdEFo7l68QRWxMji-85Jm_JnX0LBT3jPmXiLkpmaY5m&_nc_ohc=_rU2p01_i1QQ7kNvwFhtdmo&_nc_oc=AdonxDN-Up1mY8kKth9Qy74totFIWV9FLtmmt71HXz7rKSFZxo3ld7IWbqE5ERxW2dl7HBbDfYloeOTfj8vHIn3o&_nc_zt=23&_nc_ht=scontent.fmnl8-1.fna&_nc_gid=2grovV96CwF0416-95tfyA&_nc_ss=782a8&oh=00_Af6voPoPD_6-AAouCa8U1RhO8wrjXp6Gqyv0s1GLi7xzcA&oe=6A1AB59E",
  },
];

function LocationIcon({ color }) {
  return (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
      <path d="M7 1C4.79 1 3 2.79 3 5c0 3.25 4 8 4 8s4-4.75 4-8c0-2.21-1.79-4-4-4z" fill={color}/>
      <circle cx="7" cy="5" r="1.5" fill="white"/>
    </svg>
  );
}

function Modal({ photo, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 999,
        background: "rgba(0,0,0,0.65)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: WHITE, borderRadius: 20,
          width: "100%", maxWidth: 540,
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ height: 260, position: "relative", overflow: "hidden" }}>
          <img
            src={photo.image}
            alt={photo.title}
            style={{
              width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center top",
              display: "block",
            }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.6) 100%)",
          }}/>
          <div style={{
            position: "absolute", inset: 0,
            background: photo.accent, opacity: 0.12,
          }}/>
          <div style={{
            position: "absolute", top: 14, left: 14,
            background: "rgba(255,255,255,0.92)",
            border: `1px solid ${photo.accent}33`,
            color: photo.accent,
            fontSize: 9, fontWeight: 700, letterSpacing: "0.07em",
            padding: "4px 10px", borderRadius: 100, textTransform: "uppercase",
            backdropFilter: "blur(4px)",
          }}>
            Philippine Red Cross
          </div>
          <div style={{
            position: "absolute", bottom: 14, right: 48,
            background: photo.accent, color: "#fff",
            fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
            padding: "4px 12px", borderRadius: 100, textTransform: "uppercase",
          }}>
            {photo.tagLabel}
          </div>
          <div style={{
            position: "absolute", bottom: 14, left: 14,
            color: WHITE, fontSize: 20, fontWeight: 800,
            letterSpacing: "-0.02em",
            textShadow: "0 1px 8px rgba(0,0,0,0.4)",
          }}>
            {photo.title}
          </div>
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 12, right: 12,
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(0,0,0,0.45)", border: "none",
              color: WHITE, fontSize: 18, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              lineHeight: 1, backdropFilter: "blur(4px)",
            }}
          >×</button>
        </div>

        <div style={{ padding: "20px 28px 28px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 12, color: photo.accent, fontWeight: 600, marginBottom: 14,
          }}>
            <LocationIcon color={photo.accent}/>
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
      <div style={{ height: 200, position: "relative", overflow: "hidden" }}>
        <img
          src={photo.image}
          alt={photo.title}
          style={{
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center top",
            display: "block",
            transition: "transform 0.4s ease",
            transform: hovered ? "scale(1.06)" : "scale(1)",
          }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.45) 100%)",
        }}/>
        <div style={{
          position: "absolute", inset: 0,
          background: photo.accent,
          opacity: hovered ? 0.18 : 0.08,
          transition: "opacity 0.3s ease",
        }}/>
        <div style={{
          position: "absolute", top: 12, left: 12,
          background: "rgba(255,255,255,0.92)",
          border: `1px solid ${photo.accent}33`,
          color: photo.accent,
          fontSize: 9, fontWeight: 700, letterSpacing: "0.07em",
          padding: "4px 10px", borderRadius: 100, textTransform: "uppercase",
          backdropFilter: "blur(4px)",
        }}>
          Philippine Red Cross
        </div>
        <div style={{
          position: "absolute", bottom: 12, right: 12,
          background: photo.accent, color: "#fff",
          fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
          padding: "4px 12px", borderRadius: 100, textTransform: "uppercase",
        }}>
          {photo.tagLabel}
        </div>
        {hovered && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{
              background: WHITE, color: photo.accent,
              fontSize: 12, fontWeight: 700, padding: "8px 20px",
              borderRadius: 100, letterSpacing: "0.05em",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
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
          <LocationIcon color={photo.accent}/>
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