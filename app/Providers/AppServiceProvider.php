<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Force localhost instead of 127.0.0.1
        if (request()->getHost() === '127.0.0.1') {
            URL::forceRootUrl('http://localhost:8000');
            redirect('http://localhost:8000' . request()->getRequestUri())->send();
        }
    }
}