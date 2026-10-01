import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import ActivityLocationMap from '@/Components/ActivityLocationMap';
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    Search,
    Navigation,
    ArrowLeft,
    Check,
    Save,
    Info,
} from 'lucide-react';

export default function Create({ volunteers = [] }) {
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
    const [searchAddress, setSearchAddress] = useState('');

    const getInitials = (name) =>
        (name || '?').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.activities.store'));
    };

    const handleVolunteerToggle = (id) => {
        const current = data.volunteer_ids;
        if (current.includes(id)) {
            setData('volunteer_ids', current.filter((v) => v !== id));
        } else {
            setData('volunteer_ids', [...current, id]);
        }
    };

    const handleSelectAllVolunteers = () => {
        if (data.volunteer_ids.length === filteredVolunteers.length) {
            setData('volunteer_ids', []);
        } else {
            setData('volunteer_ids', filteredVolunteers.map((v) => v.id));
        }
    };

    const searchLocation = async () => {
        if (!searchAddress.trim()) {
            alert('Please enter an address or landmark to search.');
            return;
        }
        setSearchLoading(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchAddress)}&format=json&limit=1`
            );
            const results = await res.json();
            if (results.length > 0) {
                const name = results[0].display_name.split(',').slice(0, 3).join(',');
                setData((prev) => ({
                    ...prev,
                    latitude: parseFloat(results[0].lat).toFixed(8),
                    longitude: parseFloat(results[0].lon).toFixed(8),
                    location_name: prev.location_name || name,
                }));
            } else {
                alert('Location not found. Please try a more specific address.');
            }
        } catch {
            alert('Search failed. Please check internet connection or enter coordinates manually.');
        }
        setSearchLoading(false);
    };

    const detectLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }
        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setData((prev) => ({
                    ...prev,
                    latitude: pos.coords.latitude.toFixed(8),
                    longitude: pos.coords.longitude.toFixed(8),
                }));
                setLocationLoading(false);
            },
            () => {
                alert('Could not detect location. Please search or enter coordinates manually.');
                setLocationLoading(false);
            },
            { enableHighAccuracy: true }
        );
    };

    const filteredVolunteers = volunteers.filter(
        (v) =>
            (v.name || '').toLowerCase().includes(volunteerSearch.toLowerCase()) ||
            (v.email || '').toLowerCase().includes(volunteerSearch.toLowerCase())
    );

    return (
        <>
            <Head title="Create Activity - Admin Portal" />

            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header with Back Button */}
                <div className="flex items-center justify-between">
                    <div>
                        <Link
                            href={route('admin.activities.index')}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition mb-1"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Back to Activities</span>
                        </Link>
                        <h2 className="text-xl font-bold text-gray-900">Create New Activity</h2>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Card 1: Basic Information & Schedule */}
                    <div className="bg-white rounded-2xl p-5 sm:p-6 space-y-5">
                        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                            <Calendar className="w-4 h-4 text-red-600" />
                            <h3 className="text-sm font-bold text-gray-900">Activity Details & Schedule</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Name */}
                            <div className="sm:col-span-2 space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 block">
                                    Activity Title *
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. Community Blood Donation Drive 2026"
                                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                                />
                                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                            </div>

                            {/* Description */}
                            <div className="sm:col-span-2 space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 block">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Provide detailed instructions or overview of the activity..."
                                    className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                                />
                                {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
                            </div>

                            {/* Assigned By */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 block">
                                    Assigned By
                                </label>
                                <input
                                    type="text"
                                    value={data.assigned_by}
                                    onChange={(e) => setData('assigned_by', e.target.value)}
                                    placeholder="e.g. Director Juan Dela Cruz"
                                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                                />
                                {errors.assigned_by && <p className="text-xs text-red-600 mt-1">{errors.assigned_by}</p>}
                            </div>

                            {/* Status */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 block">
                                    Status
                                </label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition font-medium"
                                >
                                    <option value="upcoming">Upcoming</option>
                                    <option value="ongoing">Ongoing</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            {/* Date */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 block">
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    value={data.date}
                                    onChange={(e) => setData('date', e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                                />
                                {errors.date && <p className="text-xs text-red-600 mt-1">{errors.date}</p>}
                            </div>

                            {/* Times Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700 block">
                                        Start Time
                                    </label>
                                    <input
                                        type="time"
                                        value={data.start_time}
                                        onChange={(e) => setData('start_time', e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                                    />
                                    {errors.start_time && <p className="text-xs text-red-600 mt-1">{errors.start_time}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700 block">
                                        End Time
                                    </label>
                                    <input
                                        type="time"
                                        value={data.end_time}
                                        onChange={(e) => setData('end_time', e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                                    />
                                    {errors.end_time && <p className="text-xs text-red-600 mt-1">{errors.end_time}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Geofenced Location */}
                    <div className="bg-white rounded-2xl p-5 sm:p-6 space-y-5">
                        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                            <MapPin className="w-4 h-4 text-red-600" />
                            <h3 className="text-sm font-bold text-gray-900">Check-in Location & Geofencing</h3>
                        </div>

                        {/* Search & Auto-detect bar */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                            <div className="sm:col-span-7 space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 block">
                                    Search Address or Landmark
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={searchAddress}
                                        onChange={(e) => setSearchAddress(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchLocation())}
                                        placeholder="e.g. Alabang Town Center, Muntinlupa"
                                        className="flex-1 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                                    />
                                    <button
                                        type="button"
                                        onClick={searchLocation}
                                        disabled={searchLoading}
                                        className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                                    >
                                        <Search className="w-3.5 h-3.5" />
                                        <span>{searchLoading ? 'Searching...' : 'Search'}</span>
                                    </button>
                                </div>
                            </div>

                            <div className="sm:col-span-5 flex justify-start sm:justify-end">
                                <button
                                    type="button"
                                    onClick={detectLocation}
                                    disabled={locationLoading}
                                    className="w-full sm:w-auto px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition flex items-center justify-center gap-1.5"
                                >
                                    <Navigation className="w-3.5 h-3.5" />
                                    <span>{locationLoading ? 'Detecting...' : 'Detect GPS Location'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Location Details Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 block">
                                    Location Display Name *
                                </label>
                                <input
                                    type="text"
                                    value={data.location_name}
                                    onChange={(e) => setData('location_name', e.target.value)}
                                    placeholder="e.g. Barangay Hall Bulacan"
                                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                                />
                                {errors.location_name && <p className="text-xs text-red-600 mt-1">{errors.location_name}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 block">
                                    Latitude
                                </label>
                                <input
                                    type="text"
                                    value={data.latitude}
                                    onChange={(e) => setData('latitude', e.target.value)}
                                    placeholder="e.g. 14.383000"
                                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                                />
                                {errors.latitude && <p className="text-xs text-red-600 mt-1">{errors.latitude}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 block">
                                    Longitude
                                </label>
                                <input
                                    type="text"
                                    value={data.longitude}
                                    onChange={(e) => setData('longitude', e.target.value)}
                                    placeholder="e.g. 121.048000"
                                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                                />
                                {errors.longitude && <p className="text-xs text-red-600 mt-1">{errors.longitude}</p>}
                            </div>
                        </div>

                        {/* Radius Slider / Input */}
                        <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-gray-700">
                                    Geofence Allowed Radius: {data.radius_meters || 100} meters
                                </span>
                                <span className="text-gray-400">Volunteers must check-in within this perimeter</span>
                            </div>
                            <input
                                type="range"
                                min="20"
                                max="1000"
                                step="10"
                                value={data.radius_meters}
                                onChange={(e) => setData('radius_meters', Number(e.target.value))}
                                className="w-full accent-red-600 cursor-pointer"
                            />
                        </div>

                        {/* Live Leaflet Map Preview */}
                        <ActivityLocationMap
                            latitude={data.latitude}
                            longitude={data.longitude}
                            radius={data.radius_meters}
                            locationName={data.location_name}
                        />
                    </div>

                    {/* Card 3: Assign Volunteers */}
                    <div className="bg-white rounded-2xl p-5 sm:p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-red-600" />
                                <h3 className="text-sm font-bold text-gray-900">
                                    Assign Volunteers ({data.volunteer_ids.length} selected)
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={handleSelectAllVolunteers}
                                className="text-xs font-bold text-red-600 hover:text-red-700 self-start sm:self-auto"
                            >
                                {data.volunteer_ids.length === filteredVolunteers.length && filteredVolunteers.length > 0
                                    ? 'Deselect All'
                                    : 'Select All Available'}
                            </button>
                        </div>

                        {/* Search Volunteers Input */}
                        <div className="relative">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={volunteerSearch}
                                onChange={(e) => setVolunteerSearch(e.target.value)}
                                placeholder="Search volunteers by name or email..."
                                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition"
                            />
                        </div>

                        {/* Volunteers Checkbox Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto p-1">
                            {filteredVolunteers.length === 0 ? (
                                <div className="col-span-full py-8 text-center text-xs text-gray-400">
                                    No volunteers found matching your query.
                                </div>
                            ) : (
                                filteredVolunteers.map((v) => {
                                    const isAssigned = data.volunteer_ids.includes(v.id);
                                    return (
                                        <div
                                            key={v.id}
                                            onClick={() => handleVolunteerToggle(v.id)}
                                            className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2.5 ${
                                                isAssigned
                                                    ? 'bg-red-50/70 border-red-300 ring-1 ring-red-500/30'
                                                    : 'bg-gray-50/50 border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="w-7 h-7 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                                                    {getInitials(v.name)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-xs font-bold text-gray-900 truncate">
                                                        {v.name}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 truncate">
                                                        {v.email}
                                                    </div>
                                                </div>
                                            </div>

                                            <div
                                                className={`w-5 h-5 rounded-md flex items-center justify-center border transition shrink-0 ${
                                                    isAssigned
                                                        ? 'bg-red-600 border-red-600 text-white'
                                                        : 'border-gray-300 bg-white'
                                                }`}
                                            >
                                                {isAssigned && <Check className="w-3.5 h-3.5" />}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Link
                            href={route('admin.activities.index')}
                            className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-2 disabled:opacity-50 shadow-xs"
                        >
                            <Save className="w-4 h-4" />
                            <span>{processing ? 'Creating Activity...' : 'Create Activity'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

Create.layout = (page) => <AdminLayout title="Create Activity">{page}</AdminLayout>;