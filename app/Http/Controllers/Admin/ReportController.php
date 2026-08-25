<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Built against the ACTUAL schema confirmed via Tinker:
 *
 * activities: id, name, description, date, start_time, end_time,
 *             location_name, status, assigned_by, latitude, longitude, radius_meters
 *
 * activity_volunteer (pivot): id, activity_id, user_id
 *   -> who is ASSIGNED to an activity
 *
 * attendances: id, user_id, activity_id, date, time_in, time_out,
 *              hours_rendered, latitude, longitude, method
 *   -> who actually CHECKED IN (via face scan or manual)
 *
 * users: id, badge_number, name, role, branch, face_descriptor, ...
 *
 * Status and geofence are DERIVED here, not stored:
 *   - present  = assigned + has attendance + time_out set
 *   - ongoing  = assigned + has attendance + time_out still null
 *   - absent   = assigned but no attendance row at all
 *   - flagged  = has attendance but the scan location is outside
 *                the activity's radius_meters
 */
class ReportController extends Controller
{
    public function index(Request $request)
    {
        $from = $request->input('from', now()->startOfWeek()->toDateString());
        $to = $request->input('to', now()->endOfWeek()->toDateString());
        $statusFilter = $request->input('status', 'all');
        $search = $request->input('search');

        $rows = $this->baseQuery($from, $to)->get();

        $allRecords = $rows->map(fn ($row) => $this->transformRow($row));

        // Weekly trend computed from the unfiltered set (date range only)
        $weeklyTrend = $allRecords
            ->groupBy(fn ($r) => Carbon::parse($r['rawDate'])->format('D'))
            ->map(fn ($group, $day) => [
                'day' => $day,
                'present' => $group->whereIn('status', ['present', 'ongoing'])->count(),
                'absent' => $group->where('status', 'absent')->count(),
            ])
            ->values();

        $records = $allRecords;

        if ($statusFilter !== 'all') {
            $records = $records->where('status', $statusFilter);
        }

        if ($search) {
            $needle = strtolower($search);
            $records = $records->filter(
                fn ($r) => str_contains(strtolower($r['name']), $needle)
                    || str_contains(strtolower($r['activity']), $needle)
                    || str_contains(strtolower($r['id']), $needle)
            );
        }

        $records = $records->map(fn ($r) => collect($r)->except('rawDate')->all())->values();

        $totals = [
            'volunteers' => DB::table('users')->where('role', 'volunteer')->count(),
            'present' => $allRecords->whereIn('status', ['present', 'ongoing'])->count(),
            'absent' => $allRecords->where('status', 'absent')->count(),
            'flagged' => $allRecords->where('status', 'flagged')->count(),
        ];

        return Inertia::render('Admin/AdminReport', [
            'records' => $records,
            'totals' => $totals,
            'weeklyTrend' => $weeklyTrend,
            'filters' => [
                'from' => $from,
                'to' => $to,
                'status' => $statusFilter,
                'search' => $search,
            ],
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $from = $request->input('from', now()->startOfWeek()->toDateString());
        $to = $request->input('to', now()->endOfWeek()->toDateString());

        $records = $this->baseQuery($from, $to)->get()->map(fn ($row) => $this->transformRow($row));

        $filename = "attendance-report-{$from}-to-{$to}.csv";

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($records) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'ID', 'Volunteer', 'Branch', 'Activity',
                'Time In', 'Time Out', 'Geofence', 'Method', 'Status',
            ]);

            foreach ($records as $r) {
                fputcsv($handle, [
                    $r['id'], $r['name'], $r['branch'], $r['activity'],
                    $r['timeIn'], $r['timeOut'], $r['geofence'], $r['scan'], $r['status'],
                ]);
            }

            fclose($handle);
        };

