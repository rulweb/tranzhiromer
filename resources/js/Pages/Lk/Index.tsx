import { router, usePage } from '@inertiajs/react'

export default function Index() {
  const { props } = usePage()
  const user = (props as any).auth?.user || (props as any).user

  const handleLogout = () => {
    router.post('/logout')
  }

  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-5">
        <div className="text-center">
          <a href="/">
            <img
              src="/images/logo.png"
              alt="Логотип ТранжироМер"
              className="mx-auto h-56 w-56 sm:h-64 sm:w-64 lg:h-72 lg:w-72"
              loading="eager"
            />
          </a>
          <h1 className="mt-4 text-2xl font-bold">Личный кабинет</h1>
        </div>

        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mt-4 space-y-1 text-gray-700">
              {user?.avatar && <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="mx-auto h-28 w-28 sm:h-32 sm:w-32"
                  loading="eager"
              />}

              <div><span className="font-medium">Имя:</span> {user?.name ?? '—'}</div>
            <div><span className="font-medium">Email:</span> {user?.email ?? '—'}</div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleLogout}
              className="rounded-md bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              Выйти
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
