<?php

namespace App\Http\Controllers\Lk;

use App\Http\Controllers\Controller;
use App\Models\PaymentAllocation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $today = Carbon::today();
        $limitDate = $today->clone()->addDays(30);

        $upcoming = PaymentAllocation::query()
            ->with(['mandatoryPayment:id,name', 'incomeCycle.template:id,name', 'incomeCycle'])
            ->where('user_id', $user->id)
            ->whereNotNull('planned_due_on')
            ->whereBetween('planned_due_on', [$today->toDateString(), $limitDate->toDateString()])
            ->orderBy('planned_due_on')
            ->limit(100)
            ->get()
            ->map(function (PaymentAllocation $a): array {
                return [
                    'id' => $a->id,
                    'name' => $a->mandatoryPayment?->name,
                    'planned_amount' => (string) $a->planned_amount,
                    'planned_due_on' => optional($a->planned_due_on)->toDateString(),
                    'status' => $a->status,
                    'cycle' => [
                        'id' => $a->incomeCycle?->id,
                        'period_ref' => $a->incomeCycle?->period_ref,
                        'template_name' => $a->incomeCycle?->template?->name,
                    ],
                ];
            });

        return Inertia::render('Lk/Index', [
            'upcomingPayments' => $upcoming,
        ]);
    }
}
