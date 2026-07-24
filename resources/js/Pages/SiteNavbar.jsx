import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

const navItems = [
  {
    label: 'DONATE',
    href: '/donate',
    items: [
      { label: 'Donate Online', href: '/donate#online', hash: true },
      { label: 'Monthly Gifts', href: '/donate#bank', hash: true },
      { label: 'Text, Mail, or Phone', href: '/donate#voucher', hash: true },
      { label: 'International Donations', href: '/donate#inkind', hash: true },
    ],
  },
  {
    label: 'GIVE BLOOD',
    href: '/give-blood',
    items: [
      { label: 'How to Donate Blood', href: '/give-blood#how-to-donate', hash: true },
      { label: 'Blood Bank Locator', href: '/give-blood#blood-bank-locator', hash: true },
      { label: 'Programs', href: '/give-blood#programs', hash: true },
    ],
  },
  {
    label: 'TRAINING',
    href: '/training',
    items: [
      { label: 'Training', href: '/training' },
      { label: 'Train My Employees', href: '/training/employees' },
    ],
  },
  {
    label: 'VOLUNTEER',
    href: '/register',
    items: [
      { label: 'Become a Volunteer', href: '/volunteer-info/become#become', hash: true },
      { label: 'Red Cross 143 Program', href: '/volunteer-info/become#red-cross-143', hash: true },
      { label: 'Volunteer Service FAQs', href: '/volunteer-info/become#faqs', hash: true },
    ],
  },
  {
    label: 'ABOUT US',
    mega: true,
    columns: [
      {
        heading: 'About Us',
        items: [
          { label: 'History', href: '/about/history' },
          { label: 'Mission and Vision', href: '/about/mission-vision' },
          { label: 'The Movement', href: '/about/movement' },
        ],
      },
      {
        heading: 'The Team',
        items: [
          { label: 'Board of Governors', href: '/about/team#governors', teamTab: true },
          { label: 'Executive Staff', href: '/about/team#executive', teamTab: true },
        ],
      },
      {
        heading: 'Our Work',
        items: [
          { label: 'Disaster Management Service', href: '/disaster-management' },
          { label: 'National Blood Service', href: '/national-blood-service' },
          { label: 'Health Services', href: '/health-services' },
        ]
      },
    ],
  },
  {
    label: 'CONTACT US',
    items: [
      { label: 'Get in Touch', href: '/contact/get-in-touch' },
      { label: 'Branch Locations', href: 'https://maps.app.goo.gl/5617viaNwvSqUz5g7', external: true },
      { label: 'Hotline Numbers', href: 'tel:0286415364', external: true },
      { label: 'Email Us', href: '/contact/email' },
      { label: 'Social Media', href: 'https://www.facebook.com/RedCrossMuntinlupa/', external: true },
    ],
  },
];

