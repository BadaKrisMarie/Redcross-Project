<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceLogController extends Controller
{
    public function index(Request $request)
    {
        $logs = Attendance::with(['user:id,name,email', 'activity:id,name,location_name'])
            ->orderByDesc('date')
            ->orderByDesc('time_in')
            ->paginate(20)
            ->through(fn ($log) => [
                'id'              => $log->id,
                'volunteer'       => $log->user->name ?? '-',
                'volunteer_email' => $log->user->email ?? '-',
                'activity'        => $log->activity->name ?? '-',
                'location'        => $log->activity->location_name ?? '-',
                'date'            => $log->date,
                'time_in'         => $log->time_in,
                'time_out'        => $log->time_out,
                'hours_rendered'  => $log->hours_rendered,
                'method'          => $log->method,
                'method_label'    => match ($log->method) {
                    'fingerprint' => 'Office (Fingerprint)',
                    'face'        => 'Field (Face Scan)',
                    default       => 'Unknown',
                },
            ]);

        return Inertia::render('Admin/AttendanceLogs', [
            'logs'    => $logs,
            'summary' => $this->summaryStats(),
        ]);
    }

    public function summaryStats(): array
    {
        $today = today();

        return [
            'checkedInNow' => Attendance::whereDate('date', $today)
                ->whereNotNull('time_in')
                ->whereNull('time_out')
                ->count(),

            'totalLogsToday' => Attendance::whereDate('date', $today)->count(),

            'totalLogsThisMonth' => Attendance::whereMonth('date', now()->month)
                ->whereYear('date', now()->year)
                ->count(),

            'totalHoursThisMonth' => (float) Attendance::whereMonth('date', now()->month)
                ->whereYear('date', now()->year)
                ->sum('hours_rendered'),

            'officeLogsThisMonth' => Attendance::whereMonth('date', now()->month)
                ->whereYear('date', now()->year)
                ->where('method', 'fingerprint')
                ->count(),

            'fieldLogsThisMonth' => Attendance::whereMonth('date', now()->month)
                ->whereYear('date', now()->year)
                ->where('method', 'face')
                ->count(),
        ];
    }
}