import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import SiteNavbar from './SiteNavbar';

const RED = '#ff0000';
const HERO_IMAGE = '/images/training-hero.jpg';

const faqs = [
  {
    question: 'HOW OFTEN CAN A PERSON DONATE?',
    answer: 'A healthy individual may donate every three months.',
    red: false,
  },
  {
    question: 'WILL DONATING BLOOD MAKE A PERSON WEAK?',
    answer: 'No, it will not make you weak. Donating 450cc will not cause any ill effects or weakness. The human body has the capacity to compensate for the new fluid volume. Further, the bone marrow is stimulated to produce new blood cells which in turn makes the blood-forming organs function more effectively.',
    red: false,
  },
  {
    question: 'CAN A PERSON WHO HAS A TATTOO OR BODY PIERCING STILL DONATE BLOOD?',
    answer: 'If the tattooing procedure or the piercing was done a year ago, he/she may donate. This is also applicable to acupuncture, and other procedures involving needles.',
    red: false,
  },
  {
    question: 'HOW LONG WILL IT TAKE TO DONATE BLOOD?',
    answer: 'The whole process of blood donation, from the registration up to the recovery, will only take an average of 30 minutes. The blood extraction will take about 5-10 minutes. The blood volume will start replenishing within 24 hours. Theoretically, by the end of the month, the body will have the blood status before the blood donation.',
    red: false,
  },
  {
    question: 'WILL I CONTRACT THE DISEASE THROUGH BLOOD DONATION?',
    answer: 'No, we use sterile, disposable needles and syringes.',
    red: false,
  },
];

const mainCenters = [
  { name: 'NATIONAL BLOOD CENTER (PRC TOWER)', details: { address: 'Bloodbank, 3rd Floor, PRC Tower, 37 EDSA corner Boni Avenue, Mandaluyong City', phone: '(02) 8790-2300', hours: 'Monday to Sunday, 24 hours' } },
  { name: 'NATIONAL BLOOD CENTER (MANILA)', details: { address: 'Philippine Red Cross, Bloodbank, 1000 Batangas Street, Sta. Ana, Manila', phone: '(02) 8563-3481', hours: 'Monday to Sunday, 24 hours' } },
  { name: 'EASTERN VISAYAS REGIONAL BLOOD CENTER', details: { address: 'PRC Leyte Chapter, Bloodbank, Magsaysay Boulevard, Tacloban City', phone: '(053) 321-3726', hours: 'Monday to Sunday, 24 hours' } },
  { name: 'WESTERN VISAYAS REGIONAL BLOOD CENTER', details: { address: 'PRC Iloilo Chapter, Bloodbank, Quezon Street, Iloilo City', phone: '(033) 337-4946', hours: 'Monday to Sunday, 24 hours' } },
  { name: 'MINDANAO REGIONAL BLOOD CENTER', details: { address: 'PRC Davao Chapter, Bloodbank, San Pedro Street, Davao City', phone: '(082) 221-4591', hours: 'Monday to Sunday, 24 hours' } },
  { name: 'RIZAL CHAPTER — MUNTINLUPA CITY BRANCH', details: { address: 'Muntinlupa City Hall Compound, National Road, Tunasan, Muntinlupa City', phone: '0917 322 8143', email: 'rizalmuntinlupa@redcross.org.ph', hours: 'Monday to Friday, 8:00 AM – 5:00 PM' } },
];

const northernLuzonChapters = [
  'ALAMINOS CITY-WESTERN PANGASINAN', 'BAGUIO CITY', 'BATAAN', 'BENGUET',
  'BULACAN-BALIWAG', { name: 'BULACAN-MALOLOS', red: true }, 'BULACAN-MARILAO',
  'BULACAN-SAN RAFAEL', 'CAGAYAN', 'IFUGAO', 'ILOCOS NORTE', 'ILOCOS SUR',
  'ISABELA', 'KALINGA', 'LA UNION-SAN FERNANDO CITY', 'NUEVA ECIJA',
  'NUEVA VIZCAYA', 'OLONGAPO CITY', 'PAMPANGA', 'PAMPANGA-ANGELES CITY',
  'PANGASINAN-DAGUPAN CITY-SAN CARLOS CITY', 'PANGASINAN-URDANETA CITY',
  'QUIRINO', { name: 'SANTIAGO CITY', red: true }, 'TARLAC', 'ZAMBALES',
];

const ncrChapters = [
  'CALOOCAN CITY', 'MAKATI', 'MUNTINLUPA', 'PASAY CITY',
  'QUEZON CITY', 'RIZAL-MAIN', 'RIZAL-EAST', { name: 'VALENZUELA CITY', red: true },
];

