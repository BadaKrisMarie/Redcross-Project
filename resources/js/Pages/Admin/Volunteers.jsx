import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';

export default function Volunteers({ volunteers }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState('');
    const [selectedVolunteer, setSelectedVolunteer] = useState(null);

    const approve = (e, id) => {
        e.stopPropagation();
        router.patch(route('admin.volunteers.approve', id));
    };

    const reject = (e, id) => {
        e.stopPropagation();
        router.patch(route('admin.volunteers.reject', id));
    };

    const viewProfile = (id) => {
        router.visit(route('admin.volunteers.show', id));
    };

    const pending  = volunteers.filter(v => v.status === 'pending');
    const approved = volunteers.filter(v => v.status === 'approved');
    const rejected = volunteers.filter(v => v.status === 'rejected');

    // Recent = last 7 volunteers sorted by created_at desc, optionally filtered by search
    const recent = [...volunteers]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .filter(v =>
            v.name.toLowerCase().includes(search.toLowerCase()) ||
            v.email.toLowerCase().includes(search.toLowerCase())
        )
        .slice(0, 7);

    const getInitials = (name) =>
        name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    const avatarColors = [
        '#9f1239', '#5b21b6', '#0f766e', '#b45309', '#1e40af', '#065f46', '#6b21a8'
    ];
    const getAvatarColor = (name) =>
        avatarColors[name.charCodeAt(0) % avatarColors.length];

    const statusBadge = (status) => {
        const styles = {
            pending:  { background: '#fef3c7', color: '#92400e' },
            approved: { background: '#dcfce7', color: '#166534' },
            rejected: { background: '#fee2e2', color: '#991b1b' },
        };
        const s = styles[status] || styles.pending;
        return (
            <span style={{
                ...s,
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '500',
                textTransform: 'capitalize',
            }}>{status}</span>
        );
    };

    const btnView = {
        background: '#1d4ed8', color: 'white',
        border: 'none', padding: '7px 16px',
        borderRadius: '4px', fontSize: '12px',
        fontWeight: '600', cursor: 'pointer',
    };

    const clickableRow = {
        borderTop: '1px solid #f0f0f0',
        cursor: 'pointer',
        transition: 'background 0.15s',
    };

    const VolunteerRow = ({ v, actions }) => (
        <tr
            key={v.id}
            style={clickableRow}
            onClick={() => viewProfile(v.id)}
            onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
            <td style={{ padding: '14px 24px', fontSize: '14px', color: '#111', fontWeight: '500' }}>
                {v.name}
            </td>
            <td style={{ padding: '14px 24px', fontSize: '13px', color: '#666' }}>
                {v.email}
            </td>
            <td style={{ padding: '14px 24px', fontSize: '13px', color: '#999' }}>
                {new Date(v.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
            </td>
            <td style={{ padding: '14px 24px' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {actions(v)}
                </div>
            </td>
        </tr>
    );

    const TableShell = ({ headers, children, emptyMsg }) => (
        children.length === 0
            ? <div style={{ padding: '32px', textAlign: 'center', color: '#aaa', fontSize: '13px' }}>{emptyMsg}</div>
            : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#fafafa' }}>
                            {headers.map(h => (
                                <th key={h} style={{ padding: '12px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>{children}</tbody>
                </table>
            )
    );

    return (
        <>
            <Head title="Manage Volunteers" />
            <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;600&display=swap" rel="stylesheet" />

            {/* ── VOLUNTEER MODAL ── */}
            {selectedVolunteer && (
                <div
                    onClick={() => setSelectedVolunteer(null)}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 1000,
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'white', borderRadius: '12px',
                            width: '480px', maxWidth: '90vw',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Modal header */}
                        <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '50%',
                                    background: getAvatarColor(selectedVolunteer.name),
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '16px', fontWeight: '600', color: 'white',
                                    overflow: 'hidden', flexShrink: 0,
                                }}>
                                    {selectedVolunteer.profile_photo_url || selectedVolunteer.avatar || selectedVolunteer.photo ? (
                                        <img src={selectedVolunteer.profile_photo_url || selectedVolunteer.avatar || selectedVolunteer.photo} alt={selectedVolunteer.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                                    ) : getInitials(selectedVolunteer.name)}
                                </div>
                                <div>
                                    <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '18px', fontWeight: '600', color: '#111', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{selectedVolunteer.name}</div>
                                    <div style={{ fontSize: '12px', color: '#DC2626', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>
                                        {selectedVolunteer.branch || 'Muntinlupa City Branch'}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedVolunteer(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#aaa', lineHeight: 1 }}>✕</button>
                        </div>

                        {/* Modal body */}
                        <div style={{ padding: '24px' }}>

                            {/* Big profile photo */}
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                                <div style={{
                                    width: '110px', height: '110px', borderRadius: '50%',
                                    background: getAvatarColor(selectedVolunteer.name),
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '32px', fontWeight: '600', color: 'white',
                                    overflow: 'hidden',
                                }}>
                                    {selectedVolunteer.profile_photo_url || selectedVolunteer.avatar || selectedVolunteer.photo ? (
                                        <img src={selectedVolunteer.profile_photo_url || selectedVolunteer.avatar || selectedVolunteer.photo} alt={selectedVolunteer.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                                    ) : getInitials(selectedVolunteer.name)}
                                </div>
                            </div>

                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '20px', fontWeight: '600', color: '#111' }}>{selectedVolunteer.name}</div>
                                <div style={{ fontSize: '13px', color: '#999', marginTop: '2px' }}>{selectedVolunteer.branch || 'Muntinlupa City Branch'}</div>
                            </div>

                            {/* Info grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                                {[
                                    { label: 'Email',      value: selectedVolunteer.email },
                                    { label: 'Status',     value: selectedVolunteer.status, badge: true },
                                    { label: 'Phone',      value: selectedVolunteer.phone || selectedVolunteer.contact_number || '—' },
                                    { label: 'Address',    value: selectedVolunteer.address || '—' },
                                    { label: 'Registered', value: new Date(selectedVolunteer.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) },
                                    { label: 'Document',   value: selectedVolunteer.document_type || selectedVolunteer.document || '—' },
                                ].map(({ label, value, badge }) => (
                                    <div key={label} style={{ background: '#fafafa', borderRadius: '8px', padding: '12px 14px' }}>
                                        <div style={{ fontSize: '10px', fontWeight: '600', color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>{label}</div>
                                        {badge ? statusBadge(value) : <div style={{ fontSize: '13px', color: '#333', wordBreak: 'break-word' }}>{value}</div>}
                                    </div>
                                ))}
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button onClick={() => setSelectedVolunteer(null)} style={{ padding: '9px 20px', background: 'white', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', color: '#555' }}>Close</button>
                                <button onClick={() => { setSelectedVolunteer(null); viewProfile(selectedVolunteer.id); }} style={{ padding: '9px 20px', background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>View Full Profile →</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: "'Source Sans 3', sans-serif" }}>

                {/* TOP NAV */}
                <nav style={{
                    background: '#111', padding: '14px 32px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '32px', height: '32px', background: '#DC2626',
                            borderRadius: '4px', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: '900'
                        }}>+</div>
                        <span style={{
                            fontFamily: 'Oswald, sans-serif',
                            color: 'white', fontSize: '16px', fontWeight: '600', letterSpacing: '1px'
                        }}>RED CROSS — Admin Panel</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <Link href={route('admin.dashboard')} style={{
                            color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none'
                        }}>← Back to Dashboard</Link>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            style={{
                                background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
                                color: 'rgba(255,255,255,0.7)', padding: '7px 18px',
                                borderRadius: '4px', fontSize: '12px', cursor: 'pointer'
                            }}
                        >Log Out</Link>
                    </div>
                </nav>

                <div style={{ padding: '40px 32px' }}>

                    {/* Header */}
                    <div style={{ marginBottom: '32px' }}>
                        <div style={{
                            fontSize: '11px', fontWeight: '600', letterSpacing: '2px',
                            textTransform: 'uppercase', color: '#DC2626', marginBottom: '8px'
                        }}>Admin Panel</div>
                        <h1 style={{
                            fontFamily: 'Oswald, sans-serif',
                            fontSize: '36px', color: '#111', fontWeight: '600',
                            letterSpacing: '0.5px', textTransform: 'uppercase'
                        }}>Manage Volunteers</h1>
                    </div>

                    {/* Flash message */}
                    {flash?.success && (
                        <div style={{
                            marginBottom: '24px', padding: '12px 16px',
                            background: '#f0fdf4', border: '1px solid #bbf7d0',
                            borderRadius: '8px', fontSize: '13px', color: '#16a34a'
                        }}>{flash.success}</div>
                    )}

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                        {[
                            { label: 'Pending Approval', value: pending.length,  color: '#f59e0b' },
                            { label: 'Approved',         value: approved.length, color: '#16a34a' },
                            { label: 'Rejected',         value: rejected.length, color: '#DC2626' },
                        ].map(({ label, value, color }) => (
                            <div key={label} style={{
                                background: 'white', padding: '24px',
                                borderRadius: '8px', border: '1px solid #e8e8e8'
                            }}>
                                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: '36px', color, fontWeight: '600' }}>{value}</div>
                                <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>{label}</div>
                            </div>
                        ))}
                    </div>

                    {/* ── RECENT VOLUNTEERS ── */}
                    <div style={{
                        background: 'white', borderRadius: '8px',
                        border: '1px solid #e8e8e8', marginBottom: '32px'
                    }}>
                        {/* Section header */}
                        <div style={{
                            padding: '20px 24px', borderBottom: '1px solid #f0f0f0',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#DC2626' }}></div>
                                <span style={{
                                    fontFamily: 'Oswald, sans-serif', fontSize: '16px',
                                    fontWeight: '600', color: '#111', textTransform: 'uppercase'
                                }}>Recent Volunteers</span>
                            </div>
                            {/* Search */}
                            <div style={{ position: 'relative' }}>
                                <svg style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#aaa' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search volunteers..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    style={{
                                        paddingLeft: '30px', paddingRight: '12px',
                                        paddingTop: '7px', paddingBottom: '7px',
                                        fontSize: '13px', border: '1px solid #e8e8e8',
                                        borderRadius: '6px', outline: 'none',
                                        width: '220px', color: '#111',
                                        background: '#fafafa',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Volunteer rows */}
                        {recent.length === 0 ? (
                            <div style={{ padding: '32px', textAlign: 'center', color: '#aaa', fontSize: '13px' }}>
                                No volunteers match your search.
                            </div>
                        ) : (
                            recent.map((v, i) => (
                                <div
                                    key={v.id}
                                    onClick={() => setSelectedVolunteer(v)}
                                    style={{
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '14px 24px',
                                        borderTop: i === 0 ? 'none' : '1px solid #f5f5f5',
                                        cursor: 'pointer',
                                        transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    {/* Avatar + name */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                                        <div style={{
                                            width: '38px', height: '38px', borderRadius: '50%',
                                            background: getAvatarColor(v.name),
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '13px', fontWeight: '600', color: 'white',
                                            flexShrink: 0, overflow: 'hidden',
                                        }}>
                                            {v.profile_photo_url || v.avatar || v.photo ? (
                                                <img src={v.profile_photo_url || v.avatar || v.photo} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} onError={e => { e.target.style.display = 'none'; }} />
                                            ) : getInitials(v.name)}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: '500', color: '#111' }}>{v.name}</div>
                                            <div style={{ fontSize: '12px', color: '#999', marginTop: '1px' }}>{v.email}</div>
                                        </div>
                                    </div>

                                    {/* Right: date + status + arrow */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                                        <span style={{ fontSize: '12px', color: '#bbb' }}>
                                            {new Date(v.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                        {statusBadge(v.status)}
                                        <svg style={{ width: '14px', height: '14px', color: '#ccc' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18l6-6-6-6" />
                                        </svg>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* ── PENDING TABLE ── */}
                    <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e8e8e8', marginBottom: '24px' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></div>
                            <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '16px', fontWeight: '600', color: '#111', textTransform: 'uppercase' }}>
                                Pending Approval ({pending.length})
                            </span>
                        </div>
                        <TableShell headers={['Name', 'Email', 'Registered', 'Actions']} children={pending} emptyMsg="No pending volunteers">
                            {pending.map(v => (
                                <VolunteerRow key={v.id} v={v} actions={v => (
                                    <>
                                        <button onClick={e => { e.stopPropagation(); viewProfile(v.id); }} style={btnView}>View Profile</button>
                                        <button onClick={e => approve(e, v.id)} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '7px 16px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Approve</button>
                                        <button onClick={e => reject(e, v.id)}  style={{ background: 'white', color: '#DC2626', border: '1px solid #DC2626', padding: '7px 16px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Reject</button>
                                    </>
                                )} />
                            ))}
                        </TableShell>
                    </div>

                   

                    {/* ── REJECTED TABLE ── */}
                    <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e8e8e8' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#DC2626' }}></div>
                            <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '16px', fontWeight: '600', color: '#111', textTransform: 'uppercase' }}>
                                Rejected Volunteers ({rejected.length})
                            </span>
                        </div>
                        <TableShell headers={['Name', 'Email', 'Registered', 'Actions']} children={rejected} emptyMsg="No rejected volunteers">
                            {rejected.map(v => (
                                <VolunteerRow key={v.id} v={v} actions={v => (
                                    <>
                                        <button onClick={e => { e.stopPropagation(); viewProfile(v.id); }} style={btnView}>View Profile</button>
                                        <button onClick={e => approve(e, v.id)} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '7px 16px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Re-approve</button>
                                    </>
                                )} />
                            ))}
                        </TableShell>
                    </div>

                </div>
            </div>
        </>
    );
}