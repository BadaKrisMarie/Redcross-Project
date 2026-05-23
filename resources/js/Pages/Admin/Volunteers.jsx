import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';

export default function Volunteers({ volunteers }) {
    const { flash } = usePage().props;

    const approve = (id) => {
        router.patch(route('admin.volunteers.approve', id));
    };

    const reject = (id) => {
        router.patch(route('admin.volunteers.reject', id));
    };

    const pending = volunteers.filter(v => v.status === 'pending');
    const approved = volunteers.filter(v => v.status === 'approved');
    const rejected = volunteers.filter(v => v.status === 'rejected');

    return (
        <>
            <Head title="Manage Volunteers" />
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
                            { label: 'Pending Approval', value: pending.length, color: '#f59e0b' },
                            { label: 'Approved', value: approved.length, color: '#16a34a' },
                            { label: 'Rejected', value: rejected.length, color: '#DC2626' },
                        ].map(({ label, value, color }) => (
                            <div key={label} style={{
                                background: 'white', padding: '24px',
                                borderRadius: '8px', border: '1px solid #e8e8e8'
                            }}>
                                <div style={{
                                    fontFamily: 'Oswald, sans-serif',
                                    fontSize: '36px', color, fontWeight: '600'
                                }}>{value}</div>
                                <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>{label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Pending Table */}
                    <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e8e8e8', marginBottom: '24px' }}>
                        <div style={{
                            padding: '20px 24px', borderBottom: '1px solid #f0f0f0',
                            display: 'flex', alignItems: 'center', gap: '10px'
                        }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></div>
                            <span style={{
                                fontFamily: 'Oswald, sans-serif', fontSize: '16px',
                                fontWeight: '600', color: '#111', textTransform: 'uppercase'
                            }}>Pending Approval ({pending.length})</span>
                        </div>
                        {pending.length === 0 ? (
                            <div style={{ padding: '32px', textAlign: 'center', color: '#aaa', fontSize: '13px' }}>
                                No pending volunteers
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#fafafa' }}>
                                        {['Name', 'Email', 'Registered', 'Actions'].map(h => (
                                            <th key={h} style={{
                                                padding: '12px 24px', textAlign: 'left',
                                                fontSize: '11px', fontWeight: '600',
                                                color: '#888', textTransform: 'uppercase',
                                                letterSpacing: '1px'
                                            }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {pending.map((v) => (
                                        <tr key={v.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                                            <td style={{ padding: '14px 24px', fontSize: '14px', color: '#111', fontWeight: '500' }}>{v.name}</td>
                                            <td style={{ padding: '14px 24px', fontSize: '13px', color: '#666' }}>{v.email}</td>
                                            <td style={{ padding: '14px 24px', fontSize: '13px', color: '#999' }}>
                                                {new Date(v.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </td>
                                            <td style={{ padding: '14px 24px' }}>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={() => approve(v.id)}
                                                        style={{
                                                            background: '#16a34a', color: 'white',
                                                            border: 'none', padding: '7px 16px',
                                                            borderRadius: '4px', fontSize: '12px',
                                                            fontWeight: '600', cursor: 'pointer'
                                                        }}
                                                    >Approve</button>
                                                    <button
                                                        onClick={() => reject(v.id)}
                                                        style={{
                                                            background: 'white', color: '#DC2626',
                                                            border: '1px solid #DC2626', padding: '7px 16px',
                                                            borderRadius: '4px', fontSize: '12px',
                                                            fontWeight: '600', cursor: 'pointer'
                                                        }}
                                                    >Reject</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Approved Table */}
                    <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e8e8e8', marginBottom: '24px' }}>
                        <div style={{
                            padding: '20px 24px', borderBottom: '1px solid #f0f0f0',
                            display: 'flex', alignItems: 'center', gap: '10px'
                        }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }}></div>
                            <span style={{
                                fontFamily: 'Oswald, sans-serif', fontSize: '16px',
                                fontWeight: '600', color: '#111', textTransform: 'uppercase'
                            }}>Approved Volunteers ({approved.length})</span>
                        </div>
                        {approved.length === 0 ? (
                            <div style={{ padding: '32px', textAlign: 'center', color: '#aaa', fontSize: '13px' }}>
                                No approved volunteers yet
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#fafafa' }}>
                                        {['Name', 'Email', 'Registered', 'Actions'].map(h => (
                                            <th key={h} style={{
                                                padding: '12px 24px', textAlign: 'left',
                                                fontSize: '11px', fontWeight: '600',
                                                color: '#888', textTransform: 'uppercase',
                                                letterSpacing: '1px'
                                            }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {approved.map((v) => (
                                        <tr key={v.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                                            <td style={{ padding: '14px 24px', fontSize: '14px', color: '#111', fontWeight: '500' }}>{v.name}</td>
                                            <td style={{ padding: '14px 24px', fontSize: '13px', color: '#666' }}>{v.email}</td>
                                            <td style={{ padding: '14px 24px', fontSize: '13px', color: '#999' }}>
                                                {new Date(v.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </td>
                                            <td style={{ padding: '14px 24px' }}>
                                                <button
                                                    onClick={() => reject(v.id)}
                                                    style={{
                                                        background: 'white', color: '#DC2626',
                                                        border: '1px solid #DC2626', padding: '7px 16px',
                                                        borderRadius: '4px', fontSize: '12px',
                                                        fontWeight: '600', cursor: 'pointer'
                                                    }}
                                                >Revoke</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Rejected Table */}
                    <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e8e8e8' }}>
                        <div style={{
                            padding: '20px 24px', borderBottom: '1px solid #f0f0f0',
                            display: 'flex', alignItems: 'center', gap: '10px'
                        }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#DC2626' }}></div>
                            <span style={{
                                fontFamily: 'Oswald, sans-serif', fontSize: '16px',
                                fontWeight: '600', color: '#111', textTransform: 'uppercase'
                            }}>Rejected Volunteers ({rejected.length})</span>
                        </div>
                        {rejected.length === 0 ? (
                            <div style={{ padding: '32px', textAlign: 'center', color: '#aaa', fontSize: '13px' }}>
                                No rejected volunteers
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#fafafa' }}>
                                        {['Name', 'Email', 'Registered', 'Actions'].map(h => (
                                            <th key={h} style={{
                                                padding: '12px 24px', textAlign: 'left',
                                                fontSize: '11px', fontWeight: '600',
                                                color: '#888', textTransform: 'uppercase',
                                                letterSpacing: '1px'
                                            }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rejected.map((v) => (
                                        <tr key={v.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                                            <td style={{ padding: '14px 24px', fontSize: '14px', color: '#111', fontWeight: '500' }}>{v.name}</td>
                                            <td style={{ padding: '14px 24px', fontSize: '13px', color: '#666' }}>{v.email}</td>
                                            <td style={{ padding: '14px 24px', fontSize: '13px', color: '#999' }}>
                                                {new Date(v.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </td>
                                            <td style={{ padding: '14px 24px' }}>
                                                <button
                                                    onClick={() => approve(v.id)}
                                                    style={{
                                                        background: '#16a34a', color: 'white',
                                                        border: 'none', padding: '7px 16px',
                                                        borderRadius: '4px', fontSize: '12px',
                                                        fontWeight: '600', cursor: 'pointer'
                                                    }}
                                                >Re-approve</button>
                                            </td>
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