const southernTagalogChapters = [
  'BATANGAS', 'CAVITE', 'CAVITE-DASMARINAS', { name: 'LAGUNA', red: true },
  'LAGUNA-CALAMBA', 'LAGUNA-STA. CRUZ', 'LAGUNA-STA. ROSA', 'LAGUNA-SINILOAN',
  'OCCIDENTAL MINDORO', 'PALAWAN', 'QUEZON-LUCENA', 'ROMBLON', 'SAN PABLO CITY',
];

const bicolChapters = [
  'ALBAY-LEGASPI CITY', 'CAMARINES SUR', 'CATANDUANES', 'MASBATE',
];

const visayasChapters = [
  'AKLAN', 'ANTIQUE', 'BOHOL', 'CAPIZ', 'CEBU-BOGO CITY', 'CEBU-MANDAUE CITY',
  'EASTERN SAMAR', 'GUIMARAS', 'LAPU-LAPU CITY', 'LEYTE',
  'NEGROS OCCIDENTAL \u2013BACOLOD CITY', 'NEGROS ORIENTAL', 'NORTHERN SAMAR',
  'ORMOC CITY', 'PASSI CITY', 'SOUTHERN LEYTE',
];

const mindanaoChapters = [
  'AGUSAN DEL NORTE-BUTUAN CITY', 'AGUSAN DEL SUR', 'BUKIDNON', 'COTABATO',
  'DAVAO CITY', 'DAVAO DEL NORTE', 'DAVAO DEL SUR', 'DAVAO ORIENTAL',
  { name: 'GENERAL SANTOS', red: true }, 'GINGOOG CITY', 'ILIGAN CITY',
  'OZAMIS', 'SOUTH COTABATO', 'SULTAN KUDARAT PROVINCE-TACURONG CITY CHAPTER',
  'SULU', 'SURIGAO DEL NORTE', 'SURIGAO DEL SUR', 'TANGUB CITY',
  'ZAMBOANGA CITY', 'ZAMBOANGA DEL NORTE',
  'ZAMBOANGA DEL SUR \u2013PAGADIAN CITY', 'ZAMBOANGA -SIBUGAY SUB-CHAPTER',
];

function AccordionItem({ question, answer, red, name, details }) {
  const [open, setOpen] = useState(false);
  const label = question || name;

  return (
    <div style={{
      border: '1px solid #e5e7eb', borderRadius: 6,
      marginBottom: 10, background: open ? 'white' : '#f5f5f5',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '16px 20px',
          background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left', gap: 16,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: red ? RED : '#555', letterSpacing: '0.04em', lineHeight: 1.4 }}>
          {label}
        </span>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', background: RED,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, color: 'white', fontSize: 18, fontWeight: 700,
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
        }}>+</div>
      </button>

      {open && (
        <div style={{ padding: '4px 20px 18px', borderTop: '1px solid #e5e7eb' }}>
          {/* FAQ answer */}
          {answer && (
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, margin: 0 }}>{answer}</p>
          )}
          {/* Blood center details */}
          {details && (
            <>
              {details.address && <div style={{ marginBottom: 10 }}><div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>Address</div><div style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{details.address}</div></div>}
              {details.phone && <div style={{ marginBottom: 10 }}><div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>Phone</div><div style={{ fontSize: 14, color: '#374151' }}>{details.phone}</div></div>}
              {details.email && <div style={{ marginBottom: 10 }}><div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>Email</div><div style={{ fontSize: 14, color: RED }}>{details.email}</div></div>}
              {details.hours && <div><div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>Hours</div><div style={{ fontSize: 14, color: '#374151' }}>{details.hours}</div></div>}
            </>
          )}
          {/* Chapter placeholder */}
          {!answer && !details && (
            <p style={{ fontSize: 14, color: '#9ca3af', fontStyle: 'italic', margin: 0 }}>Contact details coming soon.</p>
          )}
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <>
      <h2 style={{ fontSize: 38, fontWeight: 800, color: RED, marginBottom: 12, fontFamily: 'monserrat, monserrat' }}>
        {children}
      </h2>
      <div style={{ width: 80, height: 2, background: '#ccc', marginBottom: 32 }} />
    </>
  );
}

