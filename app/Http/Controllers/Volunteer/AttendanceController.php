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

    // ✅ BAGO — dating wala ito kahit naka-route na sa web.php (attendance.timein),
    // kaya kapag tinatawag ito (manual/non-face na time-in) ay laging nagre-resulta
    // sa "Method does not exist" error — walang Attendance record na nagagawa, kaya
    // laging 0 ang "Checked In Today" sa Admin Dashboard. Manual na version ito ng
    // FaceAttendanceController@timeIn — parehong geofence check, walang face match.
    public function timeIn(Request $request)
    {
        $request->validate([
            'activity_id' => 'required|exists:activities,id',
            'latitude'    => 'required|numeric',
            'longitude'   => 'required|numeric',
        ]);

        $user = auth()->user();
        $activity = Activity::findOrFail($request->activity_id);

        $dist = $this->haversineDistance(
            $request->latitude, $request->longitude,
            $activity->latitude, $activity->longitude
        );

        if ($dist > $activity->radius_meters) {
            return response()->json([
                'message' => "You are too far from the activity location. You are {$dist}m away. Allowed: {$activity->radius_meters}m."
            ], 422);
        }

        $existing = Attendance::where('user_id', $user->id)
            ->where('activity_id', $request->activity_id)
            ->whereDate('date', today())
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Already timed in for this activity today.'], 422);
        }

        Attendance::create([
            'user_id'     => $user->id,
            'activity_id' => $request->activity_id,
            'date'        => today(),
            'time_in'     => Carbon::now(),
            'latitude'    => $request->latitude,
            'longitude'   => $request->longitude,
            'method'      => 'manual',
        ]);

        return response()->json(['message' => 'Time in recorded successfully!']);
    }

    // ✅ BAGO — kapareho ng dahilan sa itaas, manual na version ng
    // FaceAttendanceController@timeOut.
    public function timeOut(Request $request)
    {
        $request->validate([
            'activity_id' => 'required|exists:activities,id',
            'latitude'    => 'required|numeric',
            'longitude'   => 'required|numeric',
        ]);

        $user = auth()->user();
        $activity = Activity::findOrFail($request->activity_id);

        $dist = $this->haversineDistance(
            $request->latitude, $request->longitude,
            $activity->latitude, $activity->longitude
        );

        if ($dist > $activity->radius_meters) {
            return response()->json([
                'message' => "You are too far from the activity location. You are {$dist}m away. Allowed: {$activity->radius_meters}m."
            ], 422);
        }

        $record = Attendance::where('user_id', $user->id)
            ->where('activity_id', $request->activity_id)
            ->whereDate('date', today())
            ->first();

        if (!$record || $record->time_out) {
            return response()->json(['message' => 'No valid time-in found for this activity.'], 422);
        }

        $timeOut = Carbon::now();
        $hours = round($record->time_in->diffInMinutes($timeOut) / 60, 2);

        $record->update([
            'time_out'       => $timeOut,
            'hours_rendered' => $hours,
        ]);

        // Same rule as the face check-out: only turn Availability off if the
        // volunteer isn't still checked in somewhere else today.
        $stillCheckedInElsewhere = Attendance::where('user_id', $user->id)
            ->whereDate('date', today())
            ->whereNotNull('time_in')
            ->whereNull('time_out')
            ->exists();

        if (!$stillCheckedInElsewhere) {
            $user->update(['is_available' => false]);
        }

        return response()->json(['message' => "Time out recorded! Hours rendered: {$hours}"]);
    }

    private function haversineDistance($lat1, $lon1, $lat2, $lon2): float
    {
        $R = 6371000;
        $phi1 = deg2rad($lat1);
        $phi2 = deg2rad($lat2);
        $dphi = deg2rad($lat2 - $lat1);
        $dlambda = deg2rad($lon2 - $lon1);
        $a = sin($dphi/2)**2 + cos($phi1)*cos($phi2)*sin($dlambda/2)**2;
        return round($R * 2 * atan2(sqrt($a), sqrt(1-$a)));
    }
}