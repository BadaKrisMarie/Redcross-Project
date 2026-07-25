<?php

use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\VolunteerController;
use App\Http\Controllers\Volunteer\ProfileController as VolunteerProfileController;
use App\Http\Controllers\Volunteer\AttendanceController;
use App\Http\Controllers\Volunteer\FaceAttendanceController;
use App\Http\Controllers\Volunteer\LocationPingController;
use App\Http\Controllers\Volunteer\DocumentController;
use App\Http\Controllers\Volunteer\CommunicationController;
use App\Http\Controllers\WebAuthn\WebAuthnRegisterController;
use App\Http\Controllers\WebAuthn\WebAuthnAttendanceController;
use App\Http\Controllers\Admin\ActivityController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\AdminProfileController;
use App\Http\Controllers\Admin\AttendanceController as AdminAttendanceController;
use App\Http\Controllers\Admin\AttendanceLogController;
use App\Http\Controllers\Admin\CommunicationController as AdminCommunicationController;
use App\Http\Controllers\Admin\DocumentController as AdminDocumentController;
use App\Http\Controllers\DisasterAlertController;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Volunteer\AvailabilityController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin'       => Route::has('login'),
        'canRegister'    => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion'     => PHP_VERSION,
    ]);
});

Route::get('/about', function () {
    return Inertia::render('About');
})->name('about');

Route::get('/contact', function () {
    return Inertia::render('Contact');
})->name('contact');

Route::get('/donate', function () {
    return Inertia::render('Donate');
})->name('donate');
// --- Disaster Alerts API (used by DisasterAlertsBanner.jsx) --------------------
Route::get('/api/disaster-alerts', [DisasterAlertController::class, 'recent']);
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------

// --- Give Blood & Training main pages (linked from SiteNavbar dropdowns) ------
Route::get('/give-blood', function () {
    return Inertia::render('GiveBlood');
})->name('give-blood');

Route::get('/training', function () {
    return Inertia::render('Training');
})->name('training.index');

Route::get('/training/employees', function () {
    return Inertia::render('Training');
})->name('training.employees');

// --- PRC Services main pages (linked from SiteNavbar About Us > Our Work) -----
// Each service now has its own dedicated page instead of the old
// combined "Our Services" listing page.

// Disaster Management Service main page
Route::get('/disaster-management', function () {
    return Inertia::render('DisasterManagement');
})->name('disaster-management');

// National Blood Service main page
Route::get('/national-blood-service', function () {
    return Inertia::render('NationalBloodService');
})->name('national-blood-service');

// Health Services main page
Route::get('/health-services', function () {
    return Inertia::render('HealthServices');
})->name('health-services');

// Safety Services main page
Route::get('/safety-services', function () {
    return Inertia::render('SafetyServices');
})->name('safety-services');
// ----------------------------------------------------------------------------

// --- Navbar Dropdown Subpages (placeholder content, expand later) -------------
// Each route below renders the generic Placeholder page with a custom title.
// Replace any of these with a real Inertia page + controller whenever ready ?
// just swap the closure for a controller method and point to a real view.

// DONATE submenu
Route::get('/donate/emergency-appeal', fn () => Inertia::render('Placeholder', [
    'title' => 'Emergency Appeal',
]))->name('donate.emergency-appeal');

Route::redirect('/donate/online', '/donate')->name('donate.online');

Route::get('/donate/monthly-gifts', fn () => Inertia::render('Placeholder', [
    'title' => 'Monthly Gifts',
]))->name('donate.monthly-gifts');

Route::get('/donate/text-mail-phone', fn () => Inertia::render('Placeholder', [
    'title' => 'Text, Mail, or Phone',
]))->name('donate.text-mail-phone');

Route::get('/donate/international', fn () => Inertia::render('Placeholder', [
    'title' => 'International Donations',
]))->name('donate.international');

// GIVE BLOOD submenu (legacy links ? kept working, GIVE BLOOD nav now points to /give-blood)
Route::prefix('blood')->name('blood.')->group(function () {
    Route::get('/why-donate', fn () => Inertia::render('GiveBlood'))->name('why-donate');

    Route::get('/find-center', fn () => Inertia::render('GiveBlood'))->name('find-center');

    Route::get('/donor-registry', fn () => Inertia::render('Placeholder', [
        'title' => 'Blood Donor Registry',
    ]))->name('donor-registry');

    Route::get('/schedule', fn () => Inertia::render('Placeholder', [
        'title' => 'Schedule a Donation',
    ]))->name('schedule');

    Route::get('/safety-info', fn () => Inertia::render('Placeholder', [
        'title' => 'Blood Safety Info',
    ]))->name('safety-info');
});

