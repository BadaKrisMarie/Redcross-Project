<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DocumentCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DocumentCategoryController extends Controller
{
    // ✅ small rotating color palette so new custom folders get a distinct
    // accent color instead of all looking the same gray.
    private array $palette = [
        '#5B7FDE', '#3E9C6E', '#9066C7', '#C98A2E',
        '#DC6B6B', '#2CA6A4', '#B85C9E', '#5C8A9E',
    ];

    // ✅ Called from AdminDocumentsIndex.jsx's "Create New Folder" modal.
    // Auto-generates a unique slug `key` from the label (this is the value
    // that gets stored in documents.type once volunteers start uploading
    // against this new category), and assigns the next color in the palette.
    public function store(Request $request)
    {
        $request->validate([
            'label' => 'required|string|max:100|unique:document_categories,label',
        ]);

        $label   = trim($request->label);
        $baseKey = Str::slug($label, '_');

        if ($baseKey === '') {
            return back()->withErrors(['label' => 'Please enter a valid folder name.']);
        }

        // Guard against slug collisions (e.g. "NBI Clearance!" vs "NBI Clearance?"
        // would both slug to "nbi_clearance").
        $key = $baseKey;
        $suffix = 1;
        while (DocumentCategory::where('key', $key)->exists()) {
            $suffix++;
            $key = $baseKey . '_' . $suffix;
        }

        $count = DocumentCategory::count();
        $color = $this->palette[$count % count($this->palette)];

        DocumentCategory::create([
            'key'        => $key,
            'label'      => $label,
            'color'      => $color,
            'is_default' => false,
            'created_by' => auth()->id(),
        ]);

        return back()->with('success', 'Folder created successfully.');
    }

    // ✅ NEW — Deletes a folder (document category) called from the trash
    // icon that appears on hover over a folder card in AdminDocumentsIndex.jsx.
    //
    // 🔒 Default folders (is_default = true — the 4 seeded at migration time:
    // NBI Clearance, Medical Certificate, Training Certificate, Barangay
    // Clearance) can NEVER be deleted, even via a direct request to this
    // route. Only custom folders admins created via "Create New Folder" can
    // be removed.
    //
    // ⚠️ CASCADE DELETE: removing a folder also permanently deletes every
    // document filed under it — both the DB rows AND the physical files on
    // disk. There is no "move to uncategorized" step. The frontend confirms
    // this with the admin before calling this route.
    public function destroy($id)
    {
        $category = DocumentCategory::find($id);

        if (!$category) {
            abort(404);
        }

        if ($category->is_default) {
            return back()->withErrors(['category' => 'Default folders cannot be deleted.']);
        }

        // "barangay" has a legacy typo variant ("bangray") that older rows
        // may still use — sweep both when deleting the barangay category.
        $types = $category->key === 'barangay' ? ['barangay', 'bangray'] : [$category->key];

        $documents = DB::table('documents')->whereIn('type', $types)->get();

        foreach ($documents as $doc) {
            if ($doc->file_path) {
                $path = storage_path('app/public/' . $doc->file_path);
                if (file_exists($path)) {
                    unlink($path);
                }
            }
        }

        DB::table('documents')->whereIn('type', $types)->delete();

        $category->delete();

        return back()->with('success', 'Folder deleted successfully.');
    }
}