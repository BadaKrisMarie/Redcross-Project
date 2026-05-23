<?php

namespace App\Http\Controllers;

use App\Models\AboutContent;
use App\Models\AboutValue;
use App\Models\AboutService;
use App\Models\AboutStat;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AboutController extends Controller
{
    // ── PUBLIC: Show About Page ──
    public function index()
    {
        return Inertia::render('About', [
            'contents' => AboutContent::all()->pluck('value', 'key'),
            'values'   => AboutValue::orderBy('order')->get(),
            'services' => AboutService::orderBy('order')->get(),
            'stats'    => AboutStat::orderBy('order')->get(),
        ]);
    }

    // ── ADMIN: Show Edit Form ──
    public function edit()
    {
        return Inertia::render('Admin/AboutEdit', [
            'contents' => AboutContent::all()->pluck('value', 'key'),
            'values'   => AboutValue::orderBy('order')->get(),
            'services' => AboutService::orderBy('order')->get(),
            'stats'    => AboutStat::orderBy('order')->get(),
        ]);
    }

    // ── ADMIN: Save Contents (Mission, Vision, Hero) ──
    public function updateContents(Request $request)
    {
        $validated = $request->validate([
            'hero_title'    => 'required|string|max:255',
            'hero_subtitle' => 'required|string',
            'mission'       => 'required|string',
            'vision'        => 'required|string',
        ]);

        foreach ($validated as $key => $value) {
            AboutContent::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        return back()->with('success', 'Content updated successfully.');
    }

    // ── ADMIN: Save Core Values ──
    public function updateValues(Request $request)
    {
        $request->validate([
            'values'              => 'required|array',
            'values.*.title'      => 'required|string|max:255',
            'values.*.description'=> 'required|string',
        ]);

        // Delete removed items
        $ids = collect($request->values)->pluck('id')->filter();
        AboutValue::whereNotIn('id', $ids)->delete();

        foreach ($request->values as $i => $v) {
            AboutValue::updateOrCreate(
                ['id' => $v['id'] ?? null],
                ['title' => $v['title'], 'description' => $v['description'], 'order' => $i + 1]
            );
        }

        return back()->with('success', 'Core values updated successfully.');
    }

    // ── ADMIN: Save Services ──
    public function updateServices(Request $request)
    {
        $request->validate([
            'services'              => 'required|array',
            'services.*.title'      => 'required|string|max:255',
            'services.*.description'=> 'required|string',
        ]);

        $ids = collect($request->services)->pluck('id')->filter();
        AboutService::whereNotIn('id', $ids)->delete();

        foreach ($request->services as $i => $s) {
            AboutService::updateOrCreate(
                ['id' => $s['id'] ?? null],
                ['title' => $s['title'], 'description' => $s['description'], 'order' => $i + 1]
            );
        }

        return back()->with('success', 'Services updated successfully.');
    }

    // ── ADMIN: Save Stats ──
    public function updateStats(Request $request)
    {
        $request->validate([
            'stats'          => 'required|array',
            'stats.*.value'  => 'required|string|max:50',
            'stats.*.label'  => 'required|string|max:100',
            'stats.*.is_red' => 'boolean',
        ]);

        $ids = collect($request->stats)->pluck('id')->filter();
        AboutStat::whereNotIn('id', $ids)->delete();

        foreach ($request->stats as $i => $s) {
            AboutStat::updateOrCreate(
                ['id' => $s['id'] ?? null],
                ['value' => $s['value'], 'label' => $s['label'], 'is_red' => $s['is_red'] ?? false, 'order' => $i + 1]
            );
        }

        return back()->with('success', 'Stats updated successfully.');
    }
}
