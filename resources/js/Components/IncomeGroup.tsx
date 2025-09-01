import {Card, CardBody, CardHeader, Button, Collapse} from '@heroui/react'
import {useMemo, useState} from 'react'
import ScheduleRow from './ScheduleRow'
import AddExpenseForm from './AddExpenseForm'
import {Schedule} from '../types'

export type IncomeGroupProps = {
  income: Schedule
  expenses: Schedule[]
  onEdit?: (s: Schedule) => void
  onMoveExpense?: (s: Schedule) => void
}

export default function IncomeGroup({income, expenses, onEdit, onMoveExpense}: IncomeGroupProps) {
  const [open, setOpen] = useState(false)
  const totalExpenses = useMemo(() => expenses.reduce((sum, e) => sum + Number(e.amount), 0), [expenses])
  const rest = Number(income.amount) - totalExpenses

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <div className="text-base font-semibold">{income.name}</div>
          <div className="text-xs text-gray-500">Доход: {Number(income.amount).toLocaleString('ru-RU')} ₽</div>
        </div>
        <div className="flex items-center gap-4">
          <div className={"text-sm font-semibold " + (rest >= 0 ? 'text-green-700' : 'text-red-600')}>Остаток: {rest.toLocaleString('ru-RU')} ₽</div>
          <Button size="sm" variant="flat" onPress={() => setOpen((v) => !v)}>{open ? 'Скрыть' : 'Показать'}</Button>
        </div>
      </CardHeader>
      <CardBody className="pt-0">
        <Collapse isOpen={open} className="flex flex-col gap-2">
          {expenses.map((e) => (
            <ScheduleRow key={e.id} schedule={e} isExpense onMove={onMoveExpense} onEdit={onEdit} />
          ))}
          <AddExpenseForm parentId={income.id} groupId={income.group_id} onSuccess={() => { /* reloaded by parent via router.reload */ }} />
        </Collapse>
      </CardBody>
    </Card>
  )
}
