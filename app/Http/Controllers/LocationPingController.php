<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Activity;
use App\Models\User;
use App\Models\VolunteerLiveLocation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $query = Attendance::with(['user', 'activity'])
            ->orderBy('date', 'desc');

        if ($request->volunteer_id) {
            $query->where('user_id', $request->volunteer_id);
        }

        if ($request->activity_id) {
            $query->where('activity_id', $request->activity_id);
        }

        if ($request->date) {
            $query->whereDate('date', $request->date);
        }

        $attendances = $query->get();

        $volunteers = User::role('volunteer')
            ->where('status', 'approved')
            ->get(['id', 'name', 'email']);

        $activities = Activity::orderBy('date', 'desc')
            ->get(['id', 'name', 'date']);

        return Inertia::render('Admin/Attendance', [
            'attendances' => $attendances,
            'volunteers'  => $volunteers,
            'activities'  => $activities,
            'filters'     => $request->only(['volunteer_id', 'activity_id', 'date']),
        ]);
    }

    // ✅ Updated: now also returns the activity's own latitude/longitude (the
    // destination) alongside the volunteer's live coordinates, so the map widget
    // can draw a route line between the two and work out whether the volunteer
    // has arrived, is still on the way, or has left the area.
    public function liveLocations()
    {
        $locations = VolunteerLiveLocation::with(['user:id,name,photo', 'activity:id,name,location_name,latitude,longitude'])
            ->where('last_ping_at', '>=', now()->subSeconds(90))
            ->get()
            ->map(fn ($loc) => [
                'user_id'           => $loc->user_id,
                'user_name'         => $loc->user->name ?? 'Unknown',
                'activity_id'       => $loc->activity_id,
                'activity_name'     => $loc->activity->name ?? '-',
                'location_name'     => $loc->activity->location_name ?? '-',
                'latitude'          => $loc->latitude,
                'longitude'         => $loc->longitude,
                'activity_latitude'  => $loc->activity->latitude ?? null,
                'activity_longitude' => $loc->activity->longitude ?? null,
                'last_ping_at'      => $loc->last_ping_at->diffForHumans(),
            ]);

        return response()->json(['locations' => $locations]);
    }

    public function exportPdf(Request $request)
    {
        $query = Attendance::with(['user', 'activity'])
            ->orderBy('date', 'desc');

        if ($request->volunteer_id) {
            $query->where('user_id', $request->volunteer_id);
        }

        if ($request->activity_id) {
            $query->where('activity_id', $request->activity_id);
        }

        if ($request->date) {
            $query->whereDate('date', $request->date);
        }

        $attendances = $query->get();
        $totalHours = $attendances->sum('hours_rendered');

        $pdf = Pdf::loadHTML($this->generatePdfHtml($attendances, $totalHours))
            ->setPaper('a4', 'landscape');

        return $pdf->download('attendance-report-' . now()->format('Y-m-d') . '.pdf');
    }

    private function generatePdfHtml($attendances, $totalHours)
    {
        $rows = '';
        foreach ($attendances as $record) {
            $timeIn = $record->time_in ? date('h:i A', strtotime($record->time_in)) : '-';
            $timeOut = $record->time_out ? date('h:i A', strtotime($record->time_out)) : '-';
            $date = $record->date ? date('M d, Y', strtotime($record->date)) : '-';
            $hours = $record->hours_rendered ? $record->hours_rendered . ' hrs' : '-';
            $name = $record->user ? $record->user->name : '-';
            $email = $record->user ? $record->user->email : '-';
            $activity = $record->activity ? $record->activity->name : '-';

            $rows .= "
            <tr>
                <td>{$name}</td>
                <td>{$email}</td>
                <td>{$activity}</td>
                <td>{$date}</td>
                <td style='color: green'>{$timeIn}</td>
                <td style='color: red'>{$timeOut}</td>
                <td>{$hours}</td>
            </tr>";
        }

        return "
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; font-size: 12px; color: #111; }
                .header { text-align: center; margin-bottom: 24px; }
                .header h1 { font-size: 20px; color: #DC2626; margin: 0; }
                .header p { font-size: 12px; color: #666; margin: 4px 0 0; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th { background: #DC2626; color: white; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; }
                td { padding: 9px 10px; border-bottom: 1px solid #f0f0f0; font-size: 12px; }
                tr:nth-child(even) { background: #f9fafb; }
                .footer { margin-top: 20px; font-size: 11px; color: #888; text-align: right; }
            </style>
        </head>
        <body>
            <div class='header'>
                <h1>Philippine Red Cross - Muntinlupa Chapter</h1>
                <p>Volunteer Attendance Report | Generated: " . now()->format('F d, Y h:i A') . "</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Volunteer</th>
                        <th>Email</th>
                        <th>Activity</th>
                        <th>Date</th>
                        <th>Time In</th>
                        <th>Time Out</th>
                        <th>Hours</th>
                    </tr>
                </thead>
                <tbody>
                    {$rows}
                </tbody>
            </table>
            <div class='footer'>
                Total Records: {$attendances->count()} | Total Hours Rendered: {$totalHours} hrs
            </div>
        </body>
        </html>";
    }
}