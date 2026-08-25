<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DocumentCategory;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DocumentController extends Controller
{
    // ✅ NEW — normalizes stored file_path so Windows backslashes ("documents\5\x.jpg")
    // don't break path concatenation. Laravel/URLs always expect forward slashes;
    // storage_path() concatenation on Windows tolerates backslashes for existence
    // checks, but mixing separators has caused inconsistent behavior for some
    // PHP file functions in XAMPP/Windows setups. Centralized here so every method
    // below resolves the exact same physical path the exact same way.
    private function resolvedPath(string $filePath): string
    {
        $normalized = str_replace('\\', '/', $filePath);
        return storage_path('app/public/' . $normalized);
    }

    public function index()
    {
        $documents = DB::table('documents')
            ->join('users', 'documents.user_id', '=', 'users.id')
            ->where('documents.status', 'approved')
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

                $mimeType = null;
                if ($doc->file_path) {
                    $path = $this->resolvedPath($doc->file_path);
                    if (file_exists($path) && filesize($path) > 0) {
                        $mimeType = mime_content_type($path);
                    }
                }

                return [
                    'id'          => $doc->id,
                    'name'        => $doc->name,
                    'initials'    => $initials,
                    'photo'       => $doc->photo ? '/storage/' . $doc->photo : null,
                    'type'        => $doc->type,
                    'status'      => $doc->status ?? 'pending',
                    'file_url'    => $doc->file_path ? route('admin.documents.file', $doc->id) : null,
                    'mime_type'   => $mimeType,
                    'color_id'    => $doc->user_id % 5,
                    'uploaded_at' => \Carbon\Carbon::parse($doc->created_at)->format('M d, Y'),
                ];
            });

        $categories = DocumentCategory::orderBy('id')->get();

        return Inertia::render('Admin/AdminDocumentsIndex', [
            'auth'       => ['user' => auth()->user()],
            'documents'  => $documents,
            'categories' => $categories,
        ]);
    }

    // ✅ UPDATED — now validates that the file actually has bytes (filesize > 0)
    // before serving, and logs a warning with the exact resolved path whenever
    // something is wrong. Check storage/logs/laravel.log after reproducing the
    // issue — the log line will tell you EXACTLY which path was checked and
    // whether the file was missing vs. empty/corrupted.
    public function serveFile($id)
    {
        $doc = DB::table('documents')->where('id', $id)->first();

        if (!$doc || !$doc->file_path) {
            Log::warning('serveFile: document row or file_path missing', ['id' => $id]);
            abort(404, 'Document not found.');
        }

        $path = $this->resolvedPath($doc->file_path);

        if (!file_exists($path)) {
            Log::warning('serveFile: file does not exist on disk', [
                'id'            => $id,
                'stored_value'  => $doc->file_path,
                'resolved_path' => $path,
            ]);
            abort(404, 'File not found on disk.');
        }

        $size = filesize($path);
        if ($size === 0) {
            Log::warning('serveFile: file exists but is 0 bytes (corrupted/incomplete upload)', [
                'id'            => $id,
                'resolved_path' => $path,
            ]);
            abort(404, 'File is empty or corrupted.');
        }

        $mime = mime_content_type($path) ?: 'application/octet-stream';

        return response()->file($path, [
            'Content-Type'        => $mime,
            'Content-Disposition' => 'inline; filename="' . basename($path) . '"',
        ]);
    }

    public function download($id)
    {
        $doc = DB::table('documents')->where('id', $id)->first();

        if (!$doc || !$doc->file_path) {
            abort(404);
        }

        if (($doc->status ?? 'pending') !== 'approved') {
            abort(403, 'This document has not been approved yet and cannot be downloaded.');
        }

        $path = $this->resolvedPath($doc->file_path);

        if (!file_exists($path) || filesize($path) === 0) {
            Log::warning('download: file missing or empty', ['id' => $id, 'resolved_path' => $path]);
            abort(404, 'File not found or corrupted.');
        }

        return response()->download($path, basename($doc->file_path));
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

    public function destroy($id)
    {
        $doc = DB::table('documents')->where('id', $id)->first();

        if (!$doc) {
            abort(404);
        }

        if ($doc->file_path) {
            $path = $this->resolvedPath($doc->file_path);
            if (file_exists($path)) {
                unlink($path);
            }
        }

        DB::table('documents')->where('id', $id)->delete();

        return back()->with('success', 'Document deleted successfully.');
    }
}