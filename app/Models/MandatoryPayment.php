<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MandatoryPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'name', 'category_id', 'default_amount', 'default_cycle_template_id', 'schedule', 'due_day', 'account_id', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'default_amount' => 'decimal:2',
            'is_active' => 'bool',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function defaultCycleTemplate(): BelongsTo
    {
        return $this->belongsTo(IncomeCycleTemplate::class, 'default_cycle_template_id');
    }

    public function allocations(): HasMany
    {
        return $this->hasMany(PaymentAllocation::class);
    }
}
