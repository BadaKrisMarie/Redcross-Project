import React, { useEffect, useRef, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminSidebar from '@/Components/Admin/AdminSidebar';
import AdminTopbar from '@/Components/Admin/AdminTopbar';
import DocumentReviewModal from '@/Components/Admin/DocumentReviewModal';
import VolunteerNotifModal from '@/Components/Admin/VolunteerNotifModal';
import AdminFloatingChat from '@/Components/Admin/AdminFloatingChat';

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
}

async function apiFetch(url, options = {}) {
    const res = await fetch(url, {
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') || '',
            ...(options.headers || {}),
        },
        ...options,
    });
    if (!res.ok) throw new Error('Request failed: ' + res.status);
    return res.json();
}

export default function AdminLayout({ children, title = 'Dashboard' }) {
    const { auth, notifications } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const [notifOpen, setNotifOpen] = useState(false);
    const [topbarSearch, setTopbarSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searching, setSearching] = useState(false);
    const searchWrapRef = useRef(null);
    const searchDebounceRef = useRef(null);
    const [selectedNotif, setSelectedNotif] = useState(null);
    const notifRef = useRef(null);

    const [approvingNotifDoc, setApprovingNotifDoc] = useState(false);
    const [isNotifPreviewMaximized, setIsNotifPreviewMaximized] = useState(false);
    const [cameFromQueue, setCameFromQueue] = useState(false);

    const [localNotifs, setLocalNotifs] = useState(notifications ?? []);
    useEffect(() => {
        setLocalNotifs(notifications ?? []);
    }, [notifications]);

    // Floating chat state
    const [chatOpen, setChatOpen] = useState(false);
    const [chatView, setChatView] = useState('list');
    const [activeVolunteer, setActiveVolunteer] = useState(null);
    const [volunteerList, setVolunteerList] = useState([]);
    const [volunteerListLoading, setVolunteerListLoading] = useState(false);
    const [chatSearch, setChatSearch] = useState('');
    const [unreadChatCount, setUnreadChatCount] = useState(0);
    const [unreadByVolunteer, setUnreadByVolunteer] = useState({});

    const chatOpenRef = useRef(chatOpen);
    const chatViewRef = useRef(chatView);
    const activeVolunteerRef = useRef(activeVolunteer);
    useEffect(() => { chatOpenRef.current = chatOpen; }, [chatOpen]);
    useEffect(() => { chatViewRef.current = chatView; }, [chatView]);
    useEffect(() => { activeVolunteerRef.current = activeVolunteer; }, [activeVolunteer]);

    const isActive = (routeName) => {
        try {
            return route().current(routeName) || route().current(`${routeName}.*`);
        } catch {
            return false;
        }
    };

    const admin = auth?.user;
    const initials = admin?.name
        ? admin.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
        : 'AD';
    const photoUrl = admin?.photo ? `/storage/${admin.photo}` : null;

    const handleLogout = () => router.post(route('logout'));

    const notifList = localNotifs;
    const unreadCount = notifList.filter((n) => !n.read_at).length;

    const handleToggleNotif = () => setNotifOpen((o) => !o);

    const handleMarkAllRead = () => {
        router.post(route('admin.notifications.markRead'), {}, {
            preserveScroll: true,
            preserveState: true,
            only: ['notifications'],
        });
    };

    const handleDeleteNotif = (e, notif) => {
        e.stopPropagation();
        const id = notif.id;
        const previous = localNotifs;
        setLocalNotifs((list) => list.filter((n) => n.id !== id));

        router.delete(route('admin.notifications.destroy', id), {
            preserveScroll: true,
            preserveState: true,
            only: ['notifications'],
            onError: () => {
                setLocalNotifs(previous);
                alert('Failed to delete notification. Please try again.');
            },
        });
    };

    const handleClearAllNotifs = () => {
        if (localNotifs.length === 0) return;
        if (!window.confirm('Delete all notifications?')) return;
        const previous = localNotifs;
        setLocalNotifs([]);
        setNotifOpen(false);

        router.delete(route('admin.notifications.clearAll'), {
            preserveScroll: true,
            preserveState: true,
            only: ['notifications'],
            onError: () => {
                setLocalNotifs(previous);
                alert('Failed to clear notifications. Please try again.');
            },
        });
    };

    useEffect(() => {
        const onClick = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    useEffect(() => {
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

        const q = topbarSearch.trim();
        if (q.length < 2) {
            setSearchResults([]);
            setSearchOpen(false);
            setSearching(false);
            return;
        }

        setSearching(true);
        searchDebounceRef.current = setTimeout(() => {
            apiFetch(route('admin.search') + '?q=' + encodeURIComponent(q))
                .then((data) => {
                    setSearchResults(data.results || []);
                    setSearchOpen(true);
                })
                .catch(() => {
                    setSearchResults([]);
                    setSearchOpen(true);
                })
                .finally(() => setSearching(false));
        }, 300);

        return () => clearTimeout(searchDebounceRef.current);
    }, [topbarSearch]);

    useEffect(() => {
        const onClick = (e) => {
            if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) setSearchOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    const handleSelectSearchResult = (result) => {
        setSearchOpen(false);
        setTopbarSearch('');
        if (result.url) router.visit(result.url);
    };

    useEffect(() => {
        const echo = window.Echo;
        if (!echo || !admin?.id) return;

        const channel = echo.private('admin.chat');
        channel.listen('.message.sent', (payload) => {
            if (payload.sender_role !== 'volunteer') return;

            const isViewingThisThread =
                chatOpenRef.current &&
                chatViewRef.current === 'chat' &&
                activeVolunteerRef.current?.id === payload.volunteer_id;

            if (isViewingThisThread) return;

            setUnreadChatCount((c) => c + 1);
            setUnreadByVolunteer((prev) => ({
                ...prev,
                [payload.volunteer_id]: {
                    count: (prev[payload.volunteer_id]?.count || 0) + 1,
                    preview: payload.body,
                    at: payload.created_at,
                },
            }));
        });

        return () => {
            echo.leave('admin.chat');
        };
    }, [admin?.id]);

    const openDetail = (n) => {
        setSelectedNotif(n);
        setIsNotifPreviewMaximized(false);
    };

    const closeDetail = () => {
        setIsNotifPreviewMaximized(false);
        setSelectedNotif(null);
        setCameFromQueue(false);
    };

    const handleDownloadNotifDoc = async (docId, fileLabel) => {
        try {
            const response = await fetch(route('admin.documents.download', docId));
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileLabel || 'document';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch {
            window.location.href = route('admin.documents.download', docId);
        }
    };

    const handleApproveNotifDoc = (docId) => {
        setApprovingNotifDoc(true);
        router.patch(route('admin.documents.approve', docId), {}, {
            preserveScroll: true,
            preserveState: true,
            only: ['notifications'],
            onSuccess: () => closeDetail(),
            onFinish: () => setApprovingNotifDoc(false),
            onError: () => alert('Failed to approve document. Please try again.'),
        });
    };

    const handleRejectNotifDoc = (docId) => {
        setApprovingNotifDoc(true);
        router.patch(route('admin.documents.reject', docId), {}, {
            preserveScroll: true,
            preserveState: true,
            only: ['notifications'],
            onSuccess: () => closeDetail(),
            onFinish: () => setApprovingNotifDoc(false),
            onError: () => alert('Failed to reject document. Please try again.'),
        });
    };

    const fetchVolunteerList = () => {
        setVolunteerListLoading(true);
        apiFetch(route('admin.chat.volunteers'))
            .then((data) => setVolunteerList(data.volunteers || []))
            .catch(() => setVolunteerList([]))
            .finally(() => setVolunteerListLoading(false));
    };

    const handleOpenChat = () => {
        const opening = !chatOpen;
        setChatOpen(opening);
        if (opening) {
            setChatView(activeVolunteer ? 'chat' : 'list');
            if (!activeVolunteer) fetchVolunteerList();
            setUnreadChatCount(0);
        }
    };

    const handleSelectVolunteer = (v) => {
        setActiveVolunteer(v);
        setChatView('chat');
        setUnreadByVolunteer((prev) => {
            const next = { ...prev };
            delete next[v.id];
            return next;
        });
        setUnreadChatCount((c) => Math.max(0, c - (unreadByVolunteer[v.id]?.count || 0)));
    };

    const handleBackToList = () => {
        setChatView('list');
        fetchVolunteerList();
    };

    const filteredVolunteerList = volunteerList
        .filter((v) => (v.name || '').toLowerCase().includes(chatSearch.toLowerCase()))
        .sort((a, b) => (unreadByVolunteer[b.id]?.count || 0) - (unreadByVolunteer[a.id]?.count || 0));

    return (
        <div className="min-h-screen bg-[#F0F2F6] dark:bg-gray-950 flex flex-col font-sans text-gray-900 dark:text-gray-100 antialiased selection:bg-red-500 selection:text-white relative overflow-x-hidden">
            {/* Ambient soft glow at bottom left matching reference image */}
            <div className="fixed -bottom-24 -left-24 w-96 h-96 bg-red-100/40 rounded-full blur-3xl pointer-events-none z-0" />

            {/* Topbar spanning the header */}
            <div className="relative z-30">
                <AdminTopbar
                    title={title}
                    setSidebarOpen={setSidebarOpen}
                    topbarSearch={topbarSearch}
                    setTopbarSearch={setTopbarSearch}
                    searchResults={searchResults}
                    searchOpen={searchOpen}
                    setSearchOpen={setSearchOpen}
                    searching={searching}
                    searchWrapRef={searchWrapRef}
                    handleSelectSearchResult={handleSelectSearchResult}
                    notifOpen={notifOpen}
                    notifRef={notifRef}
                    handleToggleNotif={handleToggleNotif}
                    handleMarkAllRead={handleMarkAllRead}
                    handleDeleteNotif={handleDeleteNotif}
                    handleClearAllNotifs={handleClearAllNotifs}
                    notifList={notifList}
                    unreadCount={unreadCount}
                    openDetail={openDetail}
                    setCameFromQueue={setCameFromQueue}
                    setNotifOpen={setNotifOpen}
                    admin={admin}
                    photoUrl={photoUrl}
                    initials={initials}
                    handleLogout={handleLogout}
                />
            </div>

            {/* Layout Body: Floating Icon Dock on Desktop + Content Area */}
            <div className="flex-1 flex min-w-0 relative z-10">
                {/* Floating Dock & Mobile Drawer */}
                <AdminSidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    admin={admin}
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

            {/* Modular Document Review Modal */}
            <DocumentReviewModal
                selectedNotif={selectedNotif}
                closeDetail={closeDetail}
                approvingNotifDoc={approvingNotifDoc}
                handleApproveNotifDoc={handleApproveNotifDoc}
                handleRejectNotifDoc={handleRejectNotifDoc}
                handleDownloadNotifDoc={handleDownloadNotifDoc}
                isNotifPreviewMaximized={isNotifPreviewMaximized}
                setIsNotifPreviewMaximized={setIsNotifPreviewMaximized}
            />

            {/* Modular Volunteer Registration Modal */}
            <VolunteerNotifModal
                selectedNotif={selectedNotif}
                closeDetail={closeDetail}
            />

            {/* Modular Floating Live Chat */}
            <AdminFloatingChat
                chatOpen={chatOpen}
                setChatOpen={setChatOpen}
                chatView={chatView}
                handleOpenChat={handleOpenChat}
                handleBackToList={handleBackToList}
                handleSelectVolunteer={handleSelectVolunteer}
                activeVolunteer={activeVolunteer}
                chatSearch={chatSearch}
                setChatSearch={setChatSearch}
                filteredVolunteerList={filteredVolunteerList}
                volunteerListLoading={volunteerListLoading}
                unreadChatCount={unreadChatCount}
                unreadByVolunteer={unreadByVolunteer}
                adminId={admin?.id}
            />
        </div>
    );
}