import React from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function VolunteerCommunication({ auth, sentEmails, announcements }) {
    const volunteer = auth.user;
    const avatarUrl = volunteer?.photo_url || null;
    const initials = volunteer?.name
        ? volunteer.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : '?';

    const emails = sentEmails || [];
    const announces = announcements || [];
    const [activeTab, setActiveTab] = useState('compose');
    const [selectedInbox, setSelectedInbox] = useState(null);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        to: 'rizalmuntinlupa@redcross.org.ph',
        subject: '',
        message: '',
    });

    const handleLogout = () => router.post(route('logout'));

    const handleSend = (e) => {
        e.preventDefault();
        post(route('volunteer.communication.send'), {
            onSuccess: () => { reset('subject', 'message'); setActiveTab('sent'); },
        });
    };

    const repliedEmails = emails.filter(e => e.reply);
    const unreadReplies = repliedEmails.length;

    const sidebarLinks = [
        { key: 'dashboard',     label: 'Dashboard',     href: route('volunteer.dashboard'),     icon: <GridIcon /> },
        { key: 'schedule',      label: 'Schedule',      href: route('volunteer.schedule'),      icon: <CalIcon /> },
        { key: 'communication', label: 'Communication', href: route('volunteer.communication'), icon: <ChatIcon /> },
        { key: 'attendance',    label: 'Attendance',    href: route('volunteer.attendance'),    icon: <CheckIcon /> },
        { key: 'documents',     label: '201',           href: route('volunteer.documents'),     icon: <FolderIcon /> },
    ];

    const tabStyle = (key) => ({
        padding: '8px 16px', fontSize: '13px', fontWeight: activeTab === key ? '600' : '400',
        color: activeTab === key ? '#CC0000' : '#6B7280',
        borderBottom: activeTab === key ? '2px solid #CC0000' : '2px solid transparent',
        background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
    });

    return (
        <>
            <Head title="Communication" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

            {/* ── INBOX MODAL ── */}
            {selectedInbox !== null && (
                <div
                    onClick={() => setSelectedInbox(null)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 200,
                        background: 'rgba(0,0,0,0.45)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '24px',
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'white', borderRadius: '14px',
                            width: '100%', maxWidth: '560px',
                            maxHeight: '80vh', overflowY: 'auto',
                            boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
                        }}
                    >
                        {/* Modal header */}
                        <div style={{
                            padding: '20px 24px 16px',
                            borderBottom: '1px solid #F3F4F6',
                            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px',
                        }}>
                            <div>
                                <div style={{ fontSize: '16px', fontWeight: '700', color: '#111', marginBottom: '4px' }}>
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
                                    background: '#F3F4F6', border: 'none', borderRadius: '8px',
                                    width: '32px', height: '32px', cursor: 'pointer',
                                    fontSize: '16px', color: '#6B7280', flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                            >✕</button>
                        </div>

                        {/* Your original message */}
                        <div style={{ padding: '20px 24px' }}>
                            <div style={{ fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Your Message</div>
                            <div style={{
                                background: '#F9FAFB', border: '1px solid #E5E7EB',
                                borderRadius: '10px', padding: '14px 16px',
                                fontSize: '13px', color: '#374151', lineHeight: '1.7',
                            }}>
                                {selectedInbox.message}
                            </div>
                        </div>

                        {/* Admin reply */}
                        <div style={{ padding: '0 24px 24px' }}>
                            <div style={{ fontSize: '11px', fontWeight: '600', color: '#CC0000', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Admin Reply</div>
                            <div style={{
                                background: '#FEF2F2', border: '1px solid #FECACA',
                                borderRadius: '10px', padding: '14px 16px',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                    <div style={{
                                        width: '28px', height: '28px', borderRadius: '50%',
                                        background: '#CC0000', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: '700',
                                    }}>A</div>
                                    <div>
                                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#CC0000' }}>Admin</div>
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
                        background: 'rgba(0,0,0,0.45)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '24px',
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'white', borderRadius: '14px',
                            width: '100%', maxWidth: '560px',
                            maxHeight: '80vh', overflowY: 'auto',
                            boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
                        }}
                    >
                        {/* Modal header */}
                        <div style={{
                            padding: '20px 24px 16px',
                            borderBottom: '1px solid #F3F4F6',
                            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px',
                        }}>
                            <div>
                                <span style={{
                                    background: '#FEF2F2', color: '#CC0000',
                                    fontSize: '10px', fontWeight: '700',
                                    padding: '2px 8px', borderRadius: '10px',
                                    display: 'inline-block', marginBottom: '8px',
                                }}>ANNOUNCEMENT</span>
                                <div style={{ fontSize: '16px', fontWeight: '700', color: '#111', marginBottom: '4px' }}>
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
                                    background: '#F3F4F6', border: 'none', borderRadius: '8px',
                                    width: '32px', height: '32px', cursor: 'pointer',
                                    fontSize: '16px', color: '#6B7280', flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                            >✕</button>
                        </div>

                        {/* Body */}
                        <div style={{ padding: '20px 24px 28px' }}>
                            <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                                {selectedAnnouncement.body}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif", background: '#F3F4F6' }}>

                {/* SIDEBAR */}
                <aside style={{
                    width: '160px', minHeight: '100vh', background: '#CC0000',
                    display: 'flex', flexDirection: 'column', flexShrink: 0,
                    position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100,
                }}>
                    <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: 'white', lineHeight: '1.4' }}>
                            Rizal Chapter<br />
                            <span style={{ fontWeight: '400', opacity: 0.85 }}>Muntinlupa City Branch</span>
                        </div>
                    </div>
                    <nav style={{ flex: 1, paddingTop: '8px' }}>
                        {sidebarLinks.map(item => {
                            const isActive = item.key === 'communication';
                            return (
                                <Link key={item.key} href={item.href} style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '11px 16px', textDecoration: 'none',
                                    background: isActive ? 'rgba(0,0,0,0.18)' : 'transparent',
                                    color: 'white', fontSize: '13px',
                                    fontWeight: isActive ? '600' : '400',
                                    borderLeft: isActive ? '3px solid white' : '3px solid transparent',
                                }}>
                                    <span style={{ opacity: isActive ? 1 : 0.7, flexShrink: 0 }}>{item.icon}</span>
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                    <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                        <button onClick={handleLogout} style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            color: 'rgba(255,255,255,0.75)', fontSize: '12px', padding: 0, width: '100%'
                        }}>
                            <span style={{ fontSize: '16px' }}>⏻</span> Log out
                        </button>
                    </div>
                </aside>

                {/* MAIN */}
                <div style={{ marginLeft: '160px', flex: 1, display: 'flex', flexDirection: 'column' }}>

                    {/* Topbar */}
                    <header style={{
                        background: 'white', padding: '0 28px', height: '52px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, zIndex: 50
                    }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>Communication</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div title={volunteer?.name} style={{
                                width: '30px', height: '30px', borderRadius: '50%',
                                background: avatarUrl ? 'transparent' : '#CC0000',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontSize: '12px', fontWeight: '700',
                                flexShrink: 0, overflow: 'hidden',
                            }}>
                                {avatarUrl
                                    ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                    : initials
                                }
                            </div>
                        </div>
                    </header>

                    {/* Tabs */}
                    <div style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '0 28px', display: 'flex', gap: '4px' }}>
                        <button style={tabStyle('compose')} onClick={() => setActiveTab('compose')}>✏️ Compose</button>
                        <button style={tabStyle('inbox')} onClick={() => setActiveTab('inbox')}>
                            📥 Inbox {unreadReplies > 0 && <span style={{ background: '#CC0000', color: 'white', borderRadius: '10px', padding: '1px 6px', fontSize: '10px', marginLeft: '4px' }}>{unreadReplies}</span>}
                        </button>
                        <button style={tabStyle('announcements')} onClick={() => setActiveTab('announcements')}>
                            📢 Announcements {announces.length > 0 && <span style={{ background: '#F59E0B', color: 'white', borderRadius: '10px', padding: '1px 6px', fontSize: '10px', marginLeft: '4px' }}>{announces.length}</span>}
                        </button>
                        <button style={tabStyle('sent')} onClick={() => setActiveTab('sent')}>📤 Sent</button>
                    </div>

                    <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>

                        {activeTab === 'compose' && (
                            <div style={{ maxWidth: '560px' }}>
                                <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '28px' }}>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '20px' }}>Send a Message to Admin</div>
                                    <form onSubmit={handleSend}>
                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '6px' }}>To:</label>
                                            <input type="text" value={data.to} onChange={e => setData('to', e.target.value)}
                                                style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', background: '#FAFAFA' }} />
                                            {errors.to && <div style={{ fontSize: '11px', color: '#CC0000', marginTop: '4px' }}>{errors.to}</div>}
                                        </div>
                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '6px' }}>Subject</label>
                                            <input type="text" value={data.subject} onChange={e => setData('subject', e.target.value)}
                                                placeholder="e.g. Schedule Conflict"
                                                style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                                            {errors.subject && <div style={{ fontSize: '11px', color: '#CC0000', marginTop: '4px' }}>{errors.subject}</div>}
                                        </div>
                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '6px' }}>Message</label>
                                            <textarea value={data.message} onChange={e => setData('message', e.target.value)}
                                                placeholder="Type your message here..." rows={6}
                                                style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                                            {errors.message && <div style={{ fontSize: '11px', color: '#CC0000', marginTop: '4px' }}>{errors.message}</div>}
                                        </div>
                                        <button type="submit" disabled={processing}
                                            style={{ background: '#CC0000', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', fontWeight: '600', cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.7 : 1 }}>
                                            {processing ? 'Sending...' : 'Send Message'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* INBOX — click to open modal */}
                        {activeTab === 'inbox' && (
                            <div style={{ maxWidth: '680px' }}>
                                <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6' }}>
                                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#111' }}>Admin Replies</div>
                                    </div>
                                    {repliedEmails.length === 0 ? (
                                        <div style={{ padding: '48px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>
                                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
                                            No replies yet
                                        </div>
                                    ) : (
                                        repliedEmails.map((email, i) => (
                                            <div
                                                key={i}
                                                onClick={() => setSelectedInbox(email)}
                                                style={{
                                                    padding: '16px 20px',
                                                    borderBottom: i < repliedEmails.length - 1 ? '1px solid #F3F4F6' : 'none',
                                                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                                                    justifyContent: 'space-between', gap: '12px',
                                                    transition: 'background 0.1s',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'white'}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                                                    <div style={{
                                                        width: '36px', height: '36px', borderRadius: '50%',
                                                        background: '#FEF2F2', display: 'flex', alignItems: 'center',
                                                        justifyContent: 'center', color: '#CC0000', fontSize: '14px',
                                                        fontWeight: '700', flexShrink: 0,
                                                    }}>A</div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>{email.subject}</div>
                                                        <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            Admin: {email.reply}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#9CA3AF', flexShrink: 0 }}>
                                                    {email.replied_at ? new Date(email.replied_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }) : ''}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ANNOUNCEMENTS — click to open modal */}
                        {activeTab === 'announcements' && (
                            <div style={{ maxWidth: '680px' }}>
                                <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6' }}>
                                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#111' }}>Announcements from Admin</div>
                                    </div>
                                    {announces.length === 0 ? (
                                        <div style={{ padding: '48px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>
                                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📢</div>
                                            No announcements yet
                                        </div>
                                    ) : (
                                        announces.map((a, i) => (
                                            <div
                                                key={i}
                                                onClick={() => setSelectedAnnouncement(a)}
                                                style={{
                                                    padding: '16px 20px',
                                                    borderBottom: i < announces.length - 1 ? '1px solid #F3F4F6' : 'none',
                                                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                                                    justifyContent: 'space-between', gap: '12px',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'white'}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                                                    <div style={{
                                                        width: '36px', height: '36px', borderRadius: '50%',
                                                        background: '#FEF9C3', display: 'flex', alignItems: 'center',
                                                        justifyContent: 'center', fontSize: '18px', flexShrink: 0,
                                                    }}>📢</div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>{a.title}</div>
                                                        <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {a.body}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#9CA3AF', flexShrink: 0 }}>
                                                    {new Date(a.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'sent' && (
                            <div style={{ maxWidth: '680px' }}>
                                <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6' }}>
                                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#111' }}>Sent Messages</div>
                                    </div>
                                    {emails.length === 0 ? (
                                        <div style={{ padding: '48px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>
                                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📤</div>
                                            No sent messages yet
                                        </div>
                                    ) : (
                                        emails.map((email, i) => (
                                            <div key={i} style={{ padding: '16px 20px', borderBottom: i < emails.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#111', marginBottom: '3px' }}>{email.subject}</div>
                                                        <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email.message}</div>
                                                        <div style={{ fontSize: '10px', color: '#9CA3AF' }}>
                                                            {new Date(email.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </div>
                                                    </div>
                                                    {email.reply && (
                                                        <span style={{ background: '#DCFCE7', color: '#166534', fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '10px', flexShrink: 0, marginLeft: '12px' }}>Replied</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                    </main>
                </div>
            </div>
        </>
    );
}

function GridIcon() {
    return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
}
function CalIcon() {
    return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function ChatIcon() {
    return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}
function CheckIcon() {
    return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
}
function FolderIcon() {
    return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>;
}