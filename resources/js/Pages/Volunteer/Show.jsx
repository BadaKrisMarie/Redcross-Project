import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

function VolunteerShow({ volunteer }) {
    const s = {
        content: { maxWidth: '900px' },
        h1: { fontFamily: "'Montserrat', sans-serif", fontSize: '32px', color: '#111', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', margin: '0 0 32px' },
        card: { background: 'white', borderRadius: '8px', border: '1px solid #e8e8e8', padding: '28px', marginBottom: '20px' },
        cardTitle: { fontFamily: "'Montserrat', sans-serif", fontSize: '14px', color: '#888', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' },
        profileRow: { display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '8px' },
        avatar: { width: '72px', height: '72px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '700', color: '#991b1b', flexShrink: 0 },
        name: { fontFamily: "'Montserrat', sans-serif", fontSize: '26px', color: '#111', fontWeight: '600', margin: '0 0 4px' },
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
        btnReject:  { background: 'white', color: '#ff0000', border: '1px solid #ff0000', padding: '10px 22px', borderRadius: '4px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
        btnBack:    { background: '#f5f5f5', color: '#111', border: '1px solid #e8e8e8', padding: '10px 22px', borderRadius: '4px', fontSize: '13px', fontWeight: '600', textDecoration: 'none', display: 'inline-block' },
        statBox: { textAlign: 'center', padding: '16px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' },
        statNum: { fontFamily: "'Montserrat', sans-serif", fontSize: '28px', color: '#ff0000', fontWeight: '600' },
        statLbl: { fontSize: '12px', color: '#888', marginTop: '2px' },
        skillPill: { display: 'inline-block', fontSize: '12px', padding: '5px 14px', borderRadius: '20px', background: '#dbeafe', color: '#1e40af', fontWeight: '600', marginRight: '8px', marginBottom: '8px' },
        noSkills: { fontSize: '13px', color: '#aaa' },
        notesBox: { fontSize: '13px', color: '#444', background: '#fafafa', borderRadius: '8px', padding: '12px 14px', marginTop: '14px', lineHeight: '1.6' },
    };

    const badge = s.badge(volunteer.status);
    const initials = volunteer.name
        ? volunteer.name.split(' ').map(w => w[0]?.toUpperCase() ?? '').slice(0, 2).join('')
        : '?';

    // Compute age from birthdate.
    // NOTE: the User model / controller uses the column name "birthdate"
    // (matches the actual DB column) — read that same key here, not "birthday",
    // or this silently shows "—" even when the volunteer has a birthdate on file.
    const getAge = (birthdate) => {
        if (!birthdate) return null;
        const dob = new Date(birthdate);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        return age;
    };
    const age = getAge(volunteer.birthdate);

    // Skills can arrive as an array (JSON column) — guard against string/null
    const skillsList = Array.isArray(volunteer.skills) ? volunteer.skills : [];

    const handleApprove = () => router.patch(route('admin.volunteers.approve', volunteer.id), {}, { preserveScroll: true });
    const handleReject  = () => router.patch(route('admin.volunteers.reject',  volunteer.id), {}, { preserveScroll: true });

    return (
        <>
            <Head title={`${volunteer.name} — Volunteer Profile`} />
            <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;600&display=swap" rel="stylesheet" />

            <div style={s.content}>
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
                            { label: 'Birthday',      value: volunteer.birthdate ? new Date(volunteer.birthdate).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
                            { label: 'Age',           value: age !== null ? `${age} years old` : '—' },
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

                {/* SKILLS & TRAININGS */}
                <div style={s.card}>
                    <div style={s.cardTitle}>Skills & Trainings</div>
                    {skillsList.length === 0 ? (
                        <div style={s.noSkills}>This volunteer hasn't reported any skills or trainings yet.</div>
                    ) : (
                        <div>
                            {skillsList.map((skill, i) => (
                                <span key={i} style={s.skillPill}>{skill}</span>
                            ))}
                        </div>
                    )}
                    {volunteer.skills_notes && (
                        <div style={s.notesBox}>{volunteer.skills_notes}</div>
                    )}
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
        </>
    );
}

// ✅ Persistent layout — sidebar stays mounted across navigation
VolunteerShow.layout = (page) => <AdminLayout title="Volunteer Profile">{page}</AdminLayout>;

export default VolunteerShow;