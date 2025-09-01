<?php

namespace App\Policies;

use App\Models\Correction;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CorrectionPolicy
{
    use HandlesAuthorization;

    public function create(User $user, Correction $correction): bool
    {
        // Только член группы может создать коррекцию
        return $correction->schedule->group->members()->where('user_id', $user->id)->exists();
    }

    public function update(User $user, Correction $correction): bool
    {
        // Только владелец группы может редактировать
        return $correction->schedule->group->owner_id === $user->id;
    }

    public function delete(User $user, Correction $correction): bool
    {
        return $this->update($user, $correction);
    }
}
