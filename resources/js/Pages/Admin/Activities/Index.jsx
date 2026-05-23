import React from 'react';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ activities }) {
    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this activity?')) {
            router.delete(route('admin.activities.destroy', id));
        }
    };

    const statusColor = (status) => {
        switch (status) {
            case 'upcoming': return '#3b82f6';
            case 'ongoing': return '#16a34a';
            case 'completed': return '#6b7280';
            case 'cancelled': return '#dc2626';
            default: return '#6b7280';
        }
    };

    return (
        <>
            <Head title="Activities" />
            <div style={{ padding: '32px', maxWidth: '1100px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>Activities</h1>
                        <p style={{ color: '#6b7280', marginTop: '4px' }}>Manage all Red Cross activities</p>
                    </div>
                    <Link
                        href={route('admin.activities.create')}
                        style={{
                            background: '#dc2626',
                            color: 'white',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: '600',
                        }}
                    >
                        + New Activity
                    </Link>
                </div>

                {activities.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280', background: 'white', borderRadius: '12px' }}>
                        <p style={{ fontSize: '18px' }}>No activities yet.</p>
                        <Link href={route('admin.activities.create')} style={{ color: '#dc2626' }}>Create your first activity</Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {activities.map(activity => (
                            <div key={activity.id} style={{
                                background: 'white',
                                borderRadius: '12px',
                                padding: '20px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                                        <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>{activity.name}</h2>
                                        <span style={{
                                            background: statusColor(activity.status),
                                            color: 'white',
                                            padding: '2px 10px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            textTransform: 'capitalize',
                                        }}>
                                            {activity.status}
                                        </span>
                                    </div>
                                    <p style={{ color: '#6b7280', margin: '0 0 4px', fontSize: '14px' }}>
                                        📅 {activity.date} | ⏰ {activity.start_time} - {activity.end_time}
                                    </p>
                                    <p style={{ color: '#6b7280', margin: '0 0 4px', fontSize: '14px' }}>
                                        📍 {activity.location_name}
                                    </p>
                                    <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
                                        👥 {activity.volunteers?.length ?? 0} volunteer(s) assigned
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Link
                                        href={route('admin.activities.edit', activity.id)}
                                        style={{
                                            background: '#f3f4f6',
                                            color: '#111',
                                            padding: '8px 16px',
                                            borderRadius: '6px',
                                            textDecoration: 'none',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                        }}
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(activity.id)}
                                        style={{
                                            background: '#fee2e2',
                                            color: '#dc2626',
                                            padding: '8px 16px',
                                            borderRadius: '6px',
                                            border: 'none',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
