<?php

namespace App\Http\Controllers\Lk;

use App\Http\Controllers\Controller;
use App\Http\Requests\Lk\Corrections\StoreCorrectionRequest;
use App\Http\Requests\Lk\Corrections\UpdateCorrectionRequest;
use App\Models\Correction;
use App\Models\Schedule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

class CorrectionsController extends Controller
{
    public function store(StoreCorrectionRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $schedule = Schedule::findOrFail($validated['schedule_id']);

        $correction = new Correction([
            'schedule_id' => $schedule->id,
            'amount' => $validated['amount'] ?? null,
            'adjusted_date' => $validated['adjusted_date'] ?? null,
        ]);

        Gate::authorize('create', $correction);

        $correction->save();

        return redirect()->back()->with('success', 'Коррекция добавлена');
    }

    public function update(UpdateCorrectionRequest $request, Correction $correction): RedirectResponse
    {
        Gate::authorize('update', $correction);

        $validated = $request->validated();

        $correction->fill($validated)->save();

        return redirect()->back()->with('success', 'Коррекция сохранена');
    }
}
