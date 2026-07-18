import React from 'react';
import { Head, Link } from '@inertiajs/react';
import SiteNavbar from './SiteNavbar';

const RED = '#ff0000';

const trainingPrograms = [
  {
    title: 'Standard First Aid and Basic Life Support – Cardiopulmonary Resuscitation with Automated External Defibrillator',
    text: 'This comprehensive four-day course provides training in first aid and cardiopulmonary resuscitation (CPR) with the use of an automated external defibrillator (AED). It is designed for both workplace requirements and emergency situations, and is recognized in accordance with DOLE requirements.',
    hours: 32,
  },
  {
    title: 'Occupational First Aid and Basic Life Support – Cardiopulmonary Resuscitation with Automated External Defibrillator',
    text: 'This two-day course is recommended for workplaces that are interested in learning first aid, cardiopulmonary resuscitation (CPR) with the use of an automated external defibrillator (AED), as well as responding to common occupational hazards. It complies with the requirements that define a "certified first-aider" as any person trained and duly certified by the Philippine Red Cross.',
    hours: 16,
  },
  {
    title: 'Emergency First Aid',
    text: 'This course provides basic first aid knowledge for individuals aged 13 and above, including students, household helpers, and community workers. This program equips participants to handle common day-to-day emergencies, as well as specialized situations for cases such as sports-related incidents (Sports First Aid) and wilderness emergencies (Wilderness First Aid).',
    hours: 8,
  },
  {
    title: 'Junior First Aid',
    text: 'This program is designed to develop the emergency response skills of elementary students and out-of-school youth aged 10 to 12, preparing them to act safely and effectively during emergencies.',
    hours: 6,
  },
  {
    title: 'Basic Life Support Cardiopulmonary Resuscitation',
    text: 'This program is designed for individuals aged 18 and above whose roles require responding to emergencies, including nurses, law enforcement officers, EMS personnel, firefighters, lifeguards, and other first responders. It provides an in-depth yet concise training on handling cardiovascular emergencies and choking incidents for adults, children, and infants, depending on the level of CPR selected.',
    hours: 8,
  },
  {
    title: 'Basic Life Support Adult Cardiopulmonary Resuscitation for Lay Rescuers',
    text: 'This program trains laypersons in life-saving interventions for adults. Participants will learn how to recognize when and how to apply resuscitative measures in a variety of emergency situations.',
    hours: 8,
  },
  {
    title: 'Basic Life Support Child and Infant Cardiopulmonary Resuscitation Training',
    text: 'This program is designed for parents, guardians, teachers, babysitters, and anyone caring for children. It covers common emergencies in children and trains participants in life-saving CPR techniques for both infants and children.',
    hours: 8,
  },
];

function SectionTitle({ children }) {
  return (
    <>
      <h2 style={{ fontSize: 38, fontWeight: 800, color: RED, marginBottom: 12, fontFamily: 'Georgia, serif' }}>
        {children}
      </h2>
      <div style={{ width: 80, height: 2, background: '#ccc', marginBottom: 32 }} />
    </>
  );
}

