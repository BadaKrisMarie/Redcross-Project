import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import VolunteerLayout from '@/Layouts/VolunteerLayout'; // ⚠️ ayusin ang path base sa project mo

const RED = '#ff0000';

/**
 * ✅ Hindi na dito ginagawa ang sidebar/topbar — galing na sa VolunteerLayout.
 * Kaya persistent na siya at hindi na "magbabago" tuwing lilipat ka ng page.
 */
function VolunteerCommunication({ sentEmails, announcements }) {
    const emails = sentEmails || [];
    const announces = announcements || [];
    const [activeTab, setActiveTab] = useState('compose');
    const [selectedInbox, setSelectedInbox] = useState(null);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [focusedField, setFocusedField] = useState(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        to: 'rizalmuntinlupa@redcross.org.ph',
        subject: '',
        message: '',
    });

    const handleSend = (e) => {
        e.preventDefault();
        post(route('volunteer.communication.send'), {
            onSuccess: () => { reset('subject', 'message'); setActiveTab('sent'); },
        });
    };

    const repliedEmails = emails.filter(e => e.reply);
    const unreadReplies = repliedEmails.length;

    const tabs = [
        { key: 'compose',       label: 'Compose',       icon: <PencilIcon /> },
        { key: 'inbox',         label: 'Inbox',         icon: <InboxIcon />,  badge: unreadReplies, badgeColor: RED },
        { key: 'announcements', label: 'Announcements', icon: <MegaphoneIcon />, badge: announces.length, badgeColor: '#F59E0B' },
        { key: 'sent',          label: 'Sent',          icon: <SendIcon /> },
    ];

    const tabStyle = (key) => ({
        display: 'flex', alignItems: 'center', gap: '7px',
        padding: '13px 18px', fontSize: '13px',
        fontWeight: activeTab === key ? '700' : '500',
        color: activeTab === key ? RED : '#6B7280',
        borderBottom: activeTab === key ? `2.5px solid ${RED}` : '2.5px solid transparent',
        background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
        transition: 'color 0.15s',
    });

    const inputStyle = (field, extra = {}) => ({
        width: '100%', padding: '12px 15px',
        border: focusedField === field ? `1.5px solid ${RED}` : '1.5px solid #E5E7EB',
        borderRadius: '10px', fontSize: '13.5px', outline: 'none',
        boxSizing: 'border-box', fontFamily: "'Montserrat', sans-serif", color: '#111827',
        background: focusedField === field ? '#FFFFFF' : '#FAFAFA',
        boxShadow: focusedField === field ? '0 0 0 4px rgba(255,0,0,0.08)' : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
        ...extra,
    });

    const labelStyle = { fontSize: '12.5px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '7px', letterSpacing: '0.1px' };

    return (
        // ✅ FIXED: dating <> fragment, ngayon <div> na may fontFamily para lumaganap
        // ang Montserrat sa LAHAT ng text sa page — headers, tabs, modals, list items —
        // hindi lang sa inputs.
        <div style={{ fontFamily: "'Montserrat', sans-serif" }}>
            <Head title="Communication" />
            {/* ✅ FIXED: "monserrat" (typo, lowercase) -> "Montserrat" (case-sensitive sa Google Fonts,
                kaya dati hindi talaga naglo-load ang tamang font) */}
            <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

            {/* ── INBOX MODAL ── */}
            {selectedInbox !== null && (
                <div
                    onClick={() => setSelectedInbox(null)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 200,
                        background: 'rgba(17,17,17,0.5)', backdropFilter: 'blur(2px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '24px', animation: 'fadeIn 0.15s ease-out',
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'white', borderRadius: '18px',
                            width: '100%', maxWidth: '560px',
                            maxHeight: '80vh', overflowY: 'auto',
                            boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
                            animation: 'popIn 0.18s ease-out',
                        }}
                    >
                        <div style={{
                            padding: '22px 26px 18px',
                            borderBottom: '1px solid #F3F4F6',
                            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px',
                        }}>
                            <div>
                                <div style={{ fontSize: '17px', fontWeight: '700', color: '#111', marginBottom: '5px' }}>
                                    {selectedInbox.subject}
                                </div>
                                <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                                    {selectedInbox.replied_at
                                        ? new Date(selectedInbox.replied_at).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                        : ''}
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedInbox(null)}
                                style={{
                                    background: '#F3F4F6', border: 'none', borderRadius: '9px',
                                    width: '32px', height: '32px', cursor: 'pointer',
                                    fontSize: '15px', color: '#6B7280', flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#E5E7EB'}
                                onMouseLeave={e => e.currentTarget.style.background = '#F3F4F6'}
                            >✕</button>
                        </div>

                        <div style={{ padding: '20px 26px 4px' }}>
                            <div style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '9px' }}>Your Message</div>
                            <div style={{
                                background: '#F9FAFB', border: '1px solid #E5E7EB',
                                borderRadius: '12px', padding: '15px 17px',
                                fontSize: '13px', color: '#374151', lineHeight: '1.7',
                            }}>
                                {selectedInbox.message}
                            </div>
                        </div>

                        <div style={{ padding: '18px 26px 26px' }}>
                            <div style={{ fontSize: '11px', fontWeight: '700', color: RED, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '9px' }}>Admin Reply</div>
                            <div style={{
                                background: '#FEF2F2', border: '1px solid #FECACA',
                                borderRadius: '12px', padding: '15px 17px',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '11px' }}>
                                    <div style={{
                                        width: '30px', height: '30px', borderRadius: '50%',
                                        background: RED, display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: '700',
                                        boxShadow: '0 2px 6px rgba(255,0,0,0.3)',
                                    }}>A</div>
                                    <div>
                                        <div style={{ fontSize: '12px', fontWeight: '700', color: RED }}>Admin</div>
                                        <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Rizal Chapter · Muntinlupa</div>
                                    </div>
                                </div>
                                <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.7' }}>{selectedInbox.reply}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── ANNOUNCEMENT MODAL ── */}
            {selectedAnnouncement !== null && (
                <div
                    onClick={() => setSelectedAnnouncement(null)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 200,
                        background: 'rgba(17,17,17,0.5)', backdropFilter: 'blur(2px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '24px', animation: 'fadeIn 0.15s ease-out',
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'white', borderRadius: '18px',
                            width: '100%', maxWidth: '560px',
                            maxHeight: '80vh', overflowY: 'auto',
                            boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
                            animation: 'popIn 0.18s ease-out',
                        }}
                    >
                        <div style={{
                            padding: '22px 26px 18px',
                            borderBottom: '1px solid #F3F4F6',
                            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px',
                        }}>
                            <div>
                                <span style={{
                                    background: '#FEF2F2', color: RED,
                                    fontSize: '10px', fontWeight: '700',
                                    padding: '3px 9px', borderRadius: '10px',
                                    display: 'inline-block', marginBottom: '9px', letterSpacing: '0.3px',
                                }}>ANNOUNCEMENT</span>
                                <div style={{ fontSize: '17px', fontWeight: '700', color: '#111', marginBottom: '5px' }}>
                                    {selectedAnnouncement.title}
                                </div>
                                <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                                    {new Date(selectedAnnouncement.created_at).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    {' · '}Posted by {selectedAnnouncement.admin?.name || 'Admin'}
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedAnnouncement(null)}
                                style={{
                                    background: '#F3F4F6', border: 'none', borderRadius: '9px',
                                    width: '32px', height: '32px', cursor: 'pointer',
                                    fontSize: '15px', color: '#6B7280', flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#E5E7EB'}
                                onMouseLeave={e => e.currentTarget.style.background = '#F3F4F6'}
                            >✕</button>
                        </div>

                        <div style={{ padding: '20px 26px 30px' }}>
                            <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                                {selectedAnnouncement.body}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div style={{ background: 'white', borderBottom: '1px solid #E5E7EB', borderTop: '1px solid #E5E7EB', margin: '-28px -28px 0', padding: '0 28px', display: 'flex', gap: '6px' }}>
                {tabs.map(t => (
                    <button key={t.key} style={tabStyle(t.key)} onClick={() => setActiveTab(t.key)}>
                        <span style={{ display: 'flex', opacity: activeTab === t.key ? 1 : 0.6 }}>{t.icon}</span>
                        {t.label}
                        {!!t.badge && (
                            <span style={{
                                background: t.badgeColor, color: 'white', borderRadius: '10px',
                                padding: '1px 7px', fontSize: '10px', fontWeight: '700',
                                minWidth: '17px', textAlign: 'center', lineHeight: '15px',
                            }}>{t.badge}</span>
                        )}
                    </button>
                ))}
            </div>

            <div style={{ paddingTop: '28px' }}>

                {activeTab === 'compose' && (
                    <div style={{ maxWidth: '580px' }}>
                        <div style={{
                            background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.03)', overflow: 'hidden',
                        }}>
                            {/* Card header with accent */}
                            <div style={{
                                padding: '22px 28px', borderBottom: '1px solid #F3F4F6',
                                display: 'flex', alignItems: 'center', gap: '13px',
                            }}>
                                <div style={{
                                    width: 42, height: 42, borderRadius: '12px', flexShrink: 0,
                                    background: 'linear-gradient(135deg, #ff0000, #cc0000)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 4px 10px rgba(255,0,0,0.25)',
                                }}>
                                    <SendIconWhite />
                                </div>
                                <div>
                                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#111' }}>Send a Message to Admin</div>
                                    <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>We typically reply within 1–2 business days</div>
                                </div>
                            </div>

                            <form onSubmit={handleSend} style={{ padding: '26px 28px 28px' }}>
                                <div style={{ marginBottom: '18px' }}>
                                    <label style={labelStyle}>To</label>
                                    <input
                                        type="text" value={data.to} readOnly
                                        onFocus={() => setFocusedField('to')}
                                        onBlur={() => setFocusedField(null)}
                                        style={inputStyle('to', { color: '#6B7280', cursor: 'default' })}
                                    />
                                    {errors.to && <div style={{ fontSize: '11px', color: RED, marginTop: '5px' }}>{errors.to}</div>}
                                </div>
                                <div style={{ marginBottom: '18px' }}>
                                    <label style={labelStyle}>Subject</label>
                                    <input
                                        type="text" value={data.subject}
                                        onChange={e => setData('subject', e.target.value)}
                                        onFocus={() => setFocusedField('subject')}
                                        onBlur={() => setFocusedField(null)}
                                        placeholder="e.g. Schedule Conflict"
                                        style={inputStyle('subject')}
                                    />
                                    {errors.subject && <div style={{ fontSize: '11px', color: RED, marginTop: '5px' }}>{errors.subject}</div>}
                                </div>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={labelStyle}>Message</label>
                                    <textarea
                                        value={data.message}
                                        onChange={e => setData('message', e.target.value)}
                                        onFocus={() => setFocusedField('message')}
                                        onBlur={() => setFocusedField(null)}
                                        placeholder="Type your message here..." rows={6}
                                        style={inputStyle('message', { resize: 'vertical' })}
                                    />
                                    {errors.message && <div style={{ fontSize: '11px', color: RED, marginTop: '5px' }}>{errors.message}</div>}
                                </div>
                                <button
                                    type="submit" disabled={processing}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                                        background: processing ? '#F87171' : RED, color: 'white',
                                        border: 'none', borderRadius: '10px', padding: '12px 26px',
                                        fontSize: '13.5px', fontWeight: '700',
                                        cursor: processing ? 'not-allowed' : 'pointer',
                                        boxShadow: processing ? 'none' : '0 4px 12px rgba(255,0,0,0.28)',
                                        transition: 'transform 0.1s, box-shadow 0.15s',
                                    }}
                                    onMouseEnter={e => { if (!processing) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                                >
                                    {processing ? 'Sending...' : (<><SendIconWhite small /> Send Message</>)}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* INBOX — click to open modal */}
                {activeTab === 'inbox' && (
                    <div style={{ maxWidth: '700px' }}>
                        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
                            <div style={{ padding: '18px 24px', borderBottom: '1px solid #F3F4F6' }}>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#111' }}>Admin Replies</div>
                            </div>
                            {repliedEmails.length === 0 ? (
                                <EmptyState icon={<InboxIcon size={26} color="#D1D5DB" />} text="No replies yet" />
                            ) : (
                                repliedEmails.map((email, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setSelectedInbox(email)}
                                        style={{
                                            padding: '17px 24px',
                                            borderBottom: i < repliedEmails.length - 1 ? '1px solid #F3F4F6' : 'none',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                                            justifyContent: 'space-between', gap: '12px',
                                            transition: 'background 0.12s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'white'}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '13px', flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                width: '38px', height: '38px', borderRadius: '50%',
                                                background: '#FEF2F2', display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', color: RED, fontSize: '14px',
                                                fontWeight: '700', flexShrink: 0,
                                            }}>A</div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#111' }}>{email.subject}</div>
                                                <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    Admin: {email.reply}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                            <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
                                                {email.replied_at ? new Date(email.replied_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }) : ''}
                                            </div>
                                            <span style={{ color: '#D1D5DB', fontSize: '14px' }}>›</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* ANNOUNCEMENTS — click to open modal */}
                {activeTab === 'announcements' && (
                    <div style={{ maxWidth: '700px' }}>
                        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
                            <div style={{ padding: '18px 24px', borderBottom: '1px solid #F3F4F6' }}>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#111' }}>Announcements from Admin</div>
                            </div>
                            {announces.length === 0 ? (
                                <EmptyState icon={<MegaphoneIcon size={26} color="#D1D5DB" />} text="No announcements yet" />
                            ) : (
                                announces.map((a, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setSelectedAnnouncement(a)}
                                        style={{
                                            padding: '17px 24px',
                                            borderBottom: i < announces.length - 1 ? '1px solid #F3F4F6' : 'none',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                                            justifyContent: 'space-between', gap: '12px',
                                            transition: 'background 0.12s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'white'}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '13px', flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                width: '38px', height: '38px', borderRadius: '50%',
                                                background: '#FEF9C3', display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', flexShrink: 0,
                                            }}>
                                                <MegaphoneIcon size={16} color="#B45309" />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#111' }}>{a.title}</div>
                                                <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {a.body}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                            <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
                                                {new Date(a.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                                            </div>
                                            <span style={{ color: '#D1D5DB', fontSize: '14px' }}>›</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'sent' && (
                    <div style={{ maxWidth: '700px' }}>
                        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
                            <div style={{ padding: '18px 24px', borderBottom: '1px solid #F3F4F6' }}>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#111' }}>Sent Messages</div>
                            </div>
                            {emails.length === 0 ? (
                                <EmptyState icon={<SendIcon size={26} color="#D1D5DB" />} text="No sent messages yet" />
                            ) : (
                                emails.map((email, i) => (
                                    <div key={i} style={{ padding: '17px 24px', borderBottom: i < emails.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#111', marginBottom: '4px' }}>{email.subject}</div>
                                                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email.message}</div>
                                                <div style={{ fontSize: '10.5px', color: '#9CA3AF' }}>
                                                    {new Date(email.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </div>
                                            {email.reply && (
                                                <span style={{ background: '#DCFCE7', color: '#166534', fontSize: '10px', fontWeight: '700', padding: '3px 9px', borderRadius: '10px', flexShrink: 0 }}>Replied</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes popIn { from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: scale(1); } }
                input::placeholder, textarea::placeholder { color: #B0B5BD; }
            `}</style>
        </div>
    );
}

function EmptyState({ icon, text }) {
    return (
        <div style={{ padding: '52px 24px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>
            <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
            {text}
        </div>
    );
}

function PencilIcon({ size = 14 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>;
}
function InboxIcon({ size = 14, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z"/></svg>;
}
function MegaphoneIcon({ size = 14, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>;
}
function SendIcon({ size = 14, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
}
function SendIconWhite({ small = false }) {
    const size = small ? 14 : 19;
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
}

// ✅ Ito ang susi — gagamitin na ang persistent VolunteerLayout, hindi na gagawa ng sarili niyang sidebar
VolunteerCommunication.layout = (page) => <VolunteerLayout title="Communication">{page}</VolunteerLayout>;

export default VolunteerCommunication;