import {useEffect, useMemo, useState} from 'react'
import {Head, router} from '@inertiajs/react'
import dayjs from 'dayjs'
import {Button} from '@heroui/react'
import LkLayout from '../../../Layouts/LkLayout'
import IncomeGroup from '../../../Components/IncomeGroup'
import MoveExpenseModal from '../../../Components/MoveExpenseModal'
import {Schedule} from "@/types";

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
