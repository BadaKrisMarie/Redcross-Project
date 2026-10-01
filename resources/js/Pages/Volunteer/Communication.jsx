import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Head, useForm, usePage } from '@inertiajs/react';
import VolunteerLayout from '@/Layouts/VolunteerLayout';
import {
    PenSquare,
    Inbox,
    Send,
    Megaphone,
    Mail,
    Search,
    X,
    ArrowLeft,
    Reply,
    CheckCircle2,
    Clock,
    ChevronRight,
    Filter,
    CheckCheck,
    CornerDownRight,
} from 'lucide-react';

const AUTHORIZED_CONTACTS = [
    {
        name: 'Philippine Red Cross — Rizal Chapter (Muntinlupa)',
        email: 'rizalmuntinlupa@redcross.org.ph',
        department: 'Chapter Administration & General Inquiries',
    },
    {
        name: 'Volunteer Operations & Services Desk',
        email: 'volunteers.muntinlupa@redcross.org.ph',
        department: 'Volunteer Deployments & Schedules',
    },
    {
        name: 'Disaster Management Services (DMS)',
        email: 'dms.muntinlupa@redcross.org.ph',
        department: 'Disaster Preparedness & Relief',
    },
    {
        name: 'Safety Services & First Aid Training',
        email: 'safety.muntinlupa@redcross.org.ph',
        department: 'CPR, Safety & Training Certifications',
    },
    {
        name: 'Health & Community Welfare Services',
        email: 'welfare.muntinlupa@redcross.org.ph',
        department: 'Blood Services & Welfare Programs',
    },
];

