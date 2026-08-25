import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

/* ────────────────────────────────────────────────────────────────
   Icon set — hand-drawn strokes (lucide-style), 1.75px stroke,
   consistent 18px grid so every action button lines up perfectly.
   ──────────────────────────────────────────────────────────────── */
const Icon = {
    eye: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ),
    check: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M20 6 9 17l-5-5" />
        </svg>
    ),
    x: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M18 6 6 18M6 6l12 12" />
        </svg>
    ),
    undo: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M3 7v6h6" />
            <path d="M3 13a9 9 0 1 0 3-6.7L3 9" />
        </svg>
    ),
    trash: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" />
            <path d="M10 11v6M14 11v6" />
        </svg>
    ),
    search: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    ),
    chevron: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="m9 18 6-6-6-6" />
        </svg>
    ),
    clock: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 3" />
        </svg>
    ),
    userCheck: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="m17 11 2 2 4-4" />
        </svg>
    ),
    userX: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M17 8 22 13M22 8l-5 5" />
        </svg>
    ),
    close: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M18 6 6 18M6 6l12 12" />
        </svg>
    ),
};

/* ── Design tokens ─────────────────────────────────────────────── */
const T = {
    red: '#C8102E',       // Philippine Red Cross red
    redDark: '#A00D25',
    redSoft: '#FDECEE',
    ink: '#151922',
    ink2: '#3D4351',
    muted: '#78808F',
    faint: '#A6ACB8',
    border: '#E7E9EE',
    borderSoft: '#F0F1F4',
    surface: '#FFFFFF',
    surfaceAlt: '#FAFBFC',
    success: '#1A8245',
    successSoft: '#E9F7EF',
    successBorder: '#C4E9D3',
    warning: '#B4700A',
    warningSoft: '#FDF3E0',
    warningBorder: '#F3DFB0',
    info: '#1D4ED8',
    infoSoft: '#EAF0FE',
    dangerSoft: '#FCEBEC',
    dangerBorder: '#F6C6CB',
};

/* ── Coordinated avatar palette ──────────────────────────────────
   Same set used across Dashboard and 201 Files so a volunteer's
   avatar color stays consistent no matter where they show up in
   the admin panel. Assignment is a deterministic hash of the full
   name (not just the first letter) so colors spread out evenly
   instead of clustering on common initials.
   ──────────────────────────────────────────────────────────────── */
const AVATAR_PALETTE = [
    ['#FDECEE', '#A00D25'], ['#EAF0FE', '#1D4ED8'], ['#E9F7EF', '#1A8245'],
    ['#FDF3E0', '#B4700A'], ['#F1EEFB', '#5B3FBF'], ['#E6F6F6', '#0E7C86'],
    ['#FBEAF3', '#B02E7A'],
];
const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    return hash;
};
const getAvatarColor = (name) => AVATAR_PALETTE[hashString(name) % AVATAR_PALETTE.length];

