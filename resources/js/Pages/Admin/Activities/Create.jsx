import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import ActivityLocationMap from '@/Components/ActivityLocationMap';

export default function Create({ volunteers }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        date: '',
        start_time: '',
        end_time: '',
        location_name: '',
        latitude: '',
        longitude: '',
        radius_meters: 100,
        status: 'upcoming',
        assigned_by: '',
        volunteer_ids: [],
    });

    const [locationLoading, setLocationLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [volunteerSearch, setVolunteerSearch] = useState('');

    const avatarPalette = [
        { bg: '#fee2e2', text: '#dc2626' },
        { bg: '#dbeafe', text: '#2563eb' },
        { bg: '#ede9fe', text: '#7c3aed' },
        { bg: '#dcfce7', text: '#16a34a' },
        { bg: '#fef3c7', text: '#b45309' },
        { bg: '#fce7f3', text: '#db2777' },
    ];

    const getInitials = (name) => {
        return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.activities.store'));
    };

    const handleVolunteerToggle = (id) => {
        const current = data.volunteer_ids;
        if (current.includes(id)) {
            setData('volunteer_ids', current.filter(v => v !== id));
        } else {
            setData('volunteer_ids', [...current, id]);
        }
    };

    const searchLocation = async () => {
        const q = document.getElementById('location_search').value;
        if (!q) { alert('Please type an address first.'); return; }
        setSearchLoading(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`);
            const results = await res.json();
            if (results.length > 0) {
                const name = results[0].display_name.split(',').slice(0, 3).join(',');
                setData(prev => ({
                    ...prev,
                    latitude: parseFloat(results[0].lat).toFixed(8),
                    longitude: parseFloat(results[0].lon).toFixed(8),
                    location_name: prev.location_name || name,
                }));
                alert('✅ Location found: ' + name);
            } else {
                alert('❌ Location not found. Try a more specific address.');
            }
        } catch {
            alert('❌ Search failed. Please enter coordinates manually.');
        }
        setSearchLoading(false);
    };

    const detectLocation = () => {
        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setData(prev => ({
                    ...prev,
                    latitude: pos.coords.latitude.toFixed(8),
                    longitude: pos.coords.longitude.toFixed(8),
                }));
                setLocationLoading(false);
            },
            () => {
                alert('Could not detect location. Please search or enter manually.');
                setLocationLoading(false);
            }
        );
    };

    const inputStyle = {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        fontSize: '14px',
        boxSizing: 'border-box',
    };

    const labelStyle = {
        display: 'block',
        fontSize: '14px',
        fontWeight: '600',
        marginBottom: '6px',
        color: '#374151',
    };

    const errorStyle = {
        color: '#ff0000',
        fontSize: '12px',
        marginTop: '4px',
    };

    return (
        <>
            <Head title="Create Activity" />
            {/* Custom scrollbar para sa Assign Volunteers list — visible thumb sa gilid,
                katulad ng scrollbar na makikita sa Recent Volunteers list ng dashboard. */}
            <style>{`
                .volunteer-scroll-list {
                    scrollbar-width: thin;
                    scrollbar-color: #d1d5db #f9fafb;
                }
                .volunteer-scroll-list::-webkit-scrollbar {
                    width: 8px;
                }
                .volunteer-scroll-list::-webkit-scrollbar-track {
                    background: #f9fafb;
                    border-radius: 8px;
                }
                .volunteer-scroll-list::-webkit-scrollbar-thumb {
                    background-color: #d1d5db;
                    border-radius: 8px;
                }
                .volunteer-scroll-list::-webkit-scrollbar-thumb:hover {
                    background-color: #4f46e5;
                }
                .volunteer-row {
                    transition: background-color 0.12s ease;
                }
                .volunteer-row:hover {
                    background-color: #eef2ff;
                }
                .volunteer-row input[type="checkbox"] {
                    width: 17px;
                    height: 17px;
                    accent-color: #4f46e5;
                    cursor: pointer;
                    flex-shrink: 0;
                }
            `}</style>
            <div style={{ padding: '32px 40px', width: '100%', boxSizing: 'border-box' }}>

                <form onSubmit={handleSubmit}>
                    <div style={{ background: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 24px' }}>

                        {/* Name */}
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Activity Name *</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                style={inputStyle}
                                placeholder="e.g. Flood Relief - Bulacan"
                            />
                            {errors.name && <p style={errorStyle}>{errors.name}</p>}
                        </div>

                        {/* Description */}
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Description</label>
                            <textarea
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                style={{ ...inputStyle, height: '80px', resize: 'vertical' }}
                                placeholder="Brief description of the activity..."
                            />
                        </div>

                        {/* Assigned By */}
                        <div>
                            <label style={labelStyle}>Assigned By</label>
                            <input
                                type="text"
                                value={data.assigned_by}
                                onChange={e => setData('assigned_by', e.target.value)}
                                style={inputStyle}
                                placeholder="e.g. Dr. John Reyes, Director"
                            />
                            {errors.assigned_by && <p style={errorStyle}>{errors.assigned_by}</p>}
                        </div>

                        {/* Location Name */}
                        <div>
                            <label style={labelStyle}>Location Name *</label>
                            <input
                                type="text"
                                value={data.location_name}
                                onChange={e => setData('location_name', e.target.value)}
                                style={inputStyle}
                                placeholder="e.g. Barangay Hall, Bulacan"
                            />
                            {errors.location_name && <p style={errorStyle}>{errors.location_name}</p>}
                        </div>

                        {/* Date and Times */}
                        <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={labelStyle}>Date *</label>
                                <input
                                    type="date"
                                    value={data.date}
                                    onChange={e => setData('date', e.target.value)}
                                    style={inputStyle}
                                />
                                {errors.date && <p style={errorStyle}>{errors.date}</p>}
                            </div>
                            <div>
                                <label style={labelStyle}>Start Time *</label>
                                <input
                                    type="time"
                                    value={data.start_time}
                                    onChange={e => setData('start_time', e.target.value)}
                                    style={inputStyle}
                                />
                                {errors.start_time && <p style={errorStyle}>{errors.start_time}</p>}
                            </div>
                            <div>
                                <label style={labelStyle}>End Time *</label>
                                <input
                                    type="time"
                                    value={data.end_time}
                                    onChange={e => setData('end_time', e.target.value)}
                                    style={inputStyle}
                                />
                                {errors.end_time && <p style={errorStyle}>{errors.end_time}</p>}
                            </div>
                        </div>

                        {/* Address — search + Use My Location, walang naka-display na
                            coordinates kahit saan. Yung lat/lng ay silently naka-store
                            sa loob ng data.latitude / data.longitude (Inertia form state),
                            ipinapadala pa rin sa backend on submit, pero hindi na
                            ipinapakita sa admin. */}
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Address *</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '12px' }}>
                                <input
                                    type="text"
                                    id="location_search"
                                    placeholder="Type full address e.g. Alabang, Muntinlupa, Philippines"
                                    style={inputStyle}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), searchLocation())}
                                />
                                <button
                                    type="button"
                                    onClick={searchLocation}
                                    disabled={searchLoading}
                                    style={{
                                        padding: '10px 16px', background: '#1d4ed8', color: 'white',
                                        border: 'none', borderRadius: '8px', cursor: 'pointer',
                                        fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap',
                                    }}
                                >
                                    {searchLoading ? 'Searching...' : 'Search'}
                                </button>
                                <button
                                    type="button"
                                    onClick={detectLocation}
                                    disabled={locationLoading}
                                    style={{
                                        padding: '10px 16px', background: '#6b7280', color: 'white',
                                        border: 'none', borderRadius: '8px', cursor: 'pointer',
                                        fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap',
                                    }}
                                >
                                    {locationLoading ? 'Detecting...' : 'Use My Location'}
                                </button>
                            </div>
                           
                            {(errors.latitude || errors.longitude) && (
                                <p style={errorStyle}>Please set a location using Search or Use My Location.</p>
                            )}
                        </div>

                        {/* Radius */}
                        <div>
                            <label style={labelStyle}>Allowed Radius (meters)</label>
                            <input
                                type="number"
                                value={data.radius_meters}
                                onChange={e => setData('radius_meters', e.target.value)}
                                style={inputStyle}
                                min="50"
                                max="99999"
                            />
                            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                                Volunteers must be within this distance to time in. Default: 100 meters.
                            </p>
                        </div>

                        {/* Status */}
                        <div>
                            <label style={labelStyle}>Status</label>
                            <select
                                value={data.status}
                                onChange={e => setData('status', e.target.value)}
                                style={inputStyle}
                            >
                                <option value="upcoming">Upcoming</option>
                                <option value="ongoing">Ongoing</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        {/* Location Preview Map — nagpapakita ng napiling coordinates
                            at geofence radius habang pinupunan ang form sa itaas */}
                        <div style={{ gridColumn: '1 / -1' }}>
                            <ActivityLocationMap
                                latitude={data.latitude}
                                longitude={data.longitude}
                                radius={data.radius_meters}
                                locationName={data.location_name}
                            />
                        </div>

                        {/* Assign Volunteers */}
                        <div style={{ gridColumn: '1 / -1' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <label style={{ ...labelStyle, marginBottom: 0 }}>Assign Volunteers</label>
                                {volunteers.length > 0 && (
                                    <span style={{
                                        fontSize: '12px', fontWeight: '600', color: '#4f46e5',
                                        background: '#e0e7ff', padding: '3px 10px', borderRadius: '999px',
                                    }}>
                                        {data.volunteer_ids.length} selected
                                    </span>
                                )}
                            </div>

                            {volunteers.length === 0 ? (
                                <p style={{ color: '#6b7280', fontSize: '14px' }}>No approved volunteers yet.</p>
                            ) : (
                                <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
                                    <input
                                        type="text"
                                        value={volunteerSearch}
                                        onChange={e => setVolunteerSearch(e.target.value)}
                                        placeholder="Search volunteers by name or email..."
                                        style={{
                                            width: '100%', padding: '10px 14px', border: 'none',
                                            borderBottom: '1px solid #e5e7eb', fontSize: '13px',
                                            boxSizing: 'border-box', outline: 'none', background: '#fafafa',
                                        }}
                                    />
                                    <div
                                        className="volunteer-scroll-list"
                                        style={{ maxHeight: '240px', overflowY: 'scroll' }}
                                    >
                                        {volunteers
                                            .filter(v =>
                                                v.name.toLowerCase().includes(volunteerSearch.toLowerCase()) ||
                                                v.email.toLowerCase().includes(volunteerSearch.toLowerCase())
                                            )
                                            .map((v, i) => {
                                                const color = avatarPalette[i % avatarPalette.length];
                                                const checked = data.volunteer_ids.includes(v.id);
                                                return (
                                                    <label
                                                        key={v.id}
                                                        className="volunteer-row"
                                                        style={{
                                                            display: 'flex', alignItems: 'center', gap: '12px',
                                                            padding: '12px 16px', cursor: 'pointer',
                                                            borderBottom: '1px solid #f3f4f6',
                                                            background: checked ? '#eef2ff' : 'transparent',
                                                        }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={() => handleVolunteerToggle(v.id)}
                                                        />
                                                        <div style={{
                                                            width: '34px', height: '34px', borderRadius: '50%',
                                                            background: color.bg, color: color.text,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontSize: '12px', fontWeight: '700', flexShrink: 0,
                                                        }}>
                                                            {getInitials(v.name)}
                                                        </div>
                                                        <div style={{ minWidth: 0 }}>
                                                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{v.name}</div>
                                                            <div style={{ fontSize: '12px', color: '#9ca3af' }}>{v.email}</div>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <Link
                                href={route('admin.activities.index')}
                                style={{
                                    padding: '10px 20px', background: '#f3f4f6', color: '#374151',
                                    borderRadius: '8px', textDecoration: 'none', fontWeight: '600',
                                }}
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                style={{
                                    padding: '10px 24px', background: '#4f46e5', color: 'white',
                                    border: 'none', borderRadius: '8px', fontWeight: '600',
                                    cursor: processing ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {processing ? 'Creating...' : 'Create Activity'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

// ✅ Persistent layout — para lumabas ang sidebar (AdminLayout) sa page na ito,
// gaya ng ginagawa sa AdminDashboard at iba pang admin pages.
Create.layout = (page) => <AdminLayout title="Create Activity">{page}</AdminLayout>;