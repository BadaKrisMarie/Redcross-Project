protected function schedule(Schedule $schedule): void
{
   $schedule->command('disaster-alerts:fetch')->everyFifteenMinutes()->withoutOverlapping();
    $schedule->command('attendance:mark-absent')->everyFifteenMinutes()->withoutOverlapping();
}