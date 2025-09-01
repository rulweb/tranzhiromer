<?php

namespace App\Observers;

use App\Models\Group;

class GroupObserver
{
    /**
     * Handle the Group "created" event.
     */
    public function created(Group $group): void
    {
        // If owner_id is set, ensure the owner is attached to the group as 'owner'.
        if ($group->owner_id !== null) {
            // Avoid duplicate entries if seeder or factory already attached.
            $alreadyAttached = $group->members()
                ->where('users.id', $group->owner_id)
                ->exists();

            if (! $alreadyAttached) {
                $group->members()->attach($group->owner_id, [
                    'role' => 'owner',
                    'joined_at' => now(),
                ]);
            }

            $group->owner()->update(['current_group_id' => $group->id]);
        }
    }
}
