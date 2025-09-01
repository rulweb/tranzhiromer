<?php

namespace App\Http\Controllers\Lk;

use App\Http\Controllers\Controller;
use App\Http\Requests\Lk\Groups\InviteToGroupRequest;
use App\Http\Requests\Lk\Groups\StoreGroupRequest;
use App\Models\Group;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class GroupsController extends Controller
{
    public function index(Request $request): InertiaResponse
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

        return Inertia::render('Lk/Groups/Index', [
            'groups' => $groups,
        ]);
    }

    public function store(StoreGroupRequest $request): RedirectResponse
    {
        Gate::authorize('create', Group::class);

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

        return redirect()->back()->with('success', 'Группа создана');
    }

    public function invite(InviteToGroupRequest $request, Group $group): RedirectResponse
    {
        Gate::authorize('manageMembers', $group);

        $validated = $request->validated();

        $user = User::where('email', $validated['email'])->firstOrFail();

        // Avoid duplicate attachment
        if (!$group->members()->where('user_id', $user->id)->exists()) {
            $group->members()->attach($user->id, [
                'role' => 'member',
                'joined_at' => now(),
            ]);
        }

        return redirect()->back()->with('success', 'Пользователь добавлен в группу');
    }
}
