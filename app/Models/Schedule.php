<?php

namespace App\Models;

use App\Enums\SchedulePeriodType;
use App\Enums\ScheduleType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $group_id
 * @property ScheduleType $type
 * @property SchedulePeriodType $period_type
 * @property int|null $parent_id
 * @property int|null $day_of_month 1-31
 * @property int|null $day_of_week 0-6 (0=вс)
 * @property string|null $time_of_day
 * @property \Illuminate\Support\Carbon|null $single_date
 * @property string $amount
 * @property \Illuminate\Support\Carbon|null $end_date null = бессрочно
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Schedule> $children
 * @property-read int|null $children_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Correction> $corrections
 * @property-read int|null $corrections_count
 * @property-read \App\Models\Group $group
 * @property-read Schedule|null $parent
 * @method static \Database\Factories\ScheduleFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereDayOfMonth($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereDayOfWeek($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereEndDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereGroupId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereParentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule wherePeriodType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereSingleDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereTimeOfDay($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class Schedule extends Model
{
    /** @use HasFactory<\Database\Factories\ScheduleFactory> */
    use HasFactory;

    protected $fillable = [
        'group_id',
        'name',
        'description',
        'icon',
        'type',
        'period_type',
        'parent_id',
        'day_of_month',
        'day_of_week',
        'time_of_day',
        'single_date',
        'amount',
        'end_date',
    ];

    protected $casts = [
        'type' => ScheduleType::class,
        'period_type' => SchedulePeriodType::class,
        'end_date' => 'date',
        'single_date' => 'date',
    ];

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Schedule::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Schedule::class, 'parent_id');
    }

    public function corrections(): HasMany
    {
        return $this->hasMany(Correction::class);
    }
}
