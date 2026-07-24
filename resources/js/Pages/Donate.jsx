import React from 'react';
import { Head, Link } from '@inertiajs/react';
import SiteNavbar from './SiteNavbar';

const RED = "#ff0000";

function SectionLabel({ icon, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 26 }}>{icon}</span>
        <h2 style={{ margin: 0, color: RED, fontSize: 26, fontWeight: 700 }}>{children}</h2>
      </div>
      <div style={{ width: 60, height: 2, background: '#ccc' }} />
    </div>
  );
}

function BankCard({ bankName, bankColor, logoSrc, displayName, peso, dollar, swift, address, savingsLabel, pesoLabel }) {
  return (
    <div style={{ minWidth: 220 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        {logoSrc && (
          <img src={logoSrc} alt={bankName} style={{ height: 24, width: 'auto', objectFit: 'contain' }} />
        )}
        <span style={{ fontSize: 20, fontWeight: 800, color: bankColor || '#003DA5' }}>{bankName}</span>
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 16 }}>{displayName}</div>
      {peso && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 14, color: '#374151' }}>{pesoLabel || 'Savings \u2013 Peso Account'}</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{peso}</div>
        </div>
      )}
      {dollar && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 14, color: '#374151' }}>Savings \u2013 Dollar Account</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{dollar}</div>
        </div>
      )}
      {swift && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 14, color: '#374151' }}>Swiftcode</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{swift}</div>
        </div>
      )}
      {address && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 14, color: '#374151' }}>Bank Address</div>
          <div style={{ fontSize: 14, color: '#111' }}>{address}</div>
        </div>
      )}
    </div>
  );
}

function QRBlock({ name, sublabel }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 130 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: '#111', marginBottom: 8 }}>{sublabel || name}</div>
      <div style={{ width: 130, height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#9ca3af', fontWeight: 600, margin: '0 auto' }}>
        QR CODE<br />/images/qr-{name.toLowerCase().replace(/\s+/g, '-')}.png
      </div>
    </div>
  );
}

function Section({ id, icon, label, bg, children }) {
  return (
    <div id={id} style={{ borderBottom: '1px solid #e5e7eb', background: bg || 'white', scrollMarginTop: 80 }}>
      <div style={{ padding: '26px 36px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <div style={{ width: 52, height: 52, borderRadius: 10, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>{icon}</div>
          <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '0.02em', color: '#111' }}>{label}</span>
        </div>
      </div>
      <div style={{ padding: '8px 36px 48px' }}>{children}</div>
    </div>
  );
}

