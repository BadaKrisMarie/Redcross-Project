import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function MissionVision() {
    return (
        <>
            <Head title="Our Mission & Vision" />
            <div style={{
                minHeight: '100vh', background: '#f4f5f7',
                fontFamily: "'monserrat, monserratf",
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '60px 24px',
            }}>

                {/* MISSION CARD */}
                <div style={{
                    background: '#ff0000', borderRadius: 16, overflow: 'hidden',
                    maxWidth: 460, width: '100%',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
                    padding: '32px 28px 24px',
                }}>
                    {/* LOGO */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%',
                            background: 'white', border: '3px solid #1A1464',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            position: 'relative',
                        }}>
                            <span style={{ color: '#ff0000', fontSize: 30, fontWeight: 900, lineHeight: 1 }}>+</span>
                        </div>
                    </div>

                    {/* PRC MISSION BADGE */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                        <div style={{
                            border: '1.5px solid rgba(255,255,255,0.7)', borderRadius: 100,
                            padding: '5px 22px',
                        }}>
                            <span style={{
                                color: 'white', fontSize: 12, fontWeight: 700,
                                letterSpacing: '0.18em', textTransform: 'uppercase',
                            }}>PRC Mission</span>
                        </div>
                    </div>

                    {/* WHITE QUOTE BOX */}
                    <div style={{
                        background: 'white', border: '4px solid #1A1464', borderRadius: 14,
                        padding: '28px 22px', marginBottom: 18,
                    }}>
                        <p style={{
                            margin: 0, textAlign: 'center', color: '#1A1464',
                            fontSize: 20, fontWeight: 700, lineHeight: 1.5,
                        }}>
                            We act with dispatch to ensure we reach the most vulnerable people and communities so that they will be enabled and ennobled.
                        </p>
                    </div>

                    {/* TAGLINE FOOTER */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            fontSize: 10, color: 'rgba(255,255,255,0.8)',
                            letterSpacing: '0.1em', fontWeight: 700, textTransform: 'uppercase',
                            marginBottom: 6,
                        }}>
                            Volunteer · Logistics · Information · Technology · A Red Cross that is
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
                            {['ALWAYS FIRST', 'ALWAYS READY', 'ALWAYS THERE'].map(t => (
                                <span key={t} style={{
                                    color: 'white', fontWeight: 900, fontSize: 13,
                                    letterSpacing: '0.04em',
                                }}>{t}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* VISION SECTION (placeholder — replace with actual PRC vision text) */}
                <div style={{
                    background: 'white', borderRadius: 16, maxWidth: 460, width: '100%',
                    marginTop: 28, padding: '28px 28px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                    border: '1px solid #eee',
                }}>
                    <div style={{
                        fontSize: 11, fontWeight: 700, letterSpacing: '0.15em',
                        textTransform: 'uppercase', color: '#ff0000', marginBottom: 10,
                        textAlign: 'center',
                    }}>
                        Our Vision
                    </div>
                    <p style={{
                        margin: 0, textAlign: 'center', color: '#374151',
                        fontSize: 15, lineHeight: 1.7,
                    }}>
                        A leading humanitarian organization committed to bringing timely, effective, and meaningful
                        assistance to the most vulnerable, guided by the Fundamental Principles of the
                        Red Cross and Red Crescent Movement.
                    </p>
                </div>

                <Link href="/" style={{
                    marginTop: 36, color: '#ff0000', textDecoration: 'none',
                    fontSize: 14, fontWeight: 700,
                }}>
                    ← Back to Home
                </Link>
            </div>
        </>
    );
}
