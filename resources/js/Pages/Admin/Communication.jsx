import React from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useRef } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import LiveChatPanel from '../../Components/LiveChatPanel';

/* Standalone avatar with deterministic color from the person's name —
   same convention as the Avatar/NavAvatar components used elsewhere
   (AdminDocumentsIndex.jsx, AdminLayout.jsx). */
const AVATAR_COLORS = [
    ['#fee2e2', '#991b1b'], ['#dbeafe', '#1e40af'],
    ['#dcfce7', '#166534'], ['#ede9fe', '#5b21b6'], ['#fef3c7', '#92400e'],
];
const colorForName = (name = '') => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};
const initialsForName = (name = '') =>
    name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';

function Avatar({ name, size = 36, fontSize = 13 }) {
    const [bg, color] = colorForName(name);
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%', background: bg, color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize, fontWeight: 700, flexShrink: 0,
        }}>
            {initialsForName(name)}
        </div>
    );
}

const IconInbox = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
);
const IconMegaphone = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
);
const IconMessage = ({ size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
);
const IconTrash = ({ size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
);

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Renders announcement body text as plain segments + highlighted "@Name"
// chips, matched against the real volunteer list (so it only highlights
// actual mentions, not any random "@word").
function renderBodyWithMentions(body, volunteers) {
    if (!body) return null;
    const names = (volunteers || []).map(v => v.name).filter(Boolean);
    if (names.length === 0) return body;

    const pattern = new RegExp(`(@(?:${names.map(escapeRegExp).join('|')}))`, 'g');
    const parts = body.split(pattern);

    return parts.map((part, i) =>
        names.some(n => `@${n}` === part)
            ? <span key={i} className="mention-chip">{part}</span>
            : <React.Fragment key={i}>{part}</React.Fragment>
    );
}

function AdminCommunication({ messages, announcements, volunteers = [] }) {
    const { auth } = usePage().props;
    const currentAdminId = auth?.user?.id;

    const [activeTab, setActiveTab] = useState('messages');
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [selectedChatVolunteer, setSelectedChatVolunteer] = useState(null);

    const replyForm = useForm({ reply: '' });
    const announceForm = useForm({ title: '', body: '' });

    // ✅ @mention state — dropdown visibility, current filter text after "@",
    // and the running list of volunteer IDs tagged in this announcement.
    const [mentionOpen, setMentionOpen] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [mentionedIds, setMentionedIds] = useState([]);
    const bodyRef = useRef(null);

    const filteredVolunteers = volunteers
        .filter(v => v.name?.toLowerCase().includes(mentionQuery.toLowerCase()))
        .slice(0, 8);

    // Detects "@partialname" right before the cursor as the admin types,
    // and opens the suggestion dropdown filtered to that text.
    const handleBodyChange = (e) => {
        const value = e.target.value;
        announceForm.setData('body', value);

        const cursor = e.target.selectionStart;
        const textBeforeCursor = value.slice(0, cursor);
        const atMatch = textBeforeCursor.match(/@([a-zA-Z\s]*)$/);

        if (atMatch) {
            setMentionQuery(atMatch[1]);
            setMentionOpen(true);
        } else {
            setMentionOpen(false);
        }
    };

    // Replaces the "@partialname" being typed with the full "@Full Name ",
    // records the volunteer as mentioned, and returns focus to the textarea.
    const selectMention = (vol) => {
        const value = announceForm.data.body;
        const cursor = bodyRef.current.selectionStart;
        const textBeforeCursor = value.slice(0, cursor);
        const atIndex = textBeforeCursor.lastIndexOf('@');
        if (atIndex === -1) return;

        const newText = value.slice(0, atIndex) + '@' + vol.name + ' ' + value.slice(cursor);
        announceForm.setData('body', newText);
        setMentionedIds((prev) => prev.includes(vol.id) ? prev : [...prev, vol.id]);
        setMentionOpen(false);
        setMentionQuery('');

        setTimeout(() => {
            const newCursorPos = atIndex + vol.name.length + 2;
            bodyRef.current.focus();
            bodyRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const removeMention = (id) => {
        setMentionedIds((prev) => prev.filter((x) => x !== id));
    };

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
        announceForm.transform((data) => ({ ...data, mentioned_ids: mentionedIds }));
        announceForm.post(route('admin.communication.announce'), {
            onSuccess: () => {
                announceForm.reset();
                setMentionedIds([]);
                setMentionOpen(false);
            },
        });
    };

    const handleDeleteAnnouncement = (id) => {
        if (confirm('Delete this announcement?')) {
            router.delete(route('admin.communication.announcement.delete', id));
        }
    };

    const formatDate = (d, opts = { month: 'short', day: 'numeric', year: 'numeric' }) =>
        new Date(d).toLocaleDateString('en-PH', opts);

    return (
        <>
            <Head title="Communication" />

            <style>{`
                .comm-wrap { font-size: 13px; font-family: Montserrat, sans-serif; color: #1A1A1A; }

                .comm-tabs { display: flex; gap: 8px; margin-bottom: 22px; }
                .comm-tab { display: flex; align-items: center; gap: 8px; padding: 9px 18px; border-radius: 20px; font-size: 12.5px; font-weight: 600; cursor: pointer; border: 1.5px solid #EDEDED; background: #fff; color: #6B6B6B; transition: all .15s; }
                .comm-tab.active { background: #ff0000; color: #fff; border-color: #ff0000; }
                .comm-tab:hover:not(.active) { border-color: #ccc; color: #1A1A1A; }
                .comm-tab-count { font-size: 10px; font-weight: 700; padding: 1px 7px; border-radius: 10px; background: rgba(255,255,255,0.25); }
                .comm-tab:not(.active) .comm-tab-count { background: #fee2e2; color: #ff0000; }

                .comm-card { background: #fff; border: 1px solid #EDEDED; border-radius: 12px; overflow: hidden; }
                .comm-card-head { padding: 13px 18px; border-bottom: 1px solid #EDEDED; font-size: 11px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: .06em; }

                .comm-empty { padding: 56px 24px; text-align: center; color: #9CA3AF; font-size: 13px; }
                .comm-empty svg { color: #D8DCE1; margin-bottom: 10px; }

                .msg-row { display: flex; gap: 12px; padding: 14px 18px; cursor: pointer; border-bottom: 1px solid #F5F5F5; transition: background .12s; border-left: 3px solid transparent; }
                .msg-row:last-child { border-bottom: none; }
                .msg-row:hover { background: #fafafa; }
                .msg-row.selected { background: #fff5f5; border-left-color: #ff0000; }
                .msg-row-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 2px; }
                .msg-name { font-size: 13px; font-weight: 700; color: #1A1A1A; }
                .msg-subject { font-size: 12.5px; font-weight: 600; color: #1A1A1A; margin-bottom: 2px; }
                .msg-preview { font-size: 11.5px; color: #6B6B6B; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .msg-time { font-size: 10.5px; color: #9CA3AF; margin-top: 4px; }
                .badge-replied { font-size: 10px; font-weight: 700; padding: 2px 9px; border-radius: 20px; background: #e6f4ea; color: #1e7e34; text-transform: uppercase; letter-spacing: .02em; white-space: nowrap; }
                .badge-new-dot { width: 8px; height: 8px; border-radius: 50%; background: #1a73e8; flex-shrink: 0; margin-top: 4px; }
                .badge-unread-count { font-size: 10px; font-weight: 700; background: #ff0000; color: white; border-radius: 20px; padding: 1px 7px; min-width: 17px; text-align: center; }

                .comm-input { width: 100%; padding: 10px 14px; border: 1.5px solid #EDEDED; border-radius: 10px; font-size: 13px; font-family: Montserrat, sans-serif; color: #1A1A1A; outline: none; box-sizing: border-box; transition: border-color .15s; }
                .comm-input:focus { border-color: #ff0000; }
                .comm-label { font-size: 11px; font-weight: 700; color: #9CA3AF; display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: .05em; }
                .comm-error { font-size: 11px; color: #c5221f; margin-top: 5px; }

                .comm-btn { border: none; border-radius: 10px; background: #ff0000; color: #fff; padding: 10px 22px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: Montserrat, sans-serif; transition: opacity .15s; }
                .comm-btn:hover { opacity: .9; }
                .comm-btn:disabled { opacity: .6; cursor: default; }
                .comm-btn-outline { border: 1.5px solid #EDEDED; border-radius: 10px; background: #fff; color: #1A1A1A; padding: 10px 22px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: Montserrat, sans-serif; transition: all .15s; }
                .comm-btn-outline:hover { border-color: #ccc; }

                .ann-row { padding: 16px 20px; border-bottom: 1px solid #F5F5F5; display: flex; gap: 12px; }
                .ann-row:last-child { border-bottom: none; }
                .ann-title { font-size: 13.5px; font-weight: 700; color: #1A1A1A; margin-bottom: 4px; }
                .ann-body { font-size: 12.5px; color: #5f6368; line-height: 1.6; margin-bottom: 6px; }
                .ann-time { font-size: 10.5px; color: #9CA3AF; }
                .ann-delete { background: none; border: none; color: #9CA3AF; cursor: pointer; padding: 6px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background .15s, color .15s; }
                .ann-delete:hover { background: #fce8e6; color: #c5221f; }

                /* ✅ @mention autocomplete dropdown + tags */
                .mention-dropdown { position: absolute; left: 0; top: calc(100% + 6px); width: 100%; min-width: 300px; background: #fff; border: 1.5px solid #EDEDED; border-radius: 12px; box-shadow: 0 16px 40px rgba(0,0,0,0.18); max-height: 280px; overflow-y: auto; z-index: 999; }
                .mention-dropdown-head { padding: 10px 16px; font-size: 10.5px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: .05em; border-bottom: 1px solid #F5F5F5; position: sticky; top: 0; background: #fff; }
                .mention-option { display: flex; align-items: center; gap: 12px; padding: 12px 16px; cursor: pointer; }
                .mention-option:hover { background: #fafafa; }
                .mention-option span { font-size: 14px; font-weight: 600; color: #1A1A1A; }
                .mention-chip { color: #ff0000; font-weight: 700; }
                .mention-tag { display: inline-flex; align-items: center; gap: 4px; background: #fee2e2; color: #ff0000; font-size: 11px; font-weight: 700; padding: 4px 6px 4px 10px; border-radius: 14px; }
                .mention-tag button { background: none; border: none; color: #ff0000; cursor: pointer; font-size: 14px; line-height: 1; padding: 0 2px; }
            `}</style>

            <div className="comm-wrap">
                {/* Tabs */}
                <div className="comm-tabs">
                    <button className={`comm-tab ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>
                        <IconInbox />
                        Volunteer Messages
                        {messages.length > 0 && <span className="comm-tab-count">{messages.length}</span>}
                    </button>
                    <button className={`comm-tab ${activeTab === 'announce' ? 'active' : ''}`} onClick={() => setActiveTab('announce')}>
                        <IconMegaphone />
                        Announcements
                    </button>
                    <button className={`comm-tab ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
                        <IconMessage size={16} />
                        Live Chat
                    </button>
                </div>

                {/* MESSAGES TAB */}
                {activeTab === 'messages' && (
                    <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{ width: 340, flexShrink: 0 }}>
                            <div className="comm-card">
                                <div className="comm-card-head">All Messages</div>
                                {messages.length === 0 ? (
                                    <div className="comm-empty">
                                        <IconInbox size={30} />
                                        <div>No messages yet</div>
                                    </div>
                                ) : (
                                    messages.map((msg, i) => (
                                        <div
                                            key={msg.id ?? i}
                                            onClick={() => setSelectedMessage(msg)}
                                            className={`msg-row ${selectedMessage?.id === msg.id ? 'selected' : ''}`}
                                        >
                                            <Avatar name={msg.user?.name || 'Volunteer'} size={38} fontSize={13} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div className="msg-row-top">
                                                    <div className="msg-name">{msg.user?.name || 'Volunteer'}</div>
                                                    {msg.reply
                                                        ? <span className="badge-replied">Replied</span>
                                                        : <span className="badge-new-dot" />}
                                                </div>
                                                <div className="msg-subject">{msg.subject}</div>
                                                <div className="msg-preview">{msg.message}</div>
                                                <div className="msg-time">{formatDate(msg.created_at)}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div style={{ flex: 1 }}>
                            {!selectedMessage ? (
                                <div className="comm-card">
                                    <div className="comm-empty">
                                        <IconMessage size={34} />
                                        <div style={{ fontSize: 14 }}>Select a message to read and reply</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="comm-card">
                                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #EDEDED', display: 'flex', alignItems: 'center', gap: 14 }}>
                                        <Avatar name={selectedMessage.user?.name || 'Volunteer'} size={44} fontSize={15} />
                                        <div>
                                            <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', marginBottom: 3 }}>{selectedMessage.subject}</div>
                                            <div style={{ fontSize: 12.5, color: '#6B6B6B' }}>
                                                From <strong style={{ color: '#1A1A1A' }}>{selectedMessage.user?.name}</strong> · {formatDate(selectedMessage.created_at, { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #EDEDED' }}>
                                        <div style={{ fontSize: 14, color: '#1A1A1A', lineHeight: 1.7 }}>{selectedMessage.message}</div>
                                    </div>

                                    {selectedMessage.reply && (
                                        <div style={{ padding: '16px 24px', background: '#fafafa', borderBottom: '1px solid #EDEDED' }}>
                                            <div className="comm-label" style={{ marginBottom: 6 }}>Your reply</div>
                                            <div style={{ fontSize: 13, color: '#1A1A1A' }}>{selectedMessage.reply}</div>
                                        </div>
                                    )}

                                    <div style={{ padding: '20px 24px' }}>
                                        <div className="comm-label">{selectedMessage.reply ? 'Update Reply' : 'Reply'}</div>
                                        <form onSubmit={handleReply}>
                                            <textarea
                                                value={replyForm.data.reply}
                                                onChange={e => replyForm.setData('reply', e.target.value)}
                                                placeholder="Type your reply..."
                                                rows={4}
                                                className="comm-input"
                                                style={{ resize: 'vertical', marginBottom: 12 }}
                                            />
                                            {replyForm.errors.reply && <div className="comm-error" style={{ marginBottom: 8 }}>{replyForm.errors.reply}</div>}
                                            <div style={{ display: 'flex', gap: 10 }}>
                                                <button type="submit" disabled={replyForm.processing} className="comm-btn">
                                                    {replyForm.processing ? 'Sending...' : 'Send Reply'}
                                                </button>
                                                <button type="button" onClick={() => setSelectedMessage(null)} className="comm-btn-outline">
                                                    Cancel
                                                </button>
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
                    <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{ width: 380, flexShrink: 0 }}>
                            <div className="comm-card" style={{ padding: 24, overflow: 'visible' }}>
                                <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', marginBottom: 18 }}>Post Announcement</div>
                                <form onSubmit={handleAnnounce}>
                                    <div style={{ marginBottom: 14 }}>
                                        <label className="comm-label">Title</label>
                                        <input
                                            type="text"
                                            value={announceForm.data.title}
                                            onChange={e => announceForm.setData('title', e.target.value)}
                                            placeholder="e.g. Schedule Change Notice"
                                            className="comm-input"
                                        />
                                        {announceForm.errors.title && <div className="comm-error">{announceForm.errors.title}</div>}
                                    </div>
                                    <div style={{ marginBottom: 10, position: 'relative' }}>
                                        <label className="comm-label">Message</label>
                                        <textarea
                                            ref={bodyRef}
                                            value={announceForm.data.body}
                                            onChange={handleBodyChange}
                                            onBlur={() => setTimeout(() => setMentionOpen(false), 120)}
                                            placeholder="Type your announcement here... use @ to mention a volunteer"
                                            rows={5}
                                            className="comm-input"
                                            style={{ resize: 'vertical' }}
                                        />
                                        {announceForm.errors.body && <div className="comm-error">{announceForm.errors.body}</div>}

                                        {mentionOpen && filteredVolunteers.length > 0 && (
                                            <div className="mention-dropdown">
                                                <div className="mention-dropdown-head">Mention a volunteer</div>
                                                {filteredVolunteers.map((v) => (
                                                    <div key={v.id} className="mention-option" onMouseDown={() => selectMention(v)}>
                                                        <Avatar name={v.name} size={34} fontSize={13} />
                                                        <span>{v.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {mentionedIds.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                                            {mentionedIds.map((id) => {
                                                const v = volunteers.find((vv) => vv.id === id);
                                                if (!v) return null;
                                                return (
                                                    <span key={id} className="mention-tag">
                                                        @{v.name}
                                                        <button type="button" onClick={() => removeMention(id)} title="Remove mention">×</button>
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <button type="submit" disabled={announceForm.processing} className="comm-btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                        <IconMegaphone size={15} />
                                        {announceForm.processing ? 'Posting...' : 'Post to All Volunteers'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div style={{ flex: 1 }}>
                            <div className="comm-card">
                                <div className="comm-card-head">Posted Announcements</div>
                                {announcements.length === 0 ? (
                                    <div className="comm-empty">
                                        <IconMegaphone size={30} />
                                        <div>No announcements posted yet</div>
                                    </div>
                                ) : (
                                    announcements.map((a, i) => (
                                        <div key={a.id ?? i} className="ann-row">
                                            <div style={{
                                                width: 38, height: 38, borderRadius: '50%', background: '#fde8e8', color: '#ff0000',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                            }}>
                                                <IconMegaphone size={16} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div className="ann-title">{a.title}</div>
                                                <div className="ann-body">{renderBodyWithMentions(a.body, volunteers)}</div>
                                                <div className="ann-time">{formatDate(a.created_at)}</div>
                                            </div>
                                            <button onClick={() => handleDeleteAnnouncement(a.id)} className="ann-delete" title="Delete">
                                                <IconTrash />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* LIVE CHAT TAB — volunteer list sa gilid (kaliwa), chat window sa kanan */}
                {activeTab === 'chat' && (
                    <div style={{ display: 'flex', gap: 16, height: 560 }}>
                        <div style={{ width: 300, flexShrink: 0 }}>
                            <div className="comm-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <div className="comm-card-head">Volunteers</div>
                                <div style={{ flex: 1, overflowY: 'auto' }}>
                                    {volunteers.length === 0 ? (
                                        <div className="comm-empty">
                                            <IconMessage size={28} />
                                            <div>No approved volunteers yet</div>
                                        </div>
                                    ) : (
                                        volunteers.map((v) => (
                                            <div
                                                key={v.id}
                                                onClick={() => setSelectedChatVolunteer(v)}
                                                className={`msg-row ${selectedChatVolunteer?.id === v.id ? 'selected' : ''}`}
                                            >
                                                <Avatar name={v.name} size={36} fontSize={12} />
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div className="msg-name">{v.name}</div>
                                                    <div className="msg-preview">{v.email}</div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ flex: 1 }}>
                            <div className="comm-card" style={{ height: '100%' }}>
                                <LiveChatPanel
                                    mode="admin"
                                    volunteerId={selectedChatVolunteer?.id ?? null}
                                    volunteerName={selectedChatVolunteer?.name ?? ''}
                                    currentUserId={currentAdminId}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

// ✅ Persistent AdminLayout — para hindi na-mount ulit ang sidebar/topbar
// tuwing lilipat ng tab dito, gaya ng ibang admin pages.
AdminCommunication.layout = (page) => <AdminLayout title="Communication">{page}</AdminLayout>;

export default AdminCommunication;
