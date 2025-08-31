<?php

namespace App\Http\Controllers\Lk;

use App\Http\Controllers\Controller;
use App\Http\Requests\PaymentAllocationPayRequest;
use App\Http\Requests\PaymentAllocationUpdateRequest;
use App\Models\PaymentAllocation;
use Illuminate\Http\RedirectResponse;

class PaymentAllocationsController extends Controller
{
    public function update(PaymentAllocationUpdateRequest $request, int $id): RedirectResponse
    {
        $user = $request->user();

        $allocation = PaymentAllocation::query()
            ->where('user_id', $user->id)
            ->findOrFail($id);

        $data = $request->validated();

        $allocation->fill($data);
        $allocation->save();

        return back()->with('success', 'Аллокация обновлена');
    }

    public function move(\App\Http\Requests\PaymentAllocationMoveRequest $request, int $id): RedirectResponse
    {
        $user = $request->user();
        $allocation = PaymentAllocation::query()
            ->where('user_id', $user->id)
            ->with('incomeCycle')
            ->findOrFail($id);

        $targetCycleId = (int) $request->validated()['target_cycle_id'];

        // Ensure target cycle belongs to same user and same month
        $targetCycle = \App\Models\IncomeCycle::query()
            ->where('user_id', $user->id)
            ->findOrFail($targetCycleId);

        if ($targetCycle->period_ref !== $allocation->incomeCycle->period_ref) {
            return back()->with('error', 'Нельзя переносить между разными месяцами');
        }

        $allocation->income_cycle_id = $targetCycle->id;
        if ($request->filled('notes')) {
            $allocation->notes = trim((string) $request->input('notes'));
        }
        $allocation->save();

        return back()->with('success', 'Платёж перенесён');
    }

    public function pay(PaymentAllocationPayRequest $request, int $id): RedirectResponse
    {
        $user = $request->user();
        $allocation = PaymentAllocation::query()
            ->where('user_id', $user->id)
            ->findOrFail($id);

        $amount = (float) $request->validated()['amount'];
        $allocation->paid_amount = ($allocation->paid_amount ?? 0) + $amount;
        $allocation->status = $allocation->paid_amount >= $allocation->planned_amount ? 'paid' : 'partial';

        if ($request->filled('paid_transaction_id')) {
            $allocation->paid_transaction_id = (int) $request->input('paid_transaction_id');
        }
        if ($request->filled('notes')) {
            $allocation->notes = trim((string) $request->input('notes'));
        }

        $allocation->save();

        return back()->with('success', 'Оплата сохранена');
    }
}
