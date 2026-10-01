import React, { useState, useRef } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import LiveChatPanel from '../../Components/LiveChatPanel';
import {
    Inbox,
    Megaphone,
    MessageSquare,
    Trash2,
    Send,
    AtSign,
    X,
    User,
    Clock,
} from 'lucide-react';

const AVATAR_COLORS = [
    ['bg-red-100 text-red-700', 'border-red-200'],
    ['bg-blue-100 text-blue-700', 'border-blue-200'],
    ['bg-emerald-100 text-emerald-700', 'border-emerald-200'],
    ['bg-amber-100 text-amber-700', 'border-amber-200'],
    ['bg-purple-100 text-purple-700', 'border-purple-200'],
];

const colorForName = (name = '') => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const initialsForName = (name = '') =>
    name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';

function Avatar({ name, size = 36 }) {
    const [colorClass] = colorForName(name);
    return (
        <div
            style={{ width: size, height: size }}
            className={`rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${colorClass}`}
        >
            {initialsForName(name)}
        </div>
    );
}

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function renderBodyWithMentions(body, volunteers) {
    if (!body) return null;
    const names = (volunteers || []).map((v) => v.name).filter(Boolean);
    if (names.length === 0) return body;

    const pattern = new RegExp(`(@(?:${names.map(escapeRegExp).join('|')}))`, 'g');
    const parts = body.split(pattern);

    return parts.map((part, i) =>
        names.some((n) => `@${n}` === part) ? (
            <span key={i} className="text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded">
                {part}
            </span>
        ) : (
            <React.Fragment key={i}>{part}</React.Fragment>
        )
    );
}

