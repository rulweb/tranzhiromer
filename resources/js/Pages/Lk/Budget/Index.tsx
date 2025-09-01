import {
	Button,
	Calendar,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger
} from '@heroui/react'
import { Head, router } from '@inertiajs/react'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'

import ExpenseCreateModal from '../../../Components/ExpenseCreateModal'
import ExpenseEditModal from '../../../Components/ExpenseEditModal'
import IncomeCreateModal from '../../../Components/IncomeCreateModal'
import IncomeEditModal from '../../../Components/IncomeEditModal'
import IncomeGroup from '../../../Components/IncomeGroup'
import MoveExpenseModal from '../../../Components/MoveExpenseModal'
import ScheduleRow from '../../../Components/ScheduleRow'
import LkLayout from '../../../Layouts/LkLayout'

import { Schedule } from '@/types'

type Props = { schedules: Schedule[]; month: string }

export default function BudgetIndex({
	schedules: initial,
	month: initialMonth
}: Props) {
	const [schedules, setSchedules] = useState<Schedule[]>(initial)
	const [month, setMonth] = useState<string>(
		initialMonth || dayjs().format('YYYY-MM')
	)
	const [moveOpen, setMoveOpen] = useState(false)
	const [movingExpense, setMovingExpense] = useState<Schedule | null>(null)
	const [createIncomeOpen, setCreateIncomeOpen] = useState<boolean>(false)
	const [createExpenseOpen, setCreateExpenseOpen] = useState<boolean>(false)
	const [editIncomeOpen, setEditIncomeOpen] = useState<boolean>(false)
	const [editingIncome, setEditingIncome] = useState<Schedule | null>(null)
	const [editExpenseOpen, setEditExpenseOpen] = useState<boolean>(false)
	const [editingExpense, setEditingExpense] = useState<Schedule | null>(null)

	// Keep schedules in sync with server props when they change
	useEffect(() => {
		setSchedules(initial)
	}, [initial])

	// Refetch via Inertia when month changes (for the same group)
	useEffect(() => {
		router.visit(`/lk/budget?month=${month}`, {
			preserveScroll: true,
			preserveState: true
		})
	}, [month])

	const incomes = useMemo(
		() => schedules.filter(s => s.type === 'income'),
		[schedules]
	)
	const expensesByParent = useMemo(() => {
		const map = new Map<number, Schedule[]>()
		schedules
			.filter(s => s.type === 'expense')
			.forEach(e => {
				const key = e.parent_id || 0
				map.set(key, [...(map.get(key) || []), e])
			})
		return map
	}, [schedules])

	const unassigned = useMemo(
		() => expensesByParent.get(0) || [],
		[expensesByParent]
	)
	const unassignedTotal = useMemo(
		() => unassigned.reduce((sum, e) => sum + Number(e.amount), 0),
		[unassigned]
	)

	return (
		<LkLayout>
			<Head title={`Бюджет на ${dayjs(month + '-01').format('MMMM YYYY')}`} />
			<div className='flex items-center justify-between mb-4'>
				<h1 className='text-xl font-semibold'>Бюджет на</h1>
				<div className='flex items-center gap-2'>
					<Button
						variant='light'
						onPress={() =>
							setMonth(
								dayjs(month + '-01')
									.subtract(1, 'month')
									.format('YYYY-MM')
							)
						}
						aria-label='prev-month'
					>
						&lt;
					</Button>
					<div>
						<input
							type='month'
							className='rounded-medium border border-default-200 bg-content1 text-foreground px-2 py-1 text-sm'
							value={month}
							onChange={e => {
								const val = e.target.value
								if (dayjs(val + '-01').isValid()) {
									setMonth(dayjs(val + '-01').format('YYYY-MM'))
								}
							}}
							aria-label='Ручной выбор месяца'
						/>
					</div>
					<Button
						variant='light'
						onPress={() =>
							setMonth(
								dayjs(month + '-01')
									.add(1, 'month')
									.format('YYYY-MM')
							)
						}
						aria-label='next-month'
					>
						&gt;
					</Button>
					<Button
						variant='bordered'
						color='success'
						onPress={() => setCreateIncomeOpen(true)}
					>
						Добавить доход
					</Button>
					<Button
						color='danger'
						variant='bordered'
						onPress={() => setCreateExpenseOpen(true)}
					>
						Добавить расход
					</Button>
				</div>
			</div>

			{unassigned.length > 0 && (
				<div className='mb-4'>
					<div className='rounded-lg border border-red-200 dark:border-red-900 bg-red-50/60 dark:bg-red-900/20 p-3'>
						<div className='mb-2 flex items-center justify-between'>
							<div className='text-sm font-semibold text-red-700 dark:text-red-300'>
								Нераспределённые платежи
							</div>
							<div className='text-xs text-red-600 dark:text-red-300'>
								{unassigned.length} шт ·{' '}
								{unassignedTotal.toLocaleString('ru-RU')} ₽
							</div>
						</div>
						<div className='flex flex-col gap-2'>
							{unassigned.map(e => (
								<ScheduleRow
									key={e.id}
									schedule={e}
									isExpense
									onMove={x => {
										setMovingExpense(x)
										setMoveOpen(true)
									}}
									onEdit={s => {
										setEditingExpense(s)
										setEditExpenseOpen(true)
									}}
								/>
							))}
						</div>
					</div>
				</div>
			)}

			<div className='flex flex-col gap-3'>
				{incomes.map(inc => (
					<IncomeGroup
						key={inc.id}
						income={inc}
						expenses={expensesByParent.get(inc.id) || []}
						onMoveExpense={e => {
							setMovingExpense(e)
							setMoveOpen(true)
						}}
						onEditIncome={incSel => {
							setEditingIncome(incSel)
							setEditIncomeOpen(true)
						}}
						onEditExpense={expSel => {
							setEditingExpense(expSel)
							setEditExpenseOpen(true)
						}}
					/>
				))}
			</div>

			<MoveExpenseModal
				isOpen={moveOpen}
				onOpenChange={setMoveOpen}
				expense={movingExpense}
				incomes={incomes}
				onMoved={() => router.reload({ only: ['schedules'] })}
			/>
			<IncomeCreateModal
				isOpen={createIncomeOpen}
				onOpenChange={setCreateIncomeOpen}
				groupId={schedules[0]?.group_id ?? 0}
			/>
			<ExpenseCreateModal
				isOpen={createExpenseOpen}
				onOpenChange={setCreateExpenseOpen}
				groupId={schedules[0]?.group_id ?? 0}
				incomes={incomes}
			/>
			<IncomeEditModal
				isOpen={editIncomeOpen}
				onOpenChange={setEditIncomeOpen}
				income={editingIncome}
			/>
			<ExpenseEditModal
				isOpen={editExpenseOpen}
				onOpenChange={setEditExpenseOpen}
				expense={editingExpense}
			/>
		</LkLayout>
	)
}
