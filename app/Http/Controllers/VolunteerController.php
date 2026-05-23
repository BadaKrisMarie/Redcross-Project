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
        $volunteers = User::role('volunteer')->get();

        return Inertia::render('Admin/Volunteers', [
            'volunteers' => $volunteers,
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

        // Send Gmail notification
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

        // Send Gmail notification
        Mail::to($user->email)->send(new VolunteerRejected($user));

        return redirect()->route('admin.volunteers')->with('success', 'Volunteer rejected.');
    }
}