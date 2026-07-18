import React from 'react';
import { Head, Link } from '@inertiajs/react';
import SiteNavbar from './SiteNavbar';

const RED = "#ff0000";

// Replace this with your own base64 image (same pattern as GORDON_PHOTO /
// PANG_PHOTO in MeetTheTeam.jsx) — e.g. the crowd/volunteers photo from
// your screenshot. Leave it empty ("") to fall back to a plain dark hero.
const MOVEMENT_PHOTO = "/images/training-hero.jpg";

// Portrait of Jean Henry Dunant — replace with your own base64 image
// (same pattern as GORDON_PHOTO / PANG_PHOTO in MeetTheTeam.jsx).
// Leave empty ("") to hide the photo and show text only.
const DUNANT_PHOTO = "data:image/jpeg;base64,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";

export default function Movement() {
  return (
    <>
      <Head title="The Movement - Philippine Red Cross" />
      <div style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>

        <SiteNavbar />

        {/* HERO BANNER */}
        <div style={{
          marginTop: 92, position: 'relative', height: 360,
          overflow: 'hidden', background: '#1a1a1a',
        }}>
          {MOVEMENT_PHOTO && (
            <>
              <img src={MOVEMENT_PHOTO} alt=""
                style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%',
                  objectFit: 'cover',
                }} />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(rgba(255,0,0,0.25), rgba(255,0,0,0.25))',
              }} />
            </>
          )}
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <h1 style={{
              fontSize: 64, fontWeight: 900, color: '#fff', margin: 0,
              fontFamily: 'Inter, sans-serif', letterSpacing: '0.02em',
              textShadow: '0 2px 16px rgba(0,0,0,0.45)', textAlign: 'center',
            }}>
              ABOUT RED CROSS
            </h1>
          </div>
        </div>

        {/* BREADCRUMB */}
        <div style={{
          padding: '20px 60px', fontFamily: 'Inter, sans-serif',
          fontSize: 13, fontWeight: 700, letterSpacing: '0.03em',
        }}>
          <Link href="/" style={{ color: '#9ca3af', textDecoration: 'none' }}>HOME</Link>
          <span style={{ color: '#d1d5db', margin: '0 10px' }}>/</span>
          <span style={{ color: RED }}>THE MOVEMENT</span>
        </div>

        {/* MAIN CONTENT */}
        <main style={{ padding: '20px 60px 80px', maxWidth: 900, margin: '0 auto' }}>
          <h1 style={{
            fontSize: 44, fontWeight: 900, color: RED, margin: '20px 0 48px',
            fontFamily: 'Inter, sans-serif', letterSpacing: '-0.01em',
          }}>
            The Movement
          </h1>

          <div style={{
            width: 80, height: 3, background: '#e5e7eb', marginBottom: 40,
          }} />

          <h2 style={{
            fontSize: 28, fontWeight: 800, color: RED,
            fontFamily: 'Inter, sans-serif', marginBottom: 20,
            letterSpacing: '-0.01em',
          }}>
            The Birth of an Idea
          </h2>

          <p style={{
            fontSize: 17, color: '#222', lineHeight: 1.85,
            margin: '0 0 24px', fontFamily: 'Georgia, serif',
          }}>
            The Red Cross idea was born in 1859, when Jean Henry Dunant, a young Swiss businessman,
            came upon the scene of a bloody battle in Solferino, Italy, between the armies of
            imperial Austria and the Franco-Sardinian alliance. Some 40,000 men lay dead or dying
            on the battlefield and the wounded were lacking medical attention.
          </p>

          <p style={{
            fontSize: 17, color: '#222', lineHeight: 1.85,
            margin: '0 0 24px', fontFamily: 'Georgia, serif',
          }}>
            Dunant organized local people to bind the soldiers' wounds and to feed and comfort
            them. On his return, he called for the creation of national relief societies to assist
            those wounded in war, and pointed the way to the future Geneva Conventions. "Would
            there not be some means, during a period of peace and calm, of forming relief societies
            whose object would be to have the wounded cared for in time of war by enthusiastic,
            devoted volunteers, fully qualified for the task?" he wrote.
          </p>

          <p style={{
            fontSize: 17, color: '#222', lineHeight: 1.85,
            margin: 0, fontFamily: 'Georgia, serif',
          }}>
            The Red Cross was born in 1863 when five Geneva men, including Dunant, set up the
            International Committee for Relief to the Wounded, later to become the International
            Committee of the Red Cross. Its emblem was a red cross on a white background: the
            inverse of the Swiss flag. The following year, 12 governments adopted the first Geneva
            Convention; a milestone in the history of humanity, offering care for the wounded, and
            defining medical services as "neutral" on the battlefield.
          </p>

          {/* JEAN HENRY DUNANT SECTION */}
          <div style={{
            display: 'flex', gap: 32, alignItems: 'flex-start',
            margin: '56px 0',
          }}>
            {DUNANT_PHOTO && (
              <img src={DUNANT_PHOTO} alt="Jean Henry Dunant"
                style={{
                  width: 220, height: 260, objectFit: 'cover',
                  flexShrink: 0, border: '1px solid #e5e7eb',
                }} />
            )}
            <div>
              <h2 style={{
                fontSize: 22, fontWeight: 800, color: '#000000',
                fontFamily: 'Inter, sans-serif', marginBottom: 16,
                letterSpacing: '0.01em', textTransform: 'uppercase',
              }}>
                Jean Henry Dunant – The Destiny of the Red Cross
              </h2>
              <p style={{
                fontSize: 16, color: '#222', lineHeight: 1.8,
                margin: 0, fontFamily: 'Inter, sans-serif',
              }}>
                Jean-Henry Dunant was born on 8 May 1828 in Geneva to a middle-class Calvinist
                family. His early initiatives included participating in the creation of the
                Young Men's Christian Association (YMCA) in 1852 and the World Alliance of
                YMCAs in 1855.
              </p>
            </div>
          </div>

          {/* INTERNATIONAL MOVEMENT SECTION */}
          <div style={{ marginTop: 56 }}>
            <h2 style={{
              fontSize: 22, fontWeight: 800, color: '#000000',
              fontFamily: 'Inter, sans-serif', marginBottom: 16,
              letterSpacing: '0.01em', textTransform: 'uppercase',
            }}>
              The International Red Cross and Red Crescent Movement (
              <a href="https://www.ifrc.org" target="_blank" rel="noopener noreferrer"
                style={{ color: '#000000', textDecoration: 'none' }}>
                www.ifrc.org
              </a>
              )
            </h2>
            <p style={{
              fontSize: 16, color: '#222', lineHeight: 1.8,
              margin: '0 0 20px', fontFamily: 'Inter, sans-serif',
            }}>
              The International Red Cross and Red Crescent Movement is the world's largest
              humanitarian network. The Movement is neutral and impartial, and provides
              protection and assistance to people affected by disasters and conflicts.
            </p>
            <p style={{
              fontSize: 16, color: '#222', lineHeight: 1.8,
              margin: 0, fontFamily: 'Inter, sans-serif',
            }}>
              The Movement is made up of nearly 100 million members, volunteers and supporters
              in 190 National Societies. It has three main components:
            </p>
            <ul style={{
              fontSize: 16, color: '#000000', lineHeight: 1.8,
              margin: '16px 0 20px', paddingLeft: 24, fontFamily: 'Inter, sans-serif',
            }}>
              <li>The International Committee of the Red Cross (ICRC)</li>
              <li>The International Federation of Red Cross and Red Crescent Movement (IFRC)</li>
              <li>190 member Red Cross and Red Crescent Societies</li>
            </ul>
            <p style={{
              fontSize: 16, color: '#000000', lineHeight: 1.8,
              margin: '0 0 20px', fontFamily: 'Inter, sans-serif',
            }}>
              As partners, the different members of the Movement support communities in becoming
              stronger and safer through a variety of development projects and humanitarian
              activities. The Movement also works in cooperation with governments, donors and
              other aid organizations to assist vulnerable people around the world.
            </p>
            <p style={{
              fontSize: 16, color: '#222', lineHeight: 1.8,
              margin: 0, fontFamily: 'Inter, sans-serif',
            }}>
              The ICRC, the Federation and the National Societies are independent bodies. Each
              has its own individual status and exercises no authority over the others.
            </p>
          </div>

          {/* ICRC SECTION */}
          <div style={{ marginTop: 56 }}>
            <h2 style={{
              fontSize: 22, fontWeight: 800, color: '#000000',
              fontFamily: 'Inter, sans-serif', marginBottom: 16,
              letterSpacing: '0.01em', textTransform: 'uppercase',
            }}>
              The International Committee of the Red Cross (ICRC) (
              <a href="https://www.icrc.org" target="_blank" rel="noopener noreferrer"
                style={{ color: '#111', textDecoration: 'none' }}>
                www.icrc.org
              </a>
              )
            </h2>
            <p style={{
              fontSize: 16, color: '#222', lineHeight: 1.8,
              margin: '0 0 20px', fontFamily: 'Inter, sans-serif',
            }}>
              The International Committee of the Red Cross (ICRC) is an impartial, neutral and
              independent organization whose exclusive humanitarian mission is to protect the
              lives and dignity of victims of war and internal violence and to provide them with
              assistance.
            </p>
            <p style={{
              fontSize: 16, color: '#222', lineHeight: 1.8,
              margin: '0 0 20px', fontFamily: 'Inter, sans-serif',
            }}>
              During situations of armed conflict, the ICRC is responsible for directing and
              coordinating the Movement's international relief activities. It also promotes the
              importance of international humanitarian law and draws attention to universal
              humanitarian principles.
            </p>
            <p style={{
              fontSize: 16, color: '#222', lineHeight: 1.8,
              margin: '0 0 20px', fontFamily: 'Inter, sans-serif',
            }}>
              As the custodian of the Geneva Conventions, the ICRC has a permanent mandate under
              international law to visit prisons, organize relief operations, reunite separated
              families and undertake other humanitarian activities during armed conflicts.
            </p>
            <p style={{
              fontSize: 16, color: '#222', lineHeight: 1.8,
              margin: 0, fontFamily: 'Inter, sans-serif',
            }}>
              The ICRC also works to meet the needs of internally displaced persons, raise
              public awareness of the dangers of mines and explosive remnants of war and trace
              people who have gone missing during conflicts.
            </p>
          </div>

          {/* ICRC IN THE PHILIPPINES SUBSECTION */}
          <div style={{ marginTop: 40 }}>
            <h3 style={{
              fontSize: 19, fontWeight: 800, color: RED,
              fontFamily: 'Inter, sans-serif', marginBottom: 16,
              letterSpacing: '0.01em',
            }}>
              The ICRC in the Philippines
            </h3>
            <p style={{
              fontSize: 16, color: '#222', lineHeight: 1.8,
              margin: '0 0 20px', fontFamily: 'Inter, sans-serif',
            }}>
              The ICRC established a permanent presence in the Philippines in 1982, although the
              organization had been active in the country since 1959. The ICRC delegation in
              Manila currently focuses its humanitarian response on isolated areas of the country
              suffering from the often chronic consequences of long-running armed conflicts.
            </p>
            <p style={{
              fontSize: 16, color: '#222', lineHeight: 1.8,
              margin: '0 0 20px', fontFamily: 'Inter, sans-serif',
            }}>
              Throughout decades of internal armed conflict in the Philippines, the ICRC has
              visited detainees across the country, particularly those individuals held in
              relation to armed conflicts. The organization monitors the conditions of detention
              and treatment of detainees.
            </p>
            <p style={{
              fontSize: 16, color: '#000000', lineHeight: 1.8,
              margin: '0 0 20px', fontFamily: 'Inter, sans-serif',
            }}>
              Today, the ICRC's delegation is based in Makati City with subdelegations covering
              Mindanao and Luzon/Visayas regions.
            </p>
            <p style={{
              fontSize: 16, color: '#000000', lineHeight: 1.8,
              margin: 0, fontFamily: 'Inter, sans-serif',
            }}>
              Read more about the work of the ICRC in the Philippines at{' '}
              <a href="https://www.icrc.org/ph" target="_blank" rel="noopener noreferrer"
                style={{ color: RED, fontWeight: 700, textDecoration: 'none' }}>
                www.icrc.org/ph
              </a>
              .
            </p>
          </div>
        </main>

        {/* JOIN CTA */}
        <section style={{
          position: 'relative',
          padding: '110px 24px',
          textAlign: 'center',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(/images/gallery/icrc-philippines.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }} />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255,255,255,0.85)',
          }} />
          <div style={{ position: 'relative', maxWidth: '720px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '44px',
              fontWeight: '800',
              color: '#ff0000',
              fontFamily: 'Georgia, serif',
              margin: '0 0 20px',
            }}>
              Save Lives. Join the Red Cross.
            </h2>
            <p style={{
              fontSize: '16px',
              lineHeight: 1.7,
              color: '#000000',
              fontFamily: 'Inter, sans-serif',
              margin: '0 0 36px',
            }}>
              We take pride in urging all Filipinos to take part in the heroism of the Philippine
              Red Cross by becoming a full-fledged member, volunteer, or donor.
            </p>
            <Link href="/register" style={{
              display: 'inline-block',
              background: RED,
              color: 'white',
              textDecoration: 'none',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: '700',
              letterSpacing: '0.06em',
              padding: '16px 44px',
              borderRadius: '100px',
            }}>
              JOIN US
            </Link>
          </div>
        </section>
 {/* FOOTER */}
                <div style={{ background: '#1e3a8a', padding: '18px 80px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: 700, letterSpacing: '0.3px' }}>
                        © 2026 Philippine Red Cross – Muntinlupa City Branch. All rights reserved.
                    </span>
                </div>
            </div>
        </>
    );
}
