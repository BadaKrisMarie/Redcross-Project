import React, { useState } from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function Contact() {
    const { flash } = usePage().props;
    const [openTooltip, setOpenTooltip] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        message: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/contact', {
            onSuccess: () => reset(),
        });
    };

    const phones = [
        { dept: 'Admin',                    number: '+63 917-322-8143' },
        { dept: 'Blood Bank',               number: '+63 917-833-4929' },
        { dept: 'Safety Service Emergency', number: '+63 917-177-6143' },
        { dept: 'Medical Service',          number: '+63 917-837-0446' },
        { dept: 'Fund Generation',          number: '+63 917-831-3924' },
    ];

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

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@300;400;500;600&display=swap');
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                :root {
                    --red: #DC2626; --red-dark: #A51818;
                    --white: #ffffff; --offwhite: #f8f8f8;
                    --charcoal: #1c1c1c; --gray: #6b6b6b;
                    --light-gray: #e5e5e5; --navy: #1a2744;
                }
                body { font-family: 'Barlow', sans-serif; background: var(--white); color: var(--charcoal); overflow-x: hidden; }

                .main-nav {
                    width: 100%;
                    background: #ffffff;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 48px;
                    border-bottom: 1px solid rgba(200,16,46,0.12);
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    font-family: Inter, sans-serif;
                }
                .nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
                .nav-logo-icon { width: 34px; height: 34px; background: #DC2626; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; font-weight: 900; }
                .nav-logo-texts .top { font-size: 12px; font-weight: 600; color: #111111; line-height: 1.2; display: block; }
                .nav-logo-texts .bottom { font-size: 10px; color: #888880; display: block; }
                .nav-links { display: flex; align-items: center; gap: 28px; list-style: none; margin: 0; padding: 0; }
                .nav-links a { text-decoration: none; font-size: 13px; font-weight: 500; color: #444444; padding: 4px 10px; border-radius: 6px; transition: background 0.2s, color 0.2s; }
                .nav-links a:hover, .nav-links a.active { color: #DC2626; background: rgba(220,38,38,0.08); }
                .nav-links .login-btn a { background: #DC2626; color: white !important; font-weight: 600; padding: 8px 18px; border-radius: 6px; font-size: 12px; }
                .nav-links .login-btn a:hover { background: var(--red-dark); }

                .contact-hero { background: #1a1a1a; padding: 72px 60px; text-align: center; position: relative; overflow: hidden; background-image: url('https://scontent.fmnl8-1.fna.fbcdn.net/v/t39.30808-6/486253255_122117910200759224_1850104524729330657_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=127cfc&_nc_ohc=s3qPx72vL0QQ7kNvwEIiHPI&_nc_oc=AdqRmmyhVTdlpQ1ucKr3gwtRZUjigQziyUGexQspH0zfnd9XfILoSqGTRbOsO1TXLSzdeB3CaaEb3y_yR-Ejs5Rk&_nc_zt=23&_nc_ht=scontent.fmnl8-1.fna&_nc_gid=OEftzlaHV_BR3OPDU5Gs0g&_nc_ss=7b289&oh=00_Af5Y55emzOdxd-X1_8lK2G_kTNILcyfRuukztDwxOLT0bw&oe=6A1CBC37'); background-size: cover; background-position: center; }
                .contact-hero::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(127,29,29,0.88) 0%, rgba(26,26,26,0.88) 60%); opacity: 1; z-index: 0; }
                .contact-hero-grid { position: absolute; inset: 0; opacity: 0.05; background-image: repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #fff 0, #fff 1px, transparent 1px, transparent 40px); z-index: 0; }
                .contact-hero-ring1 { position: absolute; right: -40px; top: 50%; transform: translateY(-50%); width: 500px; height: 500px; border: 60px solid rgba(220,38,38,0.12); border-radius: 50%; z-index: 0; }
                .contact-hero-ring2 { position: absolute; right: 60px; top: 50%; transform: translateY(-50%); width: 320px; height: 320px; border: 1.5px solid rgba(220,38,38,0.25); border-radius: 50%; z-index: 0; }
                .hero-tag { display: inline-flex; align-items: center; gap: 8px; background: rgba(220,38,38,0.15); border: 1px solid rgba(220,38,38,0.35); color: #fca5a5; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; padding: 5px 16px; border-radius: 100px; margin-bottom: 18px; position: relative; z-index: 1; }
                .contact-hero h1 { font-family: 'Barlow Condensed', sans-serif; font-weight: 900; font-size: clamp(52px, 7vw, 80px); line-height: 0.92; color: white; text-transform: uppercase; margin-bottom: 14px; position: relative; z-index: 1; }
                .contact-hero p { color: rgba(255,255,255,0.6); font-size: 15px; font-weight: 300; line-height: 1.7; max-width: 460px; margin: 0 auto; position: relative; z-index: 1; }

                .breadcrumb { padding: 13px 60px; background: var(--offwhite); border-bottom: 1px solid var(--light-gray); display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--gray); }
                .breadcrumb a { color: var(--red); text-decoration: none; font-weight: 500; }

                .contact-main { padding: 72px 60px; background: var(--white); }
                .contact-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 48px; }

                .ccard { background: var(--white); border: 1px solid var(--light-gray); border-radius: 12px; padding: 32px 26px; display: flex; flex-direction: column; align-items: center; text-align: center; transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s; }
                .ccard:hover { border-color: rgba(220,38,38,0.3); box-shadow: 0 10px 36px rgba(0,0,0,0.08); transform: translateY(-3px); }
                .ccard.featured { border: 2px solid var(--red); box-shadow: 0 4px 24px rgba(220,38,38,0.1); }
                .ccard-icon { width: 56px; height: 56px; border-radius: 50%; background: rgba(220,38,38,0.08); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; font-size: 24px; }
                .ccard h3 { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--charcoal); margin-bottom: 18px; }
                .ccard-divider { width: 100%; height: 1px; background: var(--light-gray); margin: 14px 0; }
                .ccard-desc { font-size: 13px; color: var(--gray); line-height: 1.7; margin-bottom: 16px; }

                .phone-row { display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 8px 0; border-bottom: 1px solid var(--light-gray); gap: 12px; }
                .phone-row:last-of-type { border-bottom: none; }
                .phone-dept { font-size: 12px; font-weight: 600; color: var(--red); text-align: left; flex: 1; line-height: 1.3; }
                .phone-num { font-size: 13px; font-weight: 500; color: var(--charcoal); white-space: nowrap; }
                .contact-info { font-size: 12px; color: var(--gray); line-height: 1.7; }
                .contact-info a { color: var(--red); text-decoration: none; font-weight: 500; }
                .address-block { font-size: 13px; color: var(--gray); line-height: 1.8; }
                .address-block strong { display: block; font-size: 14px; color: var(--charcoal); margin-bottom: 4px; }

                .form-group { display: flex; flex-direction: column; gap: 8px; width: 100%; margin-bottom: 10px; }
                .form-group input, .form-group textarea { width: 100%; padding: 10px 14px; font-family: 'Barlow', sans-serif; font-size: 13px; color: var(--charcoal); background: var(--offwhite); border: 1px solid var(--light-gray); border-radius: 6px; outline: none; transition: border-color 0.2s; }
                .form-group input:focus, .form-group textarea:focus { border-color: var(--red); background: var(--white); }
                .form-group textarea { height: 80px; resize: none; }
                .field-error { font-size: 11px; color: var(--red); margin-top: 2px; text-align: left; }
                .btn-submit { width: 100%; background: var(--red); color: white; padding: 12px 24px; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 14px; letter-spacing: 0.1em; text-transform: uppercase; border: none; cursor: pointer; border-radius: 6px; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s, transform 0.2s; margin-top: 4px; }
                .btn-submit:hover:not(:disabled) { background: var(--red-dark); transform: translateY(-1px); }
                .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
                .success-msg { background: rgba(34,139,34,0.08); border: 1px solid rgba(34,139,34,0.2); border-radius: 6px; padding: 12px 16px; font-size: 13px; color: #1a7a1a; font-weight: 500; text-align: center; width: 100%; }

                .map-section { margin-top: 0; }
                .map-label { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--gray); margin-bottom: 12px; }
                .map-wrapper { position: relative; width: 100%; height: 320px; border-radius: 12px; overflow: hidden; border: 1px solid var(--light-gray); box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
                .map-wrapper iframe { width: 100%; height: 100%; border: 0; display: block; }
                .map-open-btn { position: absolute; bottom: 14px; right: 14px; background: var(--red); color: white; padding: 9px 18px; border-radius: 8px; font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; text-decoration: none; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 16px rgba(220,38,38,0.35); transition: background 0.2s, transform 0.15s; z-index: 10; }
                .map-open-btn:hover { background: var(--red-dark); transform: translateY(-1px); }

                footer { background: #111; color: white; padding: 56px 60px 32px; }
                .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; padding-bottom: 40px; border-bottom: 1px solid rgba(255,255,255,0.08); margin-bottom: 28px; }
                .footer-brand .logo-row { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
                .footer-brand .logo-icon { width: 36px; height: 36px; background: var(--red); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 900; color: white; }
                .footer-brand .logo-text strong { display: block; font-family: 'Barlow Condensed', sans-serif; font-size: 16px; font-weight: 700; color: white; }
                .footer-brand .logo-text span { font-size: 11px; color: rgba(255,255,255,0.4); }
                .footer-brand p { font-size: 13px; color: rgba(255,255,255,0.45); line-height: 1.7; max-width: 240px; }
                .footer-col h4 { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(255,255,255,0.5); margin-bottom: 16px; }
                .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
                .footer-col ul li a { font-size: 13px; color: rgba(255,255,255,0.6); text-decoration: none; transition: color 0.2s; }
                .footer-col ul li a:hover { color: var(--red); }
                .footer-bottom { display: flex; align-items: center; justify-content: space-between; }
                .footer-bottom p { font-size: 12px; color: rgba(255,255,255,0.3); }
                .footer-socials { display: flex; gap: 10px; }
                .social { width: 34px; height: 34px; border-radius: 6px; background: rgba(255,255,255,0.07); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; font-family: 'Barlow Condensed', sans-serif; color: white; cursor: pointer; border: none; transition: background 0.2s; }
                .social:hover { background: var(--red); }

                @media (max-width: 900px) {
                    .main-nav { padding: 14px 20px; }
                    .contact-hero { padding: 60px 24px; }
                    .breadcrumb { padding: 12px 24px; }
                    .contact-main { padding: 52px 24px; }
                    .contact-grid { grid-template-columns: 1fr; }
                    footer { padding: 48px 24px 28px; }
                    .footer-grid { grid-template-columns: 1fr 1fr; }
                }
            `}</style>

            {/* ── NAV ── */}
            <nav className="main-nav">
                <Link href="/" className="nav-logo">
                    <div className="nav-logo-icon">+</div>
                    <div className="nav-logo-texts">
                        <span className="top">Rizal Chapter</span>
                        <span className="bottom">Muntinlupa City Branch</span>
                    </div>
                </Link>
                <ul className="nav-links">
                    <li><Link href="/">Home</Link></li>

                    {/* ABOUT with tooltip */}
                    <li
                        style={{ position: 'relative' }}
                        onMouseEnter={() => setOpenTooltip('about')}
                        onMouseLeave={() => setOpenTooltip(null)}
                    >
                        <Link href="/about">About</Link>
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
                        <Link href="/contact" className="active">Contact</Link>
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

                    <li className="login-btn"><Link href="/login">Log In</Link></li>
                </ul>
            </nav>

            {/* ── HERO ── */}
            <div className="contact-hero">
                <div className="contact-hero-grid"></div>
                <div className="contact-hero-ring1"></div>
                <div className="contact-hero-ring2"></div>
                <div className="hero-tag">Contact Us</div>
                <h1>Get In Touch</h1>
                <p>Reach out to us to learn more, volunteer, or support our initiatives in Muntinlupa. We're here to connect and make a difference together.</p>
            </div>

            {/* ── BREADCRUMB ── */}
            <div className="breadcrumb">
                <Link href="/">Home</Link>
                <span>›</span>
                <span>Contact</span>
            </div>

            {/* ── MAIN ── */}
            <div className="contact-main">
                <div className="contact-grid">

                    {/* Visit Us */}
                    <div className="ccard">
                        <div className="ccard-icon">📍</div>
                        <h3>Visit Us</h3>
                        <p className="ccard-desc">Drop by our office in Muntinlupa and see how we're helping the community firsthand.</p>
                        <div className="ccard-divider"></div>
                        <div className="address-block">
                            <strong>Red Cross Center</strong>
                            Centennial Lane, Filinvest Corporate City,<br />
                            Alabang, Muntinlupa City
                        </div>
                    </div>

                    {/* Call Us */}
                    <div className="ccard featured">
                        <div className="ccard-icon">📞</div>
                        <h3>Call Us Now</h3>
                        {phones.map((p, i) => (
                            <div className="phone-row" key={i}>
                                <span className="phone-dept">{p.dept}</span>
                                <a href={`tel:${p.number.replace(/\s/g,'')}`} className="phone-num" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    {p.number}
                                </a>
                            </div>
                        ))}
                        <div className="ccard-divider"></div>
                        <div className="contact-info">
                            <a href="mailto:rizalmuntinlupa@redcross.org.ph">
                                rizalmuntinlupa@redcross.org.ph
                            </a>
                        </div>
                    </div>

                    {/* Send Message */}
                    <div className="ccard">
                        <div className="ccard-icon">✉️</div>
                        <h3>Send Message</h3>

                        {flash?.success ? (
                            <div className="success-msg">✅ {flash.success}</div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        placeholder="Your name"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                    />
                                    {errors.name && <span className="field-error">{errors.name}</span>}
                                </div>
                                <div className="form-group">
                                    <input
                                        type="email"
                                        placeholder="Your email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                    />
                                    {errors.email && <span className="field-error">{errors.email}</span>}
                                </div>
                                <div className="form-group">
                                    <textarea
                                        placeholder="Your message..."
                                        value={data.message}
                                        onChange={e => setData('message', e.target.value)}
                                    />
                                    {errors.message && <span className="field-error">{errors.message}</span>}
                                </div>
                                <button className="btn-submit" type="submit" disabled={processing}>
                                    {processing ? 'Sending...' : 'Send Message →'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* ── MAP ── */}
                <div className="map-section">
                    <div className="map-label">Our Location</div>
                    <div className="map-wrapper">
                        <iframe
                            title="Red Cross Muntinlupa Location"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3862.0!2d121.0347!3d14.4153!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397d3b6c2f1234%3A0x5e0f1234abcd!2sRed+Cross+Center%2C+Filinvest+Corporate+City%2C+Alabang%2C+Muntinlupa+City!5e0!3m2!1sen!2sph!4v1716000000000"
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                        <a
                            href="https://maps.app.goo.gl/6KXb5QSKdYh5g6yM8"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="map-open-btn"
                        >
                            📍 Open in Google Maps
                        </a>
                    </div>
                </div>
            </div>

            {/* ── FOOTER ── */}
            <footer>
                <div className="footer-grid">
                    <div className="footer-brand">
                        <div className="logo-row">
                            <div className="logo-icon">+</div>
                            <div className="logo-text">
                                <strong>Rizal Chapter</strong>
                                <span>Muntinlupa City Branch</span>
                            </div>
                        </div>
                        <p>Committed to saving lives and serving the community with compassion, excellence, and urgency.</p>
                    </div>
                    <div className="footer-col">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/about">About Us</Link></li>
                            <li><Link href="/contact">Contact</Link></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Services</h4>
                        <ul>
                            <li><a href="#">Blood Drive</a></li>
                            <li><a href="#">Emergency Aid</a></li>
                            <li><a href="#">Disaster Relief</a></li>
                            <li><a href="#">Volunteer Training</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Contact</h4>
                        <ul>
                            <li><a href="#">Muntinlupa City, NCR</a></li>
                            <li><a href="#">Philippines</a></li>
                            <li><a href="https://redcross.org.ph" target="_blank" rel="noreferrer">redcross.org.ph</a></li>
                            <li><a href="tel:143">Hotline: 143</a></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>© 2026 Philippine Red Cross – Muntinlupa City Branch. All rights reserved.</p>
                    <div className="footer-socials">
                        <button className="social">FB</button>
                        <button className="social">TW</button>
                        <button className="social">IG</button>
                    </div>
                </div>
            </footer>
        </>
    );
}
