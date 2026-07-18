<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Symfony\Component\DomCrawler\Crawler;
use Throwable;

/**
 * Scrapes the PHIVOLCS "Latest Earthquake Information" page and returns
 * a clean, structured array of earthquake data for use in the disaster
 * alert banner / DisasterManagement page.
 *
 * Usage:
 *   $service = new PhivolcsEarthquakeService();
 *   $latest = $service->getLatestEarthquakes();          // all parsed rows
 *   $alerts = $service->getSignificantEarthquakes(4.0);  // only "felt" / bolded quakes
 *   $top    = $service->getMostRecentSignificantEarthquake();
 *
 * Route example (routes/api.php):
 *   Route::get('/earthquakes/latest', function (PhivolcsEarthquakeService $svc) {
 *       return response()->json($svc->getLatestEarthquakes());
 *   });
 */
class PhivolcsEarthquakeService
{
    /** Main "latest" page — always shows the most recent entries. */
    protected const SOURCE_URL = 'https://earthquake.phivolcs.dost.gov.ph/';

    protected const CACHE_KEY = 'phivolcs_earthquakes_latest';

    /** How long to cache the parsed result before re-fetching PHIVOLCS. */
    protected const CACHE_TTL_MINUTES = 5;

    protected const USER_AGENT = 'Mozilla/5.0 (compatible; RedCrossMuntinlupaDMS/1.0; +https://redcross-muntinlupa.example)';

    /**
     * Get the latest list of earthquakes (cached).
     *
     * @return array<int, array{
     *     datetime: string,
     *     datetime_raw: string,
     *     latitude: float,
     *     longitude: float,
     *     depth_km: float|null,
     *     magnitude: float|null,
     *     is_significant: bool,
     *     distance_km: int|null,
     *     location: string,
     *     detail_url: string|null,
     * }>
     */
    public function getLatestEarthquakes(bool $forceRefresh = false): array
    {
        if ($forceRefresh) {
            Cache::forget(self::CACHE_KEY);
        }

        return Cache::remember(
            self::CACHE_KEY,
            now()->addMinutes(self::CACHE_TTL_MINUTES),
            function () {
                $html = $this->fetchHtml();

                return $html === null ? [] : $this->parseHtml($html);
            }
        );
    }

    /**
     * Only earthquakes PHIVOLCS marked as significant (bolded magnitude
     * on the source page) OR that meet/exceed the given magnitude.
     */
    public function getSignificantEarthquakes(float $minMagnitude = 4.0, bool $forceRefresh = false): array
    {
        $quakes = $this->getLatestEarthquakes($forceRefresh);

        $filtered = array_filter($quakes, function (array $quake) use ($minMagnitude) {
            return $quake['is_significant'] || ($quake['magnitude'] !== null && $quake['magnitude'] >= $minMagnitude);
        });

        return array_values($filtered);
    }

    /**
     * Convenience helper for the alert banner: the single most recent
     * significant earthquake, or null if there isn't one right now.
     */
    public function getMostRecentSignificantEarthquake(float $minMagnitude = 4.0, bool $forceRefresh = false): ?array
    {
        $quakes = $this->getSignificantEarthquakes($minMagnitude, $forceRefresh);

        return $quakes[0] ?? null;
    }

    /**
     * Fetch the raw HTML from PHIVOLCS.
     */
    protected function fetchHtml(): ?string
    {
        try {
            $response = Http::withHeaders([
                    'User-Agent' => self::USER_AGENT,
                ])
                ->timeout(15)
                ->retry(2, 500)
                ->get(self::SOURCE_URL);

            if (! $response->successful()) {
                Log::warning('PHIVOLCS fetch returned a non-2xx status.', [
                    'status' => $response->status(),
                ]);

                return null;
            }

            return $response->body();
        } catch (Throwable $e) {
            Log::error('PHIVOLCS fetch failed: ' . $e->getMessage());

            return null;
        }
    }

