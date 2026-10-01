import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import VolunteerLayout from '@/Layouts/VolunteerLayout';

import VolunteerQuickAttendanceCard from '@/Components/Volunteer/Dashboard/VolunteerQuickAttendanceCard';
import VolunteerTodayActivitiesCard from '@/Components/Volunteer/Dashboard/VolunteerTodayActivitiesCard';
import VolunteerUpcomingActivitiesCard from '@/Components/Volunteer/Dashboard/VolunteerUpcomingActivitiesCard';
import VolunteerActivityDetailModal from '@/Components/Volunteer/Dashboard/VolunteerActivityDetailModal';

function VolunteerDashboard({
    auth,
    totalHours = 0,
    totalDays = 0,
    monthDays = 0,
    assignedActivities = [],
    todaysActivities = [],
    recentAttendance = [],
    todayAttendance = null,
}) {
    const volunteer = auth?.user || {};

    // Availability State
    const [availability, setAvailability] = useState(Boolean(volunteer.is_available));
    const [savingAvailability, setSavingAvailability] = useState(false);

    // Activity detail modal state
    const [selectedActivity, setSelectedActivity] = useState(null);

    // Toggle volunteer deployment availability
    const toggleAvailability = async () => {
        const next = !availability;
        setAvailability(next);
        setSavingAvailability(true);
        try {
            await axios.patch(route('volunteer.availability.update'), { is_available: next });
        } catch {
            setAvailability(!next);
        } finally {
            setSavingAvailability(false);
        }
    };

    // Filter upcoming activities (scheduled strictly after today)
    const todayStr = useMemo(() => {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }, []);

    const upcomingActivities = useMemo(() => {
        return (assignedActivities || []).filter((act) => {
            if (!act.date) return false;
            const actDate = act.date.slice(0, 10);
            return actDate > todayStr;
        });
    }, [assignedActivities, todayStr]);

    return (
        <>
            <Head title="Dashboard - Volunteer Portal" />

            <div className="space-y-6 max-w-6xl mx-auto pb-12">
                {/* Header: Greeting & Chapter Info */}
                <div className="pt-1 pb-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                        Welcome back, {volunteer.name || 'Volunteer'}
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                        Philippine Red Cross · Muntinlupa City Chapter
                    </p>
                </div>

                {/* 1. Quick Action Attendance Card */}
                <VolunteerQuickAttendanceCard
                    volunteer={volunteer}
                    todayAttendance={todayAttendance}
                    recentAttendance={recentAttendance}
                    totalHours={totalHours}
                    totalDays={totalDays}
                    availability={availability}
                    savingAvailability={savingAvailability}
                    onToggleAvailability={toggleAvailability}
                />

                {/* 2 & 3. Today's Activities & Upcoming Activities */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    {/* Today's Activities */}
                    <VolunteerTodayActivitiesCard
                        activities={todaysActivities}
                        onSelectActivity={setSelectedActivity}
                    />

                    {/* Upcoming Activities */}
                    <VolunteerUpcomingActivitiesCard
                        activities={upcomingActivities}
                        onSelectActivity={setSelectedActivity}
                    />
                </div>
            </div>

            {/* Activity Details Modal */}
            <VolunteerActivityDetailModal
                selectedActivity={selectedActivity}
                setSelectedActivity={setSelectedActivity}
            />
        </>
    );
}

VolunteerDashboard.layout = (page) => <VolunteerLayout title="Dashboard">{page}</VolunteerLayout>;

export default VolunteerDashboard;
