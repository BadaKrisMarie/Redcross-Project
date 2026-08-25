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

        $body = $response->body();
        $crawler = new Crawler($body);

        if (stripos($body, 'no active tropical cyclone') !== false) {
            return 0; // walang bagyo ngayon
        }

        // --- Text extraction -----------------------------------------------
        // Hindi na tayo umaasa sa isang partikular na container selector
        // (.tab-content / .tab-pane.active), dahil napatunayan na hindi ito
        // reliable sa aktwal na layout ng PAGASA site -- minsan ang na-grab
        // na node ay ang "Bulletin Archive" listahan na lang mismo, hindi
        // ang totoong bulletin body, at wala pang heading text sa loob nito
        // na magagamit bilang cut-off marker.
        //
        // Sa halip, kunin natin ang buong visible text ng page, tapos
        // i-extract lang natin ang totoong bulletin body gamit ang mga
        // kilalang start/end marker na palaging sumusunod sa istruktura ng
        // PAGASA bulletin bago pa man i-render bilang HTML.
        $fullPageText = trim($crawler->filter('body')->count() > 0
            ? $crawler->filter('body')->text()
            : $crawler->text());

        // Start marker: ang totoong bulletin content ay palaging nagsisimula
        // sa "Issued at" na linya (e.g. "Issued at 05:00 am, 25 July 2026").
        $startPos = stripos($fullPageText, 'Issued at');

        // End marker: ang archive listing ay palaging nagsisimula sa
        // "Bulletin Archive" na heading, kung meron. Kung wala namang archive
        // section (bagong bulletin pa lang, walang naka-archive), gamitin
        // na lang ang "TCB#1_" bilang backup end marker, o kaya ang dulo
        // ng text kung wala talaga.
        $endPos = stripos($fullPageText, 'Bulletin Archive');
        if ($endPos === false) {
            $endPos = stripos($fullPageText, 'TCB#1_');
        }

        if ($startPos !== false) {
            $fullText = $endPos !== false && $endPos > $startPos
                ? trim(mb_substr($fullPageText, $startPos, $endPos - $startPos))
                : trim(mb_substr($fullPageText, $startPos));
        } else {
            // Kung hindi nahanap ang "Issued at" marker, huwag munang i-save
            // dahil malamang hindi natin nakuha ang tamang bulletin content.
            Log::warning('PAGASA: could not locate bulletin body via "Issued at" marker, layout may have changed');
            return 0;
        }

        if ($fullText === '') {
            return 0;
        }

        // Kunin ang bulletin number + cyclone name mula sa unang linya kung meron
        preg_match_all('/TCB#(\d+)_/i', $fullPageText, $bulletinMatches);
        preg_match('/"([A-Za-z\s]+)"/i', $fullText, $nameMatch);
        preg_match('/SIGNAL\s*(NO\.|NUMBER)?\s*(\d)/i', $fullText, $signalMatch);

       $bulletinNo = !empty($bulletinMatches[1]) ? max($bulletinMatches[1]) : now()->format('YmdHi');
        $cycloneName = trim($nameMatch[1] ?? 'Tropical Cyclone');
        $signal = $signalMatch[2] ?? null;

        // --- Track map image -------------------------------------------------
        // Naghahanap tayo diretso sa buong raw HTML gamit ang regex, hindi sa
        // pamamagitan ng DomCrawler img[src=...] selector lang, dahil posibleng
        // ang aktwal na image URL ay nasa "data-src" o katulad na lazy-load
        // attribute sa halip na sa "src" mismo.
        $imageUrl = null;
        if (preg_match('/https?:\/\/[^\s"\'<>]*track_[^\s"\'<>]+\.(?:png|jpg|jpeg)/i', $body, $imgMatch)) {
            $imageUrl = $imgMatch[0];
        }

        // Fallback: kung walang signal number na nahanap sa text (minsan
        // nasa loob lang ng icon image filename ito, hindi sa text, e.g.
        // "tcws1.png"), subukang hanapin doon gamit din ang regex sa raw HTML.
        if (! $signal && preg_match('/tcws(\d)/i', $body, $iconMatch)) {
            $signal = $iconMatch[1];
        }

        $externalId = 'pagasa-storm-' . md5(strtolower($cycloneName));

        // Kung walang na-detect na image sa fetch na ito (posibleng transient
        // gap sa PAGASA site habang nag-a-update sila ng bulletin), huwag
        // burahin ang dating image_url kung meron nang naka-save galing sa
        // isang naunang matagumpay na fetch.
        if ($imageUrl === null) {
            $existing = DisasterAlert::where('external_id', $externalId)->first();
            if ($existing && $existing->image_url) {
                $imageUrl = $existing->image_url;
            }
        }

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