function Volunteers({ volunteers }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState('');
    const [selectedVolunteer, setSelectedVolunteer] = useState(null);
    const [toDelete, setToDelete] = useState(null);
    const [toRevoke, setToRevoke] = useState(null);

    const approve = (e, id) => {
        e.stopPropagation();
        router.patch(route('admin.volunteers.approve', id));
    };

    const reject = (e, id) => {
        e.stopPropagation();
        router.patch(route('admin.volunteers.reject', id));
    };

    const confirmRevoke = () => {
        router.patch(route('admin.volunteers.reject', toRevoke.id), {
            onSuccess: () => setToRevoke(null),
        });
    };

    const viewProfile = (id) => {
        router.visit(route('admin.volunteers.show', id));
    };

    const deleteVolunteer = () => {
        router.delete(route('admin.volunteers.destroy', toDelete.id), {
            onSuccess: () => setToDelete(null),
        });
    };

    const pending  = volunteers.filter(v => v.status === 'pending');
    const approved = volunteers.filter(v => v.status === 'approved');
    const rejected = volunteers.filter(v => v.status === 'rejected');

    const recent = [...volunteers]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .filter(v =>
            v.name.toLowerCase().includes(search.toLowerCase()) ||
            v.email.toLowerCase().includes(search.toLowerCase())
        )
        .slice(0, 7);

    const getInitials = (name) =>
        name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    const fmtDate = (d, opts) =>
        new Date(d).toLocaleDateString('en-PH', opts || { year: 'numeric', month: 'short', day: 'numeric' });

    const StatusBadge = ({ status }) => {
        const s = {
            pending:  { bg: T.warningSoft, fg: T.warning, label: 'Pending' },
            approved: { bg: T.successSoft, fg: T.success, label: 'Approved' },
            rejected: { bg: T.dangerSoft,  fg: T.red,     label: 'Rejected' },
        }[status] || { bg: T.borderSoft, fg: T.muted, label: status };

        return (
            <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                background: s.bg, color: s.fg,
                padding: '3px 10px 3px 8px', borderRadius: '999px',
                fontSize: '11.5px', fontWeight: 600, letterSpacing: '0.1px',
            }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: s.fg, flexShrink: 0 }} />
                {s.label}
            </span>
        );
    };

    const Avatar = ({ v, size = 38 }) => {
        const [bg, fg] = getAvatarColor(v.name);
        const src = v.profile_photo_url || v.avatar || v.photo;
        return (
            <div style={{
                width: size, height: size, borderRadius: '50%', flexShrink: 0,
                background: bg, color: fg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: size * 0.36, fontWeight: 700, overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.04)',
            }}>
                {src
                    ? <img src={src} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                    : getInitials(v.name)}
            </div>
        );
    };

    /* ── Icon action button with CSS tooltip ─────────────────────── */
    const IconBtn = ({ icon, label, tone = 'neutral', onClick }) => {
        const tones = {
            neutral: { fg: T.ink2,   bg: T.surface,    border: T.border, hoverBg: T.surfaceAlt },
            primary: { fg: T.info,   bg: T.infoSoft,   border: 'transparent', hoverBg: '#DCE7FD' },
            success: { fg: T.success, bg: T.successSoft, border: 'transparent', hoverBg: '#D9F1E3' },
            danger:  { fg: T.red,    bg: T.dangerSoft, border: 'transparent', hoverBg: '#FADBDE' },
            warning: { fg: T.warning, bg: T.warningSoft, border: 'transparent', hoverBg: '#FBE8C6' },
        };
        const c = tones[tone];
        return (
            <button
                onClick={onClick}
                className="icon-btn"
                style={{
                    '--fg': c.fg, '--bg': c.bg, '--hoverBg': c.hoverBg, '--border': c.border,
                }}
                data-tooltip={label}
                aria-label={label}
                type="button"
            >
                {icon({ width: 16, height: 16 })}
            </button>
        );
    };

    const btnPrimaryText = {
        background: T.ink, color: '#fff',
        border: 'none', padding: '7px 14px',
        borderRadius: '6px', fontSize: '12.5px',
        fontWeight: 600, cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        transition: 'background 0.15s',
    };

    const clickableRow = {
        borderTop: `1px solid ${T.borderSoft}`,
        cursor: 'pointer',
        transition: 'background 0.12s',
    };

    /* Row actions are hidden until the row is hovered — only the
       chevron stays visible at rest, so the table doesn't read as
       "loud" the moment the page opens. Clicking the row (or tapping
       on touch devices) still opens the quick-view, where the same
       actions — including delete — are reachable. */
    const VolunteerRow = ({ v, actions }) => (
        <tr
            key={v.id}
            className="vol-row"
            style={clickableRow}
            onClick={() => setSelectedVolunteer(v)}
            onMouseEnter={e => e.currentTarget.style.background = T.surfaceAlt}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
            <td style={{ padding: '13px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                    <Avatar v={v} size={32} />
                    <span style={{ fontSize: '13.5px', color: T.ink, fontWeight: 600 }}>{v.name}</span>
                </div>
            </td>
            <td style={{ padding: '13px 20px', fontSize: '13px', color: T.muted }}>
                {v.email}
            </td>
            <td style={{ padding: '13px 20px', fontSize: '12.5px', color: T.faint }}>
                {fmtDate(v.created_at)}
            </td>
            <td style={{ padding: '13px 20px' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end' }}>
                    <div className="row-actions" style={{ display: 'flex', gap: '6px' }}>
                        {actions(v)}
                    </div>
                    <Icon.chevron width={14} height={14} style={{ color: T.faint, flexShrink: 0 }} />
                </div>
            </td>
        </tr>
    );

    const SectionCard = ({ dotColor, title, count, headers, rows, emptyMsg, renderActions }) => (
        <div style={{
            background: T.surface, borderRadius: '10px', border: `1px solid ${T.border}`,
            marginBottom: '28px', overflow: 'hidden',
        }}>
            <div style={{
                padding: '16px 20px', borderBottom: `1px solid ${T.borderSoft}`,
                display: 'flex', alignItems: 'center', gap: '9px', background: T.surfaceAlt,
            }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
                <span style={{
                    fontFamily: "'Oswald', sans-serif", fontSize: '13px', fontWeight: 600,
                    color: T.ink, textTransform: 'uppercase', letterSpacing: '0.6px',
                }}>{title}</span>
                <span style={{
                    fontSize: '11.5px', fontWeight: 700, color: T.muted,
                    background: T.borderSoft, padding: '1px 8px', borderRadius: '999px',
                }}>{count}</span>
            </div>
            {rows.length === 0 ? (
                <div style={{ padding: '36px', textAlign: 'center', color: T.faint, fontSize: '13px' }}>{emptyMsg}</div>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            {headers.map((h, i) => (
                                <th key={h} style={{
                                    padding: '10px 20px', textAlign: i === headers.length - 1 ? 'right' : 'left',
                                    fontSize: '10.5px', fontWeight: 700, color: T.faint,
                                    textTransform: 'uppercase', letterSpacing: '0.7px',
                                }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(v => <VolunteerRow key={v.id} v={v} actions={renderActions} />)}
                    </tbody>
                </table>
            )}
        </div>
    );

    return (
        <>
            <Head title="Manage Volunteers" />
            <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

            <style>{`
                * { box-sizing: border-box; }
                body { font-family: 'Inter', sans-serif; }

                .vol-list-scroll { max-height: 300px; overflow-y: auto; }
                .vol-list-scroll::-webkit-scrollbar { width: 6px; }
                .vol-list-scroll::-webkit-scrollbar-track { background: transparent; }
                .vol-list-scroll::-webkit-scrollbar-thumb { background-color: #C7CBD3; border-radius: 999px; }
                .vol-list-scroll::-webkit-scrollbar-thumb:hover { background-color: #9AA0AC; }
                .vol-list-scroll { scrollbar-width: thin; scrollbar-color: #C7CBD3 transparent; }

                /* Hover-reveal row actions — chevron stays put, the
                   action buttons (including delete) fade in only when
                   the row is actively hovered. */
                .row-actions { opacity: 0; transform: translateX(4px); transition: opacity 0.12s ease, transform 0.12s ease; }
                .vol-row:hover .row-actions,
                .vol-row:focus-within .row-actions,
                .recent-row:hover .row-actions,
                .recent-row:focus-within .row-actions { opacity: 1; transform: translateX(0); }

                .icon-btn {
                    position: relative;
                    width: 30px; height: 30px;
                    display: inline-flex; align-items: center; justify-content: center;
                    background: var(--bg); color: var(--fg);
                    border: 1px solid var(--border);
                    border-radius: 6px; cursor: pointer;
                    transition: background 0.12s ease, transform 0.08s ease;
                }
                .icon-btn:hover { background: var(--hoverBg); }
                .icon-btn:active { transform: scale(0.94); }

                .icon-btn::after {
                    content: attr(data-tooltip);
                    position: absolute;
                    bottom: calc(100% + 7px);
                    left: 50%;
                    transform: translateX(-50%) translateY(2px);
                    background: #1A1E27;
                    color: #fff;
                    font-size: 11px;
                    font-weight: 500;
                    font-family: 'Inter', sans-serif;
                    padding: 5px 9px;
                    border-radius: 5px;
                    white-space: nowrap;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.12s ease, transform 0.12s ease;
                    z-index: 20;
                }
                .icon-btn::before {
                    content: '';
                    position: absolute;
                    bottom: calc(100% + 3px);
                    left: 50%;
                    transform: translateX(-50%);
                    border: 4px solid transparent;
                    border-top-color: #1A1E27;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.12s ease;
                    z-index: 20;
                }
                .icon-btn:hover::after { opacity: 1; transform: translateX(-50%) translateY(0); }
                .icon-btn:hover::before { opacity: 1; }

                .search-input:focus { border-color: ${T.ink} !important; background: #fff !important; }
                .primary-btn:hover { background: #262B36 !important; }
                .ghost-danger-btn:hover { background: ${T.dangerSoft} !important; color: ${T.red} !important; }
            `}</style>

            {/* ── DELETE CONFIRMATION MODAL ── */}
            {toDelete && (
                <div onClick={() => setToDelete(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,17,23,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
                    <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: '12px', width: '400px', maxWidth: '90vw', padding: '28px 30px', boxShadow: '0 24px 64px rgba(15,17,23,0.22)' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: T.dangerSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                            <Icon.trash width={20} height={20} style={{ color: T.red }} />
                        </div>
                        <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '18px', fontWeight: 600, color: T.ink, marginBottom: '8px' }}>Delete this volunteer?</h3>
                        <p style={{ fontSize: '13.5px', color: T.muted, lineHeight: 1.6, marginBottom: '24px' }}>
                            <strong style={{ color: T.ink }}>{toDelete.name}</strong> and their records will be permanently removed. This can't be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setToDelete(null)} style={{ background: T.surface, border: `1px solid ${T.border}`, padding: '9px 18px', borderRadius: '7px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: T.ink2 }}>Cancel</button>
                            <button onClick={deleteVolunteer} style={{ background: T.red, color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '7px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Delete volunteer</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── REVOKE CONFIRMATION MODAL ── */}
            {toRevoke && (
                <div onClick={() => setToRevoke(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,17,23,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
                    <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: '12px', width: '400px', maxWidth: '90vw', padding: '28px 30px', boxShadow: '0 24px 64px rgba(15,17,23,0.22)' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: T.warningSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                            <Icon.undo width={20} height={20} style={{ color: T.warning }} />
                        </div>
                        <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '18px', fontWeight: 600, color: T.ink, marginBottom: '8px' }}>Revoke access?</h3>
                        <p style={{ fontSize: '13.5px', color: T.muted, lineHeight: 1.6, marginBottom: '24px' }}>
                            <strong style={{ color: T.ink }}>{toRevoke.name}</strong> will move to Rejected and lose volunteer access. You can re-approve them later.
                        </p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setToRevoke(null)} style={{ background: T.surface, border: `1px solid ${T.border}`, padding: '9px 18px', borderRadius: '7px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: T.ink2 }}>Cancel</button>
                            <button onClick={confirmRevoke} style={{ background: T.warning, color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '7px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Revoke access</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── VOLUNTEER QUICK-VIEW MODAL ── */}
            {selectedVolunteer && (
                <div onClick={() => setSelectedVolunteer(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,17,23,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: '14px', width: '460px', maxWidth: '100%', boxShadow: '0 24px 64px rgba(15,17,23,0.28)', overflow: 'hidden' }}>
                        <div style={{ padding: '22px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {/* Delete lives here in the detail view instead of sitting loud on the row */}
                            <button
                                onClick={() => { setToDelete(selectedVolunteer); setSelectedVolunteer(null); }}
                                className="ghost-danger-btn"
                                style={{
                                    background: 'transparent', border: 'none', color: T.faint,
                                    fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                    padding: '5px 8px', borderRadius: '6px', transition: 'background 0.12s, color 0.12s',
                                }}
                            >
                                <Icon.trash width={13} height={13} />
                                Delete
                            </button>
                            <button onClick={() => setSelectedVolunteer(null)} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, width: '28px', height: '28px', borderRadius: '7px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted }}>
                                <Icon.close width={14} height={14} />
                            </button>
                        </div>

                        <div style={{ padding: '4px 24px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <Avatar v={selectedVolunteer} size={84} />
                            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '19px', fontWeight: 600, color: T.ink, marginTop: '14px' }}>{selectedVolunteer.name}</div>
                            <div style={{ fontSize: '12.5px', color: T.faint, marginTop: '2px', marginBottom: '10px' }}>{selectedVolunteer.branch || 'Muntinlupa City Branch'}</div>
                            <StatusBadge status={selectedVolunteer.status} />
                        </div>

                        <div style={{ padding: '0 24px 24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '22px' }}>
                                {[
                                    { label: 'Email',      value: selectedVolunteer.email },
                                    { label: 'Phone',      value: selectedVolunteer.phone || selectedVolunteer.contact_number || '—' },
                                    { label: 'Address',    value: selectedVolunteer.address || '—' },
                                    { label: 'Registered', value: fmtDate(selectedVolunteer.created_at, { year: 'numeric', month: 'long', day: 'numeric' }) },
                                ].map(({ label, value }) => (
                                    <div key={label} style={{ background: T.surfaceAlt, border: `1px solid ${T.borderSoft}`, borderRadius: '9px', padding: '11px 13px' }}>
                                        <div style={{ fontSize: '10px', fontWeight: 700, color: T.faint, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '4px' }}>{label}</div>
                                        <div style={{ fontSize: '12.5px', color: T.ink2, wordBreak: 'break-word', fontWeight: 500 }}>{value}</div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => setSelectedVolunteer(null)} style={{ flex: 1, padding: '10px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: T.ink2 }}>Close</button>
                                <button onClick={() => { setSelectedVolunteer(null); viewProfile(selectedVolunteer.id); }} className="primary-btn" style={{ flex: 1.4, padding: '10px', background: T.ink, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'background 0.15s' }}>
                                    View full profile <Icon.chevron width={14} height={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ fontFamily: "'Inter', sans-serif" }}>

                {/* Page heading */}
                <div style={{ marginBottom: '26px' }}>
                    <h1 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '22px', fontWeight: 600, color: T.ink, textTransform: 'uppercase', letterSpacing: '0.4px', margin: 0 }}>Volunteers</h1>
                    <p style={{ fontSize: '13px', color: T.muted, marginTop: '4px' }}>Review applications, manage access, and keep the roster up to date.</p>
                </div>

                {/* Flash */}
                {flash?.success && (
                    <div style={{ marginBottom: '24px', padding: '12px 16px', background: T.successSoft, border: '1px solid #C4E9D3', borderRadius: '8px', fontSize: '13px', color: T.success, fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Icon.check width={15} height={15} />
                        {flash.success}
                    </div>
                )}

                {/* Stats — color-coded: pending stays neutral while empty,
                    approved always reads green, rejected always reads red */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '32px' }}>
                    {[
                        {
                            label: 'Pending Approval',
                            value: pending.length,
                            bg: pending.length > 0 ? T.warningSoft : T.surface,
                            border: pending.length > 0 ? T.warningBorder : T.border,
                            fg: pending.length > 0 ? T.warning : T.ink,
                            fgLabel: pending.length > 0 ? T.warning : T.muted,
                        },
                        {
                            label: 'Approved',
                            value: approved.length,
                            bg: T.successSoft,
                            border: T.successBorder,
                            fg: T.success,
                            fgLabel: T.success,
                        },
                        {
                            label: 'Rejected',
                            value: rejected.length,
                            bg: T.dangerSoft,
                            border: T.dangerBorder,
                            fg: T.red,
                            fgLabel: T.red,
                        },
                    ].map(({ label, value, bg, border, fg, fgLabel }) => (
                        <div key={label} style={{ background: bg, padding: '20px', borderRadius: '10px', border: `1px solid ${border}` }}>
                            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '28px', color: fg, fontWeight: 600, lineHeight: 1 }}>{value}</div>
                            <div style={{ fontSize: '12.5px', color: fgLabel, marginTop: '6px', fontWeight: 500 }}>{label}</div>
                        </div>
                    ))}
                </div>

                {/* ── RECENT VOLUNTEERS ── */}
                <div style={{ background: T.surface, borderRadius: '10px', border: `1px solid ${T.border}`, marginBottom: '32px', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.surfaceAlt, flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: T.red }} />
                            <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '13px', fontWeight: 600, color: T.ink, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Recent Volunteers</span>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Icon.search width={14} height={14} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: T.faint }} />
                            <input
                                type="text"
                                placeholder="Search by name or email…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="search-input"
                                style={{
                                    paddingLeft: '32px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px',
                                    fontSize: '13px', border: `1px solid ${T.border}`, borderRadius: '7px', outline: 'none',
                                    width: '240px', color: T.ink, background: T.surface, transition: 'border-color 0.12s',
                                    fontFamily: 'Inter, sans-serif',
                                }}
                            />
                        </div>
                    </div>

                    <div className="vol-list-scroll">
                        {recent.length === 0 ? (
                            <div style={{ padding: '36px', textAlign: 'center', color: T.faint, fontSize: '13px' }}>No volunteers match your search.</div>
                        ) : (
                            recent.map((v, i) => (
                                <div
                                    key={v.id}
                                    className="recent-row"
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '13px 20px',
                                        borderTop: i === 0 ? 'none' : `1px solid ${T.borderSoft}`,
                                        cursor: 'pointer', transition: 'background 0.12s',
                                    }}
                                    onClick={() => setSelectedVolunteer(v)}
                                    onMouseEnter={e => e.currentTarget.style.background = T.surfaceAlt}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                                        <Avatar v={v} size={36} />
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontSize: '13.5px', fontWeight: 600, color: T.ink }}>{v.name}</div>
                                            <div style={{ fontSize: '12px', color: T.faint, marginTop: '1px' }}>{v.email}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                                        <span style={{ fontSize: '12px', color: T.faint }}>{fmtDate(v.created_at)}</span>
                                        <StatusBadge status={v.status} />
                                        {/* Delete only appears on hover — chevron is always the visible affordance */}
                                        <div className="row-actions" onClick={e => e.stopPropagation()}>
                                            <IconBtn icon={Icon.trash} label="Delete" tone="danger" onClick={() => setToDelete(v)} />
                                        </div>
                                        <Icon.chevron width={14} height={14} style={{ color: T.faint }} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* ── PENDING ── */}
                <SectionCard
                    dotColor={T.warning}
                    title="Pending Approval"
                    count={pending.length}
                    headers={['Name', 'Email', 'Registered', 'Actions']}
                    rows={pending}
                    emptyMsg="No pending volunteers"
                    renderActions={v => (
                        <>
                            <IconBtn icon={Icon.eye} label="View profile" tone="neutral" onClick={() => viewProfile(v.id)} />
                            <IconBtn icon={Icon.check} label="Approve" tone="success" onClick={e => approve(e, v.id)} />
                            <IconBtn icon={Icon.x} label="Reject" tone="danger" onClick={e => reject(e, v.id)} />
                            <IconBtn icon={Icon.trash} label="Delete" tone="danger" onClick={() => setToDelete(v)} />
                        </>
                    )}
                />

                {/* ── APPROVED ── */}
                <SectionCard
                    dotColor={T.success}
                    title="Approved Volunteers"
                    count={approved.length}
                    headers={['Name', 'Email', 'Registered', 'Actions']}
                    rows={approved}
                    emptyMsg="No approved volunteers yet"
                    renderActions={v => (
                        <>
                            <IconBtn icon={Icon.eye} label="View profile" tone="neutral" onClick={() => viewProfile(v.id)} />
                            <IconBtn icon={Icon.undo} label="Revoke access" tone="warning" onClick={() => setToRevoke(v)} />
                            <IconBtn icon={Icon.trash} label="Delete" tone="danger" onClick={() => setToDelete(v)} />
                        </>
                    )}
                />

                {/* ── REJECTED ── */}
                <SectionCard
                    dotColor={T.red}
                    title="Rejected Volunteers"
                    count={rejected.length}
                    headers={['Name', 'Email', 'Registered', 'Actions']}
                    rows={rejected}
                    emptyMsg="No rejected volunteers"
                    renderActions={v => (
                        <>
                            <IconBtn icon={Icon.eye} label="View profile" tone="neutral" onClick={() => viewProfile(v.id)} />
                            <IconBtn icon={Icon.userCheck} label="Re-approve" tone="success" onClick={e => approve(e, v.id)} />
                            <IconBtn icon={Icon.trash} label="Delete" tone="danger" onClick={() => setToDelete(v)} />
                        </>
                    )}
                />

            </div>
        </>
    );
}

// ✅ Persistent layout — sidebar hindi na mawawala
Volunteers.layout = (page) => <AdminLayout title="Volunteers">{page}</AdminLayout>;

export default Volunteers;