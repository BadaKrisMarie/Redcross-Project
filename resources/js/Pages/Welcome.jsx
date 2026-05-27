import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';

const RED = "#C8102E";
const NAVY = "#1A1464";
const WHITE = "#FFFFFF";

const STRIPE_BG = `repeating-linear-gradient(
  -45deg,
  rgba(200,16,46,0.04) 0px,
  rgba(200,16,46,0.04) 1px,
  transparent 1px,
  transparent 12px
)`;

const aboutItems = [
    { label: 'Who We Are',  desc: 'Our story & background' },
    { label: 'Our Mission', desc: 'Vision, mission & values' },
    { label: 'Our Team',    desc: 'Meet our volunteers' },
    { label: 'Our History', desc: 'Years of service' },
];

const contactItems = [
    { label: 'Get in Touch', desc: 'Send us a message' },
    { label: 'Email Us',     desc: 'rizalmuntinlupa@redcross.org.ph' },
    { label: 'Call Us',      desc: 'Hotline & emergency numbers' },
    { label: 'Visit Us',     desc: 'Muntinlupa City Branch' },
];

const tooltipBox = {
    position: 'absolute', top: 'calc(100% + 10px)', left: '50%',
    transform: 'translateX(-50%)',
    background: '#1a1a1a', borderRadius: 8,
    padding: '10px 14px', minWidth: 190, zIndex: 200,
    pointerEvents: 'none',
};

const arrowStyle = {
    position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)',
    borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
    borderBottom: '6px solid #1a1a1a',
};

function JoinBanner() {
  const [hover, setHover] = useState(false);
  return (
    <div style={{
      background: NAVY, borderRadius: 0, padding: "60px 60px",
      display: "flex", justifyContent: "space-between", alignItems: "center", gap: 32,
      position: "relative", overflow: "hidden", minHeight: 280,
    }}>
      <div style={{
        position: "absolute", top: -50, right: 200, width: 200, height: 200,
        borderRadius: "50%", border: "50px solid rgba(255,255,255,0.04)", pointerEvents: "none",
      }}/>
      <div style={{
        position: "absolute", top: 0, bottom: 0, left: 0, right: 0,
        background: STRIPE_BG, pointerEvents: "none",
      }}/>

      <div style={{ position: "relative" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(200,16,46,0.2)", color: "#FF9EAE",
          fontSize: 12, fontWeight: 700, letterSpacing: "0.12em",
          textTransform: "uppercase", padding: "6px 16px", borderRadius: 100,
          marginBottom: 16, border: "1px solid rgba(200,16,46,0.25)",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF9EAE", display: "inline-block" }}/>
          Join Our Team
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, color: WHITE, marginBottom: 12, letterSpacing: "-0.02em" }}>
          Make a difference in Muntinlupa.
        </div>
        <div style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.8, maxWidth: 520 }}>
          Volunteer with us and help support communities, provide aid, and create positive change — one act of kindness at a time.
        </div>
      </div>

      <Link
        href="/register"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          background: hover ? "#E0102A" : RED,
          color: WHITE, textDecoration: "none",
          padding: "14px 30px", borderRadius: 12,
          fontSize: 14, fontWeight: 700,
          whiteSpace: "nowrap", flexShrink: 0,
          transform: hover ? "scale(1.03)" : "scale(1)",
          transition: "all 0.18s ease",
          boxShadow: hover ? "0 8px 24px rgba(200,16,46,0.4)" : "0 4px 12px rgba(200,16,46,0.25)",
          display: "inline-block",
          position: "relative",
        }}
      >
        Volunteer Now →
      </Link>
    </div>
  );
}

