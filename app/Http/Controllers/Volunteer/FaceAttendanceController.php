<?php

namespace App\Http\Controllers\Volunteer;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Activity;
use Illuminate\Http\Request;
use Carbon\Carbon;

class FaceAttendanceController extends Controller
{
    public function registerFace(Request $request)
    {
        $request->validate([
            'face_descriptor' => 'required|array',
        ]);

        $user = auth()->user();
        $user->update([
            'face_descriptor' => json_encode($request->face_descriptor),
        ]);

        return response()->json(['message' => 'Face registered successfully!']);
    }

    public function timeIn(Request $request)
    {
        $request->validate([
            'activity_id'    => 'required|exists:activities,id',
            'face_descriptor'=> 'required|array',
            'latitude'       => 'required|numeric',
            'longitude'      => 'required|numeric',
        ]);

        $user = auth()->user();

        // Check face descriptor exists
        if (!$user->face_descriptor) {
            return response()->json(['message' => 'Face not registered. Please register your face first.'], 422);
        }

        // Check face match
        $stored = json_decode($user->face_descriptor, true);
        $incoming = $request->face_descriptor;
        $distance = $this->euclideanDistance($stored, $incoming);

        if ($distance > 0.6) {
            return response()->json(['message' => 'Face not recognized. Please try again.'], 422);
        }

        // Check location
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

        // Check already timed in
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
        ]);

        return response()->json(['message' => 'Time in recorded successfully!']);
    }

    public function timeOut(Request $request)
    {
        $request->validate([
            'activity_id'    => 'required|exists:activities,id',
            'face_descriptor'=> 'required|array',
            'latitude'       => 'required|numeric',
            'longitude'      => 'required|numeric',
        ]);

        $user = auth()->user();

        // Check face match
        $stored = json_decode($user->face_descriptor, true);
        $incoming = $request->face_descriptor;
        $distance = $this->euclideanDistance($stored, $incoming);

        if ($distance > 0.6) {
            return response()->json(['message' => 'Face not recognized. Please try again.'], 422);
        }

        // Check location
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

        return response()->json(['message' => "Time out recorded! Hours rendered: {$hours}"]);
    }

    private function euclideanDistance(array $a, array $b): float
    {
        $sum = 0;
        foreach ($a as $i => $val) {
            $sum += ($val - ($b[$i] ?? 0)) ** 2;
        }
        return sqrt($sum);
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