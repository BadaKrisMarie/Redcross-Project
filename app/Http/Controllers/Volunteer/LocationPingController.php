<?php

namespace App\Http\Controllers\Volunteer;

use App\Http\Controllers\Controller;
use App\Models\VolunteerLiveLocation;
use Illuminate\Http\Request;

class LocationPingController extends Controller
{
    // Called every ~20 seconds by FaceAttendance.jsx while a volunteer is
    // checked in (between Face Time In and Face Time Out). Upserts one row
    // per user+activity so the admin's Live Volunteer Locations map always
    // has the latest coordinates to plot.
    public function store(Request $request)
    {
        $validated = $request->validate([
            'activity_id' => ['required', 'exists:activities,id'],
            'latitude'    => ['required', 'numeric', 'between:-90,90'],
            'longitude'   => ['required', 'numeric', 'between:-180,180'],
        ]);

        VolunteerLiveLocation::updateOrCreate(
            [
                'user_id'     => $request->user()->id,
                'activity_id' => $validated['activity_id'],
            ],
            [
                'latitude'     => $validated['latitude'],
                'longitude'    => $validated['longitude'],
                'last_ping_at' => now(),
            ]
        );

        return response()->json(['status' => 'ok']);
    }

    // Called once when the volunteer Face Time Outs, so their dot disappears
    // from the admin map immediately instead of lingering until the
    // liveLocations() 90-second staleness window expires on its own.
    public function clear(Request $request)
    {
        $validated = $request->validate([
            'activity_id' => ['required', 'exists:activities,id'],
        ]);

        VolunteerLiveLocation::where('user_id', $request->user()->id)
            ->where('activity_id', $validated['activity_id'])
            ->delete();

        return response()->json(['status' => 'ok']);
    }
}