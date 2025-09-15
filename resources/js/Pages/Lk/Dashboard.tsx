import { Button, Card, CardBody, CardHeader, Input } from '@heroui/react'
import { Head, router } from '@inertiajs/react'
import dayjs from 'dayjs'
import { useEffect, useMemo, useRef, useState } from 'react'

import ConfirmDeleteModal from '../../Components/ConfirmDeleteModal'
import ConfirmPayModal from '../../Components/ConfirmPayModal'
import ExpenseModal from '../../Components/ExpenseModal'
import IncomeCreateModal from '../../Components/IncomeCreateModal'
import IncomeEditModal from '../../Components/IncomeEditModal'
import MoveExpenseModal from '../../Components/MoveExpenseModal'
import ScheduleRow from '../../Components/ScheduleRow'
import LkLayout from '../../Layouts/LkLayout'

import { Schedule } from '@/types'

type DayGroup = { day: string; items: Schedule[] }

type IncomeDaysItem = {
	income: {
		id: number
		name: string
		amount: number
		description: string | null
		icon: string | null
	}
	days: DayGroup[]
}

type Props = {
	schedules: Schedule[]
	incomeDays: IncomeDaysItem[]
	month: string
}

export default function Dashboard({
	schedules: initial,
	incomeDays,
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
		router.visit(`/lk?month=${month}`, {
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
		<div className='flex flex-col gap-4'>
			{incomeDays.map(section => (
				<Card
					key={section.income.id}
					className='flex flex-col gap-2 mx-2 sm:mx-0'
				>
					<CardHeader className='flex flex-col sm:flex-row sm:items-center justify-between gap-2'>
						<div className='text-base font-semibold'>{section.income.name}</div>
						<div className='flex flex-row flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600'>
							<span className='font-medium text-success'>
								Доход: {Number(section.income.amount).toLocaleString('ru-RU')} ₽
							</span>
							<span className='font-medium text-danger'>
								Расходы:{' '}
								{Number(
									section.days.reduce(
										(sum, day) =>
											sum +
											day.items.reduce(
												(daySum, item) => daySum + item.amount,
												0
											),
										0
									)
								).toLocaleString('ru-RU')}{' '}
								₽
							</span>
							<span className='font-medium text-warning'>
								Баланс:{' '}
								{Number(
									section.income.amount -
										section.days.reduce(
											(sum, day) =>
												sum +
												day.items.reduce(
													(daySum, item) =>
														daySum +
														item.amount -
														(item.leftover || item.expected_leftover || 0),
													0
												),
											0
										)
								).toLocaleString('ru-RU')}{' '}
								₽
							</span>
						</div>
					</CardHeader>
					<CardBody className='flex flex-col gap-3 px-3 sm:px-6 md:px-10'>
						{section.days.map(group => (
							<div
								key={`${section.income.id}-${group.day}`}
								className={`flex flex-col gap-2`}
							>
								<div
									className={`sticky top-0 z-10 bg-white/70 dark:bg-black/50 backdrop-blur px-1 py-1 text-gray-600 dark:text-gray-300 ${
										dayjs(group.day).isToday()
											? 'font-bold text-xl text-warning underline underline-offset-4'
											: dayjs(group.day).isBefore()
												? 'text-2xs font-semibold line-through'
												: 'text-2xs font-semibold'
									}`}
								>
									{dayjs(group.day).format('DD MMMM')}
								</div>
								{group.items.map(e => (
									<ScheduleRow
										key={e.id}
										schedule={e}
										isExpense
										onPaid={() => {
											setPayingExpense(e)
											setPayLeftover(
												e.expected_leftover != null
													? String(e.expected_leftover)
													: '0'
											)
											setPayOpen(true)
										}}
										onUnpaid={() => {
											setUnpayingExpense(e)
											setUnpayOpen(true)
										}}
									/>
								))}
							</div>
						))}
					</CardBody>
				</Card>
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
						{ payment_id: unpayingExpense.payment_id },
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