    /**
     * Parse raw PHIVOLCS HTML into a clean array of earthquake data.
     * Public + accepts $html directly so it's easy to unit test with
     * a saved HTML fixture.
     */
    public function parseHtml(string $html): array
    {
        $crawler = new Crawler($html);

        // Every earthquake row has a link to a detail page whose href
        // contains "Earthquake_Information". Selecting rows this way is
        // more resilient than relying on CSS classes (which are
        // inconsistent) or exact table position (the source HTML has
        // some malformed / unclosed <tr> tags here and there).
        $rows = $crawler->filterXPath("//tr[.//a[contains(@href, 'Earthquake_Information')]]");

        $earthquakes = [];

        $rows->each(function (Crawler $row) use (&$earthquakes) {
            $quake = $this->parseRow($row);

            if ($quake !== null) {
                $earthquakes[] = $quake;
            }
        });

        return $earthquakes;
    }

    /**
     * Parse a single <tr> into an earthquake data array.
     * Column order on the source site is always:
     * [0] Date-Time (link)  [1] Latitude  [2] Longitude
     * [3] Depth (km)        [4] Magnitude [5] Location
     */
    protected function parseRow(Crawler $row): ?array
    {
        $cells = $row->filter('td');

        if ($cells->count() < 6) {
            return null;
        }

        $dateCell = $cells->eq(0);
        $latCell = $cells->eq(1);
        $lonCell = $cells->eq(2);
        $depthCell = $cells->eq(3);
        $magCell = $cells->eq(4);
        $locationCell = $cells->eq(5);

        $dateTimeRaw = $this->cleanText($dateCell->text());
        $dateTime = $this->parseDateTime($dateTimeRaw);
        $latitude = $this->toFloat($latCell->text());
        $longitude = $this->toFloat($lonCell->text());

        // A row without a valid date or coordinates is not usable data
        // (guards against stray/malformed <tr> picked up by the XPath).
        if ($dateTime === null || $latitude === null || $longitude === null) {
            return null;
        }

        $isSignificant = $magCell->filter('strong')->count() > 0;
        $locationRaw = $this->cleanText($locationCell->text());
        [$distanceKm, $location] = $this->splitLocation($locationRaw);

        $detailUrl = null;
        $link = $dateCell->filter('a')->first();
        if ($link->count() > 0) {
            $detailUrl = $this->buildDetailUrl($link->attr('href'));
        }

        return [
            'datetime' => $dateTime->toDateTimeString(),
            'datetime_raw' => $dateTimeRaw,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'depth_km' => $this->toFloat($depthCell->text()),
            'magnitude' => $this->toFloat($magCell->text()),
            'is_significant' => $isSignificant,
            'distance_km' => $distanceKm,
            'location' => $location,
            'detail_url' => $detailUrl,
        ];
    }

    /**
     * PHIVOLCS date-times look like "06 June 2026 - 03:23 AM".
     */
    protected function parseDateTime(string $raw): ?Carbon
    {
        try {
            return Carbon::createFromFormat('d F Y - h:i A', $raw);
        } catch (Throwable $e) {
            return null;
        }
    }

    protected function toFloat(string $raw): ?float
    {
        $clean = str_replace(',', '', $this->cleanText($raw));

        return is_numeric($clean) ? (float) $clean : null;
    }

    /**
     * The location cell's text is a leading distance number immediately
     * followed by "km <direction> of <place>", e.g.:
     *   "022 km S 08° E of General Luna (Surigao Del Norte)"
     * There's no separating space in the raw markup itself; cleanText()
     * may or may not introduce one depending on surrounding whitespace,
     * so the regex tolerates both.
     *
     * @return array{0: int|null, 1: string}
     */
    protected function splitLocation(string $raw): array
    {
        if (preg_match('/^(\d+)\s*(km.*)$/u', $raw, $matches)) {
            return [(int) $matches[1], trim($matches[2])];
        }

        return [null, $raw];
    }

    /**
     * Detail page hrefs in the source use backslashes and are relative
     * to the site root, e.g. "2026_Earthquake_Information\June\...".
     */
    protected function buildDetailUrl(string $href): string
    {
        $normalized = ltrim(str_replace('\\', '/', $href), '/');

        return rtrim(self::SOURCE_URL, '/') . '/' . $normalized;
    }

    protected function cleanText(string $text): string
    {
        return trim(preg_replace('/\s+/u', ' ', $text));
    }
}