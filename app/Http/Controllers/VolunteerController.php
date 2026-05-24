<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Mail\VolunteerApproved;
use App\Mail\VolunteerRejected;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class VolunteerController extends Controller
{
    public function index()
    {
        $volunteers = User::role('volunteer')
            ->get()
            ->map(fn($v) => [
                'id'         => $v->id,
                'name'       => $v->name,
                'email'      => $v->email,
                'status'     => $v->status,
                'created_at' => $v->created_at,
                'photo'      => $v->photo ? asset('storage/' . $v->photo) : null,
            ]);

        return Inertia::render('Admin/Volunteers', [
            'volunteers' => $volunteers,
        ]);
    }

    public function show($id)
    {
        $volunteer = User::findOrFail($id);

        $totalHours      = \App\Models\Attendance::where('user_id', $volunteer->id)->sum('hours_rendered');
        $attendanceCount = \App\Models\Attendance::where('user_id', $volunteer->id)->count();

        return Inertia::render('Admin/Volunteers/Show', [
            'volunteer' => [
                'id'               => $volunteer->id,
                'name'             => $volunteer->name,
                'email'            => $volunteer->email,
                'status'           => $volunteer->status,
                'phone'            => $volunteer->phone    ?? null,
                'address'          => $volunteer->address  ?? null,
                'birthday'         => $volunteer->birthday ?? null,
                'gender'           => $volunteer->gender   ?? null,
                'created_at'       => $volunteer->created_at,
                'photo'            => $volunteer->photo
                                        ? asset('storage/' . $volunteer->photo)
                                        : null,
                'total_hours'      => $totalHours,
                'attendance_count' => $attendanceCount,
                'documents_count'  => 0,
            ],
        ]);
    }

    public function approve($id)
    {
        $user = User::findOrFail($id);
        $user->update(['status' => 'approved']);

        DB::table('user_notifications')->insert([
            'user_id'    => $user->id,
            'title'      => 'Application Approved!',
            'message'    => 'Congratulations! Your volunteer application has been approved. Welcome to the Red Cross family!',
            'is_read'    => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Mail::to($user->email)->send(new VolunteerApproved($user));

        return redirect()->route('admin.volunteers')->with('success', 'Volunteer approved successfully.');
    }

    public function reject($id)
    {
        $user = User::findOrFail($id);
        $user->update(['status' => 'rejected']);

        DB::table('user_notifications')->insert([
            'user_id'    => $user->id,
            'title'      => 'Application Status Update',
            'message'    => 'We regret to inform you that your volunteer application has not been approved at this time. Please contact us for more information.',
            'is_read'    => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Mail::to($user->email)->send(new VolunteerRejected($user));

        return redirect()->route('admin.volunteers')->with('success', 'Volunteer rejected.');
    }
}