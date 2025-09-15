import { Card } from '@heroui/react'
import { Input } from '@heroui/react'
import { router } from '@inertiajs/react'
import dayjs from 'dayjs'
import { Calendar } from 'lucide-react'
import { useState } from 'react'

import ConfirmPayModal from '../../Components/ConfirmPayModal'
import ScheduleRow from '../../Components/ScheduleRow'
import LkLayout from '../../Layouts/LkLayout'
import { Schedule } from '../../types'

type Props = {
	schedules: Schedule[]
}

function nextDueDate(s: Schedule): dayjs.Dayjs | null {
	const today = dayjs().startOf('day')

	// One-time scheduled payment
	if (s.period_type === 'one_time') {
		if (!s.single_date) {
			return null
		}
		const d = dayjs(s.single_date)
		return d.isBefore(today) ? null : d
	}

	// Respect end_date if set
	const end = s.end_date ? dayjs(s.end_date).endOf('day') : null

	if (s.period_type === 'daily') {
		const d = today
		if (end && d.isAfter(end)) {
			return null
		}
		return d
	}

	if (s.period_type === 'weekly') {
		// day_of_week: 0-6 (0=вс)
		if (typeof s.day_of_week !== 'number') {
			return null
		}
		let d = today
		// dayjs: Sunday = 0
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

export default function Dashboard({ schedules }: Props) {
	const [payOpen, setPayOpen] = useState<boolean>(false)
	const [payingExpense, setPayingExpense] = useState<Schedule | null>(null)
	const [payLeftover, setPayLeftover] = useState<string>('0')
	// Compute next dates and group by date string
	const mapped = schedules.map(s => ({ s, date: nextDueDate(s) }))
	const items = (
		mapped.filter(x => x.date !== null) as { s: Schedule; date: dayjs.Dayjs }[]
	).sort((a, b) => a.date.valueOf() - b.date.valueOf())

	const groups = items.reduce(
		(acc: Record<string, { date: dayjs.Dayjs; items: Schedule[] }>, cur) => {
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

	return (
		<LkLayout>
			<Card className='p-5'>
				<div className='mb-3 flex items-center gap-2 text-base font-medium'>
					<Calendar size={18} /> Ближайшие обязательные платежи
				</div>
				<div className='flex flex-col gap-4'>
					{ordered.length === 0 && (
						<div className='text-sm text-gray-500'>
							Нет предстоящих платежей.
						</div>
					)}

					{ordered.map(g => (
						<div
							key={g.date.format('YYYY-MM-DD')}
							className='flex flex-col gap-2'
						>
							<div className='sticky top-0 z-10 bg-white/70 dark:bg-black/50 backdrop-blur px-1 py-1 text-xs font-semibold text-gray-600 dark:text-gray-300'>
								{g.date.format('D MMMM')}
							</div>
							{g.items.map(s => (
								<ScheduleRow
									key={s.id}
									schedule={s}
									isExpense={s.type === 'expense'}
									onPaid={exp => {
										setPayingExpense(exp)
										setPayLeftover(
											exp.expected_leftover != null
												? String(exp.expected_leftover)
												: '0'
										)
										setPayOpen(true)
									}}
								/>
							))}
						</div>
					))}
				</div>
			</Card>

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
						{ leftover: payLeftover, month: dayjs().format('YYYY-MM') },
						{
							preserveScroll: true,
							onSuccess: () => {
								setPayingExpense(null)
								setPayLeftover('0')
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
		</LkLayout>
	)
}
