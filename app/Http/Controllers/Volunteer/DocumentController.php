<?php

namespace App\Http\Controllers\Volunteer;

use App\Http\Controllers\Controller;
use App\Models\Document;
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
            'documents' => $documents,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:nbi,medical,training,barangay',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $user = auth()->user();

        $file = $request->file('file');
        $path = $file->store("documents/{$user->id}", 'public');

        Document::create([
            'user_id'       => $user->id,
            'type'          => $request->type,
            'file_path'     => $path,
            'original_name' => $file->getClientOriginalName(),
            'status'        => 'pending',
        ]);

        return back()->with('success', 'Document uploaded successfully.');
    }

    public function destroy($id)
    {
        $document = Document::where('id', $id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        Storage::disk('public')->delete($document->file_path);
        $document->delete();

        return back()->with('success', 'Document deleted successfully.');
    }
}
