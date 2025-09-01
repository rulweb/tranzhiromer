import { Link, router, usePage } from '@inertiajs/react'
import {Button, Card, Chip, User} from '@heroui/react'
import { Calendar, LogOut, Wallet } from 'lucide-react'

export default function Index() {
  const { props } = usePage()
  const user = (props as any).auth?.user || (props as any).user

  const handleLogout = () => {
    router.post('/logout')
  }

  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/lk">
              <img src="/images/logo.png" alt="Логотип ТранжироМер" className="h-24 w-24" loading="eager" />
            </Link>
            <div className="text-lg font-semibold">Семейный бюджет</div>
          </div>
        <div className='flex items-center gap-4'>
            <User
                avatarProps={{
                    src: user?.avatar,
                }}
                description={user?.email}
                name={user?.name}
            />
              <Button color="danger" onPress={handleLogout} startContent={<LogOut size={16}/>}>Выйти</Button>
            </div>
        </div>

        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2 text-base font-medium">
            <Calendar size={18} /> Ближайшие обязательные платежи
          </div>
        </Card>
      </div>
    </div>
  )
}
