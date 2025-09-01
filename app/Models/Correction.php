<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $schedule_id
 * @property string|null $amount если null — сумма не меняется
 * @property \Illuminate\Support\Carbon|null $adjusted_date новая дата платежа
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Schedule $schedule
 * @method static \Database\Factories\CorrectionFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Correction newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Correction newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Correction query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Correction whereAdjustedDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Correction whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Correction whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Correction whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Correction whereScheduleId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Correction whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class Correction extends Model
{
    /** @use HasFactory<\Database\Factories\CorrectionFactory> */
    use HasFactory;

    protected $fillable = ['schedule_id', 'amount', 'adjusted_date'];

    protected $casts = [
        'adjusted_date' => 'date',
    ];

    public function schedule(): BelongsTo|Schedule
    {
        return $this->belongsTo(Schedule::class);
    }
}
