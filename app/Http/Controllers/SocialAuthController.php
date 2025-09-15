<?php

namespace App\Http\Controllers;

use App\Models\User;
use Http;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Log;
use Session;

class SocialAuthController extends Controller
{
    public function login(): \Inertia\Response
    {
        return Inertia::render('Lk/Login');
    }

    public function redirect(string $provider): RedirectResponse
    {
        $clientId = config('services.yandex.client_id');
        $redirectUri = config('services.yandex.redirect');
        $state = Str::random(40);

        Session::put('yandex_state', $state);

        $url = "https://oauth.yandex.ru/authorize?" . http_build_query([
                'response_type' => 'code',
                'client_id' => $clientId,
                'redirect_uri' => $redirectUri,
                'state' => $state,
            ]);

        return redirect($url);
    }

    public function callback(string $provider): RedirectResponse
    {
        $code = request('code');
        $state = request('state');

        // Проверка state для защиты от CSRF
        if ($state !== Session::pull('yandex_state')) {
            abort(403, 'Invalid state');
        }

        // Получаем access_token
        $response = Http::asForm()->post('https://oauth.yandex.ru/token', [
            'grant_type' => 'authorization_code',
            'code' => $code,
            'client_id' => config('services.yandex.client_id'),
            'client_secret' => config('services.yandex.client_secret'),
            'redirect_uri' => config('services.yandex.redirect'),
        ]);

        if ($response->failed()) {
            return redirect('/lk/login')->withErrors(['yandex' => 'Ошибка получения токена']);
        }

        $tokenData = $response->json();
        $accessToken = $tokenData['access_token'];

        // Получаем информацию о пользователе
        $userResponse = Http::withToken($accessToken)->get('https://login.yandex.ru/info?format=json');

        if ($userResponse->failed()) {
            return redirect('/lk/login')->withErrors(['yandex' => 'Ошибка получения данных пользователя']);
        }

        $userData = $userResponse->json();

        Log::info('yandex-callback='. json_encode($userData, JSON_UNESCAPED_UNICODE));

        $email = $userData['default_email'] ?? null;
        if (empty($email) && count($userData['emails']) > 0) {
            $email = $userData['emails'][0] ?? null;
        }
        if (!$email) {
            return redirect('/lk/login')->withErrors(['yandex' => 'Email не предоставлен']);
        }

        if (!empty($userData['real_name'])) {
            $name = Arr::get($userData, 'real_name');
        } else if (!empty($userData['display_name'])) {
            $name = Arr::get($userData, 'display_name');
        } else if (!empty($userData['first_name']) || !empty($userData['last_name'])) {
            $name = Arr::get($userData, 'first_name', '') . ' ' . Arr::get($userData, 'last_name', '');
        } else {
            $name = Arr::get($userData, 'login');
        }

        $avatar = null;
        if (!empty($userData['default_avatar_id'])) {
            $avatar = 'https://avatars.yandex.net/get-yapic/'.Arr::get($userData, 'default_avatar_id').'/islands-200';
        }

        // Находим или создаём пользователя
        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'avatar' => $avatar,
            ]
        );

        // Авторизуем пользователя
        Auth::login($user, true);

        return redirect('/lk')->with('success', 'Успешный вход через Яндекс!');
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->to('/');
    }
}
