import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

const NavAvatar = ({ photoUrl, initials, size = 40, fontSize = 13 }) => (
    <div style={{ width: size, height: size, borderRadius: '50%', background: '#5765F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize, fontWeight: '700', overflow: 'hidden', flexShrink: 0 }}>
        {photoUrl ? <img src={photoUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
    </div>
);

const getInitials = (name) =>
    (name || '?').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

const FingerprintIcon = ({ size = 20, color = '#5765F2' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a5 5 0 0 0-5 5v2a5 5 0 0 0 .5 2.2" />
        <path d="M12 2a5 5 0 0 1 5 5v2c0 1-.1 2-.4 3" />
        <path d="M7.5 11a4.5 4.5 0 0 0 1.5 3.5" />
        <path d="M16.5 11a4.5 4.5 0 0 1-1 2.8" />
        <path d="M4 15c1 3 3 5 4 6" />
        <path d="M20 15c-.5 2-1.5 4-3 5.5" />
        <path d="M9.5 15c.5 1.5 1.5 3 3 4" />
        <path d="M14.5 15c-.3 1.2-1 2.4-2 3.4" />
        <path d="M12 8v4c0 1 .3 2 1 2.8" />
    </svg>
);

function StatCard({ label, value, sub, icon, tint }) {
    return (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #EDEDED', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: '#6B6B6B' }}>{label}</span>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: tint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {icon}
                </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#1A1A1A', lineHeight: 1 }}>{value}</div>
            {sub && <div style={{ fontSize: 12, color: '#9a9a9a' }}>{sub}</div>}
        </div>
    );
}

function StatusPill({ isEnrolled }) {
    return isEnrolled ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: '#dcfce7', color: '#166534', textTransform: 'uppercase', letterSpacing: '.3px' }}>
            ● Enrolled
        </span>
    ) : (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: '#fee2e2', color: '#991b1b', textTransform: 'uppercase', letterSpacing: '.3px' }}>
            ● Not Enrolled
        </span>
    );
}

function FingerprintEnrollmentIndex({ volunteers, stats, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [confirmTarget, setConfirmTarget] = useState(null); // volunteer object being toggled
    const [notesInput, setNotesInput] = useState('');
    const [saving, setSaving] = useState(false);

    const applyFilters = (nextSearch = search, nextStatus = statusFilter) => {
        router.get(route('admin.fingerprint.index'), { search: nextSearch, status: nextStatus }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') applyFilters(search, statusFilter);
    };

    const handleFilterClick = (status) => {
        setStatusFilter(status);
        applyFilters(search, status);
    };

    const openConfirm = (volunteer) => {
        setConfirmTarget(volunteer);
        setNotesInput(volunteer.notes || '');
    };

    const closeConfirm = () => {
        setConfirmTarget(null);
        setNotesInput('');
    };

    const handleConfirmToggle = () => {
        if (!confirmTarget) return;
        setSaving(true);
        router.patch(route('admin.fingerprint.toggle', confirmTarget.id), {
            is_enrolled: !confirmTarget.is_enrolled,
            notes: notesInput,
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => closeConfirm(),
            onFinish: () => setSaving(false),
        });
    };

    const filterTabs = [
        { key: '', label: 'All' },
        { key: 'enrolled', label: 'Enrolled' },
        { key: 'not_enrolled', label: 'Not Enrolled' },
    ];

    return (
        <div>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
                <StatCard
                    label="Total Volunteers"
                    value={stats.total}
                    sub="Registered volunteers"
                    icon={<FingerprintIcon color="#5765F2" />}
                    tint="#EEF0FE"
                />
                <StatCard
                    label="Enrolled"
                    value={stats.enrolled}
                    sub="Fingerprint on file"
                    icon={<FingerprintIcon color="#16a34a" />}
                    tint="#DCFCE7"
                />
                <StatCard
                    label="Not Enrolled"
                    value={stats.not_enrolled}
                    sub="Needs enrollment"
                    icon={<FingerprintIcon color="#dc2626" />}
                    tint="#FEE2E2"
                />
            </div>

            {/* Search + Filters */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #EDEDED', padding: '16px 20px', marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
                <input
                    type="text"
                    value={search}
                    onChange={handleSearchChange}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Search by name or email..."
                    style={{ flex: '1 1 260px', padding: '9px 14px', border: '1.5px solid #EDEDED', borderRadius: 20, fontSize: 13, outline: 'none', fontFamily: 'Montserrat', background: '#f7f7f5' }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                    {filterTabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => handleFilterClick(tab.key)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: 20,
                                fontSize: 12,
                                fontWeight: 700,
                                border: 'none',
                                cursor: 'pointer',
                                fontFamily: 'Montserrat',
                                background: statusFilter === tab.key ? '#5765F2' : '#F7F7F5',
                                color: statusFilter === tab.key ? '#fff' : '#6B6B6B',
                                transition: 'all .15s',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #EDEDED', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #EDEDED' }}>
                            <th style={thStyle}>Volunteer</th>
                            <th style={thStyle}>Branch</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Enrolled At</th>
                            <th style={{ ...thStyle, textAlign: 'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {volunteers.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '40px 20px', textAlign: 'center', color: '#9a9a9a', fontSize: 13 }}>
                                    No volunteers found.
                                </td>
                            </tr>
                        ) : (
                            volunteers.map((v) => (
                                <tr key={v.id} style={{ borderBottom: '1px solid #F5F5F5' }}>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <NavAvatar photoUrl={v.photo} initials={getInitials(v.name)} size={36} fontSize={12} />
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 13, color: '#1A1A1A' }}>{v.name}</div>
                                                <div style={{ fontSize: 11.5, color: '#9a9a9a' }}>{v.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{ fontSize: 12.5, color: '#6B6B6B' }}>{v.branch || '—'}</span>
                                    </td>
                                    <td style={tdStyle}>
                                        <StatusPill isEnrolled={v.is_enrolled} />
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{ fontSize: 12, color: '#9a9a9a' }}>{v.enrolled_at || '—'}</span>
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                                        <button
                                            onClick={() => openConfirm(v)}
                                            style={{
                                                padding: '7px 16px',
                                                borderRadius: 8,
                                                fontSize: 12,
                                                fontWeight: 700,
                                                border: v.is_enrolled ? '1px solid #dc2626' : 'none',
                                                cursor: 'pointer',
                                                fontFamily: 'Montserrat',
                                                background: v.is_enrolled ? '#fff' : '#5765F2',
                                                color: v.is_enrolled ? '#dc2626' : '#fff',
                                            }}
                                        >
                                            {v.is_enrolled ? 'Unmark' : 'Mark Enrolled'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Confirm modal */}
            {confirmTarget && (
                <div
                    onClick={closeConfirm}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(17,17,17,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{ background: '#fff', borderRadius: 16, width: 420, maxWidth: '100%', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.28)' }}
                    >
                        <div style={{ padding: '18px 22px', borderBottom: '1px solid #EDEDED' }}>
                            <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>
                                {confirmTarget.is_enrolled ? 'Unmark Fingerprint Enrollment' : 'Mark as Fingerprint Enrolled'}
                            </span>
                        </div>
                        <div style={{ padding: '20px 22px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                <NavAvatar photoUrl={confirmTarget.photo} initials={getInitials(confirmTarget.name)} size={40} fontSize={13} />
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{confirmTarget.name}</div>
                                    <div style={{ fontSize: 12, color: '#9a9a9a' }}>{confirmTarget.email}</div>
                                </div>
                            </div>
                            <p style={{ fontSize: 13, color: '#6B6B6B', lineHeight: 1.5, marginBottom: 14 }}>
                                {confirmTarget.is_enrolled
                                    ? 'Sigurado ka bang i-uunmark ang fingerprint enrollment ng volunteer na ito?'
                                    : 'Kumpirma na na-enroll na ang volunteer na ito sa fingerprint attendance system.'}
                            </p>
                            <label style={{ fontSize: 11.5, fontWeight: 700, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '.4px' }}>Notes (optional)</label>
                            <textarea
                                value={notesInput}
                                onChange={(e) => setNotesInput(e.target.value)}
                                rows={3}
                                placeholder="e.g. Enrolled manually, device pending"
                                style={{ width: '100%', marginTop: 6, padding: '10px 12px', border: '1.5px solid #EDEDED', borderRadius: 8, fontSize: 12.5, fontFamily: 'Montserrat', outline: 'none', resize: 'vertical' }}
                            />
                        </div>
                        <div style={{ padding: '14px 22px', borderTop: '1px solid #EDEDED', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <button
                                onClick={closeConfirm}
                                style={{ padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', background: '#f5f5f5', color: '#1A1A1A', cursor: 'pointer', fontFamily: 'Montserrat' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmToggle}
                                disabled={saving}
                                style={{
                                    padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none',
                                    background: confirmTarget.is_enrolled ? '#dc2626' : '#16a34a',
                                    color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, fontFamily: 'Montserrat',
                                }}
                            >
                                {saving ? 'Saving…' : confirmTarget.is_enrolled ? 'Yes, Unmark' : 'Yes, Confirm Enrolled'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const thStyle = {
    textAlign: 'left',
    padding: '12px 20px',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '.5px',
    textTransform: 'uppercase',
    color: '#6B6B6B',
};

const tdStyle = {
    padding: '14px 20px',
    verticalAlign: 'middle',
};

FingerprintEnrollmentIndex.layout = (page) => <AdminLayout title="Fingerprint Enrollment">{page}</AdminLayout>;

export default FingerprintEnrollmentIndex;