import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function AdminDashboard({ auth, pendingCount, totalVolunteers, activeToday }) {
    return (
        <>
            <Head title="Admin Dashboard" />
            <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;600&display=swap" rel="stylesheet" />

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
                </nav>

                {/* CONTENT */}
                <div style={{ padding: '40px 32px' }}>
                    <div style={{ marginBottom: '32px' }}>
                        <div style={{
                            fontSize: '11px', fontWeight: '600', letterSpacing: '2px',
                            textTransform: 'uppercase', color: '#DC2626', marginBottom: '8px'
                        }}>Admin Panel</div>
                        <h1 style={{
                            fontFamily: 'Oswald, sans-serif',
                            fontSize: '36px', color: '#111', fontWeight: '600',
                            letterSpacing: '0.5px', textTransform: 'uppercase'
                        }}>Welcome, Admin</h1>
                    </div>

                    {/* STATS */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                        {[
                            { label: 'Total Volunteers', value: totalVolunteers ?? 0 },
                            { label: 'Active Today', value: activeToday ?? 0 },
                            { label: 'Pending Approval', value: pendingCount ?? 0, highlight: true },
                            { label: 'Total Admins', value: '1' },
                        ].map(({ label, value, highlight }) => (
                            <div key={label} style={{
                                background: 'white', padding: '24px',
                                borderRadius: '8px',
                                border: highlight && value > 0 ? '2px solid #f59e0b' : '1px solid #e8e8e8'
                            }}>
                                <div style={{
                                    fontFamily: 'Oswald, sans-serif',
                                    fontSize: '36px',
                                    color: highlight && value > 0 ? '#f59e0b' : '#DC2626',
                                    fontWeight: '600'
                                }}>{value}</div>
                                <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>{label}</div>
                            </div>
                        ))}
                    </div>

                    {/* PENDING ALERT */}
                    {pendingCount > 0 && (
                        <div style={{
                            background: '#fffbeb', border: '1px solid #fde68a',
                            borderRadius: '8px', padding: '16px 24px',
                            marginBottom: '24px', display: 'flex',
                            alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    width: '8px', height: '8px', borderRadius: '50%',
                                    background: '#f59e0b'
                                }}></div>
                                <span style={{ fontSize: '14px', color: '#92400e', fontWeight: '500' }}>
                                    You have <strong>{pendingCount}</strong> volunteer{pendingCount > 1 ? 's' : ''} waiting for approval.
                                </span>
                            </div>
                            <Link href={route('admin.volunteers')} style={{
                                background: '#f59e0b', color: 'white', padding: '8px 18px',
                                borderRadius: '4px', fontSize: '12px', fontWeight: '600',
                                textDecoration: 'none'
                            }}>Review Now →</Link>
                        </div>
                    )}

                    {/* QUICK LINKS */}
                    <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e8e8e8', padding: '24px' }}>
                        <div style={{
                            fontFamily: 'Oswald, sans-serif',
                            fontSize: '16px', color: '#111', fontWeight: '600',
                            letterSpacing: '0.5px', textTransform: 'uppercase',
                            marginBottom: '16px'
                        }}>Quick Actions</div>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <Link href={route('admin.volunteers')} style={{
                                background: '#DC2626', color: 'white',
                                border: 'none', padding: '10px 20px',
                                borderRadius: '4px', fontSize: '13px',
                                fontWeight: '600', cursor: 'pointer',
                                textDecoration: 'none'
                            }}>Manage Volunteers</Link>

                            <Link href={route('admin.activities.index')} style={{
                                background: '#1d4ed8', color: 'white',
                                border: 'none', padding: '10px 20px',
                                borderRadius: '4px', fontSize: '13px',
                                fontWeight: '600', cursor: 'pointer',
                                textDecoration: 'none'
                            }}>Manage Activities</Link>

                            <Link href={route('admin.activities.create')} style={{
                                background: '#16a34a', color: 'white',
                                border: 'none', padding: '10px 20px',
                                borderRadius: '4px', fontSize: '13px',
                                fontWeight: '600', cursor: 'pointer',
                                textDecoration: 'none'
                            }}>+ New Activity</Link>

                            <Link href={route('admin.attendance.index')} style={{
                                background: '#f5f5f5', border: '1px solid #e8e8e8',
                                padding: '10px 20px', borderRadius: '4px',
                                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                color: '#111', textDecoration: 'none'
                            }}>View Attendance</Link>

                            {['Manage Admins', 'View Reports'].map(action => (
                                <button key={action} style={{
                                    background: '#f5f5f5', border: '1px solid #e8e8e8',
                                    padding: '10px 20px', borderRadius: '4px',
                                    fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                    color: '#111'
                                }}>{action}</button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
