<?php

namespace App\Http\Controllers\Lk;

use App\Http\Controllers\Controller;
use App\Models\IncomeCycleTemplate;
use App\Models\MandatoryPayment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MandatoryPaymentsController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $payments = MandatoryPayment::query()
            ->where('user_id', $user->id)
            ->orderBy('name')
            ->get();

        $templates = IncomeCycleTemplate::query()
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->orderBy('sequence')
            ->get(['id', 'name']);

        return Inertia::render('Lk/MandatoryPayments/Index', [
            'payments' => $payments,
            'templates' => $templates,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'integer'],
            'default_amount' => ['required', 'numeric', 'min:0.01'],
            'default_cycle_template_id' => ['nullable', 'integer'],
            'schedule' => ['required', 'in:monthly,custom'],
            'due_day' => ['nullable', 'integer', 'between:1,31'],
            'account_id' => ['nullable', 'integer'],
        ]);

        MandatoryPayment::query()->create(array_merge($data, [
            'user_id' => $request->user()->id,
            'is_active' => true,
        ]));

        return back()->with('success', 'Платёж создан');
    }
}