// TRAINING submenu (legacy links ? kept working, TRAINING nav now points to /training)
Route::prefix('training')->name('training.')->group(function () {
    Route::get('/first-aid-cpr', fn () => Inertia::render('Placeholder', [
        'title' => 'First Aid & CPR',
    ]))->name('first-aid-cpr');

    Route::get('/disaster-response', fn () => Inertia::render('Placeholder', [
        'title' => 'Disaster Response',
    ]))->name('disaster-response');

    Route::get('/basic-life-support', fn () => Inertia::render('Placeholder', [
        'title' => 'Basic Life Support',
    ]))->name('basic-life-support');

    Route::get('/community', fn () => Inertia::render('Placeholder', [
        'title' => 'Community Training',
    ]))->name('community');

    Route::get('/online-courses', fn () => Inertia::render('Placeholder', [
        'title' => 'Online Courses',
    ]))->name('online-courses');
});

// VOLUNTEER submenu (public-facing info page ? distinct from the authenticated
// /volunteer/* dashboard routes further below)
// "Become a Volunteer", "Red Cross 143 Program", and "Volunteer Service FAQs"
// are all sections within the same Volunteer.jsx page (linked via in-page anchors).
Route::prefix('volunteer-info')->name('volunteer-info.')->group(function () {
    Route::get('/become', function () {
        return Inertia::render('Volunteer');
    })->name('become');
});
// ----------------------------------------------------------------------------

// ABOUT US submenu
Route::prefix('about')->name('about.')->group(function () {
    Route::get('/who-we-are', fn () => Inertia::render('Placeholder', [
        'title' => 'Who We Are',
    ]))->name('who-we-are');

    Route::get('/mission-vision', fn () => Inertia::render('MissionVision'))->name('mission-vision');

    Route::get('/history', fn () => Inertia::render('History'))->name('history');

    Route::get('/movement', fn () => Inertia::render('Movement'))->name('movement');

    Route::get('/team', fn () => Inertia::render('MeetTheTeam'))->name('team');

    Route::get('/annual-reports', fn () => Inertia::render('Placeholder', [
        'title' => 'Annual Reports',
    ]))->name('annual-reports');

    // Our Publications
    Route::get('/news-events', fn () => Inertia::render('Placeholder', [
        'title' => 'News and Events',
    ]))->name('news-events');

    Route::get('/features', fn () => Inertia::render('Placeholder', [
        'title' => 'Features',
    ]))->name('features');

    // Our Work
    Route::get('/ways-to-help', fn () => Inertia::render('Placeholder', [
        'title' => 'Ways To Help',
    ]))->name('ways-to-help');

    Route::get('/careers', fn () => Inertia::render('Placeholder', [
        'title' => 'Careers',
    ]))->name('careers');

    Route::get('/invitation-to-bid', fn () => Inertia::render('Placeholder', [
        'title' => 'Invitation to Bid',
    ]))->name('invitation-to-bid');
});

// CONTACT US submenu
Route::prefix('contact')->name('contact.')->group(function () {
    Route::get('/get-in-touch', fn () => Inertia::render('GetInTouch'))
        ->name('get-in-touch');

    Route::get('/branch-locations', fn () => Inertia::render('Placeholder', [
        'title' => 'Branch Locations',
    ]))->name('branch-locations');

    Route::get('/hotline-numbers', fn () => Inertia::render('Placeholder', [
        'title' => 'Hotline Numbers',
    ]))->name('hotline-numbers');

    Route::get('/email', fn () => Inertia::render('Placeholder', [
        'title' => 'Email Us',
    ]))->name('email');

    Route::get('/social-media', fn () => Inertia::render('Placeholder', [
        'title' => 'Social Media',
    ]))->name('social-media');
});
// ----------------------------------------------------------------------------

// --- Real-time Email Availability Check (Register page) -----------------------
// No auth middleware ? must be reachable by guests filling out the register form.
Route::post('/check-email', [RegisteredUserController::class, 'checkEmail'])
    ->name('check.email');

