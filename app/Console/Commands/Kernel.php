protected function schedule(Schedule $schedule): void
{
    // Tumatakbo tuwing 15 minuto, palitan depende sa gusto mong frequency
    $schedule->command('alerts:fetch')->everyFifteenMinutes()->withoutOverlapping();
}
