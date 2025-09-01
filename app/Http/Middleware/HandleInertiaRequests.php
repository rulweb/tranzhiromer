<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $groups = [];
        $currentGroup = null;
        if ($user) {
            $groups = \App\Models\Group::query()
                ->select(['id', 'name', 'owner_id'])
                ->whereHas('members', fn ($q) => $q->where('user_id', $user->id))
                ->orderBy('name')
                ->get();
            if ($user->current_group_id) {
                $currentGroup = $groups->firstWhere('id', $user->current_group_id);
            }
            if (! $currentGroup && $groups->count() > 0) {
                $currentGroup = $groups->first();
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => fn () => $user?->only(['id', 'name', 'email', 'avatar', 'current_group_id']),
                'groups' => fn () => $groups,
                'currentGroup' => fn () => $currentGroup,
                'currentGroupMembers' => fn () => $currentGroup ? \App\Models\Group::with('members')->find($currentGroup->id)?->members->map->only(['id', 'name', 'email']) : [],
            ],
        ];
    }
}
