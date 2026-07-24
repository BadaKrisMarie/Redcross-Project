import React from 'react';
import { Head } from '@inertiajs/react';
import SiteNavbar from './SiteNavbar';

const BRANCH_ADDRESS =
  'GF Red Cross Center, Centennial Lane, Filinvest Corporate City, Alabang, Muntinlupa City 1780';
const BRANCH_PHONE = '+63 917 322 8143';

export default function GetInTouch() {
  const mapEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    'Philippine Red Cross Rizal Chapter Muntinlupa City Branch, ' + BRANCH_ADDRESS
  )}&output=embed`;

  return (
    <>
      <Head title="Get in Touch" />
      <SiteNavbar />

      <div
        style={{
          fontFamily: 'monserrat, monserrat',
          paddingTop: '92px',
          background: '#F3F4F6',
          minHeight: '100vh',
        }}
      >
        {/* PAGE HEADER */}
        <div
          style={{
            background: '#ff0000',
            color: 'white',
            padding: '48px 24px 36px',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: '32px', fontWeight: '800', margin: 0 }}>
            Get in Touch
          </h1>
          <p style={{ marginTop: '8px', color: 'rgba(255,255,255,0.85)', fontSize: '15px' }}>
            Philippine Red Cross &mdash; Rizal Chapter, Muntinlupa City Branch
          </p>
        </div>

        {/* MAP + INFO CONTAINER */}
        <div
          style={{
            maxWidth: '900px',
            margin: '0 auto',
            padding: '32px 20px 60px',
          }}
        >
          {/* EMBEDDED MAP */}
          <div
            style={{
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              border: '1px solid #E5E7EB',
            }}
          >
            <iframe
              title="Philippine Red Cross Muntinlupa City Branch Map"
              src={mapEmbedSrc}
              width="100%"
              height="360"
              style={{ border: 0, display: 'block' }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* CARDS */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '20px',
              marginTop: '24px',
            }}
          >
            {/* ADDRESS CARD */}
            <div
              style={{
                flex: '1 1 280px',
                background: '#1F2937',
                borderRadius: '12px',
                padding: '24px',
                color: 'white',
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: '#ff0000',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                }}
              >
                
              </div>
              <div>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    letterSpacing: '0.06em',
                    color: 'rgba(255,255,255,0.6)',
                    marginBottom: '8px',
                  }}
                >
                  ADDRESS
                </div>
                <div style={{ fontSize: '16px', fontWeight: '700', lineHeight: '1.5' }}>
                  {BRANCH_ADDRESS}
                </div>
              </div>
            </div>

            {/* HOTLINE CARD */}
            <div
              style={{
                flex: '1 1 280px',
                background: '#1F2937',
                borderRadius: '12px',
                padding: '24px',
                color: 'white',
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: '#ff0000',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                }}
              >
                
              </div>
              <div>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    letterSpacing: '0.06em',
                    color: 'rgba(255,255,255,0.6)',
                    marginBottom: '8px',
                  }}
                >
                  BRANCH HOTLINE
                </div>
                <a
                  href={`tel:${BRANCH_PHONE.replace(/\s/g, '')}`}
                  style={{
                    fontSize: '20px',
                    fontWeight: '800',
                    color: 'white',
                    textDecoration: 'none',
                  }}
                >
                  {BRANCH_PHONE}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}