        return response()->streamDownload($callback, $filename, $headers);
    }

    /**
     * Same data as the CSV export, but rendered as a downloadable PDF
     * via a Blade template + barryvdh/laravel-dompdf.
     */
    public function exportPdf(Request $request)
    {
        $from = $request->input('from', now()->startOfWeek()->toDateString());
        $to = $request->input('to', now()->endOfWeek()->toDateString());

        $allRecords = $this->baseQuery($from, $to)->get()->map(fn ($row) => $this->transformRow($row));

        $totals = [
            'volunteers' => $allRecords->pluck('id')->unique()->count(),
            'present' => $allRecords->whereIn('status', ['present', 'ongoing'])->count(),
            'absent' => $allRecords->where('status', 'absent')->count(),
            'flagged' => $allRecords->where('status', 'flagged')->count(),
        ];

        $records = $allRecords->map(fn ($r) => collect($r)->except('rawDate')->all())->values();

        $pdf = Pdf::loadView('reports.attendance-pdf', [
            'records' => $records,
            'totals' => $totals,
            'from' => $from,
            'to' => $to,
            'generatedAt' => now()->format('M d, Y h:i A'),
        ])->setPaper('a4', 'landscape');

        $filename = "attendance-report-{$from}-to-{$to}.pdf";

        return $pdf->download($filename);
    }

    /**
     * Every volunteer ASSIGNED to an activity in range, left-joined against
     * their actual attendance row (null if they never checked in).
     */
    private function baseQuery(string $from, string $to)
    {
        return DB::table('activity_volunteer as av')
            ->join('activities as a', 'a.id', '=', 'av.activity_id')
            ->join('users as u', 'u.id', '=', 'av.user_id')
            ->leftJoin('attendances as att', function ($join) {
                $join->on('att.activity_id', '=', 'av.activity_id')
                    ->on('att.user_id', '=', 'av.user_id');
            })
            ->whereBetween('a.date', [$from, $to])
            ->select(
                'av.id as pivot_id',
                'u.id as user_id',
                'u.name',
                'u.badge_number',
                'u.branch',
                'a.name as activity_name',
                'a.date as activity_date',
                'a.latitude as activity_lat',
                'a.longitude as activity_lng',
                'a.radius_meters',
                'att.id as attendance_id',
                'att.time_in',
                'att.time_out',
                'att.latitude as scan_lat',
                'att.longitude as scan_lng',
                'att.method'
            );
    }

    private function transformRow($row): array
    {
        $hasAttendance = ! is_null($row->attendance_id);

        $status = 'absent';
        if ($hasAttendance) {
            $status = is_null($row->time_out) ? 'ongoing' : 'present';
        }

        $geofence = 'inside';
        if ($hasAttendance && $row->scan_lat && $row->activity_lat) {
            $distance = $this->distanceMeters(
                (float) $row->scan_lat,
                (float) $row->scan_lng,
                (float) $row->activity_lat,
                (float) $row->activity_lng
            );

            if ($distance > ($row->radius_meters ?? 100)) {
                $geofence = 'flagged';
                $status = 'flagged';
            }
        }

        return [
            'id' => 'PRC-' . str_pad((string) $row->user_id, 4, '0', STR_PAD_LEFT),
            'name' => $row->name,
            'branch' => $row->branch,
            'activity' => $row->activity_name,
            'timeIn' => $row->time_in ? Carbon::parse($row->time_in)->format('h:i A') : '—',
            'timeOut' => $row->time_out ? Carbon::parse($row->time_out)->format('h:i A') : '—',
            'geofence' => $geofence,
            // ✅ FIXED: dating exact match lang sa 'face' ($row->method === 'face'), kaya
            // kung ang naka-save sa DB ay ibang variant (e.g. 'face_recognition',
            // 'face_field', 'facial'), palagi itong bumabagsak sa 'manual' fallback.
            // Ngayon, case-insensitive substring check na — kahit anong variant ng
            // "face" ang laman ng method column, "verified" pa rin ang lalabas.
            'scan' => $this->resolveScanMethod($row->method, $hasAttendance),
            'status' => $status,
            'rawDate' => $row->activity_date,
        ];
    }

    /**
     * Maps the raw `attendances.method` DB value to the display-friendly
     * "scan" value used by the frontend (verified / manual / failed).
     */
    private function resolveScanMethod(?string $method, bool $hasAttendance): string
    {
        if (! $hasAttendance) {
            return 'failed';
        }

        $normalized = strtolower(trim($method ?? ''));

        // Covers 'face', 'face_recognition', 'face_field', 'facial', etc.
        if (str_contains($normalized, 'face')) {
            return 'verified';
        }

        return 'manual';
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
}