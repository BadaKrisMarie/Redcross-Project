<?php

namespace App\Http\Controllers\Volunteer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AvailabilityController extends Controller
{
    public function update(Request $request)
    {
        $request->validate([
            'is_available' => 'required|boolean',
        ]);

        $user = auth()->user();
        $user->update([
            'is_available' => $request->is_available,
        ]);

        return response()->json([
            'message'      => 'Availability updated.',
            'is_available' => $user->is_available,
        ]);
    }
}