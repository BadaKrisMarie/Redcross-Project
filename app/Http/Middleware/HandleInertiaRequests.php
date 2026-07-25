<?php
namespace App\Http\Middleware;
use App\Models\Document;
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

        // ✅ BAGO: Notifications galing sa pending documents.
        // Ipinapakita lang sa admin (may 'admin' role), hindi sa volunteers,
        // para hindi masayang ang query sa mga page na hindi naman gagamit nito.
        $notifications = [];
        if ($user && method_exists($user, 'hasRole') && $user->hasRole('admin')) {
            $notifications = Document::with('user')
                ->where('status', 'pending')
                ->latest()
                ->take(10)
                ->get()
                ->map(fn($doc) => [
                    'id'         => $doc->id,
                    'title'      => ($doc->user->name ?? 'Isang volunteer') . " ay nag-submit ng {$doc->type} document",
                    'created_at' => \Carbon\Carbon::parse($doc->created_at)->diffForHumans(),
                    // ✅ BAGO: null kapag hindi pa nakikita ni admin, may value kapag nabuksan na ang bell dropdown
                    'read_at'    => $doc->admin_viewed_at,
                ])
                ->values()
                ->toArray();
        }

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
            // ✅ BAGO: available na sa lahat ng Inertia pages gamit ang
            // usePage().props.notifications — ginagamit ito ng bell icon sa AdminLayout.jsx
            'notifications' => $notifications,
        ];
    }
}