export default function Welcome({ auth }) {
    const [openTooltip, setOpenTooltip] = useState(null);

    return (
        <>
            <Head title="Philippine Red Cross - Muntinlupa" />
            <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Source+Sans+3:ital,wght@0,300;0,400;0,600;1,300&display=swap" rel="stylesheet" />

            <div style={{ fontFamily: "'Source Sans 3', sans-serif" }}>

                {/* NAVBAR */}
                <nav style={{
                    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 48px', background: 'white',
                    borderBottom: '1px solid #f0f0f0',
                    boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
                    fontFamily: 'Inter, sans-serif'
                }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                        <div style={{
                            width: '34px', height: '34px', background: '#DC2626',
                            borderRadius: '4px', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: 'white', fontSize: '20px', fontWeight: '900'
                        }}>+</div>
                        <div>
                            <strong style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#111' }}>Rizal Chapter</strong>
                            <span style={{ display: 'block', fontSize: '10px', color: '#888' }}>Muntinlupa City Branch</span>
                        </div>
                    </Link>

                    <ul style={{ display: 'flex', alignItems: 'center', gap: '28px', listStyle: 'none', margin: 0, padding: 0 }}>
                        <li><Link href="/" style={{ color: '#555', textDecoration: 'none', fontSize: '13px' }}>Home</Link></li>

                        {/* ABOUT with tooltip */}
                        <li
                            style={{ position: 'relative' }}
                            onMouseEnter={() => setOpenTooltip('about')}
                            onMouseLeave={() => setOpenTooltip(null)}
                        >
                            <Link href="/about" style={{ color: '#555', textDecoration: 'none', fontSize: '13px' }}>About</Link>
                            {openTooltip === 'about' && (
                                <div style={tooltipBox}>
                                    <div style={arrowStyle} />
                                    {aboutItems.map((item, i) => (
                                        <div key={item.label} style={{
                                            padding: '5px 0',
                                            borderBottom: i < aboutItems.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                                        }}>
                                            <div style={{ fontSize: 13, color: i === 0 ? '#fff' : '#ccc', fontWeight: i === 0 ? 600 : 500 }}>{item.label}</div>
                                            <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>{item.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </li>

                        {/* CONTACT with tooltip */}
                        <li
                            style={{ position: 'relative' }}
                            onMouseEnter={() => setOpenTooltip('contact')}
                            onMouseLeave={() => setOpenTooltip(null)}
                        >
                            <Link href="/contact" style={{ color: '#555', textDecoration: 'none', fontSize: '13px' }}>Contact</Link>
                            {openTooltip === 'contact' && (
                                <div style={tooltipBox}>
                                    <div style={arrowStyle} />
                                    {contactItems.map((item, i) => (
                                        <div key={item.label} style={{
                                            padding: '5px 0',
                                            borderBottom: i < contactItems.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                                        }}>
                                            <div style={{ fontSize: 13, color: i === 0 ? '#fff' : '#ccc', fontWeight: i === 0 ? 600 : 500 }}>{item.label}</div>
                                            <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>{item.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </li>

                        <li>
                            <Link href={route('login')} style={{
                                background: '#DC2626', color: 'white', padding: '8px 18px',
                                borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                                textDecoration: 'none'
                            }}>Log In</Link>
                        </li>
                    </ul>
                </nav>

               {/* HERO */}
<section style={{
    position: 'relative', minHeight: '600px', overflow: 'hidden',
    background: '#1a1a1a', display: 'flex', alignItems: 'center'
}}>
    <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: "url('https://scontent.fmnl8-1.fna.fbcdn.net/v/t39.30808-6/486253255_122117910200759224_1850104524729330657_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeEw-GcRpW6cF5CDYZ9ZRKZCzVUqOFhpoWXNVSo4WGmhZdHvRS7hLlmRZAbBesLg5GtZF2pP5w207rnDSsD4mH7B&_nc_ohc=eVZESyEoYO4Q7kNvwEBArtn&_nc_oc=Ado0XUsrxF7BC6HChAYWkzAqIXZ-DonRNp8s9hd5dKnQXNTXCNQPLK2MvFg8S8wQFaQueWEYEymxkLTcW5RCws-Y&_nc_zt=23&_nc_ht=scontent.fmnl8-1.fna&_nc_gid=0wJy12mi8ditc1tsAhoFkw&_nc_ss=782a8&oh=00_Af4XeMez1nXhvjGANkLOhozhl2igOmv-c8KFBIfhOlLVmw&oe=6A1AC1F7')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    }}></div>
    <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(127,29,29,0.88) 0%, rgba(26,26,26,0.88) 60%)',
    }}></div>
    <div style={{
        position: 'absolute', inset: 0, opacity: 0.05,
        backgroundImage: 'repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #fff 0, #fff 1px, transparent 1px, transparent 40px)'
    }}></div>
    <div style={{
        position: 'absolute', right: '-40px', top: '50%',
        transform: 'translateY(-50%)', width: '500px', height: '500px',
        border: '60px solid rgba(220,38,38,0.12)', borderRadius: '50%'
    }}></div>
    <div style={{
        position: 'absolute', right: '60px', top: '50%',
        transform: 'translateY(-50%)', width: '320px', height: '320px',
        border: '1.5px solid rgba(220,38,38,0.25)', borderRadius: '50%'
    }}></div>

    <div style={{ position: 'relative', zIndex: 2, padding: '120px 48px 80px', maxWidth: '640px' }}>
        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.35)',
            color: '#fca5a5', fontSize: '11px', fontWeight: '600',
            letterSpacing: '2px', textTransform: 'uppercase',
            padding: '6px 14px', borderRadius: '100px', marginBottom: '28px',
        }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#DC2626', display: 'inline-block' }}></span>
            Volunteer Program 2026
        </div>
        <h1 style={{
            fontFamily: 'Oswald, sans-serif',
            fontSize: '76px', lineHeight: '0.95', color: 'white',
            letterSpacing: '1px', margin: '0 0 8px 0',
            fontWeight: '700', textTransform: 'uppercase'
        }}>
            <span style={{ color: '#DC2626' }}>Red Cross</span><br />
            Volunteer<br />
            Needed
        </h1>
        <p style={{
            fontSize: '16px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.75',
            maxWidth: '460px', fontWeight: '300',
            margin: '24px 0 40px 0', fontStyle: 'italic'
        }}>
            Join the Philippine Red Cross – Muntinlupa City Branch and make a difference in your community through disaster response, blood services, and emergency care.
        </p>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Link href="/about" style={{
                background: '#DC2626', color: 'white', padding: '13px 30px',
                borderRadius: '4px', fontSize: '14px', fontWeight: '600',
                textDecoration: 'none', letterSpacing: '0.5px'
            }}>Read More</Link>
            <Link href={route('register')} style={{
                color: 'rgba(255,255,255,0.75)', fontSize: '14px',
                textDecoration: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.25)', paddingBottom: '2px',
                letterSpacing: '0.3px'
            }}>Register Now →</Link>
        </div>
    </div>

    <div style={{
        position: 'absolute', bottom: '40px', right: '48px',
        display: 'flex', gap: '40px', zIndex: 2
    }}>
        {[['500+', 'Volunteers'], ['24/7', 'Response'], ['10+', 'Programs']].map(([num, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
                <div style={{
                    fontFamily: 'Oswald, sans-serif',
                    fontSize: '38px', color: 'white',
                    lineHeight: '1', fontWeight: '600'
                }}>
                    {num.includes('/') ? num : <>{num.replace('+', '')}<span style={{ color: '#DC2626' }}>+</span></>}
                </div>
                <div style={{
                    fontSize: '11px', color: 'rgba(255,255,255,0.4)',
                    marginTop: '6px', letterSpacing: '1px',
                    textTransform: 'uppercase'
                }}>{label}</div>
            </div>
        ))}
    </div>
</section>

                {/* JOIN BANNER */}
                <div style={{ padding: '48px 0' }}>
                    <JoinBanner />
                </div>

                {/* FOOTER */}
                <div style={{
                    background: '#0a0a0a', padding: '18px 48px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderTop: '1px solid rgba(255,255,255,0.06)'
                }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.3px' }}>
                        © 2026 Philippine Red Cross – Muntinlupa City Branch. All rights reserved.
                    </span>
                </div>
            </div>
        </>
    );
}
