<?php

namespace App\Providers;

use App\Models\Correction;
use App\Models\Group;
use App\Models\Schedule;
use App\Policies\CorrectionPolicy;
use App\Policies\GroupPolicy;
use App\Policies\SchedulePolicy;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Force HTTPS scheme for all generated URLs when APP_URL uses https or in production.
        $appUrl = (string) config('app.url');

        if ($this->app->isProduction() || ($appUrl !== '' && str_starts_with($appUrl, 'https://'))) {
            URL::forceScheme('https');
        }

        Event::listen(function (\SocialiteProviders\Manager\SocialiteWasCalled $event) {
            $event->extendSocialite('vkid', \SocialiteProviders\VKID\Provider::class);
            $event->extendSocialite('yandex', \SocialiteProviders\Yandex\Provider::class);
        });

        Gate::policy(Group::class, GroupPolicy::class);
        Gate::policy(Schedule::class, SchedulePolicy::class);
        Gate::policy(Correction::class, CorrectionPolicy::class);
    }
}
