import { Button, Card, CardBody, CardHeader } from '@heroui/react'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'

// import AddExpenseForm from './AddExpenseForm'
import { Schedule } from '../types'

import ScheduleRow from './ScheduleRow'

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

export type IncomeGroupProps = {
	income: Schedule
	expenses: Schedule[]
	onEditIncome?: (s: Schedule) => void
	onEditExpense?: (s: Schedule) => void
	onMoveExpense?: (s: Schedule) => void
}

export default function IncomeGroup({
	income,
	expenses,
	onEditIncome,
	onEditExpense,
	onMoveExpense
}: IncomeGroupProps) {
	const [open, setOpen] = useState(false)
	const totalExpenses = useMemo(
		() => expenses.reduce((sum, e) => sum + Number(e.amount), 0),
		[expenses]
	)
	const rest = Number(income.amount) - totalExpenses

	return (
		<Card>
			<CardHeader className='flex items-center justify-between'>
				<div>
					<div className='text-base font-semibold'>{income.name}</div>
					<div className='text-xs text-gray-500'>
						Доход: {Number(income.amount).toLocaleString('ru-RU')} ₽
					</div>
				</div>
				<div className='flex items-center gap-2 sm:gap-3'>
					<div
						className={
							'text-sm font-semibold ' +
							(rest >= 0 ? 'text-green-700' : 'text-red-600')
						}
					>
						Остаток: {rest.toLocaleString('ru-RU')} ₽
					</div>
					{onEditIncome && (
						<Button
							size='sm'
							variant='light'
							onPress={() => onEditIncome(income)}
						>
							Редактировать
						</Button>
					)}
					<Button
						size='sm'
						variant='flat'
						onPress={() => setOpen(v => !v)}
					>
						{open ? 'Скрыть' : 'Показать'}
					</Button>
				</div>
			</CardHeader>
			<CardBody className='pt-0'>
				{open && (
					<div className='flex flex-col gap-2'>
						{(() => {
							const mapped = expenses.map(s => ({ s, date: nextDueDate(s) }))
							const items = (
								mapped.filter(x => x.date !== null) as {
									s: Schedule
									date: dayjs.Dayjs
								}[]
							).sort((a, b) => a.date.valueOf() - b.date.valueOf())
							const groups = items.reduce(
								(
									acc: Record<string, { date: dayjs.Dayjs; items: Schedule[] }>,
									cur
								) => {
									const key = cur.date.format('YYYY-MM-DD')
									if (!acc[key]) {
										acc[key] = { date: cur.date, items: [] }
									}
									acc[key].items.push(cur.s)
									return acc
								},
								{}
							)
							const ordered = Object.values(groups).sort(
								(a, b) => a.date.valueOf() - b.date.valueOf()
							)
							return ordered.length === 0 ? (
								<div className='text-sm text-gray-500'>
									Нет запланированных трат.
								</div>
							) : (
								ordered.map(g => (
									<div
										key={g.date.format('YYYY-MM-DD')}
										className='flex flex-col gap-2'
									>
										<div className='sticky top-0 z-10 bg-white/70 dark:bg-black/50 backdrop-blur px-1 py-1 text-xs font-semibold text-gray-600 dark:text-gray-300'>
											{g.date.format('D MMMM')}
										</div>
										{g.items.map(e => (
											<ScheduleRow
												key={e.id}
												schedule={e}
												isExpense
												onMove={onMoveExpense}
												onEdit={onEditExpense}
											/>
										))}
									</div>
								))
							)
						})()}
					</div>
				)}
			</CardBody>
		</Card>
	)
}
