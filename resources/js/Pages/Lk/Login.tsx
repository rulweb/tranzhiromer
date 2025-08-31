import { Link } from '@inertiajs/react'

export default function Login() {
  return (
    <div className="bg-white text-gray-900 min-h-screen flex items-center">
      <div className="mx-auto max-w-md w-full px-6">
        <div className="text-center">
          <Link href="/">
            <img
              src="/images/logo.png"
              alt="Логотип ТранжироМер"
              className="mx-auto h-40 w-40 sm:h-48 sm:w-48"
              loading="eager"
            />
          </Link>

          <h1 className="mt-6 text-2xl font-bold tracking-tight text-gray-900">Войти в кабинет</h1>
          <p className="mt-2 text-sm text-gray-600">Выберите удобный способ авторизации</p>

          <div className="mt-8 space-y-3">
            <a
              href="/auth/yandex/redirect"
              className="flex w-full items-center justify-center gap-2 rounded-md bg-[#ffcc00] px-4 py-2.5 text-sm font-semibold text-black shadow-sm hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffcc00]"
            >
              Войти через Яндекс ID
            </a>
          </div>

          <div className="mt-8">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              ← На главную
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
