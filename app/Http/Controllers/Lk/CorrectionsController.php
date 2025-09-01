<?php

namespace App\Http\Controllers\Lk;

use App\Http\Controllers\Controller;
use App\Http\Requests\Lk\Corrections\StoreCorrectionRequest;
use App\Http\Requests\Lk\Corrections\UpdateCorrectionRequest;
use App\Models\Correction;
use App\Models\Schedule;
use Illuminate\Http\JsonResponse;

class CorrectionsController extends Controller
{
    public function store(StoreCorrectionRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $schedule = Schedule::findOrFail($validated['schedule_id']);

        $correction = new Correction([
            'schedule_id' => $schedule->id,
            'amount' => $validated['amount'] ?? null,
            'adjusted_date' => $validated['adjusted_date'] ?? null,
        ]);

        $this->authorize('create', $correction);

        $correction->save();

        return response()->json(['data' => $correction], 201);
    }

    public function update(UpdateCorrectionRequest $request, Correction $correction): JsonResponse
    {
        $this->authorize('update', $correction);

        $validated = $request->validated();

        $correction->fill($validated)->save();

        return response()->json(['data' => $correction]);
    }
}
