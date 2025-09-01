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
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class GroupsController extends Controller
{
    public function destroy(Request $request, Group $group): RedirectResponse
    {
        Gate::authorize('delete', $group);

        $group->delete();

        return redirect()->route('lk.index')->with('success', 'Группа удалена');
    }

    public function setCurrent(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'group_id' => ['required', 'integer', 'exists:groups,id'],
        ]);
        $user = $request->user();
        $group = Group::findOrFail($data['group_id']);
        // Ensure user is a member
        if (! $group->members()->where('user_id', $user->id)->exists()) {
            abort(403);
        }
        $user->current_group_id = $group->id;
        $user->save();

        return back()->with('success', 'Текущая группа выбрана');
    }

    public function update(StoreGroupRequest $request, Group $group): RedirectResponse
    {
        Gate::authorize('update', $group);
        $validated = $request->validated();
        $group->update(['name' => $validated['name']]);

        return back()->with('success', 'Группа обновлена');
    }

    public function removeMember(Request $request, Group $group, User $user): RedirectResponse
    {
        Gate::authorize('manageMembers', $group);
        // Owner cannot be removed by this endpoint to avoid lockouts
        if ($user->id === $group->owner_id) {
            return back()->with('error', 'Нельзя удалить владельца группы');
        }
        $group->members()->detach($user->id);

        return back()->with('success', 'Участник удален');
    }

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

        // Owner will be attached by the GroupObserver
        return redirect()->back()->with('success', 'Группа создана');
    }

    public function invite(InviteToGroupRequest $request, Group $group): RedirectResponse
    {
        Gate::authorize('manageMembers', $group);

        $validated = $request->validated();

        $user = User::where('email', $validated['email'])->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'email' => ['Пользователь не найден'],
            ]);
        }

        // Avoid duplicate attachment
        if (! $group->members()->where('user_id', $user->id)->exists()) {
            $group->members()->attach($user->id, [
                'role' => 'member',
                'joined_at' => now(),
            ]);
        }

        return redirect()->back()->with('success', 'Пользователь добавлен в группу');
    }
}
