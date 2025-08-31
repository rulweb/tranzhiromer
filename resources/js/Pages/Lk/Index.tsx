import { Link, router, usePage } from '@inertiajs/react'
import {Button, Card, Chip, User} from '@heroui/react'
import { Calendar, LogOut, Wallet } from 'lucide-react'

type Upcoming = {
  id: number
  name: string
  planned_amount: string
  planned_due_on: string
  cycle?: { id: number, period_ref?: string, template_name?: string }
}

export default function Index({ upcomingPayments = [] as Upcoming[] }: { upcomingPayments?: Upcoming[] }) {
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
            <Link href="/">
              <img src="/images/logo.png" alt="Логотип ТранжироМер" className="h-12 w-12" loading="eager" />
            </Link>
            <div className="text-lg font-semibold">Личный кабинет</div>
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
            <Calendar size={18} /> Ближайшие обязательные платежи (30 дней)
          </div>
          {upcomingPayments.length === 0 && (
            <div className="text-sm text-gray-500">В ближайшие 30 дней нет запланированных платежей.</div>
          )}
          <div className="space-y-2">
            {upcomingPayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded border border-gray-200 px-3 py-2 text-sm">
                <div className="flex min-w-0 items-center gap-3">
                  <Chip size="sm" color="default" variant="flat" startContent={<Calendar size={14}/>}>{p.planned_due_on}</Chip>
                  <div className="truncate">
                    <div className="truncate font-medium">{p.name}</div>
                    {p.cycle?.template_name && (
                      <div className="text-xs text-gray-500">{p.cycle.template_name} · {p.cycle.period_ref}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  <Wallet size={16} className="text-gray-500" />
                  {p.planned_amount}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <Button as={Link} href="/lk/income-cycles" variant="flat">К циклам</Button>
            <Button as={Link} href={`/lk/planning?month=${new Date().toISOString().slice(0,7)}`} color="primary">Редактировать планы</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
