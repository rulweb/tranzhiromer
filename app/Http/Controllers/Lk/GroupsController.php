<?php

namespace App\Http\Controllers\Lk;

use App\Http\Controllers\Controller;
use App\Http\Requests\Lk\Groups\InviteToGroupRequest;
use App\Http\Requests\Lk\Groups\StoreGroupRequest;
use App\Models\Group;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class GroupsController extends Controller
{
    public function index(Request $request): JsonResponse|InertiaResponse
    {
        $user = $request->user();

        $groups = Group::query()
            ->withCount('members')
            ->with('owner')
            ->whereHas('members', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->orderByDesc('id')
            ->get();

        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json(['data' => $groups]);
        }

        return Inertia::render('Lk/Groups/Index', [
            'groups' => $groups,
        ]);
    }

    public function store(StoreGroupRequest $request): JsonResponse
    {
        $this->authorize('create', Group::class);

        $validated = $request->validated();

        $group = Group::create([
            'name' => $validated['name'],
            'owner_id' => $request->user()->id,
        ]);

        // attach owner as member
        $group->members()->attach($request->user()->id, [
            'role' => 'owner',
            'joined_at' => now(),
        ]);

        return response()->json(['data' => $group->loadCount('members')], 201);
    }

    public function invite(InviteToGroupRequest $request, Group $group): JsonResponse
    {
        $this->authorize('manageMembers', $group);

        $validated = $request->validated();

        $user = User::where('email', $validated['email'])->firstOrFail();

        // Avoid duplicate attachment
        if (! $group->members()->where('user_id', $user->id)->exists()) {
            $group->members()->attach($user->id, [
                'role' => 'member',
                'joined_at' => now(),
            ]);
        }

        return response()->json(['message' => 'User invited', 'data' => $group->load('members')]);
    }
}