export default function VolunteerCommunication({ sentEmails = [], announcements = [] }) {
    const { auth } = usePage().props;
    const volunteer = auth?.user;
    const currentVolunteerId = volunteer?.id || 'guest';
    const volunteerName = volunteer?.name || 'Volunteer';
    const volunteerEmail = volunteer?.email || 'volunteer@redcross.org.ph';

    const emails = sentEmails || [];
    const announces = announcements || [];

    // State
    const [currentFolder, setCurrentFolder] = useState('inbox'); // 'inbox' | 'sent' | 'announcements'
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
    const [composeOpen, setComposeOpen] = useState(false);
    const [replyNotice, setReplyNotice] = useState(null);
    const [successBanner, setSuccessBanner] = useState('');

    // Read/Unread tracking persisted to localStorage
    const [readSet, setReadSet] = useState(() => {
        try {
            const saved = localStorage.getItem(`prc_read_emails_${currentVolunteerId}`);
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch {
            return new Set();
        }
    });

    const persistReadSet = (updatedSet) => {
        setReadSet(updatedSet);
        try {
            localStorage.setItem(
                `prc_read_emails_${currentVolunteerId}`,
                JSON.stringify(Array.from(updatedSet))
            );
        } catch {}
    };

    // Compose Form
    const { data, setData, post, processing, reset, errors } = useForm({
        to: AUTHORIZED_CONTACTS[0].email,
        subject: '',
        message: '',
    });

    // Process Inbox items: Replied inquiries from Admin
    const inboxItems = useMemo(() => {
        return emails
            .filter((e) => Boolean(e.reply))
            .map((e) => {
                const key = `inbox_${e.id}`;
                const subject = e.subject?.startsWith('Re:') ? e.subject : `Re: ${e.subject || 'Inquiry'}`;
                return {
                    id: e.id,
                    key,
                    folder: 'inbox',
                    senderName: 'PRC Chapter Administration',
                    senderEmail: 'rizalmuntinlupa@redcross.org.ph',
                    senderBadge: 'Official PRC Reply',
                    recipient: `${volunteerName} <${volunteerEmail}>`,
                    subject,
                    preview: e.reply || '',
                    body: e.reply || '',
                    originalInquiry: {
                        to: e.to,
                        subject: e.subject,
                        message: e.message,
                        sentAt: e.created_at,
                    },
                    date: e.replied_at || e.updated_at || e.created_at,
                    raw: e,
                };
            });
    }, [emails, volunteerName, volunteerEmail]);

    // Process Sent items: Emails dispatched by the volunteer
    const sentItems = useMemo(() => {
        return emails.map((e) => {
            const key = `sent_${e.id}`;
            return {
                id: e.id,
                key,
                folder: 'sent',
                senderName: `${volunteerName} (You)`,
                senderEmail: volunteerEmail,
                recipientName: 'Philippine Red Cross — Muntinlupa Branch',
                recipient: e.to,
                subject: e.subject || 'No Subject',
                preview: e.message || '',
                body: e.message || '',
                hasReply: Boolean(e.reply),
                replyText: e.reply,
                repliedAt: e.replied_at,
                date: e.created_at,
                raw: e,
            };
        });
    }, [emails, volunteerName, volunteerEmail]);

    // Process Announcements items: Official circulars
    const announcementItems = useMemo(() => {
        return announces.map((a) => {
            const key = `announcement_${a.id}`;
            const adminName = a.admin?.name || 'PRC Chapter Administration';
            return {
                id: a.id,
                key,
                folder: 'announcements',
                senderName: `${adminName} (PRC Chapter)`,
                senderEmail: 'admin@redcross.org.ph',
                senderBadge: 'Official Notice',
                recipient: 'All Approved Volunteers',
                subject: a.title || 'Official Announcement',
                preview: a.body || '',
                body: a.body || '',
                date: a.created_at,
                raw: a,
            };
        });
    }, [announces]);

    // Unread count calculations
    const inboxUnreadCount = useMemo(() => {
        return inboxItems.filter((item) => !readSet.has(item.key)).length;
    }, [inboxItems, readSet]);

    const announcementsUnreadCount = useMemo(() => {
        return announcementItems.filter((item) => !readSet.has(item.key)).length;
    }, [announcementItems, readSet]);

    // Current folder items based on selected tab
    const currentFolderItems = useMemo(() => {
        if (currentFolder === 'inbox') return inboxItems;
        if (currentFolder === 'sent') return sentItems;
        if (currentFolder === 'announcements') return announcementItems;
        return [];
    }, [currentFolder, inboxItems, sentItems, announcementItems]);

    // Filter items based on search and unread toggle
    const filteredItems = useMemo(() => {
        let items = currentFolderItems;

        if (filterUnreadOnly && currentFolder !== 'sent') {
            items = items.filter((item) => !readSet.has(item.key));
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            items = items.filter(
                (item) =>
                    item.subject.toLowerCase().includes(q) ||
                    item.preview.toLowerCase().includes(q) ||
                    item.senderName.toLowerCase().includes(q) ||
                    (item.recipient && item.recipient.toLowerCase().includes(q))
            );
        }

        return items;
    }, [currentFolderItems, filterUnreadOnly, currentFolder, readSet, searchQuery]);

    // Open email details and mark as read
    const handleOpenEmail = (email) => {
        setSelectedEmail(email);

        if (!readSet.has(email.key)) {
            const updated = new Set(readSet);
            updated.add(email.key);
            persistReadSet(updated);
        }
    };

    // Toggle Read / Unread status
    const handleToggleRead = (e, emailKey) => {
        e.stopPropagation();
        const updated = new Set(readSet);
        if (updated.has(emailKey)) {
            updated.delete(emailKey);
        } else {
            updated.add(emailKey);
        }
        persistReadSet(updated);
    };

    // Mark all as read in current folder
    const handleMarkAllRead = () => {
        const updated = new Set(readSet);
        currentFolderItems.forEach((item) => updated.add(item.key));
        persistReadSet(updated);
    };

    // Switch Folder
    const handleSwitchFolder = (folderKey) => {
        setCurrentFolder(folderKey);
        setSelectedEmail(null);
        setFilterUnreadOnly(false);
    };

    // Open Compose modal
    const handleOpenCompose = (prefill = null) => {
        if (prefill) {
            setData({
                to: prefill.to || AUTHORIZED_CONTACTS[0].email,
                subject: prefill.subject || '',
                message: prefill.message || '',
            });
            setReplyNotice(prefill.replyNotice || null);
        } else {
            setData({
                to: AUTHORIZED_CONTACTS[0].email,
                subject: '',
                message: '',
            });
            setReplyNotice(null);
        }
        setComposeOpen(true);
    };

    // Reply action inside Email Detail
    const handleReplyToEmail = (emailItem) => {
        const subjectPrefix = emailItem.subject.startsWith('Re:')
            ? emailItem.subject
            : `Re: ${emailItem.subject}`;
        const recipientEmail = emailItem.senderEmail?.includes('@')
            ? emailItem.senderEmail
            : AUTHORIZED_CONTACTS[0].email;

        handleOpenCompose({
            to: recipientEmail,
            subject: subjectPrefix,
            message: '',
            replyNotice: `Replying regarding "${emailItem.subject}"`,
        });
    };

    // Handle Form Submit
    const handleSendEmail = (e) => {
        e.preventDefault();
        post(route('volunteer.communication.send'), {
            onSuccess: () => {
                reset();
                setComposeOpen(false);
                setReplyNotice(null);
                setSuccessBanner('Your email was sent successfully to PRC Chapter Administration.');
                setTimeout(() => setSuccessBanner(''), 5000);
                setCurrentFolder('sent');
                setSelectedEmail(null);
            },
        });
    };

    // Formatters
    const formatShortDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';

        const now = new Date();
        const isToday =
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();

        if (isToday) {
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            });
        }

        const isThisYear = date.getFullYear() === now.getFullYear();
        if (isThisYear) {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
            });
        }

        return date.toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: '2-digit',
        });
    };

    const formatFullDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString('en-PH', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const folders = [
        {
            key: 'inbox',
            label: 'Inbox',
            icon: Inbox,
            count: inboxItems.length,
            unread: inboxUnreadCount,
        },
        {
            key: 'sent',
            label: 'Sent',
            icon: Send,
            count: sentItems.length,
            unread: 0,
        },
        {
            key: 'announcements',
            label: 'Announcements',
            icon: Megaphone,
            count: announcementItems.length,
            unread: announcementsUnreadCount,
        },
    ];

    return (
        <>
            <Head title="Communication - Volunteer Portal" />

            <div className="max-w-6xl mx-auto space-y-4 pb-12 font-sans">
                {/* ── Page Header: Clean & Simple (No tracking, no subtitle) ── */}
                <div className="flex items-center justify-between pt-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                        Communications
                    </h1>

                    <button
                        type="button"
                        onClick={() => handleOpenCompose()}
                        className="sm:hidden inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-semibold shadow-xs transition"
                    >
                        <PenSquare className="w-4 h-4" />
                        <span>Compose</span>
                    </button>
                </div>

                {/* ── Success Alert Banner ── */}
                {successBanner && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="font-medium">{successBanner}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSuccessBanner('')}
                            className="text-emerald-600 hover:text-emerald-800 p-1"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* ── Main Mailbox Card ── */}
                <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden flex flex-col md:flex-row min-h-[640px]">
                    {/* ══════════════════════════════════════════════
                        SIDEBAR: COMPOSE & MAILBOX FOLDERS
                    ══════════════════════════════════════════════ */}
                    <aside className="w-full md:w-60 bg-gray-50/60 border-b md:border-b-0 md:border-r border-gray-200/80 p-3.5 flex flex-col justify-between shrink-0">
                        <div className="space-y-3">
                            {/* Compose Button */}
                            <button
                                type="button"
                                onClick={() => handleOpenCompose()}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs sm:text-sm font-semibold shadow-xs shadow-red-600/20 transition cursor-pointer"
                            >
                                <PenSquare className="w-4 h-4" />
                                <span>Compose</span>
                            </button>

                            {/* Folders List with Active Background */}
                            <nav className="space-y-1">
                                {folders.map((f) => {
                                    const Icon = f.icon;
                                    const isActive = currentFolder === f.key;
                                    return (
                                        <button
                                            key={f.key}
                                            type="button"
                                            onClick={() => handleSwitchFolder(f.key)}
                                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                                                isActive
                                                    ? 'bg-red-600 text-white font-semibold shadow-xs'
                                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <Icon
                                                    className={`w-4 h-4 shrink-0 ${
                                                        isActive ? 'text-white' : 'text-gray-400'
                                                    }`}
                                                />
                                                <span className="truncate">{f.label}</span>
                                            </div>

                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {f.unread > 0 ? (
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                            isActive
                                                                ? 'bg-white text-red-600'
                                                                : 'bg-red-600 text-white'
                                                        }`}
                                                    >
                                                        {f.unread}
                                                    </span>
                                                ) : f.count > 0 ? (
                                                    <span
                                                        className={`text-[11px] ${
                                                            isActive ? 'text-white/80' : 'text-gray-400'
                                                        }`}
                                                    >
                                                        {f.count}
                                                    </span>
                                                ) : null}
                                            </div>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Clean & Simple Footer Contact Info */}
                        <div className="pt-3 border-t border-gray-200/80">
                            <div className="flex items-center gap-2 text-[11px] text-gray-500">
                                <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                <span className="truncate">rizalmuntinlupa@redcross.org.ph</span>
                            </div>
                        </div>
                    </aside>

                    {/* ══════════════════════════════════════════════
                        MAIN CONTENT: EMAIL LIST OR EMAIL DETAIL
                    ══════════════════════════════════════════════ */}
                    <main className="flex-1 flex flex-col min-w-0 bg-white">
                        {/* ──────────────────────────────────────────
                            1. EMAIL DETAIL VIEW (READING PANE)
                        ────────────────────────────────────────── */}
                        {selectedEmail !== null ? (
                            <div className="flex-1 flex flex-col min-w-0">
                                {/* Detail Toolbar */}
                                <div className="px-5 py-3 border-b border-gray-200/80 flex items-center justify-between gap-3 bg-gray-50/40">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedEmail(null)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-xs font-medium text-gray-700 transition cursor-pointer"
                                    >
                                        <ArrowLeft className="w-3.5 h-3.5 text-gray-500" />
                                        <span>Back</span>
                                    </button>

                                    <div className="flex items-center gap-2">
                                        {/* Toggle Read/Unread */}
                                        {selectedEmail.folder !== 'sent' && (
                                            <button
                                                type="button"
                                                onClick={(e) => handleToggleRead(e, selectedEmail.key)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-xs font-medium text-gray-600 transition cursor-pointer"
                                                title={readSet.has(selectedEmail.key) ? 'Mark as unread' : 'Mark as read'}
                                            >
                                                <Mail className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="hidden sm:inline">
                                                    {readSet.has(selectedEmail.key) ? 'Mark as unread' : 'Mark as read'}
                                                </span>
                                            </button>
                                        )}

                                        {/* Reply Option */}
                                        {selectedEmail.folder === 'inbox' && (
                                            <button
                                                type="button"
                                                onClick={() => handleReplyToEmail(selectedEmail)}
                                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium shadow-2xs transition cursor-pointer"
                                            >
                                                <Reply className="w-3.5 h-3.5" />
                                                <span>Reply</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Detail Reading View */}
                                <div className="p-6 overflow-y-auto space-y-5 flex-1">
                                    {/* Subject Title & Tags */}
                                    <div className="space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">
                                                {selectedEmail.subject}
                                            </h2>
                                            {selectedEmail.senderBadge && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                                                    <ShieldCheck className="w-3 h-3 text-red-600" />
                                                    {selectedEmail.senderBadge}
                                                </span>
                                            )}
                                            {selectedEmail.folder === 'sent' && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                                    <Send className="w-3 h-3 text-blue-600" />
                                                    Sent Email
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            {formatFullDate(selectedEmail.date)}
                                        </p>
                                    </div>

                                    {/* Sender & Recipient Box */}
                                    <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                                                {selectedEmail.folder === 'sent'
                                                    ? volunteerName.slice(0, 2)
                                                    : 'PRC'}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                                                    {selectedEmail.senderName}
                                                    <span className="font-normal text-gray-500 text-xs ml-1.5 hidden sm:inline">
                                                        &lt;{selectedEmail.senderEmail}&gt;
                                                    </span>
                                                </div>
                                                <div className="text-gray-500 text-xs truncate">
                                                    <span className="font-medium text-gray-700">To: </span>
                                                    {selectedEmail.recipient}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-gray-400 text-xs sm:text-right shrink-0">
                                            {formatFullDate(selectedEmail.date)}
                                        </div>
                                    </div>

                                    {/* Full Message Body */}
                                    <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
                                        <div className="text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-wrap font-sans">
                                            {selectedEmail.body}
                                        </div>

                                        {/* If Inbox with Original Volunteer Inquiry Thread */}
                                        {selectedEmail.originalInquiry && (
                                            <div className="pt-4 mt-4 border-t border-gray-200/90 space-y-2">
                                                <div className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                                                    <CornerDownRight className="w-3.5 h-3.5 text-gray-400" />
                                                    <span>Original inquiry sent by you</span>
                                                </div>

                                                <div className="p-3 rounded-xl bg-gray-50/80 border-l-4 border-l-red-500 border border-gray-200/70 text-xs space-y-1.5">
                                                    <div className="text-xs text-gray-500 space-y-0.5">
                                                        <div>
                                                            <strong className="text-gray-700">From: </strong>
                                                            {volunteerName} &lt;{volunteerEmail}&gt;
                                                        </div>
                                                        <div>
                                                            <strong className="text-gray-700">Sent: </strong>
                                                            {formatFullDate(selectedEmail.originalInquiry.sentAt)}
                                                        </div>
                                                        <div>
                                                            <strong className="text-gray-700">To: </strong>
                                                            {selectedEmail.originalInquiry.to}
                                                        </div>
                                                        <div>
                                                            <strong className="text-gray-700">Subject: </strong>
                                                            {selectedEmail.originalInquiry.subject}
                                                        </div>
                                                    </div>
                                                    <div className="pt-1.5 border-t border-gray-200/80 whitespace-pre-wrap leading-relaxed text-gray-700">
                                                        {selectedEmail.originalInquiry.message}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* If Sent Email has received an admin reply */}
                                        {selectedEmail.folder === 'sent' && selectedEmail.hasReply && (
                                            <div className="pt-4 mt-4 border-t border-gray-200/90 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                        <span>Admin reply received</span>
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {formatFullDate(selectedEmail.repliedAt)}
                                                    </div>
                                                </div>

                                                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">
                                                    {selectedEmail.replyText}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Bottom Reply Bar */}
                                    {selectedEmail.folder === 'inbox' && (
                                        <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-200/80 flex items-center justify-between gap-3">
                                            <div className="text-xs text-gray-500">
                                                Need further follow-up? Reply directly to PRC Chapter Administration.
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleReplyToEmail(selectedEmail)}
                                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-medium shadow-2xs transition cursor-pointer shrink-0"
                                            >
                                                <Reply className="w-3.5 h-3.5" />
                                                <span>Reply to email</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* ──────────────────────────────────────────
                                2. EMAIL LIST VIEW (DEFAULT FOLDER VIEW)
                            ────────────────────────────────────────── */
                            <div className="flex-1 flex flex-col min-w-0">
                                {/* Top Search and Filter Bar */}
                                <div className="p-3 sm:p-3.5 border-b border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-gray-50/40">
                                    {/* Search Box */}
                                    <div className="relative flex-1 max-w-sm">
                                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder={`Search in ${currentFolder}...`}
                                            className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white transition"
                                        />
                                        {searchQuery && (
                                            <button
                                                type="button"
                                                onClick={() => setSearchQuery('')}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Action Chips */}
                                    <div className="flex items-center gap-2 self-end sm:self-center">
                                        {currentFolder !== 'sent' && (
                                            <button
                                                type="button"
                                                onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition border cursor-pointer ${
                                                    filterUnreadOnly
                                                        ? 'bg-red-600 text-white font-semibold border-red-600 shadow-xs'
                                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                                                }`}
                                            >
                                                <Filter className="w-3 h-3" />
                                                <span>Unread</span>
                                            </button>
                                        )}

                                        {currentFolder !== 'sent' && (
                                            <button
                                                type="button"
                                                onClick={handleMarkAllRead}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 transition cursor-pointer"
                                                title="Mark all as read"
                                            >
                                                <CheckCheck className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="hidden sm:inline">Mark all read</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Status Sub-Header */}
                                <div className="px-5 py-2 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between text-xs text-gray-500">
                                    <span className="font-medium text-gray-700">
                                        {currentFolder === 'inbox' ? 'Inbox' : currentFolder === 'sent' ? 'Sent' : 'Announcements'} ({filteredItems.length})
                                    </span>
                                    {currentFolder === 'inbox' && inboxUnreadCount > 0 && (
                                        <span className="font-semibold text-red-600">
                                            {inboxUnreadCount} unread
                                        </span>
                                    )}
                                </div>

                                {/* Email Rows */}
                                <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                                    {filteredItems.length === 0 ? (
                                        <div className="py-20 text-center px-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                                                {currentFolder === 'inbox' ? (
                                                    <Inbox className="w-6 h-6" />
                                                ) : currentFolder === 'sent' ? (
                                                    <Send className="w-6 h-6" />
                                                ) : (
                                                    <Megaphone className="w-6 h-6" />
                                                )}
                                            </div>
                                            <h3 className="text-xs sm:text-sm font-semibold text-gray-800">
                                                {searchQuery
                                                    ? 'No messages found matching search'
                                                    : currentFolder === 'inbox'
                                                    ? 'No received messages yet'
                                                    : currentFolder === 'sent'
                                                    ? 'No sent messages'
                                                    : 'No announcements posted'}
                                            </h3>
                                            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                                                {searchQuery
                                                    ? 'Try searching with different terms.'
                                                    : currentFolder === 'inbox'
                                                    ? 'Responses to your submitted inquiries will appear here.'
                                                    : currentFolder === 'sent'
                                                    ? 'Messages you send to Philippine Red Cross staff will appear here.'
                                                    : 'Official notices and chapter bulletins will appear here.'}
                                            </p>
                                        </div>
                                    ) : (
                                        filteredItems.map((item) => {
                                            const isUnread = !readSet.has(item.key) && currentFolder !== 'sent';
                                            return (
                                                <div
                                                    key={item.key}
                                                    onClick={() => handleOpenEmail(item)}
                                                    className={`group px-4 sm:px-5 py-3 flex items-center gap-3 transition-colors cursor-pointer ${
                                                        isUnread
                                                            ? 'bg-white hover:bg-red-50/20 font-semibold'
                                                            : 'bg-gray-50/20 hover:bg-gray-100/50 text-gray-700'
                                                    }`}
                                                >
                                                    {/* Left Read/Unread Dot Indicator */}
                                                    <div className="shrink-0 flex items-center">
                                                        {currentFolder !== 'sent' ? (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => handleToggleRead(e, item.key)}
                                                                className="p-1 text-gray-400 hover:text-red-600 transition"
                                                                title={isUnread ? 'Mark as read' : 'Mark as unread'}
                                                            >
                                                                <span
                                                                    className={`block w-2 h-2 rounded-full transition ${
                                                                        isUnread
                                                                            ? 'bg-red-600 ring-2 ring-red-200'
                                                                            : 'border border-gray-300 group-hover:border-gray-400'
                                                                    }`}
                                                                />
                                                            </button>
                                                        ) : (
                                                            <Send className="w-3.5 h-3.5 text-gray-300" />
                                                        )}
                                                    </div>

                                                    {/* Sender / Recipient */}
                                                    <div className="w-36 sm:w-44 shrink-0 truncate">
                                                        <span
                                                            className={`text-xs truncate block ${
                                                                isUnread ? 'font-semibold text-gray-900' : 'font-normal text-gray-700'
                                                            }`}
                                                        >
                                                            {currentFolder === 'sent'
                                                                ? `To: ${item.recipientName || item.recipient}`
                                                                : item.senderName}
                                                        </span>
                                                    </div>

                                                    {/* Subject & Preview */}
                                                    <div className="flex-1 min-w-0 pr-2">
                                                        <div className="text-xs truncate flex items-center gap-1.5">
                                                            <span
                                                                className={`truncate ${
                                                                    isUnread
                                                                        ? 'font-semibold text-gray-900'
                                                                        : 'font-medium text-gray-800'
                                                                }`}
                                                            >
                                                                {item.subject}
                                                            </span>
                                                            <span className="text-gray-300 font-normal">─</span>
                                                            <span className="text-gray-500 font-normal truncate hidden sm:inline text-xs">
                                                                {item.preview}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Status Badge */}
                                                    <div className="shrink-0 hidden md:block">
                                                        {currentFolder === 'sent' && (
                                                            item.hasReply ? (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                                    <span>Replied</span>
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                                    <Clock className="w-3 h-3 text-gray-400" />
                                                                    <span>Pending</span>
                                                                </span>
                                                            )
                                                        )}
                                                        {currentFolder === 'inbox' && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                                                                <ShieldCheck className="w-3 h-3 text-red-600" />
                                                                <span>Admin Reply</span>
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Date */}
                                                    <div className="shrink-0 text-right min-w-[58px]">
                                                        <span
                                                            className={`text-xs ${
                                                                isUnread ? 'font-semibold text-red-600' : 'text-gray-400'
                                                            }`}
                                                        >
                                                            {formatShortDate(item.date)}
                                                        </span>
                                                    </div>

                                                    {/* Chevron */}
                                                    <div className="shrink-0 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all">
                                                        <ChevronRight className="w-3.5 h-3.5" />
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* ════════════════════════════════════════════════════════════
                COMPOSE EMAIL MODAL (Portaled to document.body to escape
                the layout's z-10 stacking context)
            ════════════════════════════════════════════════════════════ */}
            {composeOpen && createPortal(
                <div className="fixed inset-0 z-[100] overflow-y-auto">
                    {/* Dark Backdrop — Strictly NO BLUR, NOT clickable outside */}
                    <div
                        className="fixed inset-0 bg-black/60 transition-opacity"
                        aria-hidden="true"
                    />

                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <div
                            className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all border border-gray-100 relative z-10 flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-base font-semibold text-gray-900">
                                        {replyNotice ? 'Reply to inquiry' : 'New message'}
                                    </h3>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setComposeOpen(false)}
                                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 flex items-center justify-center transition cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Reply Notice Banner */}
                            {replyNotice && (
                                <div className="px-6 py-2.5 bg-red-50 border-b border-red-100 flex items-center gap-2 text-xs text-red-800 font-medium">
                                    <Reply className="w-3.5 h-3.5 text-red-600 shrink-0" />
                                    <span>{replyNotice}</span>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSendEmail} className="p-6 space-y-4">
                                {/* 1. Recipient (To) - Clean, No Badge */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                        To
                                    </label>
                                    <select
                                        value={data.to}
                                        onChange={(e) => setData('to', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition font-sans cursor-pointer"
                                    >
                                        {AUTHORIZED_CONTACTS.map((contact) => (
                                            <option key={contact.email} value={contact.email}>
                                                {contact.name} — ({contact.email})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.to && (
                                        <p className="text-xs text-red-600 mt-1 font-medium">{errors.to}</p>
                                    )}
                                </div>

                                {/* 2. Subject */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        value={data.subject}
                                        onChange={(e) => setData('subject', e.target.value)}
                                        placeholder="Enter subject"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50/50 focus:bg-white transition"
                                    />
                                    {errors.subject && (
                                        <p className="text-xs text-red-600 mt-1 font-medium">{errors.subject}</p>
                                    )}
                                </div>

                                {/* 3. Message Body */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                        Message
                                    </label>
                                    <textarea
                                        rows={8}
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        placeholder="Write your message here..."
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50/50 focus:bg-white transition leading-relaxed resize-y font-sans"
                                    />
                                    {errors.message && (
                                        <p className="text-xs text-red-600 mt-1 font-medium">{errors.message}</p>
                                    )}
                                </div>

                                {/* Footer & Action Buttons */}
                                <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => setComposeOpen(false)}
                                        className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition cursor-pointer"
                                    >
                                        Discard
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-semibold shadow-xs shadow-red-600/20 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send className="w-3.5 h-3.5 text-white" />
                                        <span>{processing ? 'Sending...' : 'Send message'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

VolunteerCommunication.layout = (page) => <VolunteerLayout title="Communication">{page}</VolunteerLayout>;
