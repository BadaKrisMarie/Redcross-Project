<?php

namespace App\Console\Commands;

use App\Services\PagasaAlertScraper;
use App\Services\PhivolcsAlertScraper;
use Illuminate\Console\Command;

class FetchDisasterAlerts extends Command
{
    protected $signature = 'disaster-alerts:fetch';

    protected $description = 'Fetch latest disaster alerts from PAGASA and PHIVOLCS';

    public function handle(PagasaAlertScraper $pagasa, PhivolcsAlertScraper $phivolcs)
    {
        $pagasaCount = $pagasa->fetch();
        $phivolcsCount = $phivolcs->run();

        $this->info("PAGASA: {$pagasaCount} new alert(s). PHIVOLCS: {$phivolcsCount} new earthquake(s).");
    }
}