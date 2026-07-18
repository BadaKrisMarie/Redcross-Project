<?php

namespace App\Services;

use App\Models\DisasterAlert;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Symfony\Component\DomCrawler\Crawler;

class PagasaAlertScraper
{
    protected string $url = 'https://www.pagasa.dost.gov.ph/tropical-cyclone/severe-weather-bulletin';

    public function fetch(): int
    {
        $response = Http::withHeaders([
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) RedCrossMuntinlupaBot/1.0',
        ])->timeout(20)->get($this->url);

        if (! $response->successful()) {
            Log::warning('PAGASA fetch failed: ' . $response->status());
            return 0;
        }

        $crawler = new Crawler($response->body());

        // Kunin ang main bulletin content block. I-verify ang selector via
        // Inspect Element kung nagbago ang layout ng PAGASA site.
        $contentNode = $crawler->filter('.tab-content, .tab-pane.active')->first();

        if ($contentNode->count() === 0) {
            Log::warning('PAGASA: content block not found, layout may have changed');
            return 0;
        }

        $fullText = trim($contentNode->text());

        if ($fullText === '' || stripos($fullText, 'no active tropical cyclone') !== false) {
            return 0; // walang bagyo ngayon
        }

        // Kunin ang bulletin number + cyclone name mula sa unang linya kung meron
        preg_match_all('/TCB#(\d+)_/i', $fullText, $bulletinMatches);
        preg_match('/"([A-Za-z\s]+)"/i', $fullText, $nameMatch);
        preg_match('/SIGNAL\s*(NO\.|NUMBER)?\s*(\d)/i', $fullText, $signalMatch);

       $bulletinNo = !empty($bulletinMatches[1]) ? max($bulletinMatches[1]) : now()->format('YmdHi');
        $cycloneName = trim($nameMatch[1] ?? 'Tropical Cyclone');
        $signal = $signalMatch[2] ?? null;

        // Kunin ang track map image (kung meron)
        $imageNode = $contentNode->filter('img[src*="track_"]');
        $imageUrl = $imageNode->count() > 0 ? $imageNode->first()->attr('src') : null;

        $externalId = 'pagasa-storm-' . md5(strtolower($cycloneName));

        $alert = DisasterAlert::updateOrCreate(
            ['external_id' => $externalId],
            [
                'type' => 'storm',
                'source' => 'PAGASA',
                'title' => "Severe Weather Bulletin #{$bulletinNo} - {$cycloneName}",
                'description' => mb_substr($fullText, 0, 1000),
                'signal_number' => $signal,
                'source_url' => $this->url,
                'image_url' => $imageUrl,
                'issued_at' => now(),
            ]
        );

        return $alert->wasRecentlyCreated ? 1 : 0;
    }
}


