<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class UpdateLastActive
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()) {
            $lastActive = $request->user()->last_active_at;

            if (!$lastActive || now()->diffInSeconds($lastActive) > 30) {
                $request->user()->update(['last_active_at' => now()]);
            }
        }

        return $next($request);
    }
}