function ContactCard({ name, role, unit, dept, org, building, address, city, lines }) {
  return (
    <div style={{ textAlign: 'center', flex: 1, minWidth: 280 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#111', lineHeight: 1.8 }}>
        {name}<br />{role}<br />{unit}<br />{dept}
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#111', lineHeight: 1.8, marginTop: 24 }}>
        {org}<br />{building}<br />{address}<br />{city}
      </div>
      <div style={{ fontSize: 15, color: '#111', lineHeight: 1.9, marginTop: 20 }}>
        {lines.map((line, i) => (
          <div key={i}>
            {line.label}: {line.href ? (
              <a href={line.href} style={{ color: '#111', textDecoration: 'underline' }}>{line.value}</a>
            ) : (
              <span style={{ textDecoration: 'underline' }}>{line.value}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickNavIcon({ href, icon, label }) {
  return (
    <a href={href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textDecoration: 'none', minWidth: 120 }}>
      <div style={{ width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: RED }}>{icon}</div>
      <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: '0.02em', color: '#6b7280', textTransform: 'uppercase', textAlign: 'center' }}>{label}</span>
    </a>
  );
}

export default function Donate() {
  return (
    <>
      <Head title="Ways to Donate - Philippine Red Cross" />
      <div style={{ fontFamily: "'monserrat', 'monserrat'" }}>

        <SiteNavbar />

        {/* HERO */}
        <section style={{
          position: 'relative', minHeight: 380, display: 'flex', alignItems: 'center',
          justifyContent: 'center', overflow: 'hidden', background: '#1a1a1a',
          marginTop: 56, width: '100vw',
          marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)',
        }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: "url('/images/training-hero.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(255,0,0,0.25), rgba(255,0,0,0.25))' }} />
          <h1 style={{ position: 'relative', zIndex: 2, color: 'white', fontWeight: 900, fontSize: 64, letterSpacing: 1, textTransform: 'uppercase', textAlign: 'center', fontFamily: "monserrat, monserrat", margin: 0, padding: '0 24px' }}>
            Ways to Donate
          </h1>
        </section>

        {/* QUICK NAV */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 64, padding: '48px 24px 40px', maxWidth: 1100, margin: '0 auto' }}>
          <QuickNavIcon href="#bank" icon="🏛️" label="Bank" />
          <QuickNavIcon href="#online" icon="📲" label="Online" />
          <QuickNavIcon href="#voucher" icon="🎁" label="Donation Voucher" />
          <QuickNavIcon href="#inkind" icon="📦" label="In-Kind" />
        </div>

        {/* SECTIONS */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 0 80px' }}>

          {/* BANK */}
          <Section id="bank" icon="🏦" label="BANK" bg="#f8f9fa">
            <div style={{ fontSize: 14, fontWeight: 800, color: RED, marginBottom: 28 }}>ACCOUNT NAME: PHILIPPINE RED CROSS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40, marginBottom: 40 }}>
              <BankCard bankName="BDO" bankColor="#003DA5" logoSrc="/images/logos/bdo.png" displayName="BANCO DE ORO" peso="0045 3019 0938" dollar="1045 3003 9482" swift="BNORPHMM" address="Port Area, Manila" />
              <BankCard bankName="Metrobank" bankColor="#003DA5" logoSrc="/images/logos/metrobank.png" displayName="METROBANK" peso="151 3 04163122 8" dollar="151 2 15100218 2" swift="MBTCPHMM" address="Port Area, Manila" />
              <BankCard bankName="Security Bank" bankColor="#111827" logoSrc="/images/logos/security-bank.png" displayName="SECURITY BANK" peso="0132 0624 6400 3" dollar="0132 0624 6400 2" swift="SETCPHMM" address="EDSA, Mandaluyong" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40 }}>
              <BankCard bankName="PNB" bankColor="#003DA5" logoSrc="/images/logos/pnb.png" displayName="Philippine National Bank" peso="1607 1020 0331" dollar="1607 6020 0347" swift="PNBMPHMM" address="EDSA, Mandaluyong" />
              <BankCard bankName="BPI" bankColor="#B8860B" logoSrc="/images/logos/bpi.png" displayName="BANK OF THE PHILIPPINE ISLAND (BPI)" peso="0029 6300 7828" pesoLabel="Savings Account" swift="BOPIPHMM" />
            </div>
          </Section>

          {/* ONLINE */}
          <Section id="online" icon="📱" label="ONLINE" bg="white">
            <SectionLabel icon="📱">Online</SectionLabel>
            <div style={{ marginBottom: 48 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                POWERED BY <span style={{ color: '#003DA5', fontWeight: 800 }}>PhilPaCS</span>
              </div>
              <QRBlock name="PhilPaCS" sublabel="Scan to donate online" />
            </div>
            <SectionLabel icon="📱">Mobile Banking</SectionLabel>
            <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
              <QRBlock name="GCash" />
              <QRBlock name="Maya" />
              <QRBlock name="BPI" />
              <QRBlock name="Security-Bank" sublabel="Security Bank" />
            </div>
          </Section>

          {/* DONATION VOUCHER */}
          <Section id="voucher" icon="🎁" label="DONATION VOUCHER" bg="#f8f9fa">
            <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.8, maxWidth: 760 }}>
              Donation vouchers can be purchased and sent to friends, family, or colleagues as a meaningful gift that supports humanitarian work. Vouchers may be redeemed by the recipient and applied to any active appeal or general fund of the Philippine Red Cross.
            </p>
            <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.8, maxWidth: 760 }}>
              For inquiries about purchasing a donation voucher, please reach out through our{' '}
              <Link href="/contact/get-in-touch" style={{ color: RED, fontWeight: 700 }}>Contact Us</Link> page.
            </p>
          </Section>

          {/* IN-KIND */}
          <Section id="inkind" icon="📦" label="IN-KIND" bg="white">
            <div style={{ display: 'flex', gap: 56, flexWrap: 'wrap', marginBottom: 40 }}>
              <div style={{ flex: 1, minWidth: 280 }}>
                <h3 style={{ color: '#6b7280', fontSize: 18, fontWeight: 800, marginBottom: 14 }}>LOCAL</h3>
                <ul style={{ paddingLeft: 20, color: '#374151', fontSize: 14, lineHeight: 1.9 }}>
                  <li>For perishable goods, PRC only accepts goods with an expiry date of not less than six (6) months.</li>
                  <li>PRC does not accept rotten, damaged, expired, or decayed goods.</li>
                  <li>Though we appreciate your generosity, the PRC also discourages donations of old clothes as we have more than enough to go around.</li>
                </ul>
                <div style={{ marginTop: 24, fontSize: 14, color: '#374151' }}>Send your donations addressed to:</div>
                <div style={{ marginTop: 10, fontSize: 14, fontWeight: 700, color: '#111', lineHeight: 1.7 }}>
                  Attention: Secretary-General Gwendolyn T. Pang<br /><br />
                  Philippine Red Cross<br />37 EDSA corner Boni Ave.<br />Mandaluyong City 1550 Philippines
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 280 }}>
                <h3 style={{ color: '#6b7280', fontSize: 18, fontWeight: 800, marginBottom: 14 }}>INTERNATIONAL</h3>
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, marginBottom: 12 }}>Prior to forwarding shipment donation to Philippine Red Cross, please provide the following documents and guidelines are to be strictly followed:</p>
                <ol style={{ paddingLeft: 20, color: '#374151', fontSize: 14, lineHeight: 1.9 }}>
                  <li>Letter of Intent to Donate attention to the Secretary-General.</li>
                  <li>Secure Acceptance of Donation by Secretary-General.</li>
                  <li>Authenticated Deed of Donation from the Philippine Consular office of the country of origin.</li>
                  <li>Copy of Invoice & Packing list of donations.</li>
                  <li>Bill of Lading or AWB Air waybill</li>
                  <li>ONLY, with formal Acceptance of Donation by Philippine Red Cross will be exported & consigned to Philippine Red Cross.</li>
                  <li>In case of other relief items, donors need to secure import permits for pertinent Philippine govt agencies prior to importation to the Philippines.</li>
                  <li>Incoterms: DDP, DDU, PRC do not accept any FOB or freight collect for imported donations.</li>
                  <li>Complete address where to consign donation once accepted.</li>
                </ol>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 56, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 280 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 22 }}>💊</span>
                  <h3 style={{ color: RED, fontSize: 17, fontWeight: 800, margin: 0 }}>FOR MEDICINE AND FOOD DONATION</h3>
                </div>
                <ol style={{ paddingLeft: 20, color: '#374151', fontSize: 14, lineHeight: 1.9 }}>
                  <li>In the case of medicines & food, a certification from the Philippines' Department of Health and the Food & Drug Administration commodities are allowed to be imported without a prior prescription.</li>
                  <li>Expiry should be at least 24 months or 2 years.</li>
                </ol>
              </div>
              <div style={{ flex: 1, minWidth: 280 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 22 }}>👕</span>
                  <h3 style={{ color: RED, fontSize: 17, fontWeight: 800, margin: 0 }}>FOR USED CLOTHING DONATION</h3>
                </div>
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.9 }}>
                  Consistent with the provisions of R.A. 4653, the PRC shall likewise adhere to the{' '}
                  <em style={{ color: RED }}>"No Use Clothing Donation"</em> policy to prevent health hazards that may be transmitted through used clothing.
                </p>
              </div>
            </div>
          </Section>

          {/* CONTACT US */}
          <Section icon="💬" label="CONTACT US" bg="#f8f9fa">
            <div style={{ display: 'flex', gap: 56, flexWrap: 'wrap', paddingTop: 8 }}>
              <ContactCard
                name="Shervi Mae R. Corpuz" role="Events and Emergency Giving Officer"
                unit="Special Events Unit" dept="Fund Generation Department"
                org="PHILIPPINE RED CROSS" building="PRC-Tower"
                address="37 EDSA corner Boni Avenue" city="Mandaluyong City"
                lines={[
                  { label: 'Trunk line', value: '(02) 790 2300', href: 'tel:+63027902300' },
                  { label: 'email', value: 'emergencyappeal@redcross.org.ph', href: 'mailto:emergencyappeal@redcross.org.ph' },
                ]}
              />
              <ContactCard
                name="Ma. Rizza Z. Genil" role="Events and Emergency Giving Officer"
                unit="Special Events Unit" dept="Fund Generation Department"
                org="PHILIPPINE RED CROSS" building="PRC-Tower"
                address="37 EDSA corner Boni Avenue" city="Mandaluyong City"
                lines={[
                  { label: 'Direct line', value: '(02) 790.2410', href: 'tel:+63027902410' },
                  { label: 'Trunk line', value: '(02) 790.2300 loc. 985', href: 'tel:+63027902300' },
                  { label: 'Mobile', value: '(0917) 510 6343', href: 'tel:+639175106343' },
                  { label: 'email', value: 'rizza.genil@redcross.org.ph', href: 'mailto:rizza.genil@redcross.org.ph' },
                ]}
              />
            </div>
          </Section>

        </div>

        {/* SAVE LIVES BANNER */}
        <div style={{
          position: 'relative', padding: '80px 40px',
          background: '#f5f5f5', textAlign: 'center', overflow: 'hidden',
        }}>
          <div style={{  

backgroundSize: 'cover', backgroundPosition: 'center',
          
            opacity: 0.12,
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: 48, fontWeight: 800, color: '#ff0000', marginBottom: 16, fontFamily: 'monserrat, monserrat' }}>
              Save Lives. Join the Red Cross.
            </h2>
            <p style={{ fontSize: 15, color: '#6b7280', maxWidth: 560, margin: '0 auto 32px', lineHeight: 1.7 }}>
              We take pride in urging all Filipinos to take part in the heroism of the Philippine Red Cross by becoming a full-fledged member, volunteer, or donor.
            </p>
            <a href="/register" style={{
              display: 'inline-block', background: RED, color: 'white',
              textDecoration: 'none', padding: '14px 40px', borderRadius: 100,
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








