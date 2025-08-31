<?php

namespace App\Http\Controllers\Lk;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Models\Transaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransactionsController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $type = $request->string('type')->toString();

        $query = Transaction::query()
            ->where('user_id', $user->id)
            ->orderByDesc('occurred_at');

        if (in_array($type, ['income', 'expense'], true)) {
            $query->where('type', $type);
        }

        $transactions = $query->limit(100)->get();

        return Inertia::render('Lk/Transactions/Index', [
            'transactions' => $transactions,
            'filterType' => $type ?: 'expense',
        ]);
    }

    public function store(StoreTransactionRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;
        Transaction::query()->create($data);

        return back()->with('success', 'Запись сохранена');
    }

    public function update(UpdateTransactionRequest $request, int $id): RedirectResponse
    {
        $user = $request->user();
        $tx = Transaction::query()->where('user_id', $user->id)->findOrFail($id);
        $tx->fill($request->validated());
        $tx->save();

        return back()->with('success', 'Запись обновлена');
    }

    public function destroy(Request $request, int $id): RedirectResponse
    {
        $user = $request->user();
        $tx = Transaction::query()->where('user_id', $user->id)->findOrFail($id);
        $tx->delete();

        return back()->with('success', 'Запись удалена');
    }
}
