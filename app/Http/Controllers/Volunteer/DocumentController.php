<?php

namespace App\Http\Controllers\Volunteer;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Attendance;
use App\Models\Document;
use App\Models\DocumentCategory;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DocumentController extends Controller
{
    private function resolvedPath(?string $filePath): string
    {
        if (!$filePath) {
            return '';
        }
        $normalized = str_replace('\\', '/', $filePath);
        return storage_path('app/public/' . $normalized);
    }

    public function index()
    {
        // ✅ FIXED: fresh() + avatar_url/photo_url para consistent sa middleware
        $user = auth()->user()->fresh();

        $documents = Document::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($doc) {
                $path = $this->resolvedPath($doc->file_path);
                $fileSize = (file_exists($path) && !is_dir($path)) ? filesize($path) : null;
                $mimeType = (file_exists($path) && !is_dir($path)) ? mime_content_type($path) : null;
                return [
                    'id'               => $doc->id,
                    'user_id'          => $doc->user_id,
                    'type'             => $doc->type,
                    'original_name'    => $doc->original_name,
                    'status'           => $doc->status,
                    'created_at'       => $doc->created_at,
                    'file_size'        => $fileSize,
                    'mime_type'        => $mimeType,
                    'file_url'         => route('volunteer.documents.file', $doc->id),
                    'download_url'     => route('volunteer.documents.download', $doc->id),
                ];
            });

        // ✅ Dynamic folders/categories (admin-created custom folders show up automatically)
        $categories = DocumentCategory::orderBy('id')->get();

        // ── Activity / Assignment History ──
        // Fetch all activities this volunteer was assigned to via the pivot table
        $activities = $user->activities()
            ->orderBy('date', 'desc')
            ->get(['activities.id', 'activities.name', 'activities.date',
                   'activities.start_time', 'activities.end_time',
                   'activities.location_name', 'activities.status',
                   'activities.description', 'activities.assigned_by']);

        // ── Attendance / Volunteer Hours History ──
        $attendances = Attendance::where('user_id', $user->id)
            ->with('activity:id,name,date,start_time,end_time,location_name')
            ->orderBy('date', 'desc')
            ->get();

        // ── Attendance Summary Stats ──
        $totalHours = Attendance::where('user_id', $user->id)->sum('hours_rendered');
        $totalDays  = Attendance::where('user_id', $user->id)->count();

        return Inertia::render('Volunteer/Documents', [
            'auth' => [
                'user' => array_merge(
                    $user->toArray(),
                    [
                        'avatar_url' => $user->avatar_url,
                        'photo_url'  => $user->avatar_url,
                    ]
                ),
            ],
            'documents'  => $documents,
            'categories' => $categories,
            'activities' => $activities,
            'attendances' => $attendances,
            'attendanceSummary' => [
                'totalHours' => round($totalHours, 1),
                'totalDays'  => $totalDays,
            ],
        ]);
    }

    public function store(Request $request)
    {
        // ✅ UPDATED — 'type' is validated dynamically against
        // document_categories.key instead of a hardcoded 'in:' list, so
        // volunteers can upload against any folder an admin has created.
        $request->validate([
            'type' => 'required|exists:document_categories,key',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'detection_source' => 'nullable|in:ocr,filename,manual',
        ]);

        $user = auth()->user();

        $file = $request->file('file');
        $path = $file->store("documents/{$user->id}", 'public');

        Document::create([
            'user_id'          => $user->id,
            'type'             => $request->type,
            'detection_source' => $request->detection_source ?? 'manual',
            'file_path'        => $path,
            'original_name'    => $file->getClientOriginalName(),
            'status'           => 'pending',
        ]);

        // Notify admins of the new document submission
        Notification::create([
            'type'    => 'document_submission',
            'message' => "{$user->name} submitted a {$request->type} document",
            'link'    => route('admin.documents.index'),
        ]);

        return back()->with('success', 'Document uploaded successfully.');
    }

    public function destroy($id)
    {
        $document = Document::findOrFail($id);

        // Only allow the owner to delete their own document
        if ((int) $document->user_id !== (int) auth()->id()) {
            abort(403);
        }

        // Remove the physical file from storage first
        if ($document->file_path && Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }

        $document->delete();

        return back()->with('success', 'Document deleted successfully.');
    }

    // ✅ NEW — bulk delete for the Gmail-style "select all" checkboxes on
    // Volunteer/Documents.jsx. Mirrors destroy()'s ownership check and
    // storage cleanup, but works across a batch of ids in one request.
    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'integer|exists:documents,id',
        ]);

        // Only fetch documents that actually belong to the logged-in user —
        // this silently excludes any id that isn't theirs, same protection
        // as the abort(403) check in destroy(), but safe for a batch request.
        $documents = Document::whereIn('id', $request->ids)
            ->where('user_id', auth()->id())
            ->get();

        foreach ($documents as $document) {
            if ($document->file_path && Storage::disk('public')->exists($document->file_path)) {
                Storage::disk('public')->delete($document->file_path);
            }
            $document->delete();
        }

        $count = $documents->count();

        return back()->with('success', "{$count} document" . ($count > 1 ? 's' : '') . ' deleted successfully.');
    }

    public function serveFile($id)
    {
        $document = Document::findOrFail($id);

        if ((int) $document->user_id !== (int) auth()->id()) {
            abort(403);
        }

        $path = $this->resolvedPath($document->file_path);

        if (!file_exists($path) || is_dir($path)) {
            abort(404, 'File not found on disk.');
        }

        $mime = mime_content_type($path) ?: 'application/octet-stream';

        return response()->file($path, [
            'Content-Type'        => $mime,
            'Content-Disposition' => 'inline; filename="' . ($document->original_name ?: basename($path)) . '"',
        ]);
    }

    public function download($id)
    {
        $document = Document::findOrFail($id);

        if ((int) $document->user_id !== (int) auth()->id()) {
            abort(403);
        }

        $path = $this->resolvedPath($document->file_path);

        if (!file_exists($path) || is_dir($path)) {
            abort(404, 'File not found on disk.');
        }

        return response()->download($path, $document->original_name ?: basename($path));
    }
}
