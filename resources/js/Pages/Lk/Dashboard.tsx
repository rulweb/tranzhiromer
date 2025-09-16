import { Button, Card, CardBody, CardHeader } from '@heroui/react'
import { Head, router } from '@inertiajs/react'
import dayjs from 'dayjs'
import { Pencil } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import ExpenseModal from '../../Components/ExpenseModal'
import IncomeModal from '../../Components/IncomeModal'
import ScheduleRow from '../../Components/ScheduleRow'
import LkLayout from '../../Layouts/LkLayout'

import { Schedule } from '@/types'

type DayGroup = {
	day: string
	expenses_sum: number
	leftover_cash: number
	leftover_credit: number
	leftover: number
	items: Schedule[]
}

type IncomeDaysItem = {
	income: Schedule
	expenses_sum: number
	leftover_cash: number
	leftover_credit: number
	leftover: number
	days: DayGroup[]
}

type UnassignedDaysItem = {
	expenses_sum: number
	leftover_cash: number
	leftover_credit: number
	days: DayGroup[]
}

type Props = {
	unassignedDays: UnassignedDaysItem
	incomeDays: IncomeDaysItem[]
	month: string
}

export default function Dashboard({
	unassignedDays,
	incomeDays,
	month: initialMonth
}: Props) {
	const [month, setMonth] = useState<string>(
		initialMonth || dayjs().format('YYYY-MM')
	)
	const [createIncomeOpen, setCreateIncomeOpen] = useState<boolean>(false)
	const [createExpenseOpen, setCreateExpenseOpen] = useState<boolean>(false)
	const [editIncomeOpen, setEditIncomeOpen] = useState<boolean>(false)
	const [editingIncome, setEditingIncome] = useState<Schedule | null>(null)
	const [editExpenseOpen, setEditExpenseOpen] = useState<boolean>(false)
	const [editingExpense, setEditingExpense] = useState<Schedule | null>(null)

	useEffect(() => {
		router.visit(`/lk?month=${month}`, {
			preserveScroll: true,
			preserveState: true
		})
	}, [month])

	const incomes = useMemo(
		() => incomeDays.map(section => section.income),
		[incomeDays]
	)

	const renderByDays = () => (
		<div className='flex flex-col gap-4'>
			{incomeDays.map(section => (
				<Card
					key={section.income.id}
					className='flex flex-col gap-2 mx-2 sm:mx-0 px-3 sm:px-6 md:px-10'
				>
					<CardHeader className='flex flex-col sm:flex-row sm:items-center justify-between gap-2'>
						<div className='text-base font-semibold'>{section.income.name}</div>
						<div className='flex flex-col lg:flex-row flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600'>
							<span className='font-medium text-success'>
								Доход: {section.income.amount.toLocaleString('ru-RU')} ₽
							</span>
							<span className='font-medium text-danger'>
								Расходы: {section.expenses_sum.toLocaleString('ru-RU')} ₽
							</span>
							<span className='font-medium text-warning'>
								Остаток кредитных:{' '}
								{section.leftover_credit.toLocaleString('ru-RU')} ₽
							</span>
							<span className='font-medium text-warning'>
								Остаток наличных:{' '}
								{section.leftover_cash.toLocaleString('ru-RU')} ₽
							</span>
						</div>
						<span className='font-medium text-warning'>
							<Button
								isIconOnly
								size='sm'
								variant='flat'
								onPress={() => {
									setEditingIncome(section.income)
									setEditIncomeOpen(true)
								}}
								aria-label='edit'
							>
								<Pencil size={16} />
							</Button>
						</span>
					</CardHeader>
					<CardBody className='flex flex-col gap-3'>
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
										onEdit={s => {
											setEditingExpense(s)
											setEditExpenseOpen(true)
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

			<div className='flex flex-col lg:flex-row items-center justify-between gap-3 mb-4'>
				<h1 className='text-xl font-semibold'>Бюджет на</h1>
				<div className='flex flex-nowrap items-center gap-2'>
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
				</div>
				<div className='flex flex-nowrap items-center gap-2'>
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

			{unassignedDays.days.length > 0 && (
				<div className='mb-4'>
					<div className='rounded-lg border border-red-200 dark:border-red-900 bg-red-50/60 dark:bg-red-900/20 p-3'>
						<div className='mb-2 flex flex-col lg:flex-row items-center justify-between'>
							<div className='mb-4 text-sm font-semibold text-red-700 dark:text-red-300'>
								Нераспределённые платежи
							</div>
							<div className='flex flex-col lg:flex-row flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600'>
								<span className='font-medium text-danger'>
									Расходы: {unassignedDays.expenses_sum.toLocaleString('ru-RU')}{' '}
									₽
								</span>
								<span className='font-medium text-warning'>
									Остаток кредитных:{' '}
									{unassignedDays.leftover_credit.toLocaleString('ru-RU')} ₽
								</span>
								<span className='font-medium text-warning'>
									Остаток наличных:{' '}
									{unassignedDays.leftover_cash.toLocaleString('ru-RU')} ₽
								</span>
							</div>
						</div>
						<div className='flex flex-col gap-2'>
							{unassignedDays.days.map(dg =>
								dg.items.map(s => (
									<ScheduleRow
										key={s.id}
										schedule={s}
										isExpense
										onEdit={es => {
											setEditingExpense(es)
											setEditExpenseOpen(true)
										}}
									/>
								))
							)}
						</div>
					</div>
				</div>
			)}

			{renderByDays()}

			<IncomeModal
				isOpen={createIncomeOpen}
				onOpenChange={setCreateIncomeOpen}
			/>
			<IncomeModal
				isOpen={editIncomeOpen}
				onOpenChange={setEditIncomeOpen}
				income={editingIncome}
			/>
			<ExpenseModal
				isOpen={createExpenseOpen}
				onOpenChange={setCreateExpenseOpen}
				incomes={incomes}
			/>
			<ExpenseModal
				isOpen={editExpenseOpen}
				onOpenChange={setEditExpenseOpen}
				expense={editingExpense}
				incomes={incomes}
			/>
		</LkLayout>
	)
}
