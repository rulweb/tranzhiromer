<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class IncomeCycleTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'key', 'name', 'sequence', 'default_expected_day', 'default_account_id', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'bool',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function incomeCycles(): HasMany
    {
        return $this->hasMany(IncomeCycle::class, 'template_id');
    }

    public function mandatoryPayments(): HasMany
    {
        return $this->hasMany(MandatoryPayment::class, 'default_cycle_template_id');
    }
}
