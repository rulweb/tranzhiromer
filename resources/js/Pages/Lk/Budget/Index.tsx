import { Button, Input } from '@heroui/react'
import { Head, router } from '@inertiajs/react'
import dayjs from 'dayjs'
import { useEffect, useMemo, useRef, useState } from 'react'

import ConfirmDeleteModal from '../../../Components/ConfirmDeleteModal'
import ConfirmPayModal from '../../../Components/ConfirmPayModal'
import ExpenseModal from '../../../Components/ExpenseModal'
import IncomeCreateModal from '../../../Components/IncomeCreateModal'
import IncomeEditModal from '../../../Components/IncomeEditModal'
import IncomeGroup from '../../../Components/IncomeGroup'
import MoveExpenseModal from '../../../Components/MoveExpenseModal'
import ScheduleRow from '../../../Components/ScheduleRow'
import LkLayout from '../../../Layouts/LkLayout'

import { Schedule } from '@/types'

type DayItem = {
	id: number
	name: string
	description: string | null
	icon: string | null
	amount: number
	expected_leftover: number
	is_cash_leftover: boolean
	is_paid: boolean
	leftover: number
}

type DayGroup = { day: string; items: DayItem[] }

type Props = { schedules: Schedule[]; days: DayGroup[]; month: string }

export default function BudgetIndex({
	schedules: initial,
	days,
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
	const [payOpen, setPayOpen] = useState<boolean>(false)
	const [payingExpense, setPayingExpense] = useState<Schedule | null>(null)
	const [payLeftover, setPayLeftover] = useState<string>('0')
	const [unpayOpen, setUnpayOpen] = useState<boolean>(false)
	const [unpayingExpense, setUnpayingExpense] = useState<Schedule | null>(null)

	// Keep schedules in sync with server props when they change
	useEffect(() => {
		setSchedules(initial)
	}, [initial])

	// Refetch via Inertia when month changes (for the same group)
	const didMountRef = useRef(false)
	useEffect(() => {
		if (!didMountRef.current) {
			didMountRef.current = true
			return
		}
		router.visit(`/lk/budget?month=${month}`, {
			preserveScroll: true,
			preserveState: true
		})
	}, [month])

	// Client-side grouping by incomes is not needed for daily output anymore.
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

	const renderByDays = () => (
		<div className='flex flex-col gap-3'>
			{days.map(group => (
				<div key={group.day} className='flex flex-col gap-2'>
					<div className='sticky top-0 z-10 bg-white/70 dark:bg-black/50 backdrop-blur px-1 py-1 text-xs font-semibold text-gray-600 dark:text-gray-300'>
						{group.day}
					</div>
					{group.items.map(e => (
						<ScheduleRow
							key={e.id}
							schedule={{
								id: e.id,
								name: e.name,
								description: e.description,
								icon: e.icon,
								type: 'expense',
								period_type: 'monthly',
								amount: e.amount,
								expected_leftover: e.expected_leftover,
								leftover: e.leftover,
								is_paid: e.is_paid,
								is_cash_leftover: e.is_cash_leftover,
								end_date: null,
								parent_id: null,
								group_id: schedules[0]?.group_id ?? 0,
								created_at: '',
								updated_at: ''
							} as unknown as Schedule}
							isExpense
							onPaid={() => {
								// find full schedule from list to keep modal flows working
								const full = schedules.find(s => s.id === e.id) || null
								if (!full) return
								setPayingExpense(full)
								setPayLeftover(
									full.expected_leftover != null
										? String(full.expected_leftover)
										: '0'
								)
								setPayOpen(true)
							}}
							onUnpaid={() => {
								const full = schedules.find(s => s.id === e.id) || null
								if (!full) return
								setUnpayingExpense(full)
								setUnpayOpen(true)
							}}
						/>
					))}
				</div>
			))}
		</div>
	)

	return (
		<LkLayout>
			<Head title={`Бюджет на ${dayjs(month + '-01').format('MMMM YYYY')}`} />
			<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4'>
				<h1 className='text-xl font-semibold'>Бюджет на</h1>
				<div className='flex flex-wrap items-center gap-2'>
					<Button
						size='sm'
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
							className='w-[140px] sm:w-auto rounded-medium border border-default-200 bg-content1 text-foreground px-2 py-1 text-sm'
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
						size='sm'
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
						size='sm'
						variant='bordered'
						color='success'
						onPress={() => setCreateIncomeOpen(true)}
					>
						Добавить доход
					</Button>
					<Button
						size='sm'
						color='danger'
						variant='bordered'
						onPress={() => setCreateExpenseOpen(true)}
					>
						Добавить расход
					</Button>
				</div>
			</div>

			{/* Unassigned section kept for organizational view if needed; can be revisited later. */}
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
									onPaid={s => {
										setPayingExpense(s)
										setPayLeftover(
											s.expected_leftover != null
												? String(s.expected_leftover)
												: '0'
										)
										setPayOpen(true)
									}}
									onUnpaid={s => {
										setUnpayingExpense(s)
										setUnpayOpen(true)
									}}
								/>
							))}
						</div>
					</div>
				</div>
			)}

			{renderByDays()}

			{/* Legacy income grouping UI below (disabled)
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
						onPayExpense={s => {
							setPayingExpense(s)
							setPayLeftover(
								s.expected_leftover != null ? String(s.expected_leftover) : '0'
							)
							setPayOpen(true)
						}}
						onUnpayExpense={s => {
							setUnpayingExpense(s)
							setUnpayOpen(true)
						}}
					/>
				))}
			</div>
			*/}

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
			<ExpenseModal
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
			<ExpenseModal
				isOpen={editExpenseOpen}
				onOpenChange={setEditExpenseOpen}
				expense={editingExpense}
				incomes={incomes}
			/>

			<ConfirmPayModal
				isOpen={payOpen}
				onOpenChange={setPayOpen}
				title='Подтверждение оплаты'
				description='Укажите остаток и подтвердите проведение оплаты.'
				confirmText='Отметить как оплачено'
				onConfirm={async () => {
					if (!payingExpense) return
					await router.post(
						`/lk/schedules/${payingExpense.id}/pay`,
						{ leftover: payLeftover, month },
						{
							preserveScroll: true,
							onSuccess: () => {
								setPayingExpense(null)
								setPayLeftover('')
								router.reload({ only: ['schedules'] })
							}
						}
					)
				}}
			>
				<div className='mt-2'>
					<Input
						label='Остаток'
						type='number'
						step='0.01'
						value={payLeftover}
						onChange={e => setPayLeftover(e.target.value)}
					/>
				</div>
			</ConfirmPayModal>

			<ConfirmDeleteModal
				isOpen={unpayOpen}
				onOpenChange={setUnpayOpen}
				title='Отменить оплату?'
				description='Отменить отметку об оплате для этого расхода?'
				confirmText='Отменить оплату'
				onConfirm={async () => {
					if (!unpayingExpense) return
					await router.post(
						`/lk/schedules/${unpayingExpense.id}/unpay`,
						{ month },
						{
							preserveScroll: true,
							onSuccess: () => {
								setUnpayingExpense(null)
								setUnpayOpen(false)
								router.reload({ only: ['schedules'] })
							}
						}
					)
				}}
			/>
		</LkLayout>
	)
}
