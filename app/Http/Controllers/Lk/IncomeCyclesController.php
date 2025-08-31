<?php

namespace App\Http\Controllers\Lk;

use App\Http\Controllers\Controller;
use App\Models\IncomeCycle;
use App\Models\IncomeCycleTemplate;
use App\Models\MandatoryPayment;
use App\Models\PaymentAllocation;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class IncomeCyclesController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $month = $request->string('month')->toString() ?: now()->format('Y-m');

        $cycles = IncomeCycle::query()
            ->with(['template', 'allocations.mandatoryPayment'])
            ->where('user_id', $user->id)
            ->where('period_ref', $month)
            ->orderByRaw('1')
            ->get();

        return Inertia::render('Lk/IncomeCycles/Index', [
            'month' => $month,
            'cycles' => $cycles,
        ]);
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $user = $request->user();
        $cycle = IncomeCycle::query()->where('user_id', $user->id)->findOrFail($id);

        $data = $request->validate([
            'planned_amount' => ['nullable', 'numeric', 'min:0'],
            'expected_day' => ['nullable', 'integer', 'between:1,31'],
        ]);

        $cycle->fill($data);
        $cycle->save();

        return back()->with('success', 'Доход обновлён');
    }

    public function bootstrap(Request $request): RedirectResponse
    {
        $user = $request->user();
        $period = $request->string('period_ref')->toString() ?: now()->format('Y-m');
        $prev = Carbon::createFromFormat('Y-m', $period)->subMonth()->format('Y-m');

        DB::transaction(function () use ($user, $period, $prev): void {
            // Ensure default templates exist
            if (! IncomeCycleTemplate::query()->where('user_id', $user->id)->where('is_active', true)->exists()) {
                IncomeCycleTemplate::query()->create([
                    'user_id' => $user->id,
                    'key' => 'advance',
                    'name' => 'Аванс',
                    'sequence' => 10,
                    'default_expected_day' => 15,
                    'is_active' => true,
                ]);
                IncomeCycleTemplate::query()->create([
                    'user_id' => $user->id,
                    'key' => 'salary',
                    'name' => 'Зарплата',
                    'sequence' => 20,
                    'default_expected_day' => 30,
                    'is_active' => true,
                ]);
            }

            $templates = IncomeCycleTemplate::query()
                ->where('user_id', $user->id)
                ->where('is_active', true)
                ->orderBy('sequence')
                ->get();

            // Ensure cycles for month
            $cyclesByTemplate = [];
            foreach ($templates as $tpl) {
                $cycle = IncomeCycle::query()->firstOrCreate([
                    'user_id' => $user->id,
                    'template_id' => $tpl->id,
                    'period_ref' => $period,
                ], [
                    'expected_day' => $tpl->default_expected_day,
                ]);
                $cyclesByTemplate[$tpl->id] = $cycle;
            }

            // Create/update allocations for active mandatory payments
            $payments = MandatoryPayment::query()
                ->where('user_id', $user->id)
                ->where('is_active', true)
                ->get();

            foreach ($payments as $p) {
                $tplId = $p->default_cycle_template_id ?: $templates->first()?->id;
                if (! $tplId) {
                    continue;
                }
                $cycle = $cyclesByTemplate[$tplId] ?? null;
                if (! $cycle) {
                    continue;
                }

                // Determine prev allocation
                $prevCycle = IncomeCycle::query()
                    ->where('user_id', $user->id)
                    ->where('template_id', $tplId)
                    ->where('period_ref', $prev)
                    ->first();

                $prevAlloc = null;
                if ($prevCycle) {
                    $prevAlloc = PaymentAllocation::query()
                        ->where('user_id', $user->id)
                        ->where('mandatory_payment_id', $p->id)
                        ->where('income_cycle_id', $prevCycle->id)
                        ->first();
                }

                $plannedAmount = $prevAlloc?->planned_amount ?? $p->default_amount;
                $dueDay = null;
                if ($prevAlloc?->planned_due_on) {
                    $dueDay = Carbon::parse($prevAlloc->planned_due_on)->day;
                } elseif (! is_null($p->due_day)) {
                    $dueDay = (int) $p->due_day;
                }

                $plannedDueOn = null;
                if ($dueDay) {
                    $start = Carbon::createFromFormat('Y-m', $period)->startOfMonth();
                    $end = (clone $start)->endOfMonth();
                    $day = min($dueDay, (int) $end->day);
                    $plannedDueOn = $start->clone()->day($day)->toDateString();
                }

                PaymentAllocation::query()->updateOrCreate([
                    'user_id' => $user->id,
                    'mandatory_payment_id' => $p->id,
                    'income_cycle_id' => $cycle->id,
                ], [
                    'planned_amount' => $plannedAmount,
                    'planned_due_on' => $plannedDueOn,
                    'status' => 'planned',
                ]);
            }
        });

        return back()->with('success', 'Циклы и платежи сформированы');
    }
}
