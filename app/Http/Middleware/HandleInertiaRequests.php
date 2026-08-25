<?php
namespace App\Http\Middleware;
use App\Models\Document;
use App\Models\User;
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

        // Notifications come from pending documents and pending volunteers.
        // Only shown to admins (users with the 'admin' role), not volunteers,
        // so the query isn't wasted on pages that won't use it.
       $notifications = [];
        if ($user && method_exists($user, 'hasRole') && $user->hasRole('admin')) {
            $docNotifs = Document::with('user')
                ->where('status', 'pending')
                ->latest()
                ->take(10)
                ->get()
                ->map(function ($doc) {
                    // file_url and mime_type are NOT columns/accessors on the
                    // Document model — they're computed the same way
                    // DocumentController@index does it: file_url goes through
                    // the dedicated file-serving route, and mime_type is read
                    // straight off the file on disk.
                    $fileUrl  = null;
                    $mimeType = null;
                    if ($doc->file_path) {
                        $fileUrl = route('admin.documents.file', $doc->id);
                        $diskPath = storage_path('app/public/' . $doc->file_path);
                        if (file_exists($diskPath)) {
                            $mimeType = mime_content_type($diskPath);
                        }
                    }

                    return [
                        'id'         => 'doc_' . $doc->id,
                        'type'       => 'document',
                        'ref_id'     => $doc->id,
                        'title'      => ($doc->user->name ?? 'A volunteer') . " submitted a {$doc->type} document",
                        'created_at_raw' => $doc->created_at,
                        'created_at' => \Carbon\Carbon::parse($doc->created_at)->diffForHumans(),
                        'read_at'    => $doc->admin_viewed_at,
                        // Used for the preview inside the notification modal (AdminLayout.jsx)
                        'file_url'   => $fileUrl,
                        'mime_type'  => $mimeType,
                    ];
                });

            $volunteerNotifs = User::role('volunteer')
                ->where('status', 'pending')
                ->latest()
                ->take(10)
                ->get()
                ->map(fn($vol) => [
                    'id'         => 'vol_' . $vol->id,
                    'type'       => 'volunteer',
                    'ref_id'     => $vol->id,
                    'title'      => "New volunteer registered: {$vol->name}",
                    'created_at_raw' => $vol->created_at,
                    'created_at' => \Carbon\Carbon::parse($vol->created_at)->diffForHumans(),
                    'read_at'    => $vol->admin_viewed_at,
                ]);

          
            $notifications = $docNotifs->concat($volunteerNotifs)
                ->sortByDesc('created_at_raw')
                ->take(10)
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
            // Available on every Inertia page via usePage().props.notifications —
            // used by the bell icon in AdminLayout.jsx
            'notifications' => $notifications,
        ];
    }
}