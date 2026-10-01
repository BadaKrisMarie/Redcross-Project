import React from 'react';
import LiveChatPanel from '@/Components/LiveChatPanel';
import {
    MessageSquare,
    MessageCircle,
    ArrowLeft,
    Search,
    X,
} from 'lucide-react';

const getInitials = (name) =>
    (name || '?')
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

const truncate = (str, n) => (!str ? '' : str.length > n ? str.slice(0, n - 1) + '...' : str);

export default function AdminFloatingChat({
    chatOpen,
    setChatOpen,
    chatView,
    handleOpenChat,
    handleBackToList,
    handleSelectVolunteer,
    activeVolunteer,
    chatSearch,
    setChatSearch,
    filteredVolunteerList,
    volunteerListLoading,
    unreadChatCount,
    unreadByVolunteer,
    adminId,
}) {
    return (
        <>
            {/* Floating Live Chat Window */}
            {chatOpen && (
                <div className="fixed bottom-20 right-6 z-40 w-96 max-w-[calc(100vw-32px)] h-[520px] bg-white rounded-2xl overflow-hidden flex flex-col shadow-2xl">
                    {/* Chat Header */}
                    <div className="p-3.5 bg-red-600 text-white flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                            {chatView === 'chat' && (
                                <button onClick={handleBackToList} className="p-1 rounded-lg hover:bg-white/10" aria-label="Back">
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                            )}
                            <MessageSquare className="w-4 h-4 shrink-0" />
                            <div className="min-w-0">
                                <div className="text-xs font-bold truncate">
                                    {chatView === 'chat' ? (activeVolunteer?.name || 'Chat') : 'Live Chat'}
                                </div>
                                {chatView === 'list' && (
                                    <div className="text-[10px] text-red-100">
                                        {unreadChatCount > 0 ? `${unreadChatCount} new message(s)` : 'All caught up'}
                                    </div>
                                )}
                            </div>
                        </div>
                        <button onClick={() => setChatOpen(false)} className="p-1 rounded-lg hover:bg-white/10" aria-label="Close">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {chatView === 'list' ? (
                        <div className="flex-1 flex flex-col min-h-0 bg-white">
                            {/* Volunteer Search */}
                            <div className="p-3 border-b border-gray-100">
                                <div className="relative">
                                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={chatSearch}
                                        onChange={(e) => setChatSearch(e.target.value)}
                                        placeholder="Search volunteer..."
                                        className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:border-red-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Volunteer List */}
                            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                                {volunteerListLoading ? (
                                    <div className="p-6 text-center text-xs text-gray-500">Loading volunteers...</div>
                                ) : filteredVolunteerList.length === 0 ? (
                                    <div className="p-6 text-center text-xs text-gray-400">No volunteers found.</div>
                                ) : (
                                    filteredVolunteerList.map((v) => {
                                        const unread = unreadByVolunteer[v.id];
                                        const isUnread = !!unread?.count;
                                        return (
                                            <div
                                                key={v.id}
                                                onClick={() => handleSelectVolunteer(v)}
                                                className={`p-3 flex items-center gap-3 hover:bg-gray-50 cursor-pointer transition ${
                                                    isUnread ? 'bg-red-50/30' : ''
                                                }`}
                                            >
                                                <div className="relative shrink-0">
                                                    <div className="w-9 h-9 rounded-full bg-red-700 text-white flex items-center justify-center font-bold text-xs overflow-hidden border border-white/20">
                                                        {v.photo ? (
                                                            <img src={`/storage/${v.photo}`} alt={v.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            getInitials(v.name)
                                                        )}
                                                    </div>
                                                    {isUnread && <span className="w-2.5 h-2.5 rounded-full bg-red-600 absolute -top-0.5 -right-0.5 border-2 border-white" />}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className={`text-xs ${isUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'} truncate`}>
                                                        {v.name}
                                                    </div>
                                                    <div className="text-[11px] text-gray-500 truncate mt-0.5">
                                                        {isUnread ? truncate(unread.preview, 32) : 'Tap to chat'}
                                                    </div>
                                                </div>
                                                {isUnread && (
                                                    <span className="min-w-4 h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                                                        {unread.count > 9 ? '9+' : unread.count}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-hidden">
                            <LiveChatPanel
                                mode="admin"
                                volunteerId={activeVolunteer?.id}
                                volunteerName={activeVolunteer?.name}
                                currentUserId={adminId}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Chat FAB */}
            <div className="fixed bottom-6 right-6 z-40">
                <button
                    onClick={handleOpenChat}
                    title={chatOpen ? 'Close chat' : 'Open live chat'}
                    className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white flex items-center justify-center transition shadow-lg focus:outline-none"
                >
                    {chatOpen ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
                </button>
                {!chatOpen && unreadChatCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 rounded-full bg-red-700 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                        {unreadChatCount > 9 ? '9+' : unreadChatCount}
                    </span>
                )}
            </div>
        </>
    );
}
