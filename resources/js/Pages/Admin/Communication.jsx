import React from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function AdminCommunication({ auth, messages, announcements }) {
    const [activeTab, setActiveTab] = useState('messages');
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const replyForm = useForm({ reply: '' });
    const announceForm = useForm({ title: '', body: '' });

    const admin = auth?.user;
    const photoUrl = admin?.photo ? `/storage/${admin.photo}` : null;
    const initials = admin?.name
        ? admin.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : 'AD';

    const handleReply = (e) => {
        e.preventDefault();
        replyForm.post(route('admin.communication.reply', selectedMessage.id), {
            onSuccess: () => {
                replyForm.reset();
                setSelectedMessage(null);
            },
        });
    };

    const handleAnnounce = (e) => {
        e.preventDefault();
        announceForm.post(route('admin.communication.announce'), {
            onSuccess: () => announceForm.reset(),
        });
    };

    const handleDeleteAnnouncement = (id) => {
        if (confirm('Delete this announcement?')) {
            router.delete(route('admin.communication.announcement.delete', id));
        }
    };

    const navLinks = [
        { label: 'Dashboard',     route: 'admin.dashboard' },
        { label: 'Volunteers',    route: 'admin.volunteers' },
        { label: 'Schedule',      route: 'admin.schedule' },
        { label: 'Attendance',    route: 'admin.attendance.index' },
        { label: 'Activities',    route: 'admin.activities.index' },
        { label: '201 Files',     route: 'admin.documents.index' },
        { label: 'Communication', route: 'admin.communication' },
       
    ];

    const NavAvatar = ({ size = 32, fontSize = 12 }) => (
        <div style={{ width: size, height: size, borderRadius: '50%', background: '#C8102E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize, fontWeight: '700', overflow: 'hidden', flexShrink: 0 }}>
            {photoUrl ? <img src={photoUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
        </div>
    );

    const tabStyle = (key) => ({
        padding: '8px 18px', fontSize: '13px',
        fontWeight: activeTab === key ? '600' : '400',
        color: activeTab === key ? '#CC0000' : '#6B7280',
        borderBottom: activeTab === key ? '2px solid #CC0000' : '2px solid transparent',
        background: 'none', border: 'none', cursor: 'pointer',
    });

    return (
        <>
            <Head title="Communication" />
            <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

            <style>{`
                * { box-sizing: border-box; margin: 0; padding: 0; }
                :root { --red: #C8102E; --red-dark: #9B0B22; --ink: #1A1A1A; --muted: #6B6B6B; --border: #EDEDED; --surface: #F7F7F5; --white: #FFFFFF; }
                .wrap { display: flex; min-height: 100vh; background: var(--surface); font-family: 'DM Sans', sans-serif; font-size: 13px; }
                .sidebar { width: 220px; background: #CC0000; display: flex; flex-direction: column; position: fixed; top: 0; left: 0; height: 100vh; z-index: 100; transition: transform 0.2s; flex-shrink: 0; }
                .sidebar.closed { transform: translateX(-220px); }
                .sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 99; }
                .main { margin-left: 220px; flex: 1; display: flex; flex-direction: column; min-height: 100vh; transition: margin-left 0.2s; }
                .main.full { margin-left: 0; }
                .sb-brand { padding: 18px 20px 14px; border-bottom: 1px solid rgba(255,255,255,0.15); }
                .sb-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
                .sb-cross { width: 32px; height: 32px; background: rgba(0,0,0,0.2); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #fff; font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 700; flex-shrink: 0; }
                .sb-name { font-family: 'Barlow Condensed', sans-serif; color: #fff; font-size: 13px; font-weight: 600; letter-spacing: .5px; line-height: 1.3; }
                .sb-name span { display: block; color: rgba(255,255,255,0.7); font-size: 11px; font-weight: 400; letter-spacing: 1px; text-transform: uppercase; }
                .sb-user { padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; gap: 10px; text-decoration: none; transition: background 0.15s; }
                .sb-user:hover { background: rgba(0,0,0,0.1); }
                .sb-uname { color: #fff; font-size: 12px; font-weight: 500; line-height: 1.3; }
                .sb-uname span { display: block; color: rgba(255,255,255,0.7); font-size: 11px; font-weight: 400; }
                .sb-nav { padding: 10px 0; flex: 1; overflow-y: auto; }
                .nav-section-label { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.6); padding: 10px 20px 4px; font-weight: 600; }
                .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 20px; color: rgba(255,255,255,0.85); font-size: 13px; font-weight: 500; cursor: pointer; transition: all .15s; border-left: 2px solid transparent; text-decoration: none; }
                .nav-item:hover { background: rgba(0,0,0,0.12); color: #fff; }
                .nav-item.active { background: rgba(255,255,255,0.2); border-left-color: #fff; color: #fff; }
                .nav-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
                .sb-footer { padding: 14px 20px; border-top: 1px solid rgba(255,255,255,0.15); }
                .logout-btn { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.7); font-size: 12px; cursor: pointer; background: none; border: none; width: 100%; font-family: 'DM Sans', sans-serif; }
                .logout-btn:hover { color: #fff; }
                .topbar { background: var(--white); border-bottom: 1px solid var(--border); padding: 0 28px; height: 56px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; position: sticky; top: 0; z-index: 50; }
                .menu-btn { background: none; border: none; cursor: pointer; color: var(--ink); display: flex; align-items: center; padding: 4px; }
                .page-title { font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 700; color: var(--ink); letter-spacing: .3px; text-transform: uppercase; }
                @media (max-width: 768px) {
                    .sidebar-overlay { display: block; }
                    .main { margin-left: 0 !important; }
                    .topbar { padding: 0 16px; }
                }
            `}</style>

            <div className="wrap">

                {/* Mobile overlay */}
                {sidebarOpen && (
                    <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
                )}

                {/* SIDEBAR */}
                <aside className={`sidebar ${sidebarOpen ? '' : 'closed'}`}>
                    <div className="sb-brand">
                        <Link href={route('admin.dashboard')} className="sb-logo">
                            <div className="sb-cross">+</div>
                            <div className="sb-name">
                                Philippine Red Cross
                                <span>Rizal · Muntinlupa</span>
                            </div>
                        </Link>
                    </div>
                    <Link href={route('admin.profile')} className="sb-user">
                        <NavAvatar size={34} fontSize={12} />
                        <div className="sb-uname">
                            {admin?.name ?? 'Admin'}
                            <span>Administrator</span>
                        </div>
                    </Link>
                    <nav className="sb-nav">
                        <div className="nav-section-label">Main</div>
                        {navLinks.slice(0, 4).map(({ label, route: r, isPdf }) =>
                            isPdf ? (
                                <a key={label} href={route(r)} className="nav-item">
                                    <div className="nav-dot" />{label}
                                </a>
                            ) : (
                                <Link key={label} href={route(r)} className={`nav-item ${r === 'admin.communication' ? 'active' : ''}`}>
                                    <div className="nav-dot" />{label}
                                </Link>
                            )
                        )}
                        <div className="nav-section-label">Manage</div>
                        {navLinks.slice(4).map(({ label, route: r, isPdf }) =>
                            isPdf ? (
                                // ✅ Regular <a> tag — hindi ini-intercept ng Inertia, mag-do-download ng PDF
                                <a key={label} href={route(r)} className="nav-item">
                                    <div className="nav-dot" />{label}
                                </a>
                            ) : (
                                <Link key={label} href={route(r)} className={`nav-item ${r === 'admin.communication' ? 'active' : ''}`}>
                                    <div className="nav-dot" />{label}
                                </Link>
                            )
                        )}
                    </nav>
                    <div className="sb-footer">
                        <button className="logout-btn" onClick={() => router.post(route('logout'))}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                            Log out
                        </button>
                    </div>
                </aside>

                {/* MAIN */}
                <div className={`main ${sidebarOpen ? '' : 'full'}`}>
                    <div className="topbar">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <button className="menu-btn" onClick={() => setSidebarOpen(o => !o)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                            </button>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
                                    <Link href={route('admin.dashboard')} style={{ color: '#aaa', textDecoration: 'none' }}>Dashboard</Link>
                                    <span style={{ color: '#ccc' }}>›</span>
                                    <span style={{ color: '#1A1A1A', fontWeight: 500 }}>Communication</span>
                                </div>
                                <div className="page-title">Communication</div>
                            </div>
                        </div>
                        <NavAvatar size={32} fontSize={12} />
                    </div>

                    {/* Tabs */}
                    <div style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '0 28px', display: 'flex', gap: '4px' }}>
                        <button style={tabStyle('messages')} onClick={() => setActiveTab('messages')}>
                            📥 Volunteer Messages
                            {messages.length > 0 && (
                                <span style={{ background: '#CC0000', color: 'white', borderRadius: '10px', padding: '1px 6px', fontSize: '10px', marginLeft: '6px' }}>
                                    {messages.length}
                                </span>
                            )}
                        </button>
                        <button style={tabStyle('announce')} onClick={() => setActiveTab('announce')}>
                            📢 Announcements
                        </button>
                    </div>

                    <main style={{ flex: 1, padding: '28px', display: 'flex', gap: '24px', overflow: 'hidden' }}>

                        {/* MESSAGES TAB */}
                        {activeTab === 'messages' && (
                            <>
                                <div style={{ width: '340px', flexShrink: 0, overflowY: 'auto' }}>
                                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                                        <div style={{ padding: '14px 18px', borderBottom: '1px solid #F3F4F6' }}>
                                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>All Messages</div>
                                        </div>
                                        {messages.length === 0 ? (
                                            <div style={{ padding: '48px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>
                                                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
                                                No messages yet
                                            </div>
                                        ) : (
                                            messages.map((msg, i) => (
                                                <div key={i} onClick={() => setSelectedMessage(msg)} style={{ padding: '14px 18px', cursor: 'pointer', borderBottom: i < messages.length - 1 ? '1px solid #F3F4F6' : 'none', background: selectedMessage?.id === msg.id ? '#FEF2F2' : 'white', borderLeft: selectedMessage?.id === msg.id ? '3px solid #CC0000' : '3px solid transparent' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>{msg.user?.name || 'Volunteer'}</div>
                                                        {msg.reply && <span style={{ background: '#DCFCE7', color: '#166534', fontSize: '10px', fontWeight: '600', padding: '1px 6px', borderRadius: '8px' }}>Replied</span>}
                                                    </div>
                                                    <div style={{ fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '2px' }}>{msg.subject}</div>
                                                    <div style={{ fontSize: '11px', color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.message}</div>
                                                    <div style={{ fontSize: '10px', color: '#D1D5DB', marginTop: '4px' }}>{new Date(msg.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div style={{ flex: 1, overflowY: 'auto' }}>
                                    {!selectedMessage ? (
                                        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '64px', textAlign: 'center', color: '#9CA3AF' }}>
                                            <div style={{ fontSize: '36px', marginBottom: '12px' }}>💬</div>
                                            <div style={{ fontSize: '14px' }}>Select a message to read and reply</div>
                                        </div>
                                    ) : (
                                        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                                            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6' }}>
                                                <div style={{ fontSize: '16px', fontWeight: '700', color: '#111', marginBottom: '6px' }}>{selectedMessage.subject}</div>
                                                <div style={{ fontSize: '12px', color: '#6B7280' }}>From: <strong>{selectedMessage.user?.name}</strong> · {new Date(selectedMessage.created_at).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                                            </div>
                                            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6' }}>
                                                <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.7' }}>{selectedMessage.message}</div>
                                            </div>
                                            {selectedMessage.reply && (
                                                <div style={{ padding: '16px 24px', background: '#F0FDF4', borderBottom: '1px solid #F3F4F6' }}>
                                                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#166534', marginBottom: '6px' }}>Your reply:</div>
                                                    <div style={{ fontSize: '13px', color: '#374151' }}>{selectedMessage.reply}</div>
                                                </div>
                                            )}
                                            <div style={{ padding: '20px 24px' }}>
                                                <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>{selectedMessage.reply ? 'Update Reply' : 'Reply'}</div>
                                                <form onSubmit={handleReply}>
                                                    <textarea value={replyForm.data.reply} onChange={e => replyForm.setData('reply', e.target.value)} placeholder="Type your reply..." rows={4} style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: '12px' }} />
                                                    {replyForm.errors.reply && <div style={{ fontSize: '11px', color: '#CC0000', marginBottom: '8px' }}>{replyForm.errors.reply}</div>}
                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                        <button type="submit" disabled={replyForm.processing} style={{ background: '#CC0000', color: 'white', border: 'none', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>{replyForm.processing ? 'Sending...' : 'Send Reply'}</button>
                                                        <button type="button" onClick={() => setSelectedMessage(null)} style={{ background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* ANNOUNCEMENTS TAB */}
                        {activeTab === 'announce' && (
                            <div style={{ display: 'flex', gap: '24px', flex: 1, overflow: 'hidden' }}>
                                <div style={{ width: '380px', flexShrink: 0 }}>
                                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px' }}>
                                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '18px' }}>Post Announcement</div>
                                        <form onSubmit={handleAnnounce}>
                                            <div style={{ marginBottom: '14px' }}>
                                                <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '6px' }}>Title</label>
                                                <input type="text" value={announceForm.data.title} onChange={e => announceForm.setData('title', e.target.value)} placeholder="e.g. Schedule Change Notice" style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                                                {announceForm.errors.title && <div style={{ fontSize: '11px', color: '#CC0000', marginTop: '4px' }}>{announceForm.errors.title}</div>}
                                            </div>
                                            <div style={{ marginBottom: '18px' }}>
                                                <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '6px' }}>Message</label>
                                                <textarea value={announceForm.data.body} onChange={e => announceForm.setData('body', e.target.value)} placeholder="Type your announcement here..." rows={5} style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                                                {announceForm.errors.body && <div style={{ fontSize: '11px', color: '#CC0000', marginTop: '4px' }}>{announceForm.errors.body}</div>}
                                            </div>
                                            <button type="submit" disabled={announceForm.processing} style={{ background: '#CC0000', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', width: '100%' }}>{announceForm.processing ? 'Posting...' : '📢 Post to All Volunteers'}</button>
                                        </form>
                                    </div>
                                </div>
                                <div style={{ flex: 1, overflowY: 'auto' }}>
                                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                                        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6' }}>
                                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>Posted Announcements</div>
                                        </div>
                                        {announcements.length === 0 ? (
                                            <div style={{ padding: '48px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>
                                                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📢</div>
                                                No announcements posted yet
                                            </div>
                                        ) : (
                                            announcements.map((a, i) => (
                                                <div key={i} style={{ padding: '16px 20px', borderBottom: i < announcements.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#111', marginBottom: '4px' }}>{a.title}</div>
                                                            <div style={{ fontSize: '12px', color: '#6B7280', lineHeight: '1.6', marginBottom: '6px' }}>{a.body}</div>
                                                            <div style={{ fontSize: '10px', color: '#9CA3AF' }}>{new Date(a.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                                        </div>
                                                        <button onClick={() => handleDeleteAnnouncement(a.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '18px', padding: '0 0 0 12px', flexShrink: 0 }} title="Delete">🗑</button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
}