// --- Notification Routes -------------------------------------------------------
Route::middleware('auth')->group(function () {

    Route::get('/volunteer/notifications', function (Request $request) {
        $notifications = DB::table('user_notifications')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($n) => [
                'id'         => $n->id,
                'title'      => $n->title ?? null,
                'message'    => $n->message,
                'is_read'    => (bool) $n->is_read,
                'type'       => 'general',
                'created_at' => \Carbon\Carbon::parse($n->created_at)->diffForHumans(),
            ]);

        $unread_count = DB::table('user_notifications')
            ->where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count'  => $unread_count,
        ]);
    });

    Route::patch('/volunteer/notifications/read-all', function (Request $request) {
        DB::table('user_notifications')
            ->where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'updated_at' => now()]);
        return response()->json(['message' => 'All notifications marked as read.']);
    });

    Route::patch('/volunteer/notifications/{id}/read', function (Request $request, string $id) {
        $notif = DB::table('user_notifications')
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();
        if (!$notif) return response()->json(['message' => 'Notification not found.'], 404);
        DB::table('user_notifications')
            ->where('id', $id)
            ->update(['is_read' => true, 'updated_at' => now()]);
        return response()->json(['message' => 'Notification marked as read.']);
    });

});

// --- Admin Routes -------------------------------------------------------------
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {

    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');

    // Schedule
    Route::get('/schedule', [ActivityController::class, 'schedule'])->name('schedule');

    // Volunteers
    Route::get('/volunteers', [VolunteerController::class, 'index'])->name('volunteers');
    Route::get('/volunteers/{id}', [VolunteerController::class, 'show'])->name('volunteers.show');
    Route::patch('/volunteers/{id}/approve', [VolunteerController::class, 'approve'])->name('volunteers.approve');
    Route::patch('/volunteers/{id}/reject', [VolunteerController::class, 'reject'])->name('volunteers.reject');
    Route::delete('/volunteers/{id}', [VolunteerController::class, 'destroy'])->name('volunteers.destroy');

    // Activities
    Route::get('/activities', [ActivityController::class, 'index'])->name('activities.index');
    Route::get('/activities/create', [ActivityController::class, 'create'])->name('activities.create');
    Route::post('/activities', [ActivityController::class, 'store'])->name('activities.store');
    Route::get('/activities/{activity}/edit', [ActivityController::class, 'edit'])->name('activities.edit');
    Route::patch('/activities/{activity}', [ActivityController::class, 'update'])->name('activities.update');
    Route::delete('/activities/{activity}', [ActivityController::class, 'destroy'])->name('activities.destroy');

    // Attendance
    Route::get('/attendance', [AdminAttendanceController::class, 'index'])->name('attendance.index');
    Route::get('/attendance/export-pdf', [AdminAttendanceController::class, 'exportPdf'])->name('attendance.export.pdf');
    // ? Added � polled by LiveLocationMap.jsx to render current volunteer positions
    Route::get('/attendance/live-locations', [AdminAttendanceController::class, 'liveLocations'])->name('attendance.live-locations');

    // ✅ NEW: Attendance Logs (separate detailed log view from the main Attendance summary page)
    Route::get('/attendance-logs', [AttendanceLogController::class, 'index'])
        ->name('attendance-logs.index');

    // Reports
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/export', [ReportController::class, 'export'])->name('reports.export');
    Route::get('/reports/export-pdf', [ReportController::class, 'exportPdf'])->name('reports.export.pdf');

    // Communication
    Route::get('/communication', [AdminCommunicationController::class, 'index'])->name('communication');
    Route::post('/communication/reply/{sentEmail}', [AdminCommunicationController::class, 'reply'])->name('communication.reply');
    Route::post('/communication/announce', [AdminCommunicationController::class, 'announce'])->name('communication.announce');
    Route::delete('/communication/announcement/{announcement}', [AdminCommunicationController::class, 'deleteAnnouncement'])->name('communication.announcement.delete');

    // 201 Files (Documents)
    Route::get('/documents', [AdminDocumentController::class, 'index'])->name('documents.index');
    Route::get('/documents/{id}/file', [AdminDocumentController::class, 'serveFile'])->name('documents.file');
    Route::patch('/documents/{id}/approve', [AdminDocumentController::class, 'approve'])->name('documents.approve');
    Route::patch('/documents/{id}/reject', [AdminDocumentController::class, 'reject'])->name('documents.reject');

    // Profile & Password
    Route::get('/profile',           [AdminProfileController::class, 'edit'])->name('profile');
    Route::patch('/profile',         [AdminProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/password', [AdminProfileController::class, 'changePassword'])->name('profile.password');
});

// --- Volunteer Routes ---------------------------------------------------------
Route::middleware(['auth', 'role:volunteer'])->prefix('volunteer')->name('volunteer.')->group(function () {

    Route::get('/dashboard', function () {
        $user = auth()->user()->fresh();

        $totalHours = \App\Models\Attendance::where('user_id', $user->id)->sum('hours_rendered');
        $totalDays  = \App\Models\Attendance::where('user_id', $user->id)->count();
        $monthDays  = \App\Models\Attendance::where('user_id', $user->id)
            ->whereMonth('date', now()->month)
            ->count();

        $assignedActivities = $user->activities()
            ->where('date', '>=', now()->startOfDay())
            ->orderBy('date', 'asc')
            ->get(['activities.id', 'activities.name', 'activities.date',
                   'activities.location_name', 'activities.start_time',
                   'activities.end_time', 'activities.description']);

        $recentAttendance = \App\Models\Attendance::where('user_id', $user->id)
            ->orderBy('date', 'desc')
            ->limit(5)
            ->get(['date', 'time_in', 'time_out', 'hours_rendered']);
        $announcements = \App\Models\Announcement::with('admin')->orderBy('created_at','desc')->get();

        return Inertia::render('Volunteer/Dashboard', [
            'totalHours'         => $totalHours,
            'totalDays'          => $totalDays,
            'monthDays'          => $monthDays,
            'assignedActivities' => $assignedActivities,
            'recentAttendance'   => $recentAttendance,
            'announcements'      => $announcements,
        ]);
    })->name('dashboard');

    Route::get('/schedule', function () {
        $user = auth()->user()->fresh();
        $activities = $user->activities()
            ->orderBy('date', 'asc')
            ->get([
                'activities.id', 'activities.name', 'activities.date',
                'activities.start_time', 'activities.end_time',
                'activities.location_name', 'activities.status',
                'activities.description', 'activities.assigned_by',
            ]);
        return Inertia::render('Volunteer/Schedule', [
            'activities' => $activities,
        ]);
    })->name('schedule');

    Route::get('/communication', [CommunicationController::class, 'index'])->name('communication');
    Route::post('/communication/send', [CommunicationController::class, 'send'])->name('communication.send');

    Route::get('/documents', [DocumentController::class, 'index'])->name('documents');
    Route::post('/documents', [DocumentController::class, 'store'])->name('documents.store');
    Route::delete('/documents/{id}', [DocumentController::class, 'destroy'])->name('documents.destroy');

    Route::get('/profile', [VolunteerProfileController::class, 'edit'])->name('profile');
    Route::patch('/profile', [VolunteerProfileController::class, 'update'])->name('profile.update');

    // --- Password Change -------------------------------------------------------
    Route::get('/password', function () {
        return Inertia::render('Volunteer/ChangePassword', [
            'auth' => ['user' => auth()->user()],
        ]);
    })->name('password');

    Route::put('/password', function (Request $request) {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password'         => ['required', 'min:8', 'confirmed'],
        ]);

        $request->user()->update([
            'password' => bcrypt($request->password),
        ]);

        return response()->json(['message' => 'Password updated successfully.']);
    })->name('password.update');
    // --------------------------------------------------------------------------

    Route::get('/attendance', [AttendanceController::class, 'index'])->name('attendance');
    Route::post('/attendance/time-in', [AttendanceController::class, 'timeIn'])->name('attendance.timein');
    Route::post('/attendance/time-out', [AttendanceController::class, 'timeOut'])->name('attendance.timeout');

    Route::post('/face/register', [FaceAttendanceController::class, 'registerFace'])->name('face.register');
    Route::post('/face/timein', [FaceAttendanceController::class, 'timeIn'])->name('face.timein');
    Route::post('/face/timeout', [FaceAttendanceController::class, 'timeOut'])->name('face.timeout');

    // ? Added � periodic location pings sent by FaceAttendance.jsx while checked in,
    // and a clear call right after a successful time-out. Powers the admin live map.
    Route::post('/location/ping', [LocationPingController::class, 'store'])->name('location.ping');
    Route::post('/location/clear', [LocationPingController::class, 'clear'])->name('location.clear');

    Route::post('/webauthn/register/options', [WebAuthnRegisterController::class, 'options'])->name('webauthn.register.options');
    Route::post('/webauthn/register', [WebAuthnRegisterController::class, 'register'])->name('webauthn.register');
    Route::post('/webauthn/timein/options', [WebAuthnAttendanceController::class, 'options'])->name('webauthn.timein.options');
    Route::post('/webauthn/timein', [WebAuthnAttendanceController::class, 'timeIn'])->name('webauthn.timein');
    Route::post('/webauthn/timeout/options', [WebAuthnAttendanceController::class, 'options'])->name('webauthn.timeout.options');
    Route::post('/webauthn/timeout', [WebAuthnAttendanceController::class, 'timeOut'])->name('webauthn.timeout');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::post('admin/notifications/mark-read', [NotificationController::class, 'markRead'])
    ->name('admin.notifications.markRead');

    Route::patch('/availability', [AvailabilityController::class, 'update'])->name('availability.update');

require __DIR__.'/auth.php';