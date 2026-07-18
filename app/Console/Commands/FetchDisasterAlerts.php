<?php

namespace App\Console\Commands;

use App\Services\PagasaAlertScraper;
use App\Services\PhivolcsAlertScraper;
use Illuminate\Console\Command;

class FetchDisasterAlerts extends Command
{
    /**
     * php artisan alerts:fetch
     */
    protected $signature = 'alerts:fetch';

    protected $description = 'Fetch latest PHIVOLCS earthquake and PAGASA weather alerts';

    public function handle(PhivolcsAlertScraper $phivolcs, PagasaAlertScraper $pagasa): int
    {
        ini_set('memory_limit', '512M');

        $this->info('Fetching PHIVOLCS earthquake alerts...');
        $eqCount = $phivolcs->run();
        $this->info("  -> {$eqCount} new earthquake alert(s) saved.");

        $this->info('Fetching PAGASA weather alerts...');
        $wxCount = $pagasa->fetch();
        $this->info("  -> {$wxCount} new weather alert(s) saved.");

        $this->info('Done.');

        return self::SUCCESS;
    }
}
