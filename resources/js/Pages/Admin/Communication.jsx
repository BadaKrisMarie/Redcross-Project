import React from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';

/* ── Design tokens: plain, professional ── */
const ink    = '#1f2328';
const sub    = '#5c6470';
const line   = '#e3e5e8';
const panel  = '#fafafa';
const status = '#4a5568';

const mutedRed       = '#8a3b3b';
const mutedRedLine   = '#e0c4c4';
const mutedGreen     = '#2f5d43';
const mutedGreenLine = '#c9dcd0';

const serif = "'Georgia', 'Times New Roman', serif";
const sans  = "Arial, Helvetica, sans-serif";

function AdminCommunication({ messages, announcements }) {
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

    /* Plain tab style: quiet border underline instead of colored text/underline */
    const tabStyle = (key) => ({
        padding: '10px 18px', fontSize: '13px',
        fontWeight: '600',
        color: activeTab === key ? ink : sub,
        borderBottom: activeTab === key ? `2px solid ${ink}` : '2px solid transparent',
        background: 'none', border: 'none', borderBottomWidth: '2px', borderBottomStyle: 'solid',
        borderBottomColor: activeTab === key ? ink : 'transparent',
        cursor: 'pointer', fontFamily: sans,
    });

    // ✅ simple line-icon components (no emojis) for a cleaner, professional look
    const IconInbox = ({ size = 16 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
    );
    const IconMegaphone = ({ size = 16 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
    );
    const IconMessage = ({ size = 32 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
    );
    const IconTrash = ({ size = 16 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
    );

    /* Uniform outline button */
    const btnBase = {
        border: `1px solid ${line}`, background: 'white', color: ink,
        padding: '9px 20px', fontSize: '13px', fontWeight: '600',
        cursor: 'pointer', fontFamily: sans, letterSpacing: '0.01em',
    };
    const inputStyle = {
        width: '100%', padding: '10px 14px', border: `1px solid ${line}`,
        fontSize: '13px', outline: 'none', boxSizing: 'border-box',
        fontFamily: sans, color: ink,
    };

    return (
        <>
            <Head title="Communication" />

            <style>{`
                .comm-wrap { font-size: 13px; font-family: ${sans}; color: ${ink}; }
                textarea:focus, input:focus { border-color: ${status} !important; }
            `}</style>

            <div className="comm-wrap">
                {/* Tabs */}
                <div style={{ background: 'white', border: `1px solid ${line}`, padding: '0 20px', display: 'flex', gap: '4px', marginBottom: '24px' }}>
                    <button style={{ ...tabStyle('messages'), display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setActiveTab('messages')}>
                        <IconInbox />
                        Volunteer Messages
                        {messages.length > 0 && (
                            <span style={{ border: `1px solid ${line}`, color: sub, padding: '1px 7px', fontSize: '10px', marginLeft: '2px', fontFamily: sans, fontWeight: '700' }}>
                                {messages.length}
                            </span>
                        )}
                    </button>
                    <button style={{ ...tabStyle('announce'), display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setActiveTab('announce')}>
                        <IconMegaphone />
                        Announcements
                    </button>
                </div>

                {/* MESSAGES TAB */}
                {activeTab === 'messages' && (
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ width: '340px', flexShrink: 0, overflowY: 'auto' }}>
                            <div style={{ background: 'white', border: `1px solid ${line}`, overflow: 'hidden' }}>
                                <div style={{ padding: '14px 18px', borderBottom: `1px solid ${line}`, background: panel }}>
                                    <div style={{ fontSize: '11px', fontWeight: '700', color: sub, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: sans }}>All Messages</div>
                                </div>
                                {messages.length === 0 ? (
                                    <div style={{ padding: '48px', textAlign: 'center', color: '#a1a8b0', fontSize: '13px', fontFamily: sans }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px', color: '#c4c9ce' }}><IconInbox size={30} /></div>
                                        No messages yet
                                    </div>
                                ) : (
                                    messages.map((msg, i) => (
                                        <div key={i} onClick={() => setSelectedMessage(msg)} style={{ padding: '14px 18px', cursor: 'pointer', borderBottom: i < messages.length - 1 ? `1px solid ${line}` : 'none', background: selectedMessage?.id === msg.id ? panel : 'white', borderLeft: selectedMessage?.id === msg.id ? `3px solid ${ink}` : '3px solid transparent' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                                <div style={{ fontSize: '14px', fontWeight: '700', color: ink, fontFamily: serif }}>{msg.user?.name || 'Volunteer'}</div>
                                                {msg.reply && <span style={{ border: `1px solid ${mutedGreenLine}`, color: mutedGreen, fontSize: '10px', fontWeight: '700', padding: '1px 7px', fontFamily: sans, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Replied</span>}
                                            </div>
                                            <div style={{ fontSize: '12.5px', fontWeight: '600', color: ink, marginBottom: '2px', fontFamily: sans }}>{msg.subject}</div>
                                            <div style={{ fontSize: '11.5px', color: sub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: sans }}>{msg.message}</div>
                                            <div style={{ fontSize: '10.5px', color: '#a1a8b0', marginTop: '4px', fontFamily: sans }}>{new Date(msg.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {!selectedMessage ? (
                                <div style={{ background: 'white', border: `1px solid ${line}`, padding: '64px', textAlign: 'center', color: '#a1a8b0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px', color: '#c4c9ce' }}><IconMessage size={34} /></div>
                                    <div style={{ fontSize: '14px', fontFamily: sans }}>Select a message to read and reply</div>
                                </div>
                            ) : (
                                <div style={{ background: 'white', border: `1px solid ${line}`, overflow: 'hidden' }}>
                                    <div style={{ padding: '20px 24px', borderBottom: `1px solid ${line}` }}>
                                        <div style={{ fontSize: '17px', fontWeight: '700', color: ink, marginBottom: '6px', fontFamily: serif }}>{selectedMessage.subject}</div>
                                        <div style={{ fontSize: '12.5px', color: sub, fontFamily: sans }}>From: <strong style={{ color: ink }}>{selectedMessage.user?.name}</strong> · {new Date(selectedMessage.created_at).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                                    </div>
                                    <div style={{ padding: '20px 24px', borderBottom: `1px solid ${line}` }}>
                                        <div style={{ fontSize: '14px', color: ink, lineHeight: '1.7', fontFamily: sans }}>{selectedMessage.message}</div>
                                    </div>
                                    {selectedMessage.reply && (
                                        <div style={{ padding: '16px 24px', background: panel, borderBottom: `1px solid ${line}` }}>
                                            <div style={{ fontSize: '11px', fontWeight: '700', color: sub, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: sans }}>Your reply</div>
                                            <div style={{ fontSize: '13px', color: ink, fontFamily: sans }}>{selectedMessage.reply}</div>
                                        </div>
                                    )}
                                    <div style={{ padding: '20px 24px' }}>
                                        <div style={{ fontSize: '11px', fontWeight: '700', color: sub, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: sans }}>{selectedMessage.reply ? 'Update Reply' : 'Reply'}</div>
                                        <form onSubmit={handleReply}>
                                            <textarea value={replyForm.data.reply} onChange={e => replyForm.setData('reply', e.target.value)} placeholder="Type your reply..." rows={4} style={{ ...inputStyle, resize: 'vertical', marginBottom: '12px' }} />
                                            {replyForm.errors.reply && <div style={{ fontSize: '11px', color: mutedRed, marginBottom: '8px', fontFamily: sans }}>{replyForm.errors.reply}</div>}
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button type="submit" disabled={replyForm.processing} style={btnBase}>{replyForm.processing ? 'Sending...' : 'Send Reply'}</button>
                                                <button type="button" onClick={() => setSelectedMessage(null)} style={btnBase}>Cancel</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ANNOUNCEMENTS TAB */}
                {activeTab === 'announce' && (
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ width: '380px', flexShrink: 0 }}>
                            <div style={{ background: 'white', border: `1px solid ${line}`, padding: '24px' }}>
                                <div style={{ fontSize: '15px', fontWeight: '700', color: ink, marginBottom: '18px', fontFamily: serif }}>Post Announcement</div>
                                <form onSubmit={handleAnnounce}>
                                    <div style={{ marginBottom: '14px' }}>
                                        <label style={{ fontSize: '11px', fontWeight: '700', color: sub, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: sans }}>Title</label>
                                        <input type="text" value={announceForm.data.title} onChange={e => announceForm.setData('title', e.target.value)} placeholder="e.g. Schedule Change Notice" style={inputStyle} />
                                        {announceForm.errors.title && <div style={{ fontSize: '11px', color: mutedRed, marginTop: '4px', fontFamily: sans }}>{announceForm.errors.title}</div>}
                                    </div>
                                    <div style={{ marginBottom: '18px' }}>
                                        <label style={{ fontSize: '11px', fontWeight: '700', color: sub, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: sans }}>Message</label>
                                        <textarea value={announceForm.data.body} onChange={e => announceForm.setData('body', e.target.value)} placeholder="Type your announcement here..." rows={5} style={{ ...inputStyle, resize: 'vertical' }} />
                                        {announceForm.errors.body && <div style={{ fontSize: '11px', color: mutedRed, marginTop: '4px', fontFamily: sans }}>{announceForm.errors.body}</div>}
                                    </div>
                                    <button type="submit" disabled={announceForm.processing} style={{ ...btnBase, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <IconMegaphone size={15} />
                                        {announceForm.processing ? 'Posting...' : 'Post to All Volunteers'}
                                    </button>
                                </form>
                            </div>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            <div style={{ background: 'white', border: `1px solid ${line}`, overflow: 'hidden' }}>
                                <div style={{ padding: '14px 20px', borderBottom: `1px solid ${line}`, background: panel }}>
                                    <div style={{ fontSize: '11px', fontWeight: '700', color: sub, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: sans }}>Posted Announcements</div>
                                </div>
                                {announcements.length === 0 ? (
                                    <div style={{ padding: '48px', textAlign: 'center', color: '#a1a8b0', fontSize: '13px', fontFamily: sans }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px', color: '#c4c9ce' }}><IconMegaphone size={30} /></div>
                                        No announcements posted yet
                                    </div>
                                ) : (
                                    announcements.map((a, i) => (
                                        <div key={i} style={{ padding: '16px 20px', borderBottom: i < announcements.length - 1 ? `1px solid ${line}` : 'none' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '14px', fontWeight: '700', color: ink, marginBottom: '4px', fontFamily: serif }}>{a.title}</div>
                                                    <div style={{ fontSize: '12.5px', color: sub, lineHeight: '1.6', marginBottom: '6px', fontFamily: sans }}>{a.body}</div>
                                                    <div style={{ fontSize: '10.5px', color: '#a1a8b0', fontFamily: sans }}>{new Date(a.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                                </div>
                                                <button onClick={() => handleDeleteAnnouncement(a.id)} style={{ background: 'none', border: 'none', color: mutedRed, cursor: 'pointer', padding: '0 0 0 12px', flexShrink: 0, display: 'flex', alignItems: 'center' }} title="Delete">
                                                    <IconTrash size={15} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

// ✅ Persistent layout — parehong AdminLayout ng ibang admin pages,
// kaya lalabas na rin ang notification bell dito, at hindi na mag-re-render
// ang sidebar sa navigation.
AdminCommunication.layout = (page) => <AdminLayout title="Communication">{page}</AdminLayout>;

export default AdminCommunication;