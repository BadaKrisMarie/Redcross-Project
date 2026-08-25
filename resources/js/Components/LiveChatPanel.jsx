import React, { useEffect, useRef, useState } from 'react';

const RED = '#ff0000';

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
}

// Self-contained fetch helper — hindi umaasa sa window.axios, basta may
// naka-set na 'XSRF-TOKEN' cookie ang Laravel (default na sa web middleware).
async function apiFetch(url, options = {}) {
    const res = await fetch(url, {
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') || '',
            ...(options.headers || {}),
        },
        ...options,
    });
    if (!res.ok) throw new Error('Request failed: ' + res.status);
    return res.json();
}

/**
 * Real-time chat panel, dinisenyo para i-dock sa gilid ng Communication page.
 *
 * mode="admin"     — kailangan ng volunteerId + volunteerName (yung volunteer
 *                     na currently selected sa listahan).
 * mode="volunteer" — isang thread lang, laging kausap ang admin, walang
 *                     kailangang volunteerId.
 *
 * currentUserId — id ng naka-login na user (galing sa usePage().props.auth.user.id),
 * ginagamit para malaman kung sino may-ari ng bawat bubble (kanan/kaliwa).
 */
export default function LiveChatPanel({ mode, volunteerId = null, volunteerName = '', currentUserId }) {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef(null);

    const messagesUrl = mode === 'admin'
        ? route('admin.chat.messages', volunteerId)
        : route('volunteer.chat.messages');
    const sendUrl = mode === 'admin'
        ? route('admin.chat.send', volunteerId)
        : route('volunteer.chat.send');

    const channelName = mode === 'admin' ? `chat.${volunteerId}` : `chat.${currentUserId}`;

    useEffect(() => {
        if (mode === 'admin' && !volunteerId) { setMessages([]); return; }

        let cancelled = false;
        setLoading(true);

        apiFetch(messagesUrl)
            .then(data => { if (!cancelled) setMessages(data.messages || []); })
            .catch(() => {})
            .finally(() => { if (!cancelled) setLoading(false); });

        const echo = window.Echo;
        if (echo) {
            echo.private(channelName).listen('.message.sent', (payload) => {
                setMessages(prev => (prev.some(m => m.id === payload.id) ? prev : [...prev, payload]));
            });
        }

        return () => {
            cancelled = true;
            if (echo) echo.leave(channelName);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, volunteerId]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        const body = text.trim();
        if (!body || sending) return;

        setSending(true);
        const tempId = 'temp-' + Date.now();
        setMessages(prev => [...prev, {
            id: tempId, sender_role: mode, sender_id: currentUserId,
            body, created_at: new Date().toISOString(),
        }]);
        setText('');

        try {
            await apiFetch(sendUrl, { method: 'POST', body: JSON.stringify({ body }) });
        } catch {
            setMessages(prev => prev.map(m => (m.id === tempId ? { ...m, failed: true } : m)));
        } finally {
            setSending(false);
        }
    };

    if (mode === 'admin' && !volunteerId) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                height: '100%', color: '#9CA3AF', fontSize: 13, gap: 8,
            }}>
                <ChatIcon size={30} />
                Select a volunteer to start chatting
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #EDEDED', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1A1A1A' }}>
                    {mode === 'admin' ? volunteerName : 'PRC Muntinlupa Admin'}
                </div>
            </div>

            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {loading ? (
                    <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 12.5, marginTop: 20 }}>Loading messages...</div>
                ) : messages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 12.5, marginTop: 20 }}>No messages yet — say hi!</div>
                ) : (
                    messages.map((m) => {
                        const isMine = m.sender_role === mode;
                        return (
                            <div key={m.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                                <div style={{
                                    maxWidth: '75%', padding: '9px 13px',
                                    borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                                    background: isMine ? RED : '#F3F4F6',
                                    color: isMine ? 'white' : '#1A1A1A',
                                    fontSize: 13, lineHeight: 1.5,
                                    opacity: m.failed ? 0.5 : 1,
                                }}>
                                    {m.body}
                                    {m.failed && <div style={{ fontSize: 10, marginTop: 4 }}>Failed to send</div>}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, padding: '12px 16px', borderTop: '1px solid #EDEDED' }}>
                <input
                    type="text"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Type a message..."
                    style={{
                        flex: 1, padding: '10px 14px', border: '1.5px solid #EDEDED',
                        borderRadius: 20, fontSize: 13, outline: 'none', fontFamily: 'Montserrat, sans-serif',
                        boxSizing: 'border-box',
                    }}
                />
                <button
                    type="submit"
                    disabled={!text.trim() || sending}
                    style={{
                        width: 38, height: 38, borderRadius: '50%', border: 'none',
                        background: text.trim() ? RED : '#E5E7EB', color: 'white',
                        cursor: text.trim() ? 'pointer' : 'default', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    <SendIcon />
                </button>
            </form>
        </div>
    );
}

function ChatIcon({ size = 20 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>;
}
function SendIcon({ size = 16 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
}