export default function Training() {
  return (
    <>
      <Head title="Training - Philippine Red Cross" />
      <div style={{ fontFamily: "'Source Sans 3', sans-serif", margin: 0, padding: 0 }}>

        <SiteNavbar />

        {/* HERO */}
        <div style={{
          position: 'relative',
          height: 380,
          marginTop: 92,
          display: 'flex', alignItems: 'center',
          overflow: 'hidden',
          width: '100vw',
          marginLeft: 'calc(50% - 50vw)',
          marginRight: 'calc(50% - 50vw)',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: "url('/images/training-hero.jpg')",
            backgroundSize: 'cover', backgroundPosition: 'center',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(rgba(255,0,0,0.25), rgba(255,0,0,0.25))',
          }} />
          <div style={{ position: 'relative', padding: '0 80px' }}>
            <h1 style={{
              fontSize: 64, fontWeight: 900, color: 'white',
              letterSpacing: '0.04em', margin: 0,
              textTransform: 'uppercase',
            }}>
              Training
            </h1>
          </div>
        </div>

        {/* BREADCRUMB */}
        <div style={{ padding: '20px 80px 0', maxWidth: 1100, margin: '0 auto' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.04em' }}>
            <Link href="/" style={{ color: '#9ca3af', textDecoration: 'none' }}>HOME</Link>
            {'  '}/{'  '}
            <span style={{ color: RED }}>TRAINING</span>
          </span>
        </div>

        <div style={{ padding: '40px 80px 60px', maxWidth: 1100, margin: '0 auto' }}>

          {/* SECTION 1: INTRO */}
          <SectionTitle>Training</SectionTitle>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 48 }}>
            Explore our various training programs below
          </p>

          {/* SECTION 2: PROGRAM LIST */}
          <div style={{ marginBottom: 56 }}>
            {trainingPrograms.map((p, i) => (
              <div key={i} style={{ marginBottom: 40 }}>
                <h3 style={{
                  fontSize: 26, fontWeight: 400, color: '#6b7280',
                  marginBottom: 12, lineHeight: 1.3,
                }}>
                  {p.title}
                </h3>
                <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.8, marginBottom: 8 }}>
                  {p.text}
                </p>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>
                  Minimum number of hours: {p.hours} hours
                </p>
              </div>
            ))}
          </div>

          {/* SECTION 3: WATER SAFETY PROGRAMS */}
          <div style={{ marginBottom: 56 }}>
            <h3 style={{ fontSize: 30, fontWeight: 400, color: '#374151', marginBottom: 12 }}>
              Water Safety Programs
            </h3>
            <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.8, margin: 0 }}>
              The Water Safety Programs provide water-based life-saving training for individuals of all ages, as well as for professionals whose work involves water safety. Programs include Learn to Swim, Basic Water Safety and Rescue, Lifeguarding, and Swift Water Rescue.
            </p>
          </div>

          {/* SECTION 4: TRAIN MY EMPLOYEES */}
          <div>
            <h2 style={{ fontSize: 38, fontWeight: 800, color: RED, marginBottom: 12, fontFamily: 'Georgia, serif' }}>
              Train My Employees
            </h2>
            <div style={{ width: 80, height: 2, background: '#ccc', marginBottom: 24 }} />
            <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.8, margin: 0 }}>
              One of the Philippine Red Cross' specializations is providing professional first aid and safety training for corporations, customizable to suit the nature and requirements of your workplace. Equipping employees with first aid knowledge enables them to assist injured individuals during emergencies or workplace accidents. Having a certified first-aider team not only makes the workplace safer but also helps reduce casualties in critical situations.
            </p>
          </div>

        </div>

        {/* SECTION 5: JOIN THE RED CROSS CTA */}
        <div style={{
          position: 'relative',
          padding: '90px 40px',
          textAlign: 'center',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: "url('/images/join-us-bg.jpg')",
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'grayscale(20%)',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(255,255,255,0.82)',
          }} />

          <div style={{ position: 'relative', maxWidth: 700, margin: '0 auto' }}>
            <h2 style={{
              fontSize: 44, fontWeight: 800, color: '#ff0000',
              marginBottom: 20, fontFamily: 'Georgia, serif',
            }}>
              Save Lives. Join the Red Cross.
            </h2>
            <p style={{
              fontSize: 16, color: '#374151', lineHeight: 1.7, marginBottom: 32,
            }}>
              We take pride in urging all Filipinos to take part in the heroism of the Philippine Red Cross by becoming a full-fledged member, volunteer, or donor.
            </p>
            <Link
              href="/register"
              style={{
                display: 'inline-block',
                background: RED, color: 'white',
                padding: '14px 44px', borderRadius: 30,
                fontSize: 14, fontWeight: 700, letterSpacing: '0.05em',
                textDecoration: 'none',
              }}
            >
              JOIN US
            </Link>
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