function AdminCommunication({ messages = [], announcements = [], volunteers = [] }) {
    const { auth } = usePage().props;
    const currentAdminId = auth?.user?.id;

    const [activeTab, setActiveTab] = useState('messages');
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [selectedChatVolunteer, setSelectedChatVolunteer] = useState(null);

    const replyForm = useForm({ reply: '' });
    const announceForm = useForm({ title: '', body: '' });

    const [mentionOpen, setMentionOpen] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [mentionedIds, setMentionedIds] = useState([]);
    const bodyRef = useRef(null);

    const filteredVolunteers = volunteers
        .filter((v) => v.name?.toLowerCase().includes(mentionQuery.toLowerCase()))
        .slice(0, 8);

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

    const selectMention = (vol) => {
        const value = announceForm.data.body;
        const cursor = bodyRef.current.selectionStart;
        const textBeforeCursor = value.slice(0, cursor);
        const atIndex = textBeforeCursor.lastIndexOf('@');
        if (atIndex === -1) return;

        const newText = value.slice(0, atIndex) + '@' + vol.name + ' ' + value.slice(cursor);
        announceForm.setData('body', newText);
        setMentionedIds((prev) => (prev.includes(vol.id) ? prev : [...prev, vol.id]));
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
            <Head title="Communication - Admin Portal" />

            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Navigation Pills */}
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => setActiveTab('messages')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                            activeTab === 'messages'
                                ? 'bg-red-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <Inbox className="w-4 h-4" />
                        <span>Volunteer Messages</span>
                        {messages.length > 0 && (
                            <span
                                className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                    activeTab === 'messages' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'
                                }`}
                            >
                                {messages.length}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('announce')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                            activeTab === 'announce'
                                ? 'bg-red-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <Megaphone className="w-4 h-4" />
                        <span>Announcements</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                            activeTab === 'chat'
                                ? 'bg-red-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        <span>Live Chat</span>
                    </button>
                </div>

                {/* TAB 1: MESSAGES */}
                {activeTab === 'messages' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Messages List Card */}
                        <div className="lg:col-span-5 bg-white rounded-2xl overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50/70">
                                <h3 className="text-xs font-bold text-gray-700">Inbox</h3>
                            </div>
                            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                                {messages.length === 0 ? (
                                    <div className="p-12 text-center text-xs text-gray-400">
                                        <Inbox className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                        No messages found.
                                    </div>
                                ) : (
                                    messages.map((m) => {
                                        const isSelected = selectedMessage?.id === m.id;
                                        return (
                                            <div
                                                key={m.id}
                                                onClick={() => setSelectedMessage(m)}
                                                className={`p-4 transition cursor-pointer flex gap-3 ${
                                                    isSelected
                                                        ? 'bg-red-50/60 border-l-4 border-red-600'
                                                        : 'hover:bg-gray-50 border-l-4 border-transparent'
                                                }`}
                                            >
                                                <Avatar name={m.volunteer?.name || m.name} size={36} />
                                                <div className="min-w-0 flex-1 space-y-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-xs font-bold text-gray-900 truncate">
                                                            {m.volunteer?.name || m.name}
                                                        </span>
                                                        {m.replied ? (
                                                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                                                                Replied
                                                            </span>
                                                        ) : (
                                                            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                                                        )}
                                                    </div>
                                                    <div className="text-xs font-semibold text-gray-800 truncate">
                                                        {m.subject || 'No Subject'}
                                                    </div>
                                                    <p className="text-[11px] text-gray-500 truncate">{m.message}</p>
                                                    <div className="text-[10px] text-gray-400 pt-0.5">
                                                        {formatDate(m.created_at)}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Message Detail / Reply View Card */}
                        <div className="lg:col-span-7 bg-white rounded-2xl p-5 space-y-4">
                            {selectedMessage ? (
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between gap-3 pb-4 border-b border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <Avatar name={selectedMessage.volunteer?.name || selectedMessage.name} size={40} />
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900">
                                                    {selectedMessage.volunteer?.name || selectedMessage.name}
                                                </h3>
                                                <p className="text-xs text-gray-400">
                                                    {selectedMessage.volunteer?.email || selectedMessage.email}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {formatDate(selectedMessage.created_at)}
                                        </span>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 mb-2">
                                            {selectedMessage.subject || 'No Subject'}
                                        </h4>
                                        <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            {selectedMessage.message}
                                        </p>
                                    </div>

                                    {/* Existing reply if any */}
                                    {selectedMessage.reply && (
                                        <div className="space-y-1 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                                            <div className="text-[11px] font-bold text-emerald-800">Your Reply:</div>
                                            <p className="text-xs text-emerald-900 leading-relaxed">
                                                {selectedMessage.reply}
                                            </p>
                                        </div>
                                    )}

                                    {/* Reply Form */}
                                    <form onSubmit={handleReply} className="space-y-3 pt-2">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 block mb-1.5">
                                                Reply Message
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={replyForm.data.reply}
                                                onChange={(e) => replyForm.setData('reply', e.target.value)}
                                                placeholder="Type your response to this volunteer..."
                                                className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                                            />
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="submit"
                                                disabled={replyForm.processing || !replyForm.data.reply.trim()}
                                                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                                            >
                                                <Send className="w-3.5 h-3.5" />
                                                <span>Send Reply</span>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <div className="py-20 text-center text-xs text-gray-400 space-y-2">
                                    <Inbox className="w-10 h-10 mx-auto text-gray-300" />
                                    <p>Select a message from the list to read and reply.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 2: ANNOUNCEMENTS */}
                {activeTab === 'announce' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Create Announcement Form */}
                        <div className="lg:col-span-5 bg-white rounded-2xl p-5 space-y-4">
                            <h3 className="text-sm font-bold text-gray-900">Post Announcement</h3>
                            <form onSubmit={handleAnnounce} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 block mb-1.5">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={announceForm.data.title}
                                        onChange={(e) => announceForm.setData('title', e.target.value)}
                                        placeholder="e.g. Urgent Blood Drive Orientation"
                                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                                    />
                                    {announceForm.errors.title && (
                                        <p className="text-xs text-red-600 mt-1">{announceForm.errors.title}</p>
                                    )}
                                </div>

                                <div className="relative">
                                    <label className="text-xs font-bold text-gray-500 block mb-1.5">
                                        Content (Type @ to mention volunteers)
                                    </label>
                                    <textarea
                                        ref={bodyRef}
                                        rows={4}
                                        value={announceForm.data.body}
                                        onChange={handleBodyChange}
                                        placeholder="Write your announcement here. Type @name to tag specific volunteers..."
                                        className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                                    />
                                    {announceForm.errors.body && (
                                        <p className="text-xs text-red-600 mt-1">{announceForm.errors.body}</p>
                                    )}

                                    {/* Mention suggestions dropdown */}
                                    {mentionOpen && filteredVolunteers.length > 0 && (
                                        <div className="absolute left-0 top-full mt-1 w-full bg-white rounded-xl border border-gray-200 shadow-xl max-h-48 overflow-y-auto z-20">
                                            <div className="p-2 border-b border-gray-100 text-xs font-bold text-gray-500">
                                                Tag Volunteer
                                            </div>
                                            {filteredVolunteers.map((vol) => (
                                                <div
                                                    key={vol.id}
                                                    onClick={() => selectMention(vol)}
                                                    className="p-2.5 hover:bg-gray-50 cursor-pointer flex items-center gap-2.5 transition text-xs font-semibold text-gray-800"
                                                >
                                                    <Avatar name={vol.name} size={24} />
                                                    <span>{vol.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Tagged Mentions Chips */}
                                {mentionedIds.length > 0 && (
                                    <div className="space-y-1.5">
                                        <span className="text-[11px] font-bold text-gray-400 block">Tagged Volunteers:</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {mentionedIds.map((id) => {
                                                const vol = volunteers.find((v) => v.id === id);
                                                if (!vol) return null;
                                                return (
                                                    <span
                                                        key={id}
                                                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600"
                                                    >
                                                        <span>@{vol.name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeMention(id)}
                                                            className="hover:text-red-800"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        disabled={announceForm.processing || !announceForm.data.title.trim()}
                                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                                    >
                                        <Megaphone className="w-3.5 h-3.5" />
                                        <span>Publish Announcement</span>
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Announcements Feed Card */}
                        <div className="lg:col-span-7 bg-white rounded-2xl overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50/70">
                                <h3 className="text-xs font-bold text-gray-700">
                                    Announcements Feed
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {announcements.length === 0 ? (
                                    <div className="p-12 text-center text-xs text-gray-400">
                                        <Megaphone className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                        No announcements posted yet.
                                    </div>
                                ) : (
                                    announcements.map((ann) => (
                                        <div key={ann.id} className="p-5 space-y-2 hover:bg-gray-50/40 transition">
                                            <div className="flex items-start justify-between gap-3">
                                                <h4 className="text-sm font-bold text-gray-900 leading-snug">
                                                    {ann.title}
                                                </h4>
                                                <button
                                                    onClick={() => handleDeleteAnnouncement(ann.id)}
                                                    className="p-1 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition shrink-0"
                                                    title="Delete announcement"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-600 leading-relaxed">
                                                {renderBodyWithMentions(ann.body, volunteers)}
                                            </p>
                                            <div className="text-[10px] text-gray-400 pt-1">
                                                {formatDate(ann.created_at)}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 3: LIVE CHAT */}
                {activeTab === 'chat' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-2xl overflow-hidden min-h-[600px]">
                        {/* Volunteers List */}
                        <div className="lg:col-span-4 border-r border-gray-100 flex flex-col min-h-0">
                            <div className="p-4 border-b border-gray-100 bg-gray-50/70">
                                <h3 className="text-xs font-bold text-gray-700">
                                    Chat with Volunteers
                                </h3>
                            </div>
                            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                                {volunteers.length === 0 ? (
                                    <div className="p-8 text-center text-xs text-gray-400">No volunteers found.</div>
                                ) : (
                                    volunteers.map((vol) => {
                                        const isSelected = selectedChatVolunteer?.id === vol.id;
                                        return (
                                            <div
                                                key={vol.id}
                                                onClick={() => setSelectedChatVolunteer(vol)}
                                                className={`p-3.5 flex items-center gap-3 cursor-pointer transition ${
                                                    isSelected ? 'bg-red-50/60' : 'hover:bg-gray-50'
                                                }`}
                                            >
                                                <Avatar name={vol.name} size={36} />
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-xs font-bold text-gray-900 truncate">
                                                        {vol.name}
                                                    </div>
                                                    <div className="text-[11px] text-gray-400 truncate">
                                                        {vol.email}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Live Chat Panel */}
                        <div className="lg:col-span-8 flex flex-col min-h-0 bg-white">
                            {selectedChatVolunteer ? (
                                <div className="flex-1 flex flex-col min-h-0 h-[600px]">
                                    <LiveChatPanel
                                        mode="admin"
                                        volunteerId={selectedChatVolunteer.id}
                                        volunteerName={selectedChatVolunteer.name}
                                        currentUserId={currentAdminId}
                                    />
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-xs text-gray-400 space-y-2">
                                    <MessageSquare className="w-10 h-10 text-gray-300" />
                                    <p>Select a volunteer from the list to start a real-time conversation.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

AdminCommunication.layout = (page) => <AdminLayout title="Communication">{page}</AdminLayout>;

export default AdminCommunication;
