<?php
namespace App\Http\Middleware;
use Illuminate\Http\Request;
use Inertia\Middleware;
class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }
    public function share(Request $request): array
    {
        $user = $request->user()?->fresh();
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? array_merge(
                    $user->toArray(),
                    [
                        'avatar_url' => $user->avatar_url,
                        'photo_url'  => $user->avatar_url,
                        'photo'      => $user->photo,
                    ]
                ) : null,
            ],
            'flash' => [
                'success' => session('success'),
                'error'   => session('error'),
            ],
        ];
    }
}