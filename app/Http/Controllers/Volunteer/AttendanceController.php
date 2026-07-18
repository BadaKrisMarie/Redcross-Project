<?php

namespace App\Http\Controllers\Volunteer;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Activity;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $attendances = Attendance::where('user_id', $user->id)
            ->with('activity')
            ->orderBy('date', 'desc')
            ->get();

        // ✅ Changed from ->first() to ->get(): a volunteer can be assigned to more than
        // one activity on the same day, so we need every today's record (one per activity),
        // not just whichever came first. The frontend matches the right one by activity_id.
        $todayRecords = Attendance::where('user_id', $user->id)
            ->whereDate('date', today())
            ->with('activity')
            ->get();

        $totalHours = Attendance::where('user_id', $user->id)
            ->sum('hours_rendered');

        // Get activities assigned to this volunteer
        $activities = $user->activities()
            ->where('status', '!=', 'cancelled')
            ->whereDate('date', '>=', today())
            ->get(['activities.id', 'activities.name', 'activities.location_name', 'activities.date', 'activities.latitude', 'activities.longitude', 'activities.radius_meters']);

        return Inertia::render('Volunteer/Attendance', [
            'attendances' => $attendances,
            'todayRecords' => $todayRecords, // ✅ renamed from todayRecord (was a single record, now an array)
            'totalHours'  => $totalHours,
            'activities'  => $activities,
            'hasFaceDescriptor' => !empty($user->face_descriptor),
        ]);
    }
}
