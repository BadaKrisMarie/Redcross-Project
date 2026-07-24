<?php

namespace App\Console\Commands;

use App\Models\Activity;
use App\Models\Attendance;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class MarkAbsentVolunteers extends Command
{
    /**
     * php artisan attendance:mark-absent
     */
    protected $signature = 'attendance:mark-absent';

    protected $description = 'Auto-create Absent attendance records for volunteers assigned to activities that already ended without checking in';

    public function handle(): int
    {
        $now = Carbon::now();

        // ✅ Only look at activities whose scheduled end (date + end_time) has already passed.
        // Activities without a date or end_time are skipped — walang basehan kung "tapos na".
        $endedActivities = Activity::query()
            ->whereNotNull('date')
            ->whereNotNull('end_time')
            ->get()
           ->filter(function (Activity $activity) use ($now) {
                // ✅ FIXED: activity.date might be a plain string (not cast to Carbon
                // in the model), so parse it directly instead of calling ->format() on it
                $datePart = is_string($activity->date)
                    ? substr($activity->date, 0, 10)
                    : $activity->date->format('Y-m-d');

                $end = Carbon::parse($datePart . ' ' . $activity->end_time);
                return $end->lessThan($now);
            });

        if ($endedActivities->isEmpty()) {
            $this->info('Walang natapos na activity na kailangang i-check.');
            return self::SUCCESS;
        }

        $createdCount = 0;

        foreach ($endedActivities as $activity) {
            // ✅ Kunin lahat ng naka-assign na volunteer sa activity na ito
            // (galing sa activity_volunteer pivot table)
            $assignedUserIds = DB::table('activity_volunteer')
                ->where('activity_id', $activity->id)
                ->pluck('user_id');

            if ($assignedUserIds->isEmpty()) {
                continue;
            }

            // ✅ Alamin kung sino sa mga assigned na volunteer ang WALANG existing
            // attendance record para sa specific na activity na ito
            $existingUserIds = Attendance::query()
                ->where('activity_id', $activity->id)
                ->whereIn('user_id', $assignedUserIds)
                ->pluck('user_id');

            $absentUserIds = $assignedUserIds->diff($existingUserIds);

            foreach ($absentUserIds as $userId) {
                // ✅ time_in / time_out na null = "Absent" na sa existing frontend logic
                // (Admin & Volunteer views), kaya hindi na kailangan ng bagong "status" column
                Attendance::create([
                    'user_id'        => $userId,
                    'activity_id'    => $activity->id,
                    'date'           => $activity->date,
                    'time_in'        => null,
                    'time_out'       => null,
                    'hours_rendered' => null,
                ]);

                $createdCount++;
            }
        }

        $this->info("Nagawa: {$createdCount} Absent attendance record(s).");
        return self::SUCCESS;
    }
}