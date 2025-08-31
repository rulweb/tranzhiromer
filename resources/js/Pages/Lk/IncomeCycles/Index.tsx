import {Head, Link, router} from '@inertiajs/react'
import {Button, Card} from '@heroui/react'
import dayjs from 'dayjs'

type Allocation = {
  id: number
  planned_amount: string
  paid_amount: string
  status: 'planned'|'partial'|'paid'|'skipped'
  planned_due_on?: string|null
  mandatory_payment: { id: number, name: string }
}

type Cycle = {
  id: number
  period_ref: string
  planned_amount?: string|null
  received_amount?: string|null
  expected_day?: number|null
  template: { id: number, name: string }
  allocations: Allocation[]
}

type Props = {
  month: string
  cycles: Cycle[]
}

export default function Index({ month, cycles }: Props) {
  const onBootstrap = () => {
    router.post('/lk/income-cycles/bootstrap', { period_ref: month }, { preserveScroll: true, preserveState: true })
  }

  const prev = dayjs(month + '-01').subtract(1, 'month').format('YYYY-MM')
  const next = dayjs(month + '-01').add(1, 'month').format('YYYY-MM')

  return (
    <div className="mx-auto max-w-6xl p-4">
      <Head title="Циклы доходов" />
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button as={Link} href={`/lk/income-cycles?month=${prev}`} variant="flat">{prev}</Button>
          <div className="text-lg font-medium">{month}</div>
          <Button as={Link} href={`/lk/income-cycles?month=${next}`} variant="flat">{next}</Button>
        </div>
        <div className="flex items-center gap-2">
          <Button as={Link} href="/lk/income-cycle-templates" variant="flat">Шаблоны</Button>
          <Button color="primary" onClick={onBootstrap}>Сформировать месяц</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cycles.map(c => (
          <Card key={c.id} className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-semibold">{c.template.name}</div>
              <div className="text-sm text-gray-500">ожид. день: {c.expected_day ?? '—'}</div>
            </div>
            <div className="mb-3 text-sm text-gray-700">Аллокации: {c.allocations.length}</div>
            <div className="space-y-2">
              {c.allocations.map(a => (
                <div key={a.id} className="flex items-center justify-between rounded border border-gray-200 p-2 text-sm">
                  <div className="truncate">{a.mandatory_payment.name}</div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">{a.planned_due_on ?? '—'}</span>
                    <span className="font-medium">{a.planned_amount}</span>
                  </div>
                </div>
              ))}
              {c.allocations.length === 0 && (
                <div className="text-sm text-gray-500">Нет обязательных платежей</div>
              )}
            </div>
          </Card>
        ))}
        {cycles.length === 0 && (
          <Card className="p-6 text-center text-gray-500">Нет циклов. Нажмите «Сформировать месяц».</Card>
        )}
      </div>
    </div>
  )
}
