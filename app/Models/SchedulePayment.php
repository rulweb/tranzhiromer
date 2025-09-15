<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $group_id
 * @property int $schedule_id
 * @property \Illuminate\Support\Carbon $month
 * @property \Illuminate\Support\Carbon|null $paid_at
 * @property string|null $leftover
 * @property bool $is_cash_leftover
 */
class SchedulePayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'group_id',
        'schedule_id',
        'month',
        'paid_at',
        'leftover',
        'is_cash_leftover',
    ];

    protected $casts = [
        'month' => 'date',
        'paid_at' => 'datetime',
        'is_cash_leftover' => 'boolean',
    ];

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }
}
