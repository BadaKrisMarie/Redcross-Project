<?php

namespace App\Http\Controllers\Volunteer;

use App\Http\Controllers\Controller;
use App\Models\VolunteerLiveLocation;
use Illuminate\Http\Request;
use Carbon\Carbon;

class LocationPingController extends Controller
{
    // Called periodically (every ~15-20s) by the volunteer's browser while they're
    // checked in to an activity (time_in done, time_out not yet done). Upserts a
    // single row per user+activity, so this table never grows unbounded.
    public function store(Request $request)
    {
        $request->validate([
            'activity_id' => 'required|exists:activities,id',
            'latitude'    => 'required|numeric',
            'longitude'   => 'required|numeric',
        ]);

        $user = auth()->user();

        VolunteerLiveLocation::updateOrCreate(
            [
                'user_id'     => $user->id,
                'activity_id' => $request->activity_id,
            ],
            [
                'latitude'     => $request->latitude,
                'longitude'    => $request->longitude,
                'last_ping_at' => Carbon::now(),
            ]
        );

        return response()->json(['message' => 'ok']);
    }

    // Called by the volunteer's browser right after a successful time-out, to stop
    // showing them on the admin live map immediately (rather than waiting for the
    // stale-ping cleanup window).
    public function clear(Request $request)
    {
        $request->validate([
            'activity_id' => 'required|exists:activities,id',
        ]);

        VolunteerLiveLocation::where('user_id', auth()->id())
            ->where('activity_id', $request->activity_id)
            ->delete();

        return response()->json(['message' => 'ok']);
    }
}
