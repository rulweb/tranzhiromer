import { Link, router, usePage } from '@inertiajs/react'
import { Avatar, Button, Card } from '@heroui/react'
import { LogOut } from 'lucide-react'

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
          <Link href="/">
            <img
              src="/images/logo.png"
              alt="Логотип ТранжироМер"
              className="mx-auto h-56 w-56 sm:h-64 sm:w-64 lg:h-72 lg:w-72"
              loading="eager"
            />
          </Link>
          <h1 className="mt-4 text-2xl font-bold">Личный кабинет</h1>
        </div>

        <Card className="mt-8 p-6">
          <div className="mt-4 space-y-3 text-gray-700 text-center">
            <Avatar className="mx-auto" src={user?.avatar ?? undefined} name={user?.name ?? 'U'} size="lg"/>
            <div><span className="font-medium">Имя:</span> {user?.name ?? '—'}</div>
            <div><span className="font-medium">Email:</span> {user?.email ?? '—'}</div>
          </div>

          <div className="mt-6 flex justify-center">
            <Button color="danger" onPress={handleLogout} startContent={<LogOut size={16}/>}>Выйти</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
