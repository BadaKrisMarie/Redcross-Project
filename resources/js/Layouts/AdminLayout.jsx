import React, { useEffect, useRef, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import LiveChatPanel from '@/Components/LiveChatPanel';
// NOTE: Palitan ang import path sa itaas kung iba ang lokasyon ng LiveChatPanel.jsx mo.

/**
 * PERSISTENT LAYOUT
 * Use this on all admin pages like this at the end of the file:
 *
 *   AdminDashboard.layout = (page) => <AdminLayout title="Dashboard">{page}</AdminLayout>;
 *
 * Because of this, the sidebar is not re-rendered every time the page changes -
 * it stays in the React tree (along with the sidebarOpen state), only the
 * content is replaced by Inertia.
 *
 * FLOATING LIVE CHAT - dinagdag na floating chat bubble dito sa layout mismo,
 * kaya lumalabas siya sa LAHAT ng admin pages, hindi lang sa Communication page.
 * Dahil maraming volunteers ang pwedeng kausapin ng admin (unlike sa volunteer
 * side na iisa lang ang kausap), may dalawang view ang floating window:
 *   1. "list"  - listahan ng mga volunteer na may/pwedeng chat
 *   2. "chat"  - yung actual LiveChatPanel (mode="admin") ng napiling volunteer
 *
 * NOTE: Umaasa ito sa isang route na nagbabalik ng listahan ng volunteers para sa
 * chat picker: route('admin.chat.volunteers') - dapat nagbabalik ito ng JSON
 * na hugis: { volunteers: [{ id, name, photo }, ...] }. Kung iba ang route
 * name/shape mo, palitan na lang sa fetchVolunteerList() sa baba.
 *
 * UPDATED (document review flow): sa notification detail modal, ang
 * document notifications ay hindi na diretso nagli-Link papuntang 201 Files.
 * Sa halip, may Approve / Reject buttons na dito mismo sa modal - kaya kailangan
 * munang i-review at i-decide ng admin ang status bago ito lumabas/mareflect sa
 * 201 Files. Ginagamit ang parehong 'admin.documents.approve' / '.reject' routes
 * na ginagamit na rin sa AdminDashboard.jsx.
 *
 * NEW (this version): notifications can now be individually deleted (always-
 * visible X button per row) or all cleared at once via "Clear all notifications"
 * at the bottom of the dropdown. This is optimistic on the frontend (removes
 * immediately from local state) and expects two backend routes:
 *   - DELETE  admin.notifications.destroy  ({ id })
 *   - DELETE  admin.notifications.clearAll ()
 * If these routes don't exist yet in web.php, wire them up to a controller
 * that deletes the notification row(s) for the current admin. See the two
 * handlers below (handleDeleteNotif / handleClearAllNotifs) for the exact
 * route names expected - rename there if your routes differ.
 */

const navLinksMain = [
    { label: 'Dashboard',  route: 'admin.dashboard' },
    { label: 'Volunteers', route: 'admin.volunteers' },
    { label: 'Schedule',   route: 'admin.schedule' },
    { label: 'Attendance', route: 'admin.attendance.index' },
];

const navLinksManage = [
    { label: 'Activities',    route: 'admin.activities.index' },
    { label: '201 Files',     route: 'admin.documents.index' },
    { label: 'Communication', route: 'admin.communication' },
    { label: 'Fingerprint',   route: 'admin.fingerprint.index' },
];

const NavAvatar = ({ photoUrl, initials, size = 32, fontSize = 12 }) => (
    <div style={{ width: size, height: size, borderRadius: '50%', background: '#0000ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize, fontWeight: '700', overflow: 'hidden', flexShrink: 0 }}>
        {photoUrl ? <img src={photoUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
    </div>
);

const BellIcon = () => (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);

const UserIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c0-3.6 3.13-6 7-6s7 2.4 7 6" />
    </svg>
);

// NEW: person-with-plus icon for the "New Volunteer Registration" notification circle
const UserPlusIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20c0-3.4 2.9-6 6.5-6s6.5 2.6 6.5 6" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="16" y1="11" x2="22" y2="11" />
    </svg>
);

const DocIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13.5 2.5H7a1.5 1.5 0 0 0-1.5 1.5v16A1.5 1.5 0 0 0 7 21.5h10a1.5 1.5 0 0 0 1.5-1.5V8l-5-5.5z" />
        <path d="M13.5 2.5V8h5" />
        <path d="M8.5 13h7M8.5 16.5h7M8.5 9.5h2.5" />
    </svg>
);

// Chat icons
const ChatBubbleIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
);
const CloseIcon = ({ size = 20, stroke = 'white' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);
const BackIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"/>
    </svg>
);

// Small search icon for the volunteer picker search field
const SearchIcon = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#9a9a9a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

// NEW: plain SVG icons replacing raw unicode symbols (✕, ⤢, ⤡, ellipsis, emoji)
// that were rendering as mojibake ("Ã¢Â¤Â¢" etc) due to an encoding mismatch
// somewhere between file save and browser render. SVG paths are immune to
// that class of bug since there are no special text characters involved.
const ExpandIcon = ({ size = 14, stroke = '#444' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 3h6v6" /><path d="M9 21H3v-6" /><path d="M21 3l-7 7" /><path d="M3 21l7-7" />
    </svg>
);
const ShrinkIcon = ({ size = 14, stroke = '#444' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 14h6v6" /><path d="M20 10h-6V4" /><path d="M14 10l7-7" /><path d="M3 21l7-7" />
    </svg>
);
const SmallCloseIcon = ({ size = 15, stroke = '#888' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6L6 18" /><path d="M6 6l12 12" />
    </svg>
);
// NEW: small type-icons for the topbar search dropdown, replacing the emoji map
const SearchResultTypeIcon = ({ type }) => {
    const common = { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: '#7a7a7a', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
    if (type === 'volunteer') return <svg {...common}><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.6 3.13-6 7-6s7 2.4 7 6" /></svg>;
    if (type === 'activity') return <svg {...common}><rect x="3" y="4" width="18" height="17" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="16" y1="2" x2="16" y2="6" /></svg>;
    if (type === 'document') return <DocIcon size={15} />;
    if (type === 'schedule') return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
    return <svg {...common}><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
};

// NEW: figure out preview type from mime_type, same convention as AdminDocumentsIndex
const isImageMime = (mime) => !!mime && mime.startsWith('image/');
const isPdfMime = (mime) => mime === 'application/pdf';

// Maps raw document type values to their proper display names -
// same convention as AdminDocumentsIndex.jsx's FOLDER_LABELS.
const NOTIF_DOC_LABELS = {
    nbi: 'NBI Clearance',
    medical: 'Medical Certificate',
    training: 'Training Certificate',
    barangay: 'Barangay Clearance',
    bangray: 'Barangay Clearance',
};
const formatDocLabel = (type) => NOTIF_DOC_LABELS[type?.toLowerCase()] || (type ? type.toUpperCase() : null);

// NEW - small status pill, same visual language as the one used in
// AdminDashboard.jsx and 201 Files, for the document notification modal.
function StatusPill({ status }) {
    const map = {
        approved: { bg: '#dcfce7', color: '#166534', label: 'Approved' },
        rejected: { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
        pending:  { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
    };
    const s = map[status] ?? map.pending;
    return (
        <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color, textTransform: 'uppercase', letterSpacing: '.3px' }}>
            {s.label}
        </span>
    );
}

const getInitials = (name) =>
    (name || '?')
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

// Parses each raw notification into everything the new card style needs:
// a headline ("New Volunteer Registration"), a plain-language description
// ("Claire Villamor has submitted a volunteer application."), and which
// icon/color treatment to use. Falls back gracefully if the backend later
// sends dedicated fields instead of a freeform title string.
const parseNotif = (n) => {
    const isVolunteer = n.type === 'volunteer';

    if (isVolunteer) {
        const match = (n.title ?? '').match(/registered:\s*(.+)$/i);
        const name = (n.volunteer_name ?? (match ? match[1] : n.title) ?? '').trim();
        return {
            name,
            docType: null,
            isVolunteer: true,
            headline: 'New Volunteer Registration',
            description: `${name || 'A volunteer'} has submitted a volunteer application.`,
        };
    }

    const title = n.title ?? n.message ?? '';
    const match = title.match(/^(.+?)\s+submitted\s+a\s+(.+?)\s+document/i);
    const name = (n.volunteer_name ?? (match ? match[1] : title) ?? '').trim();
    const docType = n.doc_type_label ?? (match ? formatDocLabel(match[2]) : null);

    return {
        name,
        docType,
        isVolunteer: false,
        headline: docType ? `${docType} Submitted` : 'Document Submitted',
        description: `${name || 'A volunteer'} has submitted ${docType ? `a ${docType}` : 'a document'} for review.`,
    };
};

// Self-contained fetch helper (same convention as LiveChatPanel.jsx) -
// hindi umaasa sa window.axios, basta may naka-set na 'XSRF-TOKEN' cookie.
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
}
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

export default function AdminLayout({ children, title = 'Dashboard' }) {
    const { auth, notifications } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [notifOpen, setNotifOpen] = useState(false);
    const [topbarSearch, setTopbarSearch] = useState(''); // topbar search bar (beside the bell)
    const [searchResults, setSearchResults] = useState([]);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searching, setSearching] = useState(false);
    const searchWrapRef = useRef(null);
    const searchDebounceRef = useRef(null);
    const [selectedNotif, setSelectedNotif] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const notifRef = useRef(null);

    // NEW - Approve/Reject state for the document notification detail modal.
    // Disables both buttons while a request is in flight, same pattern as
    // AdminDashboard.jsx's `approving` state.
    const [approvingNotifDoc, setApprovingNotifDoc] = useState(false);
    // NEW - Enlarge/Shrink toggle for the document preview, same behavior
    // as AdminDashboard.jsx's previewDoc modal.
    const [isNotifPreviewMaximized, setIsNotifPreviewMaximized] = useState(false);

    // Tracks whether the currently-open review modal (selectedNotif) was
    // opened FROM the queue, so that closing it can automatically return
    // the admin to the queue (if there's still more to review) instead of
    // just closing everything.
    const [cameFromQueue, setCameFromQueue] = useState(false);
    // Ref mirror of pendingDocNotifs so closeDetail() (called from inside a
    // setTimeout) always sees the freshest list, not a stale closure value
    // from the render where the timeout was scheduled.
    const pendingDocNotifsRef = useRef([]);

    // NEW - local mirror of the `notifications` prop so deleting a notification
    // (or clearing all) can update the dropdown immediately, without waiting
    // for a full Inertia round-trip. Stays in sync with the server prop via
    // the effect below, same optimistic-list pattern used for pendingDocs in
    // AdminDashboard.jsx.
    const [localNotifs, setLocalNotifs] = useState(notifications ?? []);
    useEffect(() => {
        setLocalNotifs(notifications ?? []);
    }, [notifications]);

    // Floating chat widget state
    const [chatOpen, setChatOpen] = useState(false);
    const [chatView, setChatView] = useState('list'); // 'list' | 'chat'
    const [activeVolunteer, setActiveVolunteer] = useState(null); // { id, name, photo }
    const [volunteerList, setVolunteerList] = useState([]);
    const [volunteerListLoading, setVolunteerListLoading] = useState(false);
    const [chatSearch, setChatSearch] = useState('');
    // Unread chat message badge (bilang ng bagong messages habang sarado
    // ang chat window, o habang ibang volunteer ang bukas). Naka-reset pag
    // binuksan ang widget papuntang list, o pag pinili yung volunteer na
    // nagpadala ng bagong message.
    const [unreadChatCount, setUnreadChatCount] = useState(0);
    // Per-volunteer unread tracking - { [volunteerId]: { count, preview, at } }
    // Ginagamit para ipakita kung SINO specifically ang nag-message sa listahan
    // (bold name, unread dot, huling message preview) - hindi lang total badge.
    const [unreadByVolunteer, setUnreadByVolunteer] = useState({});
    // Refs para makuha ng Echo listener (na naka-mount nang isang beses lang)
    // ang pinaka-up-to-date na value ng chatOpen/chatView/activeVolunteer,
    // kasi naka-"freeze" ang mga ito sa closure ng listener kung state lang
    // ang gagamitin.
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
        ? admin.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : 'AD';
    const photoUrl = admin?.photo ? `/storage/${admin.photo}` : null;

    const handleLogout = () => router.post(route('logout'));

    const notifList = localNotifs;
    const unreadCount = notifList.filter(n => !n.read_at).length;

    // document notifications na hindi pa na-review (status pa rin
    // 'pending', kahit "read" na siya sa bell). Ginagamit lang ito ngayon
    // para sa "cameFromQueue" fallback sa closeDetail() - HINDI na ito
    // ginagamit para i-gate ang "201 Files" sidebar link.
    const pendingDocNotifs = notifList.filter((n) => {
        const isDoc = !parseNotif(n).isVolunteer;
        const notYetDecided = (n.status ?? 'pending') === 'pending';
        return isDoc && notYetDecided;
    });
    useEffect(() => { pendingDocNotifsRef.current = pendingDocNotifs; });

    // Opening the bell no longer silently marks everything read - that's
    // now an explicit "Mark all as read" action, so the unread dots actually
    // stay visible while browsing, matching the target design.
    const handleToggleNotif = () => setNotifOpen((o) => !o);

    const handleMarkAllRead = () => {
        router.post(route('admin.notifications.markRead'), {}, {
            preserveScroll: true,
            preserveState: true,
            only: ['notifications'],
        });
    };

    // NEW - delete a single notification. Optimistic: removes it from
    // localNotifs immediately, then fires the backend request in the
    // background. Rolls back (restores the item) if the request fails.
    // Expects route 'admin.notifications.destroy' accepting the notification
    // id - rename below if your route is named differently.
    const handleDeleteNotif = (e, notif) => {
        e.stopPropagation(); // don't trigger the row's onClick (opening the detail modal)
        const id = notif.id;
        const previous = localNotifs;
        setLocalNotifs((list) => list.filter((n) => n.id !== id));

        router.delete(route('admin.notifications.destroy', id), {
            preserveScroll: true,
            preserveState: true,
            only: ['notifications'],
            onError: () => {
                setLocalNotifs(previous); // rollback
                alert('Hindi na-delete ang notification. Pakisubukan ulit.');
            },
        });
    };

    // NEW - clear every notification at once. Optimistic clear + backend call.
    // Expects route 'admin.notifications.clearAll'.
    const handleClearAllNotifs = () => {
        if (localNotifs.length === 0) return;
        if (!window.confirm('Burahin lahat ng notifications?')) return;
        const previous = localNotifs;
        setLocalNotifs([]);
        setNotifOpen(false);

        router.delete(route('admin.notifications.clearAll'), {
            preserveScroll: true,
            preserveState: true,
            only: ['notifications'],
            onError: () => {
                setLocalNotifs(previous); // rollback
                alert('Hindi na-clear ang notifications. Pakisubukan ulit.');
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

    // Global topbar search - debounced fetch (300ms) papunta sa
    // route('admin.search'). Kailangan itong idagdag sa Laravel routes/web.php
    // + controller na magbabalik ng JSON: { results: [{ id, type, label,
    // subtitle, url }, ...] }. `type` ay ginagamit para pumili ng icon
    // (volunteer / activity / document / schedule).
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        setSearchResults([]);
        if (result.url) router.visit(result.url);
    };

    // Persistent, pre-unlocked AudioContext - Chrome/Edge block audio
    // playback that isn't tied to a user gesture. We create ONE AudioContext
    // on the very first click/keypress anywhere on the page (a gesture that
    // almost always happens within seconds of the admin using the app) and
    // keep reusing + resuming that same context. This avoids the "silent
    // notification" bug where a fresh AudioContext created purely from a
    // WebSocket push stays permanently suspended.
    const audioCtxRef = useRef(null);
    useEffect(() => {
        const unlock = () => {
            try {
                const Ctx = window.AudioContext || window.webkitAudioContext;
                if (!Ctx) return;
                if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
                if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
            } catch {
                // best-effort
            }
            document.removeEventListener('click', unlock);
            document.removeEventListener('keydown', unlock);
        };
        document.addEventListener('click', unlock);
        document.addEventListener('keydown', unlock);
        return () => {
            document.removeEventListener('click', unlock);
            document.removeEventListener('keydown', unlock);
        };
    }, []);

    // Maikling "ding" na tunog gamit ang Web Audio API - walang kailangang
    // audio file, kaya walang extra asset na dapat i-upload/i-host. Gumagamit
    // ng shared/unlocked AudioContext (audioCtxRef) kung meron na; kung wala
    // pa (hindi pa nag-i-interact ang admin sa page), gagawa pa rin ng bago
    // bilang best-effort fallback.
    const playChatSound = () => {
        try {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return;
            if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
            const ctx = audioCtxRef.current;

            const scheduleBellSound = () => {
                const compressor = ctx.createDynamicsCompressor();
                compressor.threshold.setValueAtTime(-28, ctx.currentTime);
                compressor.knee.setValueAtTime(24, ctx.currentTime);
                compressor.ratio.setValueAtTime(14, ctx.currentTime);
                compressor.attack.setValueAtTime(0.003, ctx.currentTime);
                compressor.release.setValueAtTime(0.22, ctx.currentTime);
                compressor.connect(ctx.destination);

                const master = ctx.createGain();
                master.gain.setValueAtTime(1.5, ctx.currentTime);
                master.connect(compressor);

                const playBellNote = (freq, startAt, duration = 0.38) => {
                    const partials = [
                        { mult: 1,    gain: 1.0,  type: 'sine' },
                        { mult: 2.01, gain: 0.35, type: 'sine' },
                        { mult: 2.76, gain: 0.18, type: 'triangle' },
                    ];
                    partials.forEach(({ mult, gain, type }) => {
                        const osc = ctx.createOscillator();
                        const env = ctx.createGain();
                        osc.type = type;
                        osc.frequency.setValueAtTime(freq * mult, startAt);
                        env.gain.setValueAtTime(0.0001, startAt);
                        env.gain.exponentialRampToValueAtTime(gain, startAt + 0.012);
                        env.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
                        osc.connect(env);
                        env.connect(master);
                        osc.start(startAt);
                        osc.stop(startAt + duration + 0.02);
                    });
                };

                playBellNote(880, ctx.currentTime);
                playBellNote(1318.5, ctx.currentTime + 0.13, 0.45);
            };

            if (ctx.state === 'suspended') {
                ctx.resume().then(scheduleBellSound).catch(() => {});
            } else {
                scheduleBellSound();
            }
        } catch {
            // Best-effort lang ang sound - hindi dapat ito makasira sa chat kung mag-fail.
        }
    };

    // GLOBAL chat listener - naka-mount habang buhay ang AdminLayout (ibig
    // sabihin sa LAHAT ng admin pages), kaya may notification pa rin kahit
    // sarado ang floating chat window o nasa ibang page ang admin.
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

            playChatSound();
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [admin?.id]);

    // Opens the detail modal with a fade + scale-in entrance (same convention
    // as the delete-confirmation modal in AdminDocumentsIndex.jsx).
    const openDetail = (n) => {
        setSelectedNotif(n);
        setIsNotifPreviewMaximized(false);
        requestAnimationFrame(() => setModalVisible(true));
    };
    const closeDetail = () => {
        setModalVisible(false);
        setIsNotifPreviewMaximized(false);
        setTimeout(() => {
            setSelectedNotif(null);
            setCameFromQueue(false);
        }, 160);
    };

    // download a document straight from the notification modal.
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

    // Approve / Reject a document straight from the notification
    // detail modal. Mirrors AdminDashboard.jsx's handleApprove/handleReject.
    const handleApproveNotifDoc = (docId) => {
        setApprovingNotifDoc(true);
        router.patch(route('admin.documents.approve', docId), {}, {
            preserveScroll: true,
            preserveState: true,
            only: ['notifications'],
            onSuccess: () => closeDetail(),
            onFinish: () => setApprovingNotifDoc(false),
            onError: () => alert('Hindi na-approve ang document. Pakisubukan ulit.'),
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
            onError: () => alert('Hindi na-reject ang document. Pakisubukan ulit.'),
        });
    };

    // Fetch the list of volunteers for the chat picker.
    const fetchVolunteerList = () => {
        setVolunteerListLoading(true);
        apiFetch(route('admin.chat.volunteers'))
            .then(data => setVolunteerList(data.volunteers || []))
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
        .filter(v => (v.name || '').toLowerCase().includes(chatSearch.toLowerCase()))
        .sort((a, b) => (unreadByVolunteer[b.id]?.count || 0) - (unreadByVolunteer[a.id]?.count || 0));

    const truncate = (str, n) => (!str ? '' : str.length > n ? str.slice(0, n - 1) + '...' : str);

    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

            <style>{`
                * { box-sizing: border-box; margin: 0; padding: 0; }
                :root { --red: #5765F2; --red-dark: #343D91; --ink: #1A1A1A; --muted: #6B6B6B; --border: #EDEDED; --surface: #F7F7F5; --white: #FFFFFF; }
                body {
                    font-family: Montserrat;
                    background: #F4F5F7;
                }
                .wrap { display: flex; min-height: 100vh; }
                .sidebar { width: 220px; background: #e40000; display: flex; flex-direction: column; position: fixed; top: 0; left: 0; height: 100vh; z-index: 100; transition: transform 0.2s; }
                .sidebar.closed { transform: translateX(-220px); }
                .main { margin-left: 220px; flex: 1; display: flex; flex-direction: column; min-height: 100vh; transition: margin-left 0.2s; }
                .main.full { margin-left: 0; }
                .sb-brand { padding: 18px 20px 14px; border-bottom: 1px solid rgba(255,255,255,0.15); }
                .sb-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
                .sb-cross { width: 32px; height: 32px; background: rgba(0,0,0,0.2); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #fff; font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 700; flex-shrink: 0; }
                .sb-name { font-family: Montserrat; color: #fff; font-size: 13px; font-weight: 600; letter-spacing: .5px; line-height: 1.3; }
                .sb-name span { display: block; color: rgba(255,255,255,0.7); font-size: 11px; font-weight: 400; letter-spacing: 1px; text-transform: uppercase; }
                .sb-user { padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; gap: 10px; cursor: default; }
                .sb-uname { color: #fff; font-size: 12.5px; font-weight: 600; line-height: 1.3; }
                .sb-uname span { display: block; color: rgba(255,255,255,0.9); font-size: 11px; font-weight: 500; }
                .sb-nav { padding: 10px 0; flex: 1; overflow-y: auto; }
                .nav-section-label { font-size: 10.5px; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.85); padding: 10px 20px 4px; font-weight: 700; text-shadow: 0 1px 2px rgba(0,0,0,0.15); }
                .nav-item { position: relative; display: flex; align-items: center; gap: 10px; padding: 10px 20px; margin-right: 12px; color: #ffffff; font-size: 13.5px; font-weight: 600; cursor: pointer; transition: all .15s; border-left: 2px solid transparent; text-decoration: none; text-shadow: 0 1px 2px rgba(0,0,0,0.12); }
                .nav-item:hover { background: rgba(0,0,0,0.15); color: #fff; }
                .nav-item.active { background: #fff; border-left-color: transparent; color: #e40000; text-shadow: none; border-radius: 20px 0 0 20px; margin-right: 0; z-index: 1; }
                .nav-item.active .nav-dot { background: #e40000; }
                .nav-item.active::before,
                .nav-item.active::after {
                    content: '';
                    position: absolute;
                    right: 0;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    pointer-events: none;
                }
                .nav-item.active::before { top: -18px; box-shadow: 9px 9px 0 0 #fff; }
                .nav-item.active::after { bottom: -18px; box-shadow: 9px -9px 0 0 #fff; }
                .nav-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
                .nav-badge { margin-left: auto; background: #fff; color: var(--red); font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: 10px; }
                .sb-footer { padding: 14px 20px; border-top: 1px solid rgba(255,255,255,0.15); }
                .logout-btn { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.7); font-size: 12px; cursor: pointer; transition: color .15s; background: none; border: none; width: 100%; font-family: 'DM Sans', sans-serif; }
                .logout-btn:hover { color: #fff; }
                .topbar { background: var(--white); border-bottom: 1px solid var(--border); padding: 0 28px; height: 56px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; position: sticky; top: 0; z-index: 50; }
                .menu-btn { background: none; border: none; cursor: pointer; color: var(--ink); display: flex; align-items: center; padding: 4px; }
                .page-title { font-family: Montserrat; font-size: 20px; font-weight: 700; color: var(--ink); letter-spacing: .3px; text-transform: uppercase; line-height: 1; }
                .content { flex: 1; padding: 28px; }
                .topbar-right { display: flex; align-items: center; gap: 10px; }
                .topbar-search { position: relative; display: flex; align-items: center; }
                .topbar-search svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #a0a0a0; }
                .topbar-search input {
                    width: 220px; padding: 8px 12px 8px 34px; border: 1.5px solid var(--border); border-radius: 20px;
                    font-size: 12.5px; outline: none; font-family: 'Montserrat', sans-serif; box-sizing: border-box;
                    background: #f7f7f5; transition: border-color 0.15s, background 0.15s, width 0.2s;
                }
                .topbar-search input:focus { border-color: var(--red); background: #fff; width: 260px; }
                .topbar-search-dropdown { position: absolute; top: 42px; left: 0; width: 320px; max-width: calc(100vw - 32px); background: #fff; border: 1px solid var(--border); border-radius: 12px; box-shadow: 0 12px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06); overflow: hidden; z-index: 210; max-height: 360px; overflow-y: auto; }
                .topbar-search-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; cursor: pointer; border-bottom: 1px solid #f5f5f5; transition: background 0.12s; }
                .topbar-search-item:last-child { border-bottom: none; }
                .topbar-search-item:hover { background: #f8f9fa; }
                .topbar-search-item-icon { flex-shrink: 0; display: flex; align-items: center; }
                .topbar-search-item-text { min-width: 0; }
                .topbar-search-item-label { font-size: 12.5px; font-weight: 600; color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .topbar-search-item-subtitle { font-size: 11px; color: var(--muted); margin-top: 1px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .topbar-search-empty { padding: 20px 14px; text-align: center; font-size: 12px; color: var(--muted); }
                .notif-wrap { position: relative; }
                .notif-btn { position: relative; background: none; border: none; cursor: pointer; color: var(--ink); width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
                .notif-btn:hover { background: #f5f5f5; }
                .notif-badge { position: absolute; top: 3px; right: 3px; min-width: 16px; height: 16px; padding: 0 4px; border-radius: 999px; background: var(--red); color: #fff; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; border: 1.5px solid #fff; line-height: 1; }
                .notif-dropdown { position: absolute; right: 0; top: 44px; width: 380px; max-width: calc(100vw - 32px); background: #fff; border: 1px solid var(--border); border-radius: 14px; box-shadow: 0 12px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06); overflow: hidden; z-index: 200; }
                .notif-header { padding: 16px 18px; border-bottom: 1px solid var(--border); font-size: 15px; font-weight: 700; color: var(--ink); display: flex; align-items: center; justify-content: space-between; letter-spacing: .1px; }
                .notif-markread { background: none; border: none; cursor: pointer; font-size: 11.5px; font-weight: 700; color: var(--red); font-family: Montserrat; padding: 0; }
                .notif-markread:hover { text-decoration: underline; }
                .notif-list { max-height: 400px; overflow-y: auto; }
                .notif-item { display: flex; align-items: flex-start; gap: 10px; padding: 14px 18px; border-bottom: 1px solid #f5f5f5; transition: background 0.12s ease; }
                .notif-item:last-child { border-bottom: none; }
                .notif-item:hover { background: #f8f9fa; }
                .notif-item.unread { background: #f8f9ff; }
                .notif-item.unread:hover { background: #f0f2ff; }
                .notif-item-main { display: flex; align-items: flex-start; gap: 12px; flex: 1; min-width: 0; cursor: pointer; }
                .notif-icon-circle { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .notif-icon-volunteer { background: #e3e7fd; color: #4356e0; }
                .notif-icon-document { background: #e3e7fd; color: #3a4bd0; }
                .notif-headline { font-size: 13px; font-weight: 700; color: var(--ink); margin-bottom: 3px; line-height: 1.4; }
                .notif-desc { font-size: 12px; color: var(--muted); line-height: 1.5; margin-bottom: 6px; }
                .notif-time { font-size: 11px; color: #b0b0b0; }
                .notif-side { display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between; gap: 8px; flex-shrink: 0; align-self: stretch; padding: 2px 0; }
                .notif-side-top { display: flex; align-items: center; gap: 8px; }
                .notif-unread-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--red); flex-shrink: 0; }
                .notif-delete-btn { background: none; border: none; cursor: pointer; color: #c2c2c2; width: 22px; height: 22px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background 0.12s, color 0.12s; }
                .notif-delete-btn:hover { background: #fee2e2; color: #dc2626; }
                .notif-review-btn { background: var(--red); color: #fff; font-size: 11px; font-weight: 700; padding: 6px 14px; border-radius: 8px; text-decoration: none; white-space: nowrap; }
                .notif-review-btn:hover { opacity: .9; }
                .notif-empty { padding: 32px 18px; text-align: center; font-size: 12.5px; color: var(--muted); }
                .notif-footer { padding: 12px 18px; text-align: center; border-top: 1px solid var(--border); }
                .notif-footer button { background: none; border: none; cursor: pointer; font-size: 12px; font-weight: 700; color: var(--muted); font-family: Montserrat; }
                .notif-footer button:hover:not(:disabled) { color: #dc2626; text-decoration: underline; }
                .notif-footer button:disabled { opacity: 0.4; cursor: not-allowed; }
                .detail-backdrop {
                    position: fixed; inset: 0; z-index: 299;
                    display: flex; align-items: center; justify-content: center; padding: 20px;
                    background: rgba(17, 17, 17, 0); backdrop-filter: blur(0px);
                    transition: background .18s ease, backdrop-filter .18s ease;
                }
                .detail-backdrop.show { background: rgba(17, 17, 17, 0.5); backdrop-filter: blur(2px); }
                .detail-modal {
                    width: 440px; max-width: 100%; background: #fff; border-radius: 16px;
                    box-shadow: 0 24px 60px rgba(0,0,0,0.28); overflow: hidden;
                    transform: translateY(8px) scale(0.96); opacity: 0;
                    transition: transform .18s cubic-bezier(.2,.8,.2,1), opacity .18s ease;
                }
                .detail-modal.show { transform: translateY(0) scale(1); opacity: 1; }
                .detail-header { padding: 18px 22px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
                .detail-header-title { font-size: 15px; font-weight: 700; color: var(--ink); }
                .detail-close { background: none; border: none; cursor: pointer; color: var(--muted); width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
                .detail-close:hover { background: #f5f5f5; color: var(--ink); }
                .detail-body { padding: 28px 22px 24px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px; }
                .detail-avatar { position: relative; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 700; }
                .detail-headline { font-size: 15px; font-weight: 700; color: var(--ink); line-height: 1.4; }
                .detail-desc { font-size: 13px; color: var(--muted); line-height: 1.5; }
                .detail-time { font-size: 12px; color: var(--muted); }
                .detail-preview { width: 100%; border-radius: 10px; overflow: hidden; background: #f5f5f5; border: 1px solid var(--border); margin-top: 6px; }
                .detail-preview img { width: 100%; max-height: 260px; object-fit: contain; display: block; background: #f5f5f5; }
                .detail-preview iframe { width: 100%; height: 260px; border: none; display: block; }
                .detail-preview-fallback { padding: 28px 16px; display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--muted); font-size: 12.5px; }
                .detail-footer { padding: 16px 22px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 10px; }
                .detail-btn { padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; border: none; font-family: 'Montserrat', sans-serif; }
                .detail-btn:disabled { opacity: 0.6; cursor: not-allowed; }
                .detail-btn-secondary { background: #f5f5f5; color: var(--ink); border: none; }
                .detail-btn-secondary:hover { background: #ececec; }
                .detail-btn-primary { background: var(--red); color: #fff; border: none; }
                .detail-btn-primary:hover { opacity: 0.9; }
                .detail-btn-approve { background: #16a34a; color: #fff; }
                .detail-btn-approve:hover { opacity: 0.9; }
                .detail-btn-reject { background: #fff; color: #dc2626; border: 1px solid #dc2626; }
                .detail-btn-reject:hover { background: #fef2f2; }
                .topbar-profile { display: flex; align-items: center; gap: 10px; text-decoration: none; padding: 4px 8px; border-radius: 8px; transition: background 0.15s; cursor: pointer; }
                .topbar-profile:hover { background: #f5f5f5; }
                .topbar-profile-name { font-size: 12px; font-weight: 500; color: var(--ink); }

                /* FLOATING CHAT WIDGET - professional redesign */
                .achat-fab-wrap { position: fixed; bottom: 26px; right: 26px; z-index: 200; }
                .achat-fab {
                    position: relative; width: 58px; height: 58px;
                    border-radius: 50%; background: #5765F2; border: none; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 6px 18px rgba(5,38,89,0.35);
                    transition: transform 0.15s, box-shadow 0.15s;
                }
                .achat-fab:hover { transform: scale(1.06); box-shadow: 0 8px 22px rgba(5,38,89,0.45); }
                .achat-fab-badge {
                    position: absolute; top: -4px; right: -4px; min-width: 20px; height: 20px; padding: 0 5px;
                    border-radius: 999px; background: #111; color: #fff; font-size: 11px; font-weight: 700;
                    display: flex; align-items: center; justify-content: center; border: 2px solid #fff;
                    font-family: 'Montserrat', sans-serif; line-height: 1;
                }
                @keyframes achat-badge-pop { from { transform: scale(0.6); } to { transform: scale(1); } }
                .achat-fab-badge { animation: achat-badge-pop 0.18s ease-out; }
                .achat-window {
                    position: fixed; bottom: 98px; right: 26px;
                    width: 368px; max-width: calc(100vw - 40px);
                    height: 540px; max-height: calc(100vh - 140px);
                    background: #fff; border-radius: 16px; overflow: hidden;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.22), 0 2px 10px rgba(0,0,0,0.08);
                    z-index: 200; display: flex; flex-direction: column;
                    border: 1px solid var(--border);
                    animation: achat-pop 0.16s ease-out;
                }
                @keyframes achat-pop {
                    from { opacity: 0; transform: translateY(12px) scale(0.98); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                .achat-header {
                    background: linear-gradient(135deg, #5765F2 0%, #343D91 100%); color: #fff; padding: 16px 18px;
                    display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
                    gap: 8px;
                }
                .achat-header-title { font-size: 14.5px; font-weight: 700; display: flex; align-items: center; gap: 9px; min-width: 0; }
                .achat-header-title-text { display: flex; flex-direction: column; min-width: 0; }
                .achat-header-title-text span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .achat-header-sub { font-size: 10.5px; font-weight: 500; opacity: 0.85; }
                .achat-header-btns { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
                .achat-icon-btn { background: rgba(255,255,255,0.18); border: none; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.15s; }
                .achat-icon-btn:hover { background: rgba(255,255,255,0.3); }

                .achat-search { padding: 12px 16px; border-bottom: 1px solid var(--border); flex-shrink: 0; background: #fff; }
                .achat-search-inner { position: relative; }
                .achat-search-inner svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; }
                .achat-search input {
                    width: 100%; padding: 9px 14px 9px 34px; border: 1.5px solid var(--border); border-radius: 22px;
                    font-size: 12.5px; outline: none; font-family: 'Montserrat', sans-serif; box-sizing: border-box;
                    background: #f7f7f5; transition: border-color 0.15s, background 0.15s;
                }
                .achat-search input:focus { border-color: var(--red); background: #fff; }
                .achat-list { flex: 1; overflow-y: auto; background: #fff; }
                .achat-list-section { font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: #b5b5b5; font-weight: 700; padding: 12px 16px 6px; }
                .achat-list-item {
                    display: flex; align-items: center; gap: 11px; padding: 11px 16px; cursor: pointer;
                    border-bottom: 1px solid #f5f5f5; transition: background 0.12s; position: relative;
                }
                .achat-list-item:hover { background: #fafafa; }
                .achat-list-item.has-unread { background: #f8f9ff; }
                .achat-list-item.has-unread:hover { background: #f0f2ff; }
                .achat-list-avatar-wrap { position: relative; flex-shrink: 0; }
                .achat-list-unread-dot {
                    position: absolute; top: -2px; right: -2px; width: 11px; height: 11px; border-radius: 50%;
                    background: var(--red); border: 2px solid #fff;
                }
                .achat-list-text { flex: 1; min-width: 0; }
                .achat-list-name-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
                .achat-list-name { font-size: 13px; font-weight: 600; color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .achat-list-name.unread-name { font-weight: 700; }
                .achat-list-time { font-size: 10.5px; color: #b5b5b5; flex-shrink: 0; }
                .achat-list-preview { font-size: 11.5px; color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 1px; }
                .achat-list-preview.unread-preview { color: var(--ink); font-weight: 600; }
                .achat-list-count-badge {
                    background: var(--red); color: #fff; font-size: 10px; font-weight: 700; min-width: 18px; height: 18px;
                    border-radius: 999px; display: flex; align-items: center; justify-content: center; padding: 0 5px; flex-shrink: 0;
                }
                .achat-empty { text-align: center; color: #aaa; font-size: 12.5px; padding: 40px 16px; display: flex; flex-direction: column; align-items: center; gap: 10px; }

                @media (max-width: 480px) {
                    .achat-window { right: 12px; left: 12px; width: auto; bottom: 92px; }
                    .achat-fab-wrap { right: 18px; bottom: 18px; }
                }
            `}</style>

            <div className="wrap">
                <aside className={`sidebar ${sidebarOpen ? '' : 'closed'}`}>
                    <div className="sb-user">
                        <NavAvatar photoUrl={photoUrl} initials={initials} size={34} fontSize={12} />
                        <div className="sb-uname">{admin?.name ?? 'Admin'}<span>Administrator</span></div>
                    </div>
                    <nav className="sb-nav">
                        <div className="nav-section-label">Main</div>
                        {navLinksMain.map(({ label, route: r, badge }) => (
                            <Link key={label} href={route(r)} className={`nav-item ${isActive(r) ? 'active' : ''}`}>
                                <div className="nav-dot" />{label}
                                {badge && <span className="nav-badge">{badge}</span>}
                            </Link>
                        ))}
                        <div className="nav-section-label">Manage</div>
                        {navLinksManage.map(({ label, route: r, badge }) => (
                            <Link
                                key={label}
                                href={route(r)}
                                className={`nav-item ${isActive(r) ? 'active' : ''}`}
                            >
                                <div className="nav-dot" />{label}
                                {badge && <span className="nav-badge">{badge}</span>}
                            </Link>
                        ))}
                    </nav>
                    <div className="sb-footer">
                        <button className="logout-btn" onClick={handleLogout}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                            Log out
                        </button>
                    </div>
                </aside>

                <main className={`main ${sidebarOpen ? '' : 'full'}`}>
                    <div className="topbar">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <button className="menu-btn" onClick={() => setSidebarOpen(o => !o)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                            </button>
                            <span className="page-title">{title}</span>
                        </div>

                        <div className="topbar-right">
                            <div className="topbar-search" ref={searchWrapRef}>
                                <SearchIcon size={15} />
                                <input
                                    type="text"
                                    value={topbarSearch}
                                    onChange={(e) => setTopbarSearch(e.target.value)}
                                    onFocus={() => { if (searchResults.length > 0) setSearchOpen(true); }}
                                    placeholder="Search..."
                                />
                                {searchOpen && (
                                    <div className="topbar-search-dropdown">
                                        {searching ? (
                                            <div className="topbar-search-empty">Searching...</div>
                                        ) : searchResults.length === 0 ? (
                                            <div className="topbar-search-empty">No results found.</div>
                                        ) : (
                                            searchResults.map((r) => (
                                                <div
                                                    key={`${r.type}-${r.id}`}
                                                    className="topbar-search-item"
                                                    onClick={() => handleSelectSearchResult(r)}
                                                >
                                                    <span className="topbar-search-item-icon"><SearchResultTypeIcon type={r.type} /></span>
                                                    <div className="topbar-search-item-text">
                                                        <div className="topbar-search-item-label">{r.label}</div>
                                                        {r.subtitle && <div className="topbar-search-item-subtitle">{r.subtitle}</div>}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="notif-wrap" ref={notifRef}>
                                <button className="notif-btn" onClick={handleToggleNotif} aria-label="Notifications">
                                    <BellIcon />
                                    {unreadCount > 0 && (
                                        <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                                    )}
                                </button>
                                {notifOpen && (
                                    <div className="notif-dropdown">
                                        <div className="notif-header">
                                            <span>Notifications</span>
                                            {unreadCount > 0 && (
                                                <button type="button" className="notif-markread" onClick={handleMarkAllRead}>
                                                    Mark all as read
                                                </button>
                                            )}
                                        </div>
                                        <div className="notif-list">
                                            {notifList.length === 0 ? (
                                                <div className="notif-empty">No new notifications yet.</div>
                                            ) : (
                                                notifList.map((n, i) => {
                                                    const unread = !n.read_at;
                                                    const { isVolunteer, headline, description } = parseNotif(n);
                                                    return (
                                                        <div key={n.id ?? i} className={`notif-item ${unread ? 'unread' : ''}`}>
                                                            <div
                                                                className="notif-item-main"
                                                                onClick={() => { setCameFromQueue(false); openDetail(n); setNotifOpen(false); }}
                                                            >
                                                                <div className={`notif-icon-circle ${isVolunteer ? 'notif-icon-volunteer' : 'notif-icon-document'}`}>
                                                                    {isVolunteer ? <UserPlusIcon /> : <DocIcon />}
                                                                </div>
                                                                <div className="notif-body">
                                                                    <div className="notif-headline">{headline}</div>
                                                                    <div className="notif-desc">{description}</div>
                                                                    <div className="notif-time">{n.created_at}</div>
                                                                </div>
                                                            </div>
                                                            <div className="notif-side">
                                                                <div className="notif-side-top">
                                                                    {unread && <span className="notif-unread-dot" />}
                                                                    {/* NEW - always-visible delete button per notification row */}
                                                                    <button
                                                                        type="button"
                                                                        className="notif-delete-btn"
                                                                        onClick={(e) => handleDeleteNotif(e, n)}
                                                                        aria-label="Delete notification"
                                                                        title="Delete notification"
                                                                    >
                                                                        <SmallCloseIcon size={13} stroke="currentColor" />
                                                                    </button>
                                                                </div>
                                                                {isVolunteer && (
                                                                    <Link
                                                                        href={route('admin.volunteers.show', n.ref_id)}
                                                                        className="notif-review-btn"
                                                                        onClick={() => setNotifOpen(false)}
                                                                    >
                                                                        Review
                                                                    </Link>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                        {/* NEW - clear-all action */}
                                        {notifList.length > 0 && (
                                            <div className="notif-footer">
                                                <button type="button" onClick={handleClearAllNotifs}>
                                                    Clear all notifications
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <Link href={route('admin.profile')} className="topbar-profile">
                                <NavAvatar photoUrl={photoUrl} initials={initials} size={28} fontSize={10} />
                                <span className="topbar-profile-name">{admin?.name ?? 'Admin'}</span>
                            </Link>
                        </div>
                    </div>

                    <div className="content">
                        {children}
                    </div>
                </main>
            </div>

            {/* Detail modal - expands when a notification is clicked from the dropdown.
                UPDATED: document notifications now show Approve / Reject buttons instead
                of a "View in 201 Files" link, so the admin must decide the status here
                first - only after Approve does the document move into 201 Files. */}
            {selectedNotif && !parseNotif(selectedNotif).isVolunteer && (() => {
                // DOCUMENT notification - full preview modal, same layout/behavior
                // as AdminDashboard.jsx's previewDoc modal (avatar sidebar, status
                // pill, image/PDF viewer, Enlarge/Shrink, Approve/Reject/Download/Close).
                const { name, docType } = parseNotif(selectedNotif);
                const status = selectedNotif.status ?? 'pending';
                const hasFile = !!selectedNotif.file_url;
                const showImage = hasFile && isImageMime(selectedNotif.mime_type);
                const showPdf = hasFile && isPdfMime(selectedNotif.mime_type);
                const docInitials = getInitials(name);
                const docPhoto = selectedNotif.photo ? (selectedNotif.photo.startsWith('/') || selectedNotif.photo.startsWith('http') ? selectedNotif.photo : `/storage/${selectedNotif.photo}`) : null;
                const fileLabel = `${name || 'document'}_${docType || 'file'}`.replace(/\s+/g, '_');

                return (
                    <div
                        onClick={closeDetail}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'white',
                                borderRadius: '8px',
                                width: '100%',
                                maxWidth: isNotifPreviewMaximized ? '95vw' : '860px',
                                maxHeight: isNotifPreviewMaximized ? '95vh' : '90vh',
                                height: isNotifPreviewMaximized ? '95vh' : 'auto',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                                transition: 'max-width 0.2s ease, max-height 0.2s ease',
                            }}
                        >
                            {/* Header */}
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#e3e7fd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#3a4bd0' }}>
                                        {docPhoto ? <img src={docPhoto} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : docInitials}
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ fontFamily: 'Montserrat', fontSize: '16px', fontWeight: '700', textTransform: 'uppercase' }}>{name || 'Volunteer'}</div>
                                            <StatusPill status={status} />
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#0000ff', fontWeight: '600', marginTop: '2px' }}>{docType || 'Document'}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {(showImage || showPdf) && (
                                        <button
                                            onClick={() => setIsNotifPreviewMaximized((m) => !m)}
                                            title={isNotifPreviewMaximized ? 'Shrink' : 'Enlarge preview'}
                                            style={{ background: '#f5f5f5', border: '1px solid #e8e8e8', borderRadius: '6px', padding: '5px 10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', color: '#444', display: 'flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            {isNotifPreviewMaximized ? <ShrinkIcon /> : <ExpandIcon />}
                                            {isNotifPreviewMaximized ? 'Shrink' : 'Enlarge'}
                                        </button>
                                    )}
                                    <button onClick={closeDetail} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex' }}><SmallCloseIcon size={18} /></button>
                                </div>
                            </div>

                            {/* Body: sidebar + preview */}
                            <div style={{ flex: 1, overflow: 'auto', display: 'grid', gridTemplateColumns: isNotifPreviewMaximized ? '0px 1fr' : '240px 1fr' }}>
                                {!isNotifPreviewMaximized && (
                                    <div style={{ borderRight: '1px solid #f0f0f0', padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', background: '#e3e7fd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#3a4bd0' }}>
                                            {docPhoto ? <img src={docPhoto} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : docInitials}
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontWeight: '600', fontSize: '15px' }}>{name || 'Volunteer'}</div>
                                            <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>Muntinlupa City Branch</div>
                                        </div>
                                        <div style={{ width: '100%', marginTop: '8px' }}>
                                            <div style={{ fontSize: '11px', fontWeight: '600', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>Document</div>
                                            <div style={{ fontSize: '13px', color: '#5765F2', fontWeight: '600' }}>{docType || 'Document'}</div>
                                        </div>
                                    </div>
                                )}
                                <div style={{ background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: isNotifPreviewMaximized ? '100%' : '400px', overflow: 'hidden' }}>
                                    {hasFile ? (
                                        showImage ? (
                                            <img
                                                src={selectedNotif.file_url}
                                                alt={docType || 'Document'}
                                                onClick={() => setIsNotifPreviewMaximized((m) => !m)}
                                                style={{
                                                    maxWidth: '100%',
                                                    maxHeight: isNotifPreviewMaximized ? '90vh' : '55vh',
                                                    objectFit: 'contain',
                                                    margin: isNotifPreviewMaximized ? 0 : '20px',
                                                    cursor: 'zoom-in',
                                                }}
                                            />
                                        ) : showPdf ? (
                                            <iframe
                                                src={`${selectedNotif.file_url}#toolbar=1`}
                                                style={{ width: '100%', height: isNotifPreviewMaximized ? '100%' : '55vh', border: 'none' }}
                                                title={docType || 'Document'}
                                            />
                                        ) : (
                                            <div style={{ textAlign: 'center', color: '#888' }}>
                                                <DocIcon size={44} />
                                                <div style={{ fontSize: '13px', marginTop: 10 }}>This file can't be previewed here.</div>
                                            </div>
                                        )
                                    ) : (
                                        <div style={{ textAlign: 'center', color: '#aaa', fontSize: '13px' }}>No file attached.</div>
                                    )}
                                </div>
                            </div>

                            {/* Footer: Approve/Reject left, Download/Close right */}
                            <div style={{ padding: '12px 20px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {status !== 'approved' && (
                                        <button
                                            disabled={approvingNotifDoc}
                                            onClick={() => handleApproveNotifDoc(selectedNotif.ref_id)}
                                            style={{ background: '#16a34a', border: 'none', color: '#fff', padding: '7px 16px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: approvingNotifDoc ? 'not-allowed' : 'pointer', opacity: approvingNotifDoc ? 0.6 : 1 }}
                                        >
                                            {approvingNotifDoc ? 'Please wait...' : 'Approve'}
                                        </button>
                                    )}
                                    {status !== 'rejected' && (
                                        <button
                                            disabled={approvingNotifDoc}
                                            onClick={() => handleRejectNotifDoc(selectedNotif.ref_id)}
                                            style={{ background: '#fff', border: '1px solid #dc2626', color: '#dc2626', padding: '7px 16px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: approvingNotifDoc ? 'not-allowed' : 'pointer', opacity: approvingNotifDoc ? 0.6 : 1 }}
                                        >
                                            Reject
                                        </button>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    {hasFile && status === 'approved' && (
                                        <button onClick={() => handleDownloadNotifDoc(selectedNotif.ref_id, fileLabel)} style={{ background: '#f5f5f5', border: '1px solid #e8e8e8', padding: '7px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Download</button>
                                    )}
                                    {hasFile && status !== 'approved' && (
                                        <span style={{ fontSize: 11, color: '#9CA3AF' }}>Download locked until approved</span>
                                    )}
                                    <button onClick={closeDetail} style={{ background: '#f5f5f5', border: '1px solid #e8e8e8', padding: '7px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* VOLUNTEER notification - keeps the simpler original detail modal */}
            {selectedNotif && parseNotif(selectedNotif).isVolunteer && (() => {
                const { headline, description } = parseNotif(selectedNotif);
                const href = route('admin.volunteers.show', selectedNotif.ref_id);

                return (
                    <div className={`detail-backdrop ${modalVisible ? 'show' : ''}`} onClick={closeDetail}>
                        <div className={`detail-modal ${modalVisible ? 'show' : ''}`} onClick={(e) => e.stopPropagation()}>
                            <div className="detail-header">
                                <span className="detail-header-title">Notification</span>
                                <button className="detail-close" onClick={closeDetail} aria-label="Close">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                            </div>
                            <div className="detail-body">
                                <div className="detail-avatar notif-icon-volunteer">
                                    <UserPlusIcon />
                                </div>
                                <div className="detail-headline">{headline}</div>
                                <div className="detail-desc">{description}</div>
                                {selectedNotif.created_at && <div className="detail-time">{selectedNotif.created_at}</div>}
                            </div>
                            <div className="detail-footer">
                                <button className="detail-btn detail-btn-secondary" onClick={closeDetail}>
                                    Close
                                </button>
                                <Link href={href} className="detail-btn detail-btn-primary" onClick={closeDetail}>
                                    View profile
                                </Link>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* FLOATING LIVE CHAT - lumalabas sa LAHAT ng admin pages */}
            {chatOpen && (
                <div className="achat-window">
                    <div className="achat-header">
                        <div className="achat-header-title">
                            {chatView === 'chat' && (
                                <button className="achat-icon-btn" onClick={handleBackToList} aria-label="Back to list">
                                    <BackIcon size={14} />
                                </button>
                            )}
                            <ChatBubbleIcon size={16} />
                            <div className="achat-header-title-text">
                                <span>{chatView === 'chat' ? (activeVolunteer?.name || 'Chat') : 'Live Chat'}</span>
                                {chatView === 'list' && (
                                    <span className="achat-header-sub">
                                        {unreadChatCount > 0 ? `${unreadChatCount} new message${unreadChatCount > 1 ? 's' : ''}` : 'All caught up'}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="achat-header-btns">
                            <button className="achat-icon-btn" onClick={() => setChatOpen(false)} aria-label="Close chat">
                                <CloseIcon size={14} />
                            </button>
                        </div>
                    </div>

                    {chatView === 'list' ? (
                        <>
                            <div className="achat-search">
                                <div className="achat-search-inner">
                                    <SearchIcon />
                                    <input
                                        type="text"
                                        value={chatSearch}
                                        onChange={e => setChatSearch(e.target.value)}
                                        placeholder="Search volunteer..."
                                    />
                                </div>
                            </div>
                            <div className="achat-list">
                                {volunteerListLoading ? (
                                    <div className="achat-empty">Loading volunteers...</div>
                                ) : filteredVolunteerList.length === 0 ? (
                                    <div className="achat-empty">
                                        <ChatBubbleIcon size={28} />
                                        <span style={{ color: '#c9c9c9' }}>No volunteers found.</span>
                                    </div>
                                ) : (
                                    filteredVolunteerList.map(v => {
                                        const unread = unreadByVolunteer[v.id];
                                        const isUnread = !!unread?.count;
                                        return (
                                            <div
                                                key={v.id}
                                                className={`achat-list-item ${isUnread ? 'has-unread' : ''}`}
                                                onClick={() => handleSelectVolunteer(v)}
                                            >
                                                <div className="achat-list-avatar-wrap">
                                                    <NavAvatar photoUrl={v.photo ? `/storage/${v.photo}` : null} initials={getInitials(v.name)} size={38} fontSize={12} />
                                                    {isUnread && <span className="achat-list-unread-dot" />}
                                                </div>
                                                <div className="achat-list-text">
                                                    <div className="achat-list-name-row">
                                                        <span className={`achat-list-name ${isUnread ? 'unread-name' : ''}`}>{v.name}</span>
                                                    </div>
                                                    <div className={`achat-list-preview ${isUnread ? 'unread-preview' : ''}`}>
                                                        {isUnread ? truncate(unread.preview, 34) : 'Tap to start chatting'}
                                                    </div>
                                                </div>
                                                {isUnread && (
                                                    <span className="achat-list-count-badge">{unread.count > 9 ? '9+' : unread.count}</span>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </>
                    ) : (
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <LiveChatPanel
                                mode="admin"
                                volunteerId={activeVolunteer?.id}
                                volunteerName={activeVolunteer?.name}
                                currentUserId={admin?.id}
                            />
                        </div>
                    )}
                </div>
            )}

            <div className="achat-fab-wrap">
                <button
                    className="achat-fab"
                    onClick={handleOpenChat}
                    title={chatOpen ? 'Close chat' : 'Open live chat'}
                >
                    {chatOpen ? <CloseIcon /> : <ChatBubbleIcon />}
                </button>
                {!chatOpen && unreadChatCount > 0 && (
                    <span className="achat-fab-badge">{unreadChatCount > 9 ? '9+' : unreadChatCount}</span>
                )}
            </div>
        </>
    );
}