<?php

namespace Database\Factories;

use App\Enums\SchedulePeriodType;
use App\Enums\ScheduleType;
use Illuminate\Database\Eloquent\Factories\Factory;

class ScheduleFactory extends Factory
{
    public function definition(): array
    {
        $periodType = fake()->randomElement([
            SchedulePeriodType::MONTHLY,
            SchedulePeriodType::WEEKLY,
            SchedulePeriodType::DAILY,
            SchedulePeriodType::ONE_TIME,
        ]);

        // Наборы данных: name, description, icon
        $incomeItems = [
            ['name' => 'Зарплата', 'desc' => 'Основной доход от работы', 'icon' => 'wallet'],
            ['name' => 'Подработка', 'desc' => 'Фриланс или разовые заказы', 'icon' => 'briefcase'],
            ['name' => 'Дивиденды', 'desc' => 'Доход от инвестиций', 'icon' => 'trending-up'],
            ['name' => 'Пособие', 'desc' => 'Государственная поддержка', 'icon' => 'scale'],
            ['name' => 'Премия', 'desc' => 'Ежегодная или квартальная премия', 'icon' => 'gift'],
        ];

        $expenseItems = [
            ['name' => 'Аренда', 'desc' => 'Ежемесячная аренда жилья', 'icon' => 'home'],
            ['name' => 'Коммуналка', 'desc' => 'Оплата света, воды, отопления', 'icon' => 'thermometer'],
            ['name' => 'Еда', 'desc' => 'Продукты и кафе', 'icon' => 'utensils'],
            ['name' => 'Транспорт', 'desc' => 'Бензин, метро, такси', 'icon' => 'car'],
            ['name' => 'Развлечения', 'desc' => 'Кино, игры, хобби', 'icon' => 'gamepad-2'],
            ['name' => 'Обучение', 'desc' => 'Курсы, книги, подписки', 'icon' => 'book-open'],
            ['name' => 'Медицина', 'desc' => 'Лекарства, врачи', 'icon' => 'heart'],
            ['name' => 'Одежда', 'desc' => 'Покупка вещей', 'icon' => 'shirt'],
            ['name' => 'Автомобиль', 'desc' => 'ТО, страховка, мойка', 'icon' => 'wrench'],
            ['name' => 'Подписки', 'desc' => 'Netflix, Spotify и др.', 'icon' => 'music'],
        ];

        $type = fake()->randomElement([ScheduleType::INCOME, ScheduleType::EXPENSE]);
        $item = fake()->randomElement($type === ScheduleType::INCOME ? $incomeItems : $expenseItems);

        $data = [
            'name' => $item['name'],
            'description' => $item['desc'],
            'icon' => $item['icon'],
            'type' => $type,
            'period_type' => $periodType,
            'amount' => fake()->numberBetween(1000, 100000),
            'end_date' => fake()->boolean(20) ? fake()->dateTimeBetween('now', '+5 years') : null,
        ];

        // Заполняем поля в зависимости от period_type
        match ($periodType) {
            SchedulePeriodType::MONTHLY => $data['day_of_month'] = fake()->numberBetween(1, 28),
            SchedulePeriodType::WEEKLY => $data['day_of_week'] = fake()->numberBetween(0, 6),
            SchedulePeriodType::DAILY => $data['time_of_day'] = fake()->time(),
            SchedulePeriodType::ONE_TIME => $data['single_date'] = fake()->date(),
        };

        return $data;
    }

    /**
     * Привязать к группе.
     */
    public function group(int $groupId): static
    {
        return $this->state(fn(array $attributes) => [
            'group_id' => $groupId,
        ]);
    }

    /**
     * Сделать доход.
     */
    public function income(): static
    {
        return $this->state(fn(array $attributes) => [
            'type' => ScheduleType::INCOME,
        ]);
    }

    /**
     * Сделать расход.
     */
    public function expense(): static
    {
        return $this->state(fn(array $attributes) => [
            'type' => ScheduleType::EXPENSE,
        ]);
    }

    /**
     * Привязать к родительскому графику.
     */
    public function parent(int $parentId): static
    {
        return $this->state(fn(array $attributes) => [
            'parent_id' => $parentId,
        ]);
    }
}
