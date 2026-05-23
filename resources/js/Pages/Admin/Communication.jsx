import React from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function AdminCommunication({ messages, announcements }) {
    const [activeTab, setActiveTab] = useState('messages');
    const [selectedMessage, setSelectedMessage] = useState(null);

    const replyForm = useForm({ reply: '' });
    const announceForm = useForm({ title: '', body: '' });

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

    const sidebarLinks = [
        { key: 'dashboard',     label: 'Dashboard',     href: route('admin.dashboard') },
        { key: 'volunteers',    label: 'Volunteers',    href: route('admin.volunteers') },
        { key: 'activities',    label: 'Activities',    href: route('admin.activities.index') },
        { key: 'attendance',    label: 'Attendance',    href: route('admin.attendance.index') },
        { key: 'communication', label: 'Communication', href: route('admin.communication') },
    ];

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
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

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
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                    <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                        <button onClick={() => router.post(route('logout'))} style={{
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
                        borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, zIndex: 50,
                    }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>Communication</div>
                    </header>

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
                                {/* Message List */}
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
                                                <div
                                                    key={i}
                                                    onClick={() => setSelectedMessage(msg)}
                                                    style={{
                                                        padding: '14px 18px', cursor: 'pointer',
                                                        borderBottom: i < messages.length - 1 ? '1px solid #F3F4F6' : 'none',
                                                        background: selectedMessage?.id === msg.id ? '#FEF2F2' : 'white',
                                                        borderLeft: selectedMessage?.id === msg.id ? '3px solid #CC0000' : '3px solid transparent',
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>
                                                            {msg.user?.name || 'Volunteer'}
                                                        </div>
                                                        {msg.reply && (
                                                            <span style={{ background: '#DCFCE7', color: '#166534', fontSize: '10px', fontWeight: '600', padding: '1px 6px', borderRadius: '8px' }}>Replied</span>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '2px' }}>{msg.subject}</div>
                                                    <div style={{ fontSize: '11px', color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.message}</div>
                                                    <div style={{ fontSize: '10px', color: '#D1D5DB', marginTop: '4px' }}>
                                                        {new Date(msg.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Reply Panel */}
                                <div style={{ flex: 1, overflowY: 'auto' }}>
                                    {!selectedMessage ? (
                                        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '64px', textAlign: 'center', color: '#9CA3AF' }}>
                                            <div style={{ fontSize: '36px', marginBottom: '12px' }}>💬</div>
                                            <div style={{ fontSize: '14px' }}>Select a message to read and reply</div>
                                        </div>
                                    ) : (
                                        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                                            {/* Message Header */}
                                            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6' }}>
                                                <div style={{ fontSize: '16px', fontWeight: '700', color: '#111', marginBottom: '6px' }}>{selectedMessage.subject}</div>
                                                <div style={{ fontSize: '12px', color: '#6B7280' }}>
                                                    From: <strong>{selectedMessage.user?.name}</strong> · {new Date(selectedMessage.created_at).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </div>

                                            {/* Message Body */}
                                            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6' }}>
                                                <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.7' }}>{selectedMessage.message}</div>
                                            </div>

                                            {/* Existing Reply */}
                                            {selectedMessage.reply && (
                                                <div style={{ padding: '16px 24px', background: '#F0FDF4', borderBottom: '1px solid #F3F4F6' }}>
                                                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#166534', marginBottom: '6px' }}>Your reply:</div>
                                                    <div style={{ fontSize: '13px', color: '#374151' }}>{selectedMessage.reply}</div>
                                                </div>
                                            )}

                                            {/* Reply Form */}
                                            <div style={{ padding: '20px 24px' }}>
                                                <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>
                                                    {selectedMessage.reply ? 'Update Reply' : 'Reply'}
                                                </div>
                                                <form onSubmit={handleReply}>
                                                    <textarea
                                                        value={replyForm.data.reply}
                                                        onChange={e => replyForm.setData('reply', e.target.value)}
                                                        placeholder="Type your reply..."
                                                        rows={4}
                                                        style={{
                                                            width: '100%', padding: '10px 14px',
                                                            border: '1px solid #E5E7EB', borderRadius: '8px',
                                                            fontSize: '13px', outline: 'none', resize: 'vertical',
                                                            boxSizing: 'border-box', fontFamily: 'inherit',
                                                            marginBottom: '12px',
                                                        }}
                                                    />
                                                    {replyForm.errors.reply && <div style={{ fontSize: '11px', color: '#CC0000', marginBottom: '8px' }}>{replyForm.errors.reply}</div>}
                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                        <button type="submit" disabled={replyForm.processing}
                                                            style={{ background: '#CC0000', color: 'white', border: 'none', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                                                            {replyForm.processing ? 'Sending...' : 'Send Reply'}
                                                        </button>
                                                        <button type="button" onClick={() => setSelectedMessage(null)}
                                                            style={{ background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                                                            Cancel
                                                        </button>
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

                                {/* Post Announcement Form */}
                                <div style={{ width: '380px', flexShrink: 0 }}>
                                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px' }}>
                                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '18px' }}>Post Announcement</div>
                                        <form onSubmit={handleAnnounce}>
                                            <div style={{ marginBottom: '14px' }}>
                                                <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '6px' }}>Title</label>
                                                <input type="text" value={announceForm.data.title}
                                                    onChange={e => announceForm.setData('title', e.target.value)}
                                                    placeholder="e.g. Schedule Change Notice"
                                                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                                                {announceForm.errors.title && <div style={{ fontSize: '11px', color: '#CC0000', marginTop: '4px' }}>{announceForm.errors.title}</div>}
                                            </div>
                                            <div style={{ marginBottom: '18px' }}>
                                                <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '6px' }}>Message</label>
                                                <textarea value={announceForm.data.body}
                                                    onChange={e => announceForm.setData('body', e.target.value)}
                                                    placeholder="Type your announcement here..."
                                                    rows={5}
                                                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                                                {announceForm.errors.body && <div style={{ fontSize: '11px', color: '#CC0000', marginTop: '4px' }}>{announceForm.errors.body}</div>}
                                            </div>
                                            <button type="submit" disabled={announceForm.processing}
                                                style={{ background: '#CC0000', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', width: '100%' }}>
                                                {announceForm.processing ? 'Posting...' : '📢 Post to All Volunteers'}
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* Announcements List */}
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
                                                            <div style={{ fontSize: '10px', color: '#9CA3AF' }}>
                                                                {new Date(a.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteAnnouncement(a.id)}
                                                            style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '18px', padding: '0 0 0 12px', flexShrink: 0 }}
                                                            title="Delete"
                                                        >🗑</button>
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
