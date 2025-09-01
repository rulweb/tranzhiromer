<?php

namespace App\Policies;

use App\Models\Schedule;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class SchedulePolicy
{
    use HandlesAuthorization;

    public function view(User $user, Schedule $schedule): bool
    {
        return $schedule->group->members()->where('user_id', $user->id)->exists();
    }

    public function create(User $user, Schedule $schedule): bool
    {
        return $schedule->group->members()->where('user_id', $user->id)->exists();
    }

    public function update(User $user, Schedule $schedule): bool
    {
        return $schedule->group->owner_id === $user->id;
    }

    public function delete(User $user, Schedule $schedule): bool
    {
        return $this->update($user, $schedule);
    }
}
