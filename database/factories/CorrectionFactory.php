<?php

namespace Database\Factories;

use App\Models\Schedule;
use Illuminate\Database\Eloquent\Factories\Factory;

class CorrectionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'schedule_id' => Schedule::factory(),
            'amount' => fake()->boolean(50) ? fake()->numberBetween(500, 50000) : null,
            'adjusted_date' => fake()->boolean(70) ? fake()->date() : null,
        ];
    }

    /**
     * Указать конкретный график.
     */
    public function schedule(int $scheduleId): static
    {
        return $this->state(fn (array $attributes) => [
            'schedule_id' => $scheduleId,
        ]);
    }
}
