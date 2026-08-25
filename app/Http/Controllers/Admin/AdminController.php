<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Attendance;
use App\Models\Document;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

        // ✅ BAGO — totoong "online ngayon" count, base sa is_online column
        // (event-driven: nagiging true pag nag-login, false pag nag-logout).
        // Ito yung dating hindi nakukuwenta at kaya laging 0/walang laman
        // ang "Available Volunteers" card sa Dashboard.
        $onlineNowCount = User::role('volunteer')
            ->where('is_online', true)
            ->count();

        // ── Recent volunteers (latest 5) ──────────────────────────────
        // "Online" ay base na sa is_online column (login/logout event-driven),
        // hindi na sa oras ng last_active_at — kaya persistent hanggang mag-logout.
        $recentVolunteers = User::role('volunteer')
            ->latest()
            ->get(['id', 'name', 'email', 'status', 'photo', 'is_available', 'is_online'])
            ->map(fn($user) => [
                'initials' => collect(explode(' ', $user->name))
                                ->map(fn($w) => strtoupper($w[0] ?? ''))
                                ->take(2)
                                ->join(''),
                'name'         => $user->name,
                'branch'       => 'Muntinlupa City Branch',
                'status'       => match($user->status) {
                    'approved' => 'Active',
                    'pending'  => 'Incomplete docs',
                    default    => 'Inactive',
                },
                'photo'        => $user->photo ? asset('storage/' . $user->photo) : null,
                'is_available' => (bool) $user->is_available,
                'is_online'    => (bool) $user->is_online,
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
            ->map(function ($doc) {
                // ✅ Detect mime_type from actual file on disk (kagaya ng sa DocumentController@index)
                // Kailangan ito para malaman ng frontend kung image, PDF, o iba pang uri ng file
                // ang dapat i-preview sa modal, dahil ang file_url galing sa route (walang extension).
               $mimeType = null;
                if ($doc->file_path) {
                    $normalized = str_replace('\\', '/', $doc->file_path);
                    $path = storage_path('app/public/' . $normalized);
                    if (file_exists($path) && filesize($path) > 0) {
                        $mimeType = mime_content_type($path);
                    } else {
                        \Illuminate\Support\Facades\Log::warning('Dashboard pending doc: file missing/empty', [
                            'doc_id' => $doc->id,
                            'resolved_path' => $path,
                            'exists' => file_exists($path),
                        ]);
                    }
                }
                return [
                    'id'        => $doc->id,
                    'user_id'   => $doc->user_id,
                    'name'      => $doc->user->name,
                    'type'      => strtoupper($doc->type),
                    'file_url'  => $doc->file_path ? route('admin.documents.file', $doc->id) : null,
                    'mime_type' => $mimeType, // ✅ BAGO — ginagamit ng frontend para malaman kung image/PDF
                    'photo'     => $doc->user->photo ? asset('storage/' . $doc->user->photo) : null,
                    'initials'  => collect(explode(' ', $doc->user->name))
                                    ->map(fn($w) => strtoupper($w[0] ?? ''))
                                    ->take(2)
                                    ->join(''),
                    'color_id'  => $doc->user_id % 5,
                ];
            })
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

        // ── NEW: Flagged check-ins this week (geofence violations) ─────
        $flaggedThisWeek = $this->countFlaggedThisWeek();

        // ── NEW: Top 5 volunteers by total hours rendered ──────────────
        $topVolunteers = DB::table('attendances as att')
            ->join('users as u', 'u.id', '=', 'att.user_id')
            ->select('u.id', 'u.name', 'u.photo', DB::raw('SUM(att.hours_rendered) as total_hours'))
            ->groupBy('u.id', 'u.name', 'u.photo')
            ->orderByDesc('total_hours')
            ->take(5)
            ->get()
            ->map(fn($row) => [
                'name'  => $row->name,
                'photo' => $row->photo ? asset('storage/' . $row->photo) : null,
                'initials' => collect(explode(' ', $row->name))
                                ->map(fn($w) => strtoupper($w[0] ?? ''))
                                ->take(2)
                                ->join(''),
                'hours' => round((float) $row->total_hours, 1),
            ])
            ->values()
            ->toArray();

        // ── NEW: Today's activities with assigned volunteer count ──────
        $todaysActivities = Activity::whereDate('date', today())
            ->orderBy('start_time')
            ->get(['id', 'name', 'description', 'status', 'start_time', 'end_time', 'location_name'])
            ->map(function ($a) {
                $assignedVolunteers = DB::table('activity_volunteer as av')
                    ->join('users as u', 'u.id', '=', 'av.user_id')
                    ->where('av.activity_id', $a->id)
                    ->pluck('u.name')
                    ->values()
                    ->toArray();

                return [
                    'id'             => $a->id,
                    'name'           => $a->name,
                    'description'    => $a->description,
                    'status'         => $a->status,
                    'time'           => $a->start_time && $a->end_time
                        ? \Carbon\Carbon::parse($a->start_time)->format('h:i A') . ' – ' . \Carbon\Carbon::parse($a->end_time)->format('h:i A')
                        : '—',
                    'location'       => $a->location_name,
                    'assignedCount'  => count($assignedVolunteers),
                    'assignedNames'  => $assignedVolunteers,
                ];
            })
            ->values()
            ->toArray();

        // ── NEW: Volunteer count per branch ─────────────────────────────
        $branchBreakdown = User::role('volunteer')
            ->select('branch', DB::raw('count(*) as total'))
            ->groupBy('branch')
            ->orderByDesc('total')
            ->get()
            ->map(fn($row) => [
                'branch' => $row->branch ?: 'Unspecified',
                'total'  => $row->total,
            ])
            ->values()
            ->toArray();

        // ── NEW: Recent activity log (approvals/rejections + new activities) ──
        $recentActivityLog = $this->buildRecentActivityLog();

        return Inertia::render('Admin/Dashboard', [
            'pendingCount'         => $pendingCount,
            'totalVolunteers'      => $totalVolunteers,
            'activeToday'          => $activeToday,
            'onlineNowCount'       => $onlineNowCount, // ✅ BAGO — pinapasa na ngayon papunta sa "Available Volunteers" card
            'recentVolunteers'     => $recentVolunteers,
            'pendingDocuments'     => $pendingDocuments,
            'volunteerStats'       => $volunteerStats,
            'upcomingEvents'       => $upcomingEvents,
            'quickStats'           => $quickStats,
            'activityStatsByYear'  => $activityStatsByYear,
            'flaggedThisWeek'      => $flaggedThisWeek,
            'topVolunteers'        => $topVolunteers,
            'todaysActivities'     => $todaysActivities,
            'branchBreakdown'      => $branchBreakdown,
            'recentActivityLog'    => $recentActivityLog,
        ]);
    }

    /**
     * 🆕 Global topbar search (ginagamit ng debounced fetch sa
     * AdminLayout.jsx: route('admin.search')?q=...).
     *
     * Naghahanap sa tatlong bagay: volunteers (users na role 'volunteer'),
     * activities, at pending/approved documents — tapos pinagsasama ang
     * lahat papunta sa isang flat na listahan na may pare-parehong hugis
     * ({ id, type, label, subtitle, url }) para diretso na magamit ng
     * dropdown sa frontend.
     */
    public function search(Request $request)
    {
        $q = trim((string) $request->query('q', ''));

        if (strlen($q) < 2) {
            return response()->json(['results' => []]);
        }

        // — Volunteers (pangalan o email) —
        $volunteers = User::role('volunteer')
            ->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                      ->orWhere('email', 'like', "%{$q}%");
            })
            ->limit(5)
            ->get(['id', 'name', 'email'])
            ->map(fn ($v) => [
                'id'       => $v->id,
                'type'     => 'volunteer',
                'label'    => $v->name,
                'subtitle' => $v->email,
                'url'      => route('admin.volunteers.show', $v->id),
            ]);

        // — Activities (pangalan o lokasyon) —
        $activities = Activity::where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                      ->orWhere('location_name', 'like', "%{$q}%");
            })
            ->limit(5)
            ->get(['id', 'name', 'location_name', 'date'])
            ->map(fn ($a) => [
                'id'       => $a->id,
                'type'     => 'activity',
                'label'    => $a->name,
                'subtitle' => $a->location_name
                    ? $a->location_name . ' · ' . \Carbon\Carbon::parse($a->date)->format('M d, Y')
                    : \Carbon\Carbon::parse($a->date)->format('M d, Y'),
                'url'      => route('admin.activities.edit', $a->id),
            ]);

        // — Documents (uri ng dokumento o pangalan ng volunteer na may-ari) —
        $documents = Document::with('user')
            ->where(function ($query) use ($q) {
                $query->where('type', 'like', "%{$q}%")
                      ->orWhereHas('user', function ($uq) use ($q) {
                          $uq->where('name', 'like', "%{$q}%");
                      });
            })
            ->limit(5)
            ->get()
            ->map(fn ($d) => [
                'id'       => $d->id,
                'type'     => 'document',
                'label'    => strtoupper($d->type) . ' — ' . ($d->user->name ?? 'Unknown'),
                'subtitle' => ucfirst($d->status),
                'url'      => route('admin.documents.index'),
            ]);

        $results = $volunteers
            ->concat($activities)
            ->concat($documents)
            ->values()
            ->toArray();

        return response()->json(['results' => $results]);
    }

    /**
     * Counts attendances this week whose scan location falls outside
     * the activity's geofence radius. Mirrors the flagging logic used
     * in Admin\ReportController.
     */
    private function countFlaggedThisWeek(): int
    {
        $from = now()->startOfWeek()->toDateString();
        $to = now()->endOfWeek()->toDateString();

        $rows = DB::table('attendances as att')
            ->join('activities as a', 'a.id', '=', 'att.activity_id')
            ->whereBetween('a.date', [$from, $to])
            ->whereNotNull('att.latitude')
            ->whereNotNull('a.latitude')
            ->select(
                'att.latitude as scan_lat',
                'att.longitude as scan_lng',
                'a.latitude as activity_lat',
                'a.longitude as activity_lng',
                'a.radius_meters'
            )
            ->get();

        $flagged = 0;

        foreach ($rows as $row) {
            $distance = $this->distanceMeters(
                (float) $row->scan_lat,
                (float) $row->scan_lng,
                (float) $row->activity_lat,
                (float) $row->activity_lng
            );

            if ($distance > ($row->radius_meters ?? 100)) {
                $flagged++;
            }
        }

        return $flagged;
    }

    /**
     * Haversine distance in meters between two lat/lng points.
     */
    private function distanceMeters(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371000;

        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Combines recently approved/rejected volunteers and recently created
     * activities into a single reverse-chronological feed of the last 6 events.
     */
    private function buildRecentActivityLog(): array
    {
        $recentStatusChanges = User::role('volunteer')
            ->whereIn('status', ['approved', 'rejected'])
            ->latest('updated_at')
            ->take(5)
            ->get(['name', 'status', 'updated_at'])
            ->map(fn($u) => [
                'text' => $u->status === 'approved'
                    ? "{$u->name}'s application was approved"
                    : "{$u->name}'s application was rejected",
                'timestamp' => $u->updated_at,
            ]);

        $recentActivities = Activity::latest('created_at')
            ->take(5)
            ->get(['name', 'created_at'])
            ->map(fn($a) => [
                'text' => "New activity created: {$a->name}",
                'timestamp' => $a->created_at,
            ]);

        return $recentStatusChanges
            ->concat($recentActivities)
            ->sortByDesc('timestamp')
            ->take(6)
            ->map(fn($item) => [
                'text' => $item['text'],
                'time' => \Carbon\Carbon::parse($item['timestamp'])->diffForHumans(),
            ])
            ->values()
            ->toArray();
    }
}