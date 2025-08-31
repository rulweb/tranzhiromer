<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    public function login(): \Inertia\Response
    {
        return Inertia::render('Lk/Login');
    }

    public function redirect(string $provider): RedirectResponse
    {
        $this->guardSupportedProvider($provider);

        if ($provider === 'vkid') {
            // For VK we usually need the 'email' scope to receive email
            return Socialite::driver('vkid')->redirect();
        }

        if ($provider === 'yandex') {
            // Request email scope from Yandex
            return Socialite::driver('yandex')->redirect();
        }

        return Socialite::driver($provider)->redirect();
    }

    public function callback(string $provider): RedirectResponse
    {
        $this->guardSupportedProvider($provider);

        $socialUser = Socialite::driver($provider)->user();

        $email = $socialUser->getEmail();
        $avatar = $socialUser->getAvatar();
        $name = $socialUser->getName() ?: ($socialUser->getNickname() ?: 'User');

        if (empty($email)) {
            // Synthesize unique email when provider doesn't return one
            $email = match ($provider) {
                'vkid' => 'vk_'.$socialUser->getId().'@vk.local',
                'yandex' => 'yandex_'.$socialUser->getId().'@yandex.local',
                default => 'social_'.$socialUser->getId().'@example.local',
            };
        }

        /** @var Authenticatable|User $user */
        $user = User::query()->updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'avatar' => $avatar,
            ]
        );

        Auth::login($user, true);

        return redirect()->route('lk.index');
    }

    protected function guardSupportedProvider(string $provider): void
    {
        if (! in_array($provider, ['vkid', 'yandex'], true)) {
            abort(404);
        }
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->to('/');
    }
}