export default function GiveBlood() {
  const [showNCR, setShowNCR] = useState(false);
  return (
    <>
      <Head title="Give Blood - Philippine Red Cross" />
      <div style={{ fontFamily: "'monserrat', 'monserrat'", margin: 0, padding: 0 }}>

        <SiteNavbar />
        {/* FULL-BLEED HERO BANNER */}
        <div style={{
          marginTop: 56, position: 'relative', height: 380,
          overflow: 'hidden', background: '#1a1a1a',
          width: '100vw', marginLeft: 'calc(50% - 50vw)',
        }}>
          <img src={HERO_IMAGE} alt="Give Blood"
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover',
            }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(255,0,0,0.25), rgba(255,0,0,0.25))' }} />
          <div style={{
            position: 'absolute', left: '5%', right: '5%', bottom: 40, zIndex: 2,
          }}>
            <h1 style={{
              fontSize: 56, fontWeight: 800, color: '#fff', margin: 0,
              fontFamily: 'monserrat, monserrat', letterSpacing: '-0.01em',
              lineHeight: 1.15, textShadow: '0 2px 12px rgba(0,0,0,0.35)',
              maxWidth: 900,
            }}>
              Give Blood. Save Lives.
            </h1>
          </div>
        </div>

        <div style={{ marginTop: 56, paddingTop: 60, paddingLeft: 80, paddingRight: 80, paddingBottom: 0, width: '100%', boxSizing: 'border-box' }}>

          {/* SECTION 1: HOW TO DONATE */}
          <SectionTitle>How to Donate</SectionTitle>
          <div style={{ marginBottom: 64 }}>
            {faqs.map((faq, i) => (
              <AccordionItem key={i} question={faq.question} answer={faq.answer} red={faq.red} />
            ))}
          </div>

          {/* SECTION 2: BLOOD BANK LOCATOR */}
          <SectionTitle>Blood Bank Locator</SectionTitle>
          <div style={{ marginBottom: 40 }}>
            {mainCenters.map((c, i) => (
              <AccordionItem key={i} name={c.name} details={c.details} />
            ))}
          </div>

          
        </div>

        {/* PROGRAMS SECTION */}
        <div style={{ paddingTop: '20px', paddingLeft: 80, paddingRight: 80, paddingBottom: '60px', width: '100%', boxSizing: 'border-box' }}>
          <h2 style={{ fontSize: 38, fontWeight: 800, color: RED, marginBottom: 12, fontFamily: 'monserrat, monserrat' }}>
            Programs
          </h2>
          <div style={{ width: 80, height: 2, background: '#ccc', marginBottom: 36 }} />

          {[
            {
              title: 'DONOR RECRUITMENT AND RETENTION',
              text: 'To meet the increasing demand for blood and augment the national blood requirement, the PRC conducts education and recruitment sessions to encourage regular voluntary blood donations from communities, different companies, organizations, colleges and universities nationwide.',
            },
            {
              title: 'BLOOD COLLECTION',
              text: 'With different PRC blood service facilities strategically located in the entire country, the PRC collects blood from voluntary, non-remunerated blood donors with their donations accounting to almost 50% share of the nation\'s blood supply.',
            },
            {
              title: 'BLOOD COMPONENT PROCESSING',
              text: 'Whole blood donations are separated into components using a special equipment to generate one unit each of red blood cells, plasma and platelets. Thus, one donation can help save three lives.',
            },
            {
              title: 'BLOOD STORAGE AND ISSUANCE',
              text: 'Once blood is suitable for transfusion, blood is stored in a temperature controlled blood bank refrigerator. Clients or patients needing blood for transfusion may request from any PRC blood facilities upon presentation of blood request form issued by the hospital or physician.',
            },
            {
              title: 'BLOOD SAMARITAN PROGRAM',
              text: 'The Blood Samaritan Program is aimed mainly to assist indigent patients needing blood transfusion. The PRC seeks kind-hearted individuals/groups that are willing to give financial donations to support the blood needs of the indigents. The donated money covers the payment of blood processing fees of legitimate indigent patients.',
            },
            {
              title: 'BLOOD DONOR RECOGNITION',
              text: 'We have instituted different awards to recognize and thank individuals and different groups who untiringly help us attain our mission. Blood Galloner pins, certificates, medals and plaques are some of the tokens we issue during the annual Blood Donors Recognition Ceremony held every month July in celebration of the Blood Donors Month.',
            },
          ].map((item, i) => (
            <div key={i} style={{ marginBottom: 36 }}>
              <h3 style={{
                fontSize: 14, fontWeight: 800, color: '#6b7280',
                letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12,
              }}>{item.title}</h3>
              <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.8, margin: 0 }}>{item.text}</p>
            </div>
          ))}
        </div>

        {/* SAVE LIVES BANNER */}
        <div style={{
          position: 'relative', padding: '32px 40px',
          background: '#f5f5f5', textAlign: 'center',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{
              fontSize: 48, fontWeight: 800, color: '#ff0000',
              marginBottom: 16, fontFamily: 'monserrat, monserrat',
            }}>
              Save Lives. Join the Red Cross.
            </h2>
            <p style={{ fontSize: 15, color: '#6b7280', maxWidth: 560, margin: '0 auto 32px', lineHeight: 1.7 }}>
              We take pride in urging all Filipinos to take part in the heroism of the Philippine Red Cross by becoming a full-fledged member, volunteer, or donor.
            </p>
            <a href="/register" style={{
              display: 'inline-block',
              background: RED, color: 'white', textDecoration: 'none',
              padding: '14px 40px', borderRadius: 100,
              fontSize: 14, fontWeight: 800, letterSpacing: '0.08em',
            }}>JOIN US</a>
          </div>
        </div>

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




















