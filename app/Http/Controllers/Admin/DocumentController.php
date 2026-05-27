<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DocumentController extends Controller
{
    public function index()
    {
        $documents = DB::table('documents')
            ->join('users', 'documents.user_id', '=', 'users.id')
            ->select(
                'documents.id',
                'documents.type',
                'documents.file_path',
                'documents.status',
                'documents.created_at',
                'users.id as user_id',
                'users.name',
                'users.photo'
            )
            ->orderByDesc('documents.created_at')
            ->get()
            ->map(function ($doc) {
                $nameParts = explode(' ', $doc->name ?? '');
                $initials  = collect($nameParts)
                    ->map(fn($w) => strtoupper($w[0] ?? ''))
                    ->take(2)
                    ->join('');

                return [
                    'id'          => $doc->id,
                    'name'        => $doc->name,
                    'initials'    => $initials,
                    'photo'       => $doc->photo ? '/storage/' . $doc->photo : null,
                    'type'        => $doc->type,
                    'status'      => $doc->status ?? 'pending',
                    'file_url'    => $doc->file_path ? route('admin.documents.file', $doc->id) : null, // ← BINAGO
                    'color_id'    => $doc->user_id % 5,
                    'uploaded_at' => \Carbon\Carbon::parse($doc->created_at)->format('M d, Y'),
                ];
            });

        return Inertia::render('Admin/AdminDocumentsIndex', [
            'auth'      => ['user' => auth()->user()],
            'documents' => $documents,
        ]);
    }

    // ← BAGONG METHOD
    public function serveFile($id)
    {
        $doc = DB::table('documents')->where('id', $id)->first();

        if (!$doc || !$doc->file_path) {
            abort(404);
        }

        $path = storage_path('app/public/' . $doc->file_path);

        if (!file_exists($path)) {
            abort(404);
        }

        $mime = mime_content_type($path);

        return response()->file($path, [
            'Content-Type'        => $mime,
            'Content-Disposition' => 'inline; filename="' . basename($path) . '"',
        ]);
    }

    public function approve($id)
    {
        DB::table('documents')
            ->where('id', $id)
            ->update([
                'status'     => 'approved',
                'updated_at' => now(),
            ]);

        return back()->with('success', 'Document approved successfully.');
    }

    public function reject($id)
    {
        DB::table('documents')
            ->where('id', $id)
            ->update([
                'status'     => 'rejected',
                'updated_at' => now(),
            ]);

        return back()->with('success', 'Document rejected.');
    }
}
