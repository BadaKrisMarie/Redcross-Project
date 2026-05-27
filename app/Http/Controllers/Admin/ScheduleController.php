public function index() {
    $activities = Activity::all();
    return Inertia::render('Schedule', [
        'activities' => $activities
    ]);
}