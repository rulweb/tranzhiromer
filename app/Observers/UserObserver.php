<?php

namespace App\Observers;

use App\Models\Group;
use App\Models\Schedule;
use App\Models\User;

class UserObserver
{
    public function created(User $user): void
    {
        $this->createGroupAndDemo($user);
    }

    private function createGroupAndDemo(User $user): void
    {
        // Создаём группу
        /** @var Group $group */
        $group = Group::factory()
            ->create([
                'name' => 'По умолчанию',
                'owner_id' => $user->id,
            ]);

        // Доход: Основная зарплата
        $salary = Schedule::factory()
            ->group($group->id)
            ->income()
            ->create([
                'name' => 'Зарплата',
                'description' => 'Основной доход',
                'icon' => 'wallet',
                'period_type' => 'monthly',
                'day_of_month' => 5,
                'amount' => 120000,
            ]);

        // Доход: Подработка
        Schedule::factory()
            ->group($group->id)
            ->income()
            ->create([
                'name' => 'Фриланс',
                'description' => 'Дополнительный заработок на проектах',
                'icon' => 'briefcase',
                'period_type' => 'one_time',
                'single_date' => '2025-06-15',
                'amount' => 25000,
            ]);
    }
}
