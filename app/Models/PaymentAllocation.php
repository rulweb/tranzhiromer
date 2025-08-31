<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentAllocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'mandatory_payment_id', 'income_cycle_id', 'planned_amount', 'paid_amount', 'status', 'paid_transaction_id', 'planned_due_on', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'planned_amount' => 'decimal:2',
            'paid_amount' => 'decimal:2',
            'planned_due_on' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function mandatoryPayment(): BelongsTo
    {
        return $this->belongsTo(MandatoryPayment::class);
    }

    public function incomeCycle(): BelongsTo
    {
        return $this->belongsTo(IncomeCycle::class);
    }
}
