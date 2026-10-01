import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { MessageCircle, X } from 'lucide-react';
import VolunteerSidebar from '@/Components/Volunteer/VolunteerSidebar';
import VolunteerTopbar from '@/Components/Volunteer/VolunteerTopbar';
import LiveChatPanel from '@/Components/LiveChatPanel';

export default function VolunteerLayout({ children, title = 'Dashboard' }) {
    const { auth } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Auto-collapse on resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch volunteer notifications for topbar bell
    useEffect(() => {
        axios
            .get('/volunteer/notifications')
            .then((res) => {
                const list = res.data.notifications || [];
                setNotifications(list);
                setUnreadCount(res.data.unread_count ?? list.filter((n) => !n.is_read).length);
            })
            .catch(() => {});
    }, []);

    const handleMarkAllRead = async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
        try {
            await axios.patch('/volunteer/notifications/read-all');
        } catch {}
    };

    const isActive = (routeName) => {
        try {
            return route().current(routeName) || route().current(`${routeName}.*`);
        } catch {
            return false;
        }
    };

    const volunteer = auth?.user;
    const initials = volunteer?.name
        ? volunteer.name
              .split(' ')
              .map((w) => w[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()
        : 'VL';
    const photoUrl = volunteer?.photo ? `/storage/${volunteer.photo}` : null;

    const handleLogout = () => router.post(route('logout'));

    return (
        <div className="min-h-screen bg-[#F0F2F6] flex flex-col font-sans text-gray-900 antialiased selection:bg-red-500 selection:text-white relative overflow-x-hidden">
            {/* Ambient soft glow at bottom left matching reference mockup */}
            <div className="fixed -bottom-24 -left-24 w-96 h-96 bg-red-100/40 rounded-full blur-3xl pointer-events-none z-0" />

            {/* Topbar spanning the header */}
            <div className="relative z-30">
                <VolunteerTopbar
                    title={title}
                    setSidebarOpen={setSidebarOpen}
                    volunteer={volunteer}
                    photoUrl={photoUrl}
                    initials={initials}
                    handleLogout={handleLogout}
                    notifications={notifications}
                    unreadCount={unreadCount}
                    handleMarkAllRead={handleMarkAllRead}
                    isActive={isActive}
                />
            </div>

            {/* Layout Body: Floating Icon Dock on Desktop + Content Area */}
            <div className="flex-1 flex min-w-0 relative z-10">
                {/* Floating Dock & Mobile Drawer */}
                <VolunteerSidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    volunteer={volunteer}
                    photoUrl={photoUrl}
                    initials={initials}
                    isActive={isActive}
                    handleLogout={handleLogout}
                />

                {/* Main Application Content Area */}
                <main className="flex-1 min-w-0 px-4 sm:px-8 py-4 lg:pl-28 transition-all duration-200">
                    {children}
                </main>
            </div>

            {/* Floating Live Chat Panel */}
            {chatOpen && (
                <div className="fixed bottom-24 right-4 sm:right-6 w-96 max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-8rem)] bg-white rounded-3xl shadow-2xl border-0 z-50 flex flex-col overflow-hidden animate-fadeIn">
                    <div className="bg-red-600 text-white px-5 py-4 flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-2.5 font-bold text-sm">
                            <MessageCircle className="w-5 h-5" />
                            <span>Red Cross Live Chat</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setChatOpen(false)}
                            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <LiveChatPanel mode="volunteer" currentUserId={volunteer?.id} />
                    </div>
                </div>
            )}

            {/* Floating Chat Trigger Button */}
            <button
                type="button"
                onClick={() => setChatOpen((prev) => !prev)}
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-xl flex items-center justify-center transition-all transform hover:scale-105 z-40 focus:outline-none focus:ring-4 focus:ring-red-500/30 cursor-pointer"
                title={chatOpen ? 'Close chat' : 'Open live chat'}
            >
                {chatOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            </button>
        </div>
    );
}