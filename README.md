# ТранжироМер

Простое и наглядное приложение для домашней бухгалтерии: учет расходов и доходов, категории и отчеты, базовое планирование бюджета. Фронтенд на React через Inertia v2, UI — HeroUI, стили — Tailwind CSS v4. Авторизация через социальные сети (VK ID, Яндекс) через Laravel Socialite.

[Обновлено: 2025‑09‑01]

---

## Стек и версии
- PHP: 8.2+
- Laravel: 12.x
- Inertia (Laravel + React): v2
- React: 19
- Vite: 7
- Tailwind CSS: v4 (подключение через `@import 'tailwindcss'`)
- UI: `@heroui/react` (+ Tailwind плагин)
- Иконки: `lucide-react`
- Уведомления: `sonner` (Toaster подключен глобально)
- Даты: `dayjs` (локаль ru, plugin duration)
- Тесты: Pest v4
- Docker / Dev: Laravel Sail (опционально), Pail логгер

## Основные возможности
- Лендинг: `/` (Inertia страница `Landing`)
- Личный кабинет: `/lk` (Inertia страница `Lk/Index`, доступна после входа)
- Вход: `/lk/login`
- Соц. авторизация: `/auth/{provider}/redirect` и `/auth/{provider}/callback`, где `{provider}` ∈ {`vkid`, `yandex`}
- Выход: `POST /logout`

## Структура проекта (основное)
- `app/Http/Controllers/LandingController.php` — лендинг
- `app/Http/Controllers/SocialAuthController.php` — вход через VK ID и Яндекс (Socialite)
- `routes/web.php` — маршруты Inertia и авторизации
- `resources/js/app.tsx` — точка входа фронтенда (Inertia, HeroUIProvider, Toaster, dayjs)
- `resources/js/Pages/` — страницы Inertia (`Landing.tsx`, `Lk/Index.tsx`, др.)
- `resources/css/app.css` — Tailwind v4 (`@import 'tailwindcss'`, HeroUI плагин)
- `vite.config.js` — Vite + React + Tailwind v4 plugin + tsconfig paths
- `postcss.config.js` — `@tailwindcss/postcss`

## Быстрый старт (локально, без Docker)
1. Установить зависимости PHP и Node:
   - `composer install`
   - `npm install`
2. Создать `.env` и сгенерировать ключ:
   - `cp .env.example .env`
   - `php artisan key:generate`
3. (Опционально) настроить БД и выполнить миграции:
   - Обновите переменные подключения в `.env`
   - `php artisan migrate`
4. Запуск режима разработки (варианты):
   - Отдельно: в одном терминале `php artisan serve`, в другом — `npm run dev`
   - Или одной командой: `composer run dev` (конкурентный запуск сервера, очереди, логгера pail и Vite)

Откройте приложение по адресу, который выведет `php artisan serve` (обычно http://127.0.0.1:8000).

## Запуск через Docker (Laravel Sail)
1. Установите зависимости: `composer install`
2. Подготовьте окружение: `cp .env.example .env` и настройте БД (Sail по умолчанию использует MySQL)
3. Поднимите контейнеры: `./vendor/bin/sail up -d`
4. Выполните миграции: `./vendor/bin/sail artisan migrate`
5. Запустите фронтенд в контейнере (в новом терминале): `./vendor/bin/sail npm run dev`

Откройте http://localhost (или порт из docker-compose.yml, если переопределён).

## Переменные окружения (соц. вход)
Для VK ID и Яндекс авторизации добавьте в `.env` необходимые ключи (см. документацию Socialite и провайдеров):
- VK ID: `VKID_CLIENT_ID`, `VKID_CLIENT_SECRET`, `VKID_REDIRECT_URI`
- Яндекс: `YANDEX_CLIENT_ID`, `YANDEX_CLIENT_SECRET`, `YANDEX_REDIRECT_URI`

Маршруты редиректа/колбэка уже настроены в `routes/web.php`:
- `GET /auth/vkid/redirect` → VK ID
- `GET /auth/yandex/redirect` → Яндекс

Контроллер `SocialAuthController` создаёт/обновляет пользователя на основе данных сервиса. Если провайдер не возвращает email, генерируется синтетический (`vk_...@vk.local`, `yandex_...@yandex.local`).

## Команды
- Backend
  - Запуск dev: `composer run dev`
  - Тесты: `php artisan test`
- Frontend
  - Dev сервер: `npm run dev`
  - Сборка: `npm run build`
  - Типизация: `npm run typecheck`

## Тестирование
- Запустить все тесты: `php artisan test`
- Рекомендуется фильтровать по файлу/именам тестов при разработке (см. Pest v4)

## Сборка на продакшен
1. `npm run build` (Vite соберёт ассеты в `public/build`)
2. Убедитесь, что сконфигурированы ключи окружения и база данных
3. Выполните миграции: `php artisan migrate --force`

## Примечания по фронтенду
- Inertia страницы находятся в `resources/js/Pages`. Навигация — через `<Link>` и `router.visit`.
- Tailwind v4 подключается через CSS: `@import 'tailwindcss';` (см. `resources/css/app.css`).
- HeroUI и его Tailwind плагин подключены в `app.css` (`@plugin './hero.ts'`).
- Toaster из `sonner` и провайдер HeroUI подключены в `resources/js/app.tsx` глобально.
- Даты: `dayjs` (локаль RU + `duration`).

## Лицензия
MIT (как в Laravel skeleton).
