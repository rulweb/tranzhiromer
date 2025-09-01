<?php

namespace App\Policies;

use App\Models\Group;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Auth\Access\Response;

class GroupPolicy
{
    use HandlesAuthorization;

    public function view(User $user, Group $group): bool
    {
        return $group->members()->where('user_id', $user->id)->exists();
    }

    public function update(User $user, Group $group): bool
    {
        return $group->owner_id === $user->id;
    }

    public function delete(User $user, Group $group): bool
    {
        return $this->update($user, $group);
    }

    public function manageMembers(User $user, Group $group): bool
    {
        return $group->owner_id === $user->id;
    }

    public function create(User $user): bool
    {
        return true; // любой авторизованный пользователь может создать группу
    }
}
