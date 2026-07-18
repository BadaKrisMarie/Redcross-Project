<?php

namespace App\Http\Controllers;

use App\Models\DisasterAlert;
use Illuminate\Http\JsonResponse;

class DisasterAlertController extends Controller
{
    /**
     * Return recent alerts (last 48 hours) as JSON for the homepage
     * banner to consume, newest first.
     *
     * Storms are always included. Earthquakes are only included if
     * they meet the significance threshold (magnitude >= 4.5), since
     * minor earthquakes happen very frequently in the Philippines and
     * would otherwise flood out more important alerts.
     */
    public function recent(): JsonResponse
    {
        $alerts = DisasterAlert::recent()
            ->where(function ($query) {
                $query->where('type', 'storm')
                    ->orWhere(function ($query2) {
                        $query2->where('type', 'earthquake')
                            ->where('magnitude', '>=', 4.5);
                    });
            })
            ->latestFirst()
            ->limit(5)
            ->get([
                'id',
                'type',
                'source',
                'title',
                'description',
                'magnitude',
                'location',
                'signal_number',
                'source_url',
                'image_url',
                'issued_at',
            ]);

        return response()->json([
            'alerts' => $alerts,
        ]);
    }
}
