<?php

namespace App\Services;

use App\Models\DisasterAlert;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Symfony\Component\DomCrawler\Crawler;

/**
 * Scrapes the PHIVOLCS latest-earthquakes bulletin page and stores
 * new entries into the disaster_alerts table.
 *
 * NOTE: PHIVOLCS does not offer a stable public JSON API, so this
 * relies on parsing their HTML bulletin table. The page contains many
 * layout tables; the actual earthquake data table is identified by
 * looking for its header row (contains "Latitude"), rather than by a
 * fixed index, since PHIVOLCS may reorder layout tables over time.
 */
class PhivolcsAlertScraper
{
    protected string $sourceUrl = 'https://earthquake.phivolcs.dost.gov.ph/';

    public function run(): int
    {
        ini_set('memory_limit', '512M');

        $inserted = 0;
        try {
            $response = Http::withoutVerifying()->timeout(15)
                ->withHeaders(['User-Agent' => 'Mozilla/5.0 (compatible; RedCrossAlertBot/1.0)'])
                ->get($this->sourceUrl);

            if (! $response->successful()) {
                Log::warning('PHIVOLCS scraper: non-200 response', ['status' => $response->status()]);
                return 0;
            }

            $crawler = new Crawler($response->body());

            // Find the data table by checking each table's header row for "Latitude".
            $dataTable = null;
            foreach ($crawler->filter('table') as $domTable) {
                $tableCrawler = new Crawler($domTable);
                $rows = $tableCrawler->filter('tr');
                if ($rows->count() === 0) {
                    continue;
                }
                $headerText = trim($rows->first()->text());
                if (stripos($headerText, 'Latitude') !== false) {
                    $dataTable = $tableCrawler;
                    break;
                }
            }

            if (! $dataTable) {
                Log::warning('PHIVOLCS: earthquake data table not found, layout may have changed');
                return 0;
            }

            $rows = $dataTable->filter('tr')->slice(1, 20); // skip header row, cap at 20

            foreach ($rows as $domRow) {
                $row = new Crawler($domRow);
                $cells = $row->filter('td');
                if ($cells->count() < 6) {
                    continue; // not a data row
                }

                $dateTimeText = trim($cells->eq(0)->text(''));
                $latitude     = trim($cells->eq(1)->text(''));
                $longitude    = trim($cells->eq(2)->text(''));
                $depth        = trim($cells->eq(3)->text(''));
                $magnitude    = trim($cells->eq(4)->text(''));
                $location     = trim($cells->eq(5)->text(''));

                if ($dateTimeText === '' || $location === '') {
                    continue;
                }

                $mapUrl = "https://staticmap.openstreetmap.de/staticmap.php?center={$latitude},{$longitude}&zoom=7&size=320x240&maptype=mapnik&markers={$latitude},{$longitude},red-pushpin";
                $issuedAt = $this->parseDateTime($dateTimeText);
                $externalId = 'phivolcs-' . md5($dateTimeText . $latitude . $longitude . $magnitude);

                $alert = DisasterAlert::firstOrCreate(
                    ['external_id' => $externalId],
                    [
                        'type'        => 'earthquake',
                        'source'      => 'PHIVOLCS',
                        'title'       => "Magnitude {$magnitude} earthquake - {$location}",
                        'description' => "Lat: {$latitude}, Lon: {$longitude}",
                        'magnitude'   => $magnitude,
                        'depth'       => $depth,
                        'location'    => $location,
                        'source_url'  => $this->sourceUrl,
                        'image_url'   => $mapUrl,
                        'issued_at'   => $issuedAt,
                    ]
                );

                if ($alert->wasRecentlyCreated) {
                    $inserted++;
                }
            }
        } catch (\Throwable $e) {
            Log::error('PHIVOLCS scraper failed: ' . $e->getMessage());
        }

        return $inserted;
    }

    protected function parseDateTime(string $raw): ?string
    {
        try {
            // PHIVOLCS format is typically "07 July 2026 - 08:15 PM"
            return \Carbon\Carbon::parse(str_replace(' - ', ' ', $raw))->toDateTimeString();
        } catch (\Throwable $e) {
            return now()->toDateTimeString();
        }
    }
}

