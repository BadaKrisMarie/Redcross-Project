<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class AttendanceTestSeeder extends Seeder
{
    /**
     * TEST DATA LANG ITO — para makita agad kung tama ang itsura ng
     * "Volunteer Activity" chart sa dashboard. Pwede mong burahin ito
     * anytime gamit ang command sa ibaba (tingnan sa dulo ng file).
     *
     * PAALALA: kung may iba pang REQUIRED (NOT NULL) column sa
     * 'attendances' table mo bukod sa user_id, date, at hours_rendered
     * (hal. 'time_in', 'time_out', 'method'), idagdag mo na lang sa
     * $attributes array sa baba — sabihin mo lang at itutulong kita.
     */
    public function run(): void
    {
        $volunteers = User::role('volunteer')
            ->where('status', 'approved')
            ->get();

        if ($volunteers->isEmpty()) {
            $this->command->warn('Walang approved volunteers. Mag-approve muna ng volunteer bago patakbuhin ito.');
            return;
        }

        // Feb hanggang Jul 2026 — para maka-match sa "Last 6 months" na halimbawa
        $months = [2, 3, 4, 5, 6, 7];
        $year = 2026;

        foreach ($months as $month) {
            // Random na bilang ng volunteers na "dumalo" kada buwan (para may variation)
            $attendCount = rand(1, $volunteers->count());
            $attendees = $volunteers->random(min($attendCount, $volunteers->count()));

            foreach ($attendees as $volunteer) {
                $randomDay = rand(1, Carbon::create($year, $month, 1)->daysInMonth);

                $attributes = [
                    'user_id'        => $volunteer->id,
                    'date'           => Carbon::create($year, $month, $randomDay)->format('Y-m-d'),
                    'hours_rendered' => rand(2, 8),
                ];

                Attendance::create($attributes);
            }
        }

        $this->command->info('Tapos na mag-seed ng test attendance records (Feb-Jul 2026).');
    }
}