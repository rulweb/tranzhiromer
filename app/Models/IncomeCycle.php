<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class IncomeCycle extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'template_id', 'period_ref', 'planned_amount', 'received_amount', 'received_at', 'account_id', 'expected_day',
    ];

    protected function casts(): array
    {
        return [
            'planned_amount' => 'decimal:2',
            'received_amount' => 'decimal:2',
            'received_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(IncomeCycleTemplate::class, 'template_id');
    }

    public function allocations(): HasMany
    {
        return $this->hasMany(PaymentAllocation::class);
    }
}
