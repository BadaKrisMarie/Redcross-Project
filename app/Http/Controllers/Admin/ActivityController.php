<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActivityController extends Controller
{
    public function index()
    {
        $activities = Activity::with('volunteers')->latest()->get();
        return Inertia::render('Admin/Activities/Index', [
            'activities' => $activities,
        ]);
    }

    public function create()
    {
        $volunteers = User::role('volunteer')
            ->where('status', 'approved')
            ->get(['id', 'name', 'email']);
        return Inertia::render('Admin/Activities/Create', [
            'volunteers' => $volunteers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'description'     => 'nullable|string',
            'date'            => 'required|date',
            'start_time'      => 'required',
            'end_time'        => 'required',
            'location_name'   => 'required|string',
            'latitude'        => 'required|numeric',
            'longitude'       => 'required|numeric',
            'radius_meters'   => 'integer|min:50|max:1000',
            'status'          => 'in:upcoming,ongoing,completed,cancelled',
            'volunteer_ids'   => 'array',
            'volunteer_ids.*' => 'exists:users,id',
        ]);

        $validated['assigned_by'] = auth()->id();

        $activity = Activity::create($validated);

        if (!empty($validated['volunteer_ids'])) {
            $activity->volunteers()->sync($validated['volunteer_ids']);
        }

        return redirect()->route('admin.activities.index')
            ->with('success', 'Activity created successfully!');
    }

    public function edit(Activity $activity)
    {
        $volunteers = User::role('volunteer')
            ->where('status', 'approved')
            ->get(['id', 'name', 'email']);
        $activity->load('volunteers');
        return Inertia::render('Admin/Activities/Edit', [
            'activity'   => $activity,
            'volunteers' => $volunteers,
        ]);
    }

    public function update(Request $request, Activity $activity)
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'description'     => 'nullable|string',
            'date'            => 'required|date',
            'start_time'      => 'required',
            'end_time'        => 'required',
            'location_name'   => 'required|string',
            'latitude'        => 'required|numeric',
            'longitude'       => 'required|numeric',
            'radius_meters'   => 'integer|min:50|max:1000',
            'status'          => 'in:upcoming,ongoing,completed,cancelled',
            'volunteer_ids'   => 'array',
            'volunteer_ids.*' => 'exists:users,id',
        ]);

        $validated['assigned_by'] = auth()->id();

        $activity->update($validated);
        $activity->volunteers()->sync($validated['volunteer_ids'] ?? []);

        return redirect()->route('admin.activities.index')
            ->with('success', 'Activity updated successfully!');
    }

    public function destroy(Activity $activity)
    {
        $activity->delete();
        return redirect()->route('admin.activities.index')
            ->with('success', 'Activity deleted successfully!');
    }
}