<?php

namespace App\Http\Controllers\WebAuthn;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Laragear\WebAuthn\Http\Requests\AssertionRequest;
use Carbon\Carbon;

class WebAuthnAttendanceController extends Controller
{
    public function options(AssertionRequest $request)
    {
        try {
            $options = $request->toVerify();
            return response()->json($options);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function timeIn(Request $request)
    {
        $user = auth()->user();

        try {
            $existing = Attendance::where('user_id', $user->id)
                ->whereDate('date', today())
                ->first();

            if ($existing) {
                return response()->json(['message' => 'Already timed in today.'], 422);
            }

            Attendance::create([
                'user_id' => $user->id,
                'date'    => today(),
                'time_in' => Carbon::now(),
            ]);

            return response()->json(['message' => 'Time in recorded!']);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function timeOut(Request $request)
    {
        $user = auth()->user();

        try {
            $record = Attendance::where('user_id', $user->id)
                ->whereDate('date', today())
                ->first();

            if (!$record || $record->time_out) {
                return response()->json(['message' => 'No valid time-in found.'], 422);
            }

            $timeOut = Carbon::now();
            $hours = round($record->time_in->diffInMinutes($timeOut) / 60, 2);

            $record->update([
                'time_out'       => $timeOut,
                'hours_rendered' => $hours,
            ]);

            return response()->json(['message' => 'Time out recorded! Hours: ' . $hours]);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}