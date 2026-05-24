import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

export default function VolunteerShow({ volunteer }) {
    const [previewDoc, setPreviewDoc] = useState(null);

    const s = {
        page: { minHeight: '100vh', background: '#f5f5f5', fontFamily: "'Source Sans 3', sans-serif" },
        nav: { background: '#111', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
        navBrand: { display: 'flex', alignItems: 'center', gap: '10px' },
        navIcon: { width: '32px', height: '32px', background: '#DC2626', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: '900' },
        navTitle: { fontFamily: 'Oswald, sans-serif', color: 'white', fontSize: '16px', fontWeight: '600', letterSpacing: '1px' },
        navBack: { color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' },
        navLogout: { background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', padding: '7px 18px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' },
        content: { padding: '40px 32px', maxWidth: '960px', margin: '0 auto' },
        eyebrow: { fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#DC2626', marginBottom: '8px' },
        h1: { fontFamily: 'Oswald, sans-serif', fontSize: '32px', color: '#111', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', margin: '0 0 32px' },
        card: { background: 'white', borderRadius: '8px', border: '1px solid #e8e8e8', padding: '28px', marginBottom: '20px' },
        cardTitle: { fontFamily: 'Oswald, sans-serif', fontSize: '14px', color: '#888', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' },
        grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
        fieldLabel: { fontSize: '11px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#aaa', marginBottom: '4px' },
        fieldValue: { fontSize: '14px', color: '#111', fontWeight: '500' },
        statBox: { textAlign: 'center', padding: '20px 16px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' },
        statNum: { fontFamily: 'Oswald, sans-serif', fontSize: '32px', color: '#DC2626', fontWeight: '600' },
        statLbl: { fontSize: '12px', color: '#888', marginTop: '4px' },
        actionsRow: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f0f0f0' },
        btnApprove: { background: '#16a34a', color: 'white', border: 'none', padding: '10px 22px', borderRadius: '4px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
        btnReject: { background: 'white', color: '#DC2626', border: '1px solid #DC2626', padding: '10px 22px', borderRadius: '4px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
        btnBack: { background: '#f5f5f5', color: '#111', border: '1px solid #e8e8e8', padding: '10px 22px', borderRadius: '4px', fontSize: '13px', fontWeight: '600', textDecoration: 'none', display: 'inline-block' },
    };

    const badgeMap = {
        approved: { bg: '#dcfce7', color: '#166534', label: 'Approved' },
        pending:  { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
        rejected: { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
        inactive: { bg: '#f5f5f5', color: '#555',    label: 'Inactive' },
    };
    const badge = badgeMap[volunteer.status] ?? badgeMap.inactive;

    const initials = volunteer.name
        ? volunteer.name.split(' ').map(w => w[0]?.toUpperCase() ?? '').slice(0, 2).join('')
        : '?';

    const handleApprove = () => router.patch(route('admin.volunteers.approve', volunteer.id), {}, { preserveScroll: true });
    const handleReject  = () => router.patch(route('admin.volunteers.reject',  volunteer.id), {}, { preserveScroll: true });

    const isImage = (url) => url && /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    const isPdf   = (url) => url && /\.pdf$/i.test(url);

    const handleDownload = async (doc) => {
        if (!doc.file_url) return;
        const ext = isPdf(doc.file_url) ? '.pdf' : isImage(doc.file_url) ? '.' + doc.file_url.split('.').pop() : '';
        const fileName = `${volunteer.name}_${doc.type}`.replace(/\s+/g, '_') + ext;
        try {
            const response = await fetch(doc.file_url);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch {
            const link = document.createElement('a');
            link.href = doc.file_url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const documents = volunteer.documents ?? [];
    const attendance = volunteer.attendance ?? [];

    return (
        <>
            <Head title={`${volunteer.name} — Volunteer Profile`} />
            <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;600&display=swap" rel="stylesheet" />

            {/* DOCUMENT PREVIEW MODAL */}
            {previewDoc && (
                <div
                    onClick={() => setPreviewDoc(null)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{ background: 'white', borderRadius: '8px', width: '100%', maxWidth: '760px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                    >
                        {/* Modal Header */}
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '16px', fontWeight: '600', textTransform: 'uppercase', color: '#111' }}>{previewDoc.type}</div>
                                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{volunteer.name}</div>
                            </div>
                            <button onClick={() => setPreviewDoc(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}>✕</button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ flex: 1, overflow: 'hidden', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '500px' }}>
                            {previewDoc.file_url ? (
                                isImage(previewDoc.file_url) ? (
                                    <img src={previewDoc.file_url} alt={previewDoc.type} style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: '4px' }} />
                                ) : isPdf(previewDoc.file_url) ? (
                                    <iframe
                                        src={`${previewDoc.file_url}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
                                        style={{ width: '100%', height: '65vh', border: 'none', display: 'block' }}
                                        title={previewDoc.type}
                                    />
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#888' }}>
                                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>📄</div>
                                        <div style={{ fontSize: '13px' }}>Hindi ma-preview ang file.</div>
                                    </div>
                                )
                            ) : (
                                <div style={{ textAlign: 'center', color: '#aaa', fontSize: '13px' }}>Walang file na naka-attach.</div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div style={{ padding: '12px 20px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            {previewDoc.file_url && (
                                <button
                                    onClick={() => handleDownload(previewDoc)}
                                    style={{ background: '#f5f5f5', border: '1px solid #e8e8e8', padding: '7px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', color: '#111' }}
                                >
                                    I-download
                                </button>
                            )}
                            <button
                                onClick={() => setPreviewDoc(null)}
                                style={{ background: '#f5f5f5', border: '1px solid #e8e8e8', padding: '7px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', color: '#111' }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={s.page}>
                {/* NAV */}
                <nav style={s.nav}>
                    <div style={s.navBrand}>
                        <div style={s.navIcon}>+</div>
                        <span style={s.navTitle}>RED CROSS — Admin Panel</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Link href={route('admin.volunteers')} style={s.navBack}>← Back to Volunteers</Link>
                        <Link href={route('logout')} method="post" as="button" style={s.navLogout}>Log Out</Link>
                    </div>
                </nav>

                <div style={s.content}>
                    <div style={s.eyebrow}>Volunteer Profile</div>
                    <h1 style={s.h1}>Profile Details</h1>

                    {/* ── PROFILE HEADER CARD ── */}
                    <div style={s.card}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
                            {/* Avatar */}
                            {volunteer.photo
                                ? <img src={`/storage/${volunteer.photo}`} alt={volunteer.name} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '3px solid #f0f0f0' }} />
                                : (
                                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '700', color: '#991b1b', flexShrink: 0 }}>
                                        {initials}
                                    </div>
                                )
                            }
                            <div>
                                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '28px', color: '#111', fontWeight: '600', margin: '0 0 4px' }}>{volunteer.name}</div>
                                <div style={{ fontSize: '14px', color: '#666', margin: '0 0 10px' }}>{volunteer.email}</div>
                                <span style={{ display: 'inline-block', fontSize: '12px', padding: '4px 12px', borderRadius: '20px', background: badge.bg, color: badge.color, fontWeight: '600' }}>
                                    {badge.label}
                                </span>
                            </div>
                        </div>

                        {/* INFO GRID */}
                        <div style={s.grid2}>
                            {[
                                { label: 'Branch',       value: 'Muntinlupa City Branch' },
                                { label: 'Member Since', value: volunteer.created_at ? new Date(volunteer.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
                                { label: 'Phone',        value: volunteer.phone    ?? '—' },
                                { label: 'Address',      value: volunteer.address  ?? '—' },
                                { label: 'Birthday',     value: volunteer.birthdate ? new Date(volunteer.birthdate).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
                                { label: 'Gender',       value: volunteer.gender   ?? '—' },
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

                    {/* ── EMERGENCY CONTACT ── */}
                    {(volunteer.emergency_contact_name || volunteer.emergency_contact_phone) && (
                        <div style={s.card}>
                            <div style={s.cardTitle}>Emergency Contact</div>
                            <div style={s.grid2}>
                                <div>
                                    <div style={s.fieldLabel}>Contact Name</div>
                                    <div style={s.fieldValue}>{volunteer.emergency_contact_name ?? '—'}</div>
                                </div>
                                <div>
                                    <div style={s.fieldLabel}>Contact Phone</div>
                                    <div style={s.fieldValue}>{volunteer.emergency_contact_phone ?? '—'}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── ACTIVITY SUMMARY ── */}
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

                    {/* ── SUBMITTED DOCUMENTS ── */}
                    <div style={s.card}>
                        <div style={s.cardTitle}>Submitted Documents</div>
                        {documents.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#aaa', fontSize: '13px', padding: '24px 0' }}>Walang submitted na documents.</div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#fafafa' }}>
                                        {['Document Type', 'Submitted', 'Actions'].map(h => (
                                            <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {documents.map((doc, i) => (
                                        <tr key={i} style={{ borderTop: '1px solid #f0f0f0' }}>
                                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#111', fontWeight: '500' }}>
                                                <span style={{ marginRight: '8px' }}>📄</span>{doc.type}
                                            </td>
                                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#888' }}>
                                                {doc.created_at ? new Date(doc.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    {doc.file_url && (
                                                        <>
                                                            <button
                                                                onClick={() => setPreviewDoc(doc)}
                                                                style={{ background: '#1d4ed8', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                                            >
                                                                Preview
                                                            </button>
                                                            <button
                                                                onClick={() => handleDownload(doc)}
                                                                style={{ background: 'white', color: '#111', border: '1px solid #e8e8e8', padding: '6px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                                            >
                                                                I-download
                                                            </button>
                                                        </>
                                                    )}
                                                    {!doc.file_url && (
                                                        <span style={{ fontSize: '12px', color: '#aaa' }}>Walang file</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* ── ATTENDANCE HISTORY ── */}
                    <div style={s.card}>
                        <div style={s.cardTitle}>Attendance History</div>
                        {attendance.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#aaa', fontSize: '13px', padding: '24px 0' }}>Walang attendance records.</div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#fafafa' }}>
                                        {['Activity', 'Date', 'Time In', 'Time Out', 'Hours'].map(h => (
                                            <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendance.map((a, i) => (
                                        <tr key={i} style={{ borderTop: '1px solid #f0f0f0' }}>
                                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#111', fontWeight: '500' }}>{a.activity_name ?? '—'}</td>
                                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#666' }}>
                                                {a.date ? new Date(a.date).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                                            </td>
                                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#16a34a', fontWeight: '600' }}>{a.time_in ?? '—'}</td>
                                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#DC2626', fontWeight: '600' }}>{a.time_out ?? '—'}</td>
                                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#111', fontWeight: '600' }}>{a.hours ? `${a.hours} hrs` : '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
}
