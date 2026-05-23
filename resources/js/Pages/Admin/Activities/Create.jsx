import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

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
        color: '#dc2626',
        fontSize: '12px',
        marginTop: '4px',
    };

    return (
        <>
            <Head title="Create Activity" />
            <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ marginBottom: '24px' }}>
                    <Link href={route('admin.activities.index')} style={{ color: '#6b7280', textDecoration: 'none', fontSize: '14px' }}>
                        ← Back to Activities
                    </Link>
                    <h1 style={{ fontSize: '24px', fontWeight: '700', margin: '8px 0 0' }}>Create Activity</h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'grid', gap: '20px' }}>

                        {/* Name */}
                        <div>
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
                        <div>
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

                        {/* Date and Times */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
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

                        {/* Address Search */}
                        <div>
                            <label style={labelStyle}>Search Address (auto-fills coordinates)</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px' }}>
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
                                    {searchLoading ? 'Searching...' : '🔍 Search'}
                                </button>
                            </div>
                            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px' }}>
                                Search fills the coordinates automatically. Or click 📍 Use My Location below.
                            </p>
                        </div>

                        {/* Coordinates */}
                        <div>
                            <label style={labelStyle}>GPS Coordinates *</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
                                <div>
                                    <input
                                        type="number"
                                        step="any"
                                        value={data.latitude}
                                        onChange={e => setData('latitude', e.target.value)}
                                        style={inputStyle}
                                        placeholder="Latitude (auto-filled)"
                                    />
                                    {errors.latitude && <p style={errorStyle}>{errors.latitude}</p>}
                                </div>
                                <div>
                                    <input
                                        type="number"
                                        step="any"
                                        value={data.longitude}
                                        onChange={e => setData('longitude', e.target.value)}
                                        style={inputStyle}
                                        placeholder="Longitude (auto-filled)"
                                    />
                                    {errors.longitude && <p style={errorStyle}>{errors.longitude}</p>}
                                </div>
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
                                    {locationLoading ? 'Detecting...' : '📍 Use My Location'}
                                </button>
                            </div>
                        </div>

                        {/* Radius */}
                        <div>
                            <label style={labelStyle}>Allowed Radius (meters)</label>
                            <input
                                type="number"
                                value={data.radius_meters}
                                onChange={e => setData('radius_meters', e.target.value)}
                                style={{ ...inputStyle, width: '200px' }}
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

                        {/* Assign Volunteers */}
                        <div>
                            <label style={labelStyle}>Assign Volunteers</label>
                            {volunteers.length === 0 ? (
                                <p style={{ color: '#6b7280', fontSize: '14px' }}>No approved volunteers yet.</p>
                            ) : (
                                <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                                    {volunteers.map(v => (
                                        <label key={v.id} style={{
                                            display: 'flex', alignItems: 'center', gap: '10px',
                                            padding: '10px 14px', cursor: 'pointer',
                                            borderBottom: '1px solid #f3f4f6',
                                        }}>
                                            <input
                                                type="checkbox"
                                                checked={data.volunteer_ids.includes(v.id)}
                                                onChange={() => handleVolunteerToggle(v.id)}
                                            />
                                            <span style={{ fontSize: '14px' }}>{v.name} <span style={{ color: '#9ca3af' }}>({v.email})</span></span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
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
                                    padding: '10px 24px', background: '#dc2626', color: 'white',
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
