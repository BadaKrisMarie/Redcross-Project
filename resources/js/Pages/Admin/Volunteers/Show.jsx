import React from 'react';
import { Head, Link, router } from '@inertiajs/react';

export default function VolunteerShow({ volunteer }) {
    const s = {
        page: { minHeight: '100vh', background: '#f5f5f5', fontFamily: "'Source Sans 3', sans-serif" },
        nav: { background: '#111', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
        navBrand: { display: 'flex', alignItems: 'center', gap: '10px' },
        navIcon: { width: '32px', height: '32px', background: '#DC2626', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: '900' },
        navTitle: { fontFamily: 'Oswald, sans-serif', color: 'white', fontSize: '16px', fontWeight: '600', letterSpacing: '1px' },
        navBack: { color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' },
        navLogout: { background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', padding: '7px 18px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' },
        content: { padding: '40px 32px', maxWidth: '900px', margin: '0 auto' },
        eyebrow: { fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#DC2626', marginBottom: '8px' },
        h1: { fontFamily: 'Oswald, sans-serif', fontSize: '32px', color: '#111', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', margin: '0 0 32px' },
        card: { background: 'white', borderRadius: '8px', border: '1px solid #e8e8e8', padding: '28px', marginBottom: '20px' },
        cardTitle: { fontFamily: 'Oswald, sans-serif', fontSize: '14px', color: '#888', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' },
        profileRow: { display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '8px' },
        avatar: { width: '72px', height: '72px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '700', color: '#991b1b', flexShrink: 0 },
        name: { fontFamily: 'Oswald, sans-serif', fontSize: '26px', color: '#111', fontWeight: '600', margin: '0 0 4px' },
        email: { fontSize: '14px', color: '#666', margin: '0 0 8px' },
        grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
        fieldLabel: { fontSize: '11px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#aaa', marginBottom: '4px' },
        fieldValue: { fontSize: '14px', color: '#111', fontWeight: '500' },
        badge: (status) => {
            const map = {
                approved: { bg: '#dcfce7', color: '#166534', label: 'Active' },
                pending:  { bg: '#fef3c7', color: '#92400e', label: 'Incomplete Docs' },
                rejected: { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
                inactive: { bg: '#f5f5f5', color: '#555',    label: 'Inactive' },
            };
            const m = map[status] ?? map.inactive;
            return {
                style: { display: 'inline-block', fontSize: '12px', padding: '4px 12px', borderRadius: '20px', background: m.bg, color: m.color, fontWeight: '600' },
                label: m.label,
            };
        },
        actionsRow: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '24px' },
        btnApprove: { background: '#16a34a', color: 'white', border: 'none', padding: '10px 22px', borderRadius: '4px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
        btnReject:  { background: 'white', color: '#DC2626', border: '1px solid #DC2626', padding: '10px 22px', borderRadius: '4px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
        btnBack:    { background: '#f5f5f5', color: '#111', border: '1px solid #e8e8e8', padding: '10px 22px', borderRadius: '4px', fontSize: '13px', fontWeight: '600', textDecoration: 'none', display: 'inline-block' },
        statBox: { textAlign: 'center', padding: '16px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' },
        statNum: { fontFamily: 'Oswald, sans-serif', fontSize: '28px', color: '#DC2626', fontWeight: '600' },
        statLbl: { fontSize: '12px', color: '#888', marginTop: '2px' },
    };

    const badge = s.badge(volunteer.status);
    const initials = volunteer.name
        ? volunteer.name.split(' ').map(w => w[0]?.toUpperCase() ?? '').slice(0, 2).join('')
        : '?';

    const handleApprove = () => router.patch(route('admin.volunteers.approve', volunteer.id), {}, { preserveScroll: true });
    const handleReject  = () => router.patch(route('admin.volunteers.reject',  volunteer.id), {}, { preserveScroll: true });

    return (
        <>
            <Head title={`${volunteer.name} — Volunteer Profile`} />
            <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;600&display=swap" rel="stylesheet" />

            <div style={s.page}>
                {/* NAV */}
                <nav style={s.nav}>
                    <div style={s.navBrand}>
                        <div style={s.navIcon}>+</div>
                        <span style={s.navTitle}>RED CROSS — Admin Panel</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Link href={route('admin.dashboard')} style={s.navBack}>← Back to Dashboard</Link>
                        <Link href={route('logout')} method="post" as="button" style={s.navLogout}>Log Out</Link>
                    </div>
                </nav>

                <div style={s.content}>
                    <div style={s.eyebrow}>Volunteer Profile</div>
                    <h1 style={s.h1}>Profile Details</h1>

                    {/* PROFILE HEADER */}
                    <div style={s.card}>
                        <div style={s.profileRow}>
                            {volunteer.photo
                                ? <img src={volunteer.photo} alt={volunteer.name} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                                : <div style={s.avatar}>{initials}</div>
                            }
                            <div>
                                <p style={s.name}>{volunteer.name}</p>
                                <p style={s.email}>{volunteer.email}</p>
                                <span style={badge.style}>{badge.label}</span>
                            </div>
                        </div>

                        {/* INFO GRID */}
                        <div style={{ ...s.grid2, marginTop: '24px' }}>
                            {[
                                { label: 'Branch',        value: 'Muntinlupa City Branch' },
                                { label: 'Member Since',  value: volunteer.created_at ? new Date(volunteer.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
                                { label: 'Phone',         value: volunteer.phone    ?? '—' },
                                { label: 'Address',       value: volunteer.address  ?? '—' },
                                { label: 'Birthday',      value: volunteer.birthday ? new Date(volunteer.birthday).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
                                { label: 'Gender',        value: volunteer.gender   ?? '—' },
                            ].map(({ label, value }) => (
                                <div key={label}>
                                    <div style={s.fieldLabel}>{label}</div>
                                    <div style={s.fieldValue}>{value}</div>
                                </div>
                            ))}
                        </div>

                        {/* ACTIONS */}
                        <div style={s.actionsRow}>
                            {volunteer.status !== 'approved' && (
                                <button style={s.btnApprove} onClick={handleApprove}>Approve Volunteer</button>
                            )}
                            {volunteer.status !== 'rejected' && (
                                <button style={s.btnReject} onClick={handleReject}>
                                    {volunteer.status === 'approved' ? 'Revoke Approval' : 'Reject'}
                                </button>
                            )}
                            <Link href={route('admin.volunteers')} style={s.btnBack}>← Back to Volunteers</Link>
                        </div>
                    </div>

                    {/* QUICK STATS */}
                    <div style={s.card}>
                        <div style={s.cardTitle}>Activity Summary</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            <div style={s.statBox}>
                                <div style={s.statNum}>{volunteer.total_hours ?? 0}</div>
                                <div style={s.statLbl}>Hours Rendered</div>
                            </div>
                            <div style={s.statBox}>
                                <div style={s.statNum}>{volunteer.attendance_count ?? 0}</div>
                                <div style={s.statLbl}>Activities Attended</div>
                            </div>
                            <div style={s.statBox}>
                                <div style={s.statNum}>{volunteer.documents_count ?? 0}</div>
                                <div style={s.statLbl}>Documents Submitted</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
