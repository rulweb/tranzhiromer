import { Link, router, usePage } from '@inertiajs/react'
import {Button, Card, User} from '@heroui/react'
import { Calendar, LogOut } from 'lucide-react'
import ScheduleRow from '../../Components/ScheduleRow'
import { Schedule } from '../../types'

type Props = {
  schedules: Schedule[]
}

export default function Dashboard({ schedules }: Props) {
  const { props } = usePage()
  const user = (props as any).auth?.user || (props as any).user

  const handleLogout = () => {
    router.post('/lk/logout')
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
          <div className="flex flex-col gap-2">
            {schedules.length === 0 && (
              <div className="text-sm text-gray-500">Нет предстоящих платежей.</div>
            )}
            {schedules.map((s) => (
              <ScheduleRow key={s.id} schedule={s} isExpense={s.type === 'expense'} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