function MegaMenuLink({ item, onHashClick }) {
  const [hovered, setHovered] = useState(false);

  const baseStyle = {
    color: hovered ? '#FFFFFF' : 'rgba(255,255,255,0.85)',
    textDecoration: 'none',
    fontSize: 14,
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    transition: 'color 0.15s',
  };

  if (item.hash) {
    return (
      <a
        href={item.href}
        onClick={(e) => onHashClick(e, item.href)}
        style={{ ...baseStyle, cursor: 'pointer' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {item.label}
      </a>
    );
  }

  if (item.teamTab) {
    const handleClick = (e) => {
      e.preventDefault();
      const [path, hash] = item.href.split('#');
      if (window.location.pathname === path) {
        window.location.hash = hash;
      } else {
        router.visit(item.href);
      }
    };

    return (
      <a
        href={item.href}
        onClick={handleClick}
        style={{ ...baseStyle, cursor: 'pointer' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {item.label}
      </a>
    );
  }

  return (
    <Link
      href={item.href}
      style={baseStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {item.label}
    </Link>
  );
}

function DropdownLink({ item, onHashClick }) {
  const [hovered, setHovered] = useState(false);

  const baseStyle = {
    display: 'block',
    padding: '10px 20px',
    color: 'white',
    textDecoration: 'none',
    fontSize: '13px',
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: '600',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    background: hovered ? 'rgba(255,255,255,0.1)' : 'transparent',
    transition: 'background 0.15s',
  };

  if (item.hash) {
    return (
      <a
        href={item.href}
        onClick={(e) => onHashClick(e, item.href)}
        style={{ ...baseStyle, cursor: 'pointer' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {item.label}
      </a>
    );
  }

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        style={baseStyle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {item.label}
      </a>
    );
  }

  return (
    <Link
      href={item.href}
      style={baseStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {item.label}
    </Link>
  );
}

export default function SiteNavbar() {
  const [openNav, setOpenNav] = useState(null);

  const handleHashClick = (e, href) => {
    e.preventDefault();
    const [path, hash] = href.split('#');
    const el = document.getElementById(hash);

    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      router.visit(path, {
        onFinish: () => {
          setTimeout(() => {
            const target = document.getElementById(hash);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 50);
        },
      });
    }
    setOpenNav(null);
  };

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>
      <nav
        style={{
          background: '#FF0000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 80px',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 101,
          height: '92px',
          fontFamily: 'Montserrat, sans-serif',
        }}
      >
        {/* LOGO */}
        <Link
          href="/"
          style={{ display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none', flexShrink: 0 }}
        >
          <img
            src="/images/redcross-logo.png"
            alt="Philippine Red Cross - Muntinlupa City Branch"
            style={{
              width: '64px',
              height: '64px',
              objectFit: 'cover',
              clipPath: 'circle(50%)',
            }}
          />
          <div>
            <strong style={{ display: 'block', fontSize: '16px', fontFamily: 'Montserrat, sans-serif', fontWeight: '700', color: 'white' }}>
              Rizal Chapter
            </strong>
            <span style={{ display: 'block', fontSize: '13px', fontFamily: 'Montserrat, sans-serif', color: 'rgba(255,255,255,0.7)' }}>
              Muntinlupa City Branch
            </span>
          </div>
        </Link>

        {/* CENTER LINKS WITH HOVER DROPDOWNS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          {navItems.map((nav) => (
            <div
              key={nav.label}
              style={{ position: 'relative', height: '92px', display: 'flex', alignItems: 'center' }}
              onMouseEnter={() => setOpenNav(nav.label)}
              onMouseLeave={() => setOpenNav(null)}
            >
              {nav.href ? (
                <Link
                  href={nav.href}
                  style={{
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: '15px',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: '700',
                    letterSpacing: '0.06em',
                    whiteSpace: 'nowrap',
                    borderBottom: openNav === nav.label ? '3px solid white' : '3px solid transparent',
                    paddingBottom: '4px',
                  }}
                >
                  {nav.label}
                </Link>
              ) : (
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  style={{
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: '15px',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: '700',
                    letterSpacing: '0.06em',
                    whiteSpace: 'nowrap',
                    borderBottom: openNav === nav.label ? '3px solid white' : '3px solid transparent',
                    paddingBottom: '4px',
                    cursor: 'default',
                  }}
                >
                  {nav.label}
                </a>
              )}

              {openNav === nav.label && nav.mega && (
                <div
                  style={{
                    position: 'absolute',
                    top: '92px',
                    right: 0,
                    background: '#FF0000',
                    minWidth: '640px',
                    zIndex: 200,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                    display: 'flex',
                    gap: 0,
                    padding: '28px 32px',
                  }}
                >
                  {nav.columns.map((col, ci) => (
                    <div key={ci} style={{ flex: 1, paddingRight: 24 }}>
                      {col.heading && (
                        <div
                          style={{
                            color: 'white',
                            fontSize: 15,
                            fontFamily: 'Montserrat, sans-serif',
                            fontWeight: 800,
                            marginBottom: 14,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {col.heading}
                        </div>
                      )}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 10,
                          marginTop: col.heading ? 0 : 29,
                        }}
                      >
                        {col.items.map((item) => (
                          <MegaMenuLink key={item.label} item={item} onHashClick={handleHashClick} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {openNav === nav.label && !nav.mega && nav.items && (
                <div
                  style={{
                    position: 'absolute',
                    top: '92px',
                    left: 0,
                    background: '#FF0000',
                    minWidth: '220px',
                    zIndex: 200,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  }}
                >
                  {nav.items.map((item) => (
                    <DropdownLink key={item.label} item={item} onHashClick={handleHashClick} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* RIGHT: LOG IN + DONATE NOW (flush sa edge) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
          <Link
            href={route('login')}
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: 'white',
              border: '1.5px solid rgba(255,255,255,0.5)',
              padding: '11px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: '700',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Log In
          </Link>
        </div>
      </nav>
    </>
  );
}