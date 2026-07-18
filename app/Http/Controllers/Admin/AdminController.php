<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Attendance;
use App\Models\Document;
use App\Models\User;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function dashboard()
    {
        // ── Metric cards ──────────────────────────────────────────────
        $totalVolunteers = User::role('volunteer')->count();

        $activeToday = Attendance::whereDate('date', today())
            ->distinct('user_id')
            ->count('user_id');

        $pendingCount = User::role('volunteer')
            ->where('status', 'pending')
            ->count();

        // ── Recent volunteers (latest 5) ──────────────────────────────
        $recentVolunteers = User::role('volunteer')
            ->latest()
            ->get(['id', 'name', 'email', 'status', 'photo'])
            ->map(fn($user) => [
                'initials' => collect(explode(' ', $user->name))
                                ->map(fn($w) => strtoupper($w[0] ?? ''))
                                ->take(2)
                                ->join(''),
                'name'   => $user->name,
                'branch' => 'Muntinlupa City Branch',
                'status' => match($user->status) {
                    'approved' => 'Active',
                    'pending'  => 'Incomplete docs',
                    default    => 'Inactive',
                },
                'photo'  => $user->photo ? asset('storage/' . $user->photo) : null,
            ])
            ->values()
            ->toArray();

        // ── Volunteer status breakdown ─────────────────────────────────
        $volunteerStats = [
            'active'         => User::role('volunteer')->where('status', 'approved')->count(),
            'incompleteDocs' => User::role('volunteer')->where('status', 'pending')->count(),
            'inactive'       => User::role('volunteer')->where('status', 'inactive')->count(),
        ];

        // ── Upcoming events (next 4 activities) ───────────────────────
        $upcomingEvents = Activity::where('status', 'upcoming')
            ->where('date', '>=', today())
            ->orderBy('date')
            ->take(4)
            ->get(['id', 'name', 'date'])
            ->map(fn($a) => [
                'name'  => $a->name,
                'date'  => \Carbon\Carbon::parse($a->date)->format('M d'),
                'color' => '#DC2626',
            ]);

        // ── Quick stats ───────────────────────────────────────────────
        $totalHours = Attendance::sum('hours_rendered');
        $approvedCount = User::role('volunteer')->where('status', 'approved')->count();

        $quickStats = [
            'avgHours'           => $approvedCount > 0
                                        ? round($totalHours / $approvedCount)
                                        : 0,
            'totalHours'         => $totalHours,
            'activeBranches'     => 1,
            'trainingsThisMonth' => Activity::where('status', 'completed')
                                        ->whereMonth('date', now()->month)
                                        ->count(),
            'totalActivities'    => Activity::count(),
        ];

        // ── Pending documents ─────────────────────────────────────────
        $pendingDocuments = Document::with('user')
            ->where('status', 'pending')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($doc) => [
                'id'        => $doc->id,
                'user_id'   => $doc->user_id,
                'name'      => $doc->user->name,
                'type'      => strtoupper($doc->type),
                'file_url'  => $doc->file_path ? route('admin.documents.file', $doc->id) : null, // ← BINAGO
                'photo'     => $doc->user->photo ? asset('storage/' . $doc->user->photo) : null,
                'initials'  => collect(explode(' ', $doc->user->name))
                                ->map(fn($w) => strtoupper($w[0] ?? ''))
                                ->take(2)
                                ->join(''),
                'color_id'  => $doc->user_id % 5,
            ])
            ->values()
            ->toArray();

        // ── Volunteer activity analytics (para sa bar chart) ───────────
        // Awtomatikong kukuha ng lahat ng taon na may attendance record.
        $availableYears = Attendance::selectRaw('YEAR(date) as year')
            ->distinct()
            ->orderByDesc('year')
            ->pluck('year');

        if ($availableYears->isEmpty()) {
            $availableYears = collect([now()->year]);
        }

        $currentYear  = now()->year;
        $currentMonth = now()->month;

        $activityStatsByYear = [];

        foreach ($availableYears as $year) {
            // Ilang distinct volunteer ang nag-attend kada buwan sa taong ito
            $attendedPerMonth = Attendance::selectRaw('MONTH(date) as month, COUNT(DISTINCT user_id) as total')
                ->whereYear('date', $year)
                ->groupBy('month')
                ->pluck('total', 'month');

            // Hanggang current month lang kung kasalukuyang taon; buong 12 kung nakaraan
            $monthLimit = ($year == $currentYear) ? $currentMonth : 12;

            $monthly = [];
            for ($m = 1; $m <= $monthLimit; $m++) {
                $attended = $attendedPerMonth[$m] ?? 0;
                // "Missed" = approved volunteers na hindi nag-attend ng kahit isang beses sa buwang ito
                $missed = max($approvedCount - $attended, 0);

                $monthly[] = [
                    'month'    => \Carbon\Carbon::create()->month($m)->format('M'),
                    'attended' => $attended,
                    'missed'   => $missed,
                ];
            }

            $activityStatsByYear[$year] = $monthly;
        }

        return Inertia::render('Admin/Dashboard', [
            'pendingCount'         => $pendingCount,
            'totalVolunteers'      => $totalVolunteers,
            'activeToday'          => $activeToday,
            'recentVolunteers'     => $recentVolunteers,
            'pendingDocuments'     => $pendingDocuments,
            'volunteerStats'       => $volunteerStats,
            'upcomingEvents'       => $upcomingEvents,
            'quickStats'           => $quickStats,
            'activityStatsByYear'  => $activityStatsByYear,
        ]);
    }
}