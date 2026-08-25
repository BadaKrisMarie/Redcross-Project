<?php

namespace App\Http\Controllers\Volunteer;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\DocumentCategory;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DocumentController extends Controller
{
    public function index()
    {
        // ✅ FIXED: fresh() + avatar_url/photo_url para consistent sa middleware
        $user = auth()->user()->fresh();

        $documents = Document::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        // ✅ NEW — dynamic folders/categories (no longer hardcoded to
        // nbi/medical/training/barangay). Admin-created custom folders show
        // up here automatically as soon as they're created.
        $categories = DocumentCategory::orderBy('id')->get();

        return Inertia::render('Volunteer/Documents', [
            'auth' => [
                'user' => array_merge(
                    $user->toArray(),
                    [
                        'avatar_url' => $user->avatar_url,
                        'photo_url'  => $user->avatar_url, // ✅ same as HandleInertiaRequests
                    ]
                ),
            ],
            'documents'  => $documents,
            'categories' => $categories,
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
}
