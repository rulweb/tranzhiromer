import {useEffect, useMemo, useState} from 'react'
import {Head, router} from '@inertiajs/react'
import dayjs from 'dayjs'
import {Button} from '@heroui/react'
import LkLayout from '../../../Layouts/LkLayout'
import IncomeGroup from '../../../Components/IncomeGroup'
import MoveExpenseModal from '../../../Components/MoveExpenseModal'
import {Schedule} from "@/types";

function nextDueDate(s: Schedule): dayjs.Dayjs | null {
  const today = dayjs().startOf('day')

  if (s.period_type === 'one_time') {
    if (!s.single_date) {
      return null
    }
    const d = dayjs(s.single_date)
    return d.isBefore(today) ? null : d
  }

  const end = s.end_date ? dayjs(s.end_date).endOf('day') : null

  if (s.period_type === 'daily') {
    const d = today
    if (end && d.isAfter(end)) {
      return null
    }
    return d
  }

  if (s.period_type === 'weekly') {
    if (typeof s.day_of_week !== 'number') {
      return null
    }
    let d = today
    const delta = (s.day_of_week - d.day() + 7) % 7
    d = d.add(delta, 'day')
    if (end && d.isAfter(end)) {
      return null
    }
    return d
  }

  if (s.period_type === 'monthly') {
    if (typeof s.day_of_month !== 'number') {
      return null
    }
    let d = today.date(Math.min(s.day_of_month, today.daysInMonth()))
    if (d.isBefore(today)) {
      const nextMonth = today.add(1, 'month')
      d = nextMonth.date(Math.min(s.day_of_month, nextMonth.daysInMonth()))
    }
    if (end && d.isAfter(end)) {
      return null
    }
    return d
  }

  return null
}

type Props = { schedules: Schedule[]; month: string }

export default function BudgetIndex({ schedules: initial, month: initialMonth }: Props) {
  const [schedules, setSchedules] = useState<Schedule[]>(initial)
  const [month, setMonth] = useState<string>(initialMonth || dayjs().format('YYYY-MM'))
  const [moveOpen, setMoveOpen] = useState(false)
  const [movingExpense, setMovingExpense] = useState<Schedule | null>(null)

  // Keep schedules in sync with server props when they change
  useEffect(() => {
    setSchedules(initial)
  }, [initial])

  // Refetch via Inertia when month changes (for the same group)
  useEffect(() => {
      router.visit(`/lk/budget?month=${month}`, { preserveScroll: true, preserveState: true })
  }, [month])

  const incomes = useMemo(() => schedules.filter(s => s.type === 'income'), [schedules])
  const expensesByParent = useMemo(() => {
    const map = new Map<number, Schedule[]>()
    schedules.filter(s => s.type === 'expense').forEach(e => {
      const key = e.parent_id || 0
      map.set(key, [...(map.get(key) || []), e])
    })
    return map
  }, [schedules])

  return (
    <LkLayout>
      <Head title={`Бюджет на ${dayjs(month + '-01').format('MMMM YYYY')}`} />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Бюджет на {dayjs(month + '-01').format('MMMM YYYY')}</h1>
        <div className="flex items-center gap-2">
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="border rounded px-2 py-1"/>
          <Button color="primary" onPress={() => router.visit('/lk')}>К ближайшим платежам</Button>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {incomes.map((inc) => (
          <IncomeGroup
            key={inc.id}
            income={inc}
            expenses={expensesByParent.get(inc.id) || []}
            onMoveExpense={(e) => { setMovingExpense(e); setMoveOpen(true) }}
          />
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <Button variant="flat" color="success">Добавить доход</Button>
      </div>

      <MoveExpenseModal
        isOpen={moveOpen}
        onOpenChange={setMoveOpen}
        expense={movingExpense}
        incomes={incomes}
        onMoved={() => router.reload({ only: ['schedules'] })}
      />
    </LkLayout>
  )
}
