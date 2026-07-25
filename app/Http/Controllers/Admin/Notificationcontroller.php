<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * POST /admin/notifications/mark-read
     *
     * ⚠️ Ang "notifications" dito ay galing sa PENDING DOCUMENTS
     * (HandleInertiaRequests::share()), hindi sa user_notifications table.
     * Ang "unread" ay isang pending document na ang admin_viewed_at ay null pa.
     *
     * Kapag binuksan ang bell dropdown, i-stamp natin ang admin_viewed_at ng
     * lahat ng currently-pending, hindi-pa-view na documents ⇒ mawawala ang
     * red badge. Kapag may BAGONG pending document na dumating (bagong row,
     * walang admin_viewed_at pa), lalabas ulit ang red badge — dahil "unread"
     * ulit siya sa susunod na fetch.
     *
     * Kung may 'id' na ipinasa (mark isang document lang), iyon lang ang
     * mamarkahan.
     */
    public function markRead(Request $request)
    {
        $id = $request->input('id');

        $query = Document::where('status', 'pending')->whereNull('admin_viewed_at');

        if ($id) {
            $query->where('id', $id);
        }

        $query->update(['admin_viewed_at' => now()]);

        // ⚠️ Tinawag ito ng frontend gamit ang Inertia's router.post() (may
        // 'only: ["notifications"]' partial reload), kaya kailangan Inertia
        // response ang ibalik dito — HINDI response()->json(). Ang back()
        // ay magre-redirect papunta sa parehong page, at kukunin lang ulit
        // ni Inertia yung 'notifications' shared prop mula sa
        // HandleInertiaRequests::share() (na ngayon ay may admin_viewed_at na).
        return back();
    }
}