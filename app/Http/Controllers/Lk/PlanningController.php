<?php

namespace App\Http\Controllers\Lk;

use App\Http\Controllers\Controller;
use App\Models\IncomeCycle;
use App\Models\IncomeCycleTemplate;
use App\Models\MandatoryPayment;
use App\Models\PaymentAllocation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlanningController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $month = $request->string('month')->toString() ?: now()->format('Y-m');

        $cycles = IncomeCycle::query()
            ->with(['template', 'allocations.mandatoryPayment'])
            ->where('user_id', $user->id)
            ->where('period_ref', $month)
            ->orderBy('id')
            ->get();

        // Provide templates to help create one-off payments into a cycle
        $templates = IncomeCycleTemplate::query()
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->orderBy('sequence')
            ->get(['id', 'name']);

        return Inertia::render('Lk/Planning/Index', [
            'month' => $month,
            'cycles' => $cycles,
            'templates' => $templates,
        ]);
    }

    public function createOneOff(Request $request): RedirectResponse
    {
        $user = $request->user();
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'planned_due_on' => ['nullable', 'date'],
            'income_cycle_id' => ['required', 'integer'],
            'category_id' => ['nullable', 'integer'],
        ]);

        $cycle = IncomeCycle::query()
            ->where('user_id', $user->id)
            ->findOrFail((int) $data['income_cycle_id']);

        // Create lightweight mandatory payment (custom schedule) for this user; keep it active for history
        $payment = MandatoryPayment::query()->create([
            'user_id' => $user->id,
            'name' => $data['name'],
            'category_id' => $data['category_id'] ?? 0,
            'default_amount' => $data['amount'],
            'default_cycle_template_id' => $cycle->template_id,
            'schedule' => 'custom',
            'due_day' => null,
            'account_id' => null,
            'is_active' => true,
        ]);

        PaymentAllocation::query()->create([
            'user_id' => $user->id,
            'mandatory_payment_id' => $payment->id,
            'income_cycle_id' => $cycle->id,
            'planned_amount' => $data['amount'],
            'planned_due_on' => $data['planned_due_on'] ?? null,
            'status' => 'planned',
        ]);

        return back()->with('success', 'Разовый платёж добавлен');
    }
}
