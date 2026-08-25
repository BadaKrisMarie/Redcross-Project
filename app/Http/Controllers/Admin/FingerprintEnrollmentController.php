<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FingerprintEnrollment;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FingerprintEnrollmentController extends Controller
{
    public function index(Request $request)
    {
        $volunteers = User::role("volunteer")
            ->with(["fingerprintEnrollment"])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where("name", "like", "%{$search}%")
                      ->orWhere("email", "like", "%{$search}%");
                });
            })
            ->when($request->status, function ($query, $status) {
                if ($status === "enrolled") {
                    $query->whereHas("fingerprintEnrollment", fn($q) => $q->where("is_enrolled", true));
                } elseif ($status === "not_enrolled") {
                    $query->whereDoesntHave("fingerprintEnrollment")
                          ->orWhereHas("fingerprintEnrollment", fn($q) => $q->where("is_enrolled", false));
                }
            })
            ->get()
            ->map(function ($user) {
                return [
                    "id" => $user->id,
                    "name" => $user->name,
                    "email" => $user->email,
                    "photo" => $user->avatar_url,
                    "branch" => $user->branch,
                    "is_enrolled" => $user->fingerprintEnrollment?->is_enrolled ?? false,
                    "enrolled_at" => $user->fingerprintEnrollment?->enrolled_at?->format("M d, Y h:i A"),
                    "enrollment_method" => $user->fingerprintEnrollment?->enrollment_method,
                    "notes" => $user->fingerprintEnrollment?->notes,
                ];
            });

        $stats = [
            "total" => $volunteers->count(),
            "enrolled" => $volunteers->where("is_enrolled", true)->count(),
            "not_enrolled" => $volunteers->where("is_enrolled", false)->count(),
        ];

        return Inertia::render("Admin/FingerprintEnrollment/Index", [
            "volunteers" => $volunteers->values(),
            "stats" => $stats,
            "filters" => $request->only(["search", "status"]),
        ]);
    }

    public function toggle(Request $request, User $user)
    {
        $request->validate([
            "is_enrolled" => "required|boolean",
            "notes" => "nullable|string|max:500",
        ]);

        FingerprintEnrollment::updateOrCreate(
            ["user_id" => $user->id],
            [
                "is_enrolled" => $request->is_enrolled,
                "enrolled_at" => $request->is_enrolled ? now() : null,
                "enrolled_by" => $request->is_enrolled ? auth()->id() : null,
                "enrollment_method" => "manual",
                "notes" => $request->notes,
            ]
        );

        return back()->with("success", $request->is_enrolled
            ? "Na-mark na si {$user->name} bilang enrolled sa fingerprint."
            : "Na-unmark si {$user->name} sa fingerprint enrollment."
        );
    }
}