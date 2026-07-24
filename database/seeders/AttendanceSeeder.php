<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class AttendanceSeeder extends Seeder
{
    /**
     * Approximate coordinates around Muntinlupa Chapter HQ, used to fake
     * GPS geofencing points for field/face attendance.
     */
    protected float $hqLat = 14.4081;
    protected float $hqLng = 121.0415;

    public function run(): void
    {
        // Adjust this if your 'role' column uses a different value for volunteers
        // (e.g. check via: User::select('role')->distinct()->get() )
        $volunteers = User::where('role', 'volunteer')->get();

        if ($volunteers->isEmpty()) {
            $this->command->warn("No users with role='volunteer' found. Falling back to all users.");
            $volunteers = User::all();
        }

        if ($volunteers->isEmpty()) {
            $this->command->error('No users found at all. Seed users first.');
            return;
        }

        $activities = Activity::all(); // used only for field/deployment attendance, if any exist

        $rows = [];
        $daysBack = 30;

        foreach ($volunteers as $volunteer) {
            for ($day = $daysBack; $day >= 0; $day--) {
                $date = Carbon::now()->subDays($day);

                // Skip weekends most of the time (occasional weekend = emergency deployment)
                if ($date->isWeekend() && ! $this->chance(20)) {
                    continue;
                }

                // 85% attendance rate on eligible days
                if (! $this->chance(85)) {
                    continue;
                }

                // 80% office (fingerprint via WebAuthn), 20% field (face recognition)
                $isField = $this->chance(20);
                $method = $isField ? 'face' : 'fingerprint';

                // --- time in ---
                $inHour = $this->chance(75) ? rand(7, 8) : rand(9, 10);
                $timeIn = $date->copy()->setTime($inHour, rand(0, 59), rand(0, 59));

                // --- time out --- (5% chance forgot to time out)
                $timeOut = null;
                $hoursRendered = null;
                if ($this->chance(95)) {
                    $outHour = rand(16, 18);
                    $timeOut = $date->copy()->setTime($outHour, rand(0, 59), rand(0, 59));
                    $hoursRendered = round($timeIn->diffInMinutes($timeOut) / 60, 2);
                }

                // --- GPS: only meaningful for field/face attendance (geofenced deployment) ---
                $lat = null;
                $lng = null;
                $activityId = null;

                if ($isField) {
                    // small random offset (~within a few km) to simulate deployment sites
                    $lat = $this->hqLat + (rand(-500, 500) / 10000);
                    $lng = $this->hqLng + (rand(-500, 500) / 10000);

                    if ($activities->isNotEmpty()) {
                        $activityId = $activities->random()->id;
                    }
                }

                $rows[] = [
                    'user_id'        => $volunteer->id,
                    'activity_id'    => $activityId,
                    'date'           => $date->toDateString(),
                    'time_in'        => $timeIn,
                    'time_out'       => $timeOut,
                    'hours_rendered' => $hoursRendered,
                    'method'         => $method,
                    'latitude'       => $lat,
                    'longitude'      => $lng,
                    'created_at'     => now(),
                    'updated_at'     => now(),
                ];
            }
        }

        collect($rows)->chunk(500)->each(function ($chunk) {
            Attendance::insert($chunk->toArray());
        });

        $this->command->info(count($rows) . ' fake attendance records seeded for ' . $volunteers->count() . ' volunteers.');
    }

    protected function chance(int $percent): bool
    {
        return rand(1, 100) <= $percent;
    }
}