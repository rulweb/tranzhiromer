<?php

namespace Database\Seeders;

use App\Models\Correction;
use App\Models\Group;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Database\Seeder;

class BudgetDemoSeeder extends Seeder
{
    public function run(): void
    {
        // Создаём пользователя
        /** @var User $user */
        $user = User::factory()->create([
            'name' => 'Антон Шипулин',
            'email' => 'rul22rus@yandex.ru',
            'avatar' => 'https://avatars.yandex.net/get-yapic/50071/enc-4cfa97be407754bafa2aafbb5f6be44d184cedf62d88d3d42f496e4563fab5d7/islands-200',
            'remember_token' => 'jJnFAdcAT1NszXTIO55yC2tGlE64YlG9VNR3FfFBeuPu6PmBSNCou9vs1sAn',
        ]);

        // Создаём группу
        /** @var Group $group */
        $group = Group::factory()
            ->create([
                'name' => 'Семья Шипулиных',
                'owner_id' => $user->id,
            ]);

        // Доход: Основная зарплата
        $salary = Schedule::factory()
            ->group($group->id)
            ->income()
            ->create([
                'name' => 'Зарплата',
                'description' => 'Основной доход от основной работы',
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

        // Расход: Аренда (привязан к зарплате)
        Schedule::factory()
            ->group($group->id)
            ->expense()
            ->parent($salary->id)
            ->create([
                'name' => 'Аренда',
                'description' => 'Ежемесячная оплата квартиры',
                'icon' => 'home',
                'period_type' => 'monthly',
                'day_of_month' => 3,
                'amount' => 45000,
            ]);

        // Расход: Коммуналка
        Schedule::factory()
            ->group($group->id)
            ->expense()
            ->parent($salary->id)
            ->create([
                'name' => 'Коммуналка',
                'description' => 'Свет, вода, отопление',
                'icon' => 'thermometer',
                'period_type' => 'monthly',
                'day_of_month' => 10,
                'amount' => 8500,
            ]);

        // Расход: Еда
        Schedule::factory()
            ->group($group->id)
            ->expense()
            ->parent($salary->id)
            ->create([
                'name' => 'Еда',
                'description' => 'Продукты и кафе',
                'icon' => 'utensils',
                'period_type' => 'monthly',
                'day_of_month' => 1,
                'amount' => 25000,
            ]);

        // Расход: Транспорт
        Schedule::factory()
            ->group($group->id)
            ->expense()
            ->parent($salary->id)
            ->create([
                'name' => 'Транспорт',
                'description' => 'Бензин и метро',
                'icon' => 'car',
                'period_type' => 'monthly',
                'day_of_month' => 7,
                'amount' => 6000,
            ]);

        // Расход: Подписки
        Schedule::factory()
            ->group($group->id)
            ->expense()
            ->create([
                'name' => 'Подписки',
                'description' => 'Spotify, YouTube Premium',
                'icon' => 'music',
                'period_type' => 'monthly',
                'day_of_month' => 1,
                'amount' => 1200,
            ]);

        // Коррекция: зарплата пришла позже
        Correction::factory()->create([
            'schedule_id' => $salary->id,
            'adjusted_date' => '2025-04-07',
            'amount' => null, // сумма не менялась
        ]);

        // Одноразовый расход: Подарок
        Schedule::factory()
            ->group($group->id)
            ->expense()
            ->create([
                'name' => 'Подарок',
                'description' => 'День рождения друга',
                'icon' => 'gift',
                'period_type' => 'one_time',
                'single_date' => '2025-05-20',
                'amount' => 3000,
            ]);

        $this->command->info('✅ Demo data created with icons, names and descriptions!');
    }
}
