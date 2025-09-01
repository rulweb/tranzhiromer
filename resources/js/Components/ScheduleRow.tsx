import {
	Button,
	Card,
	CardBody,
	Popover,
	PopoverContent,
	PopoverTrigger
} from '@heroui/react'
import dayjs from 'dayjs'
import { CheckCircle, Info, MoveVertical, Pencil } from 'lucide-react'

import { Schedule } from '../types'

import { ScheduleIcon } from './ScheduleIcon'

export type ScheduleRowProps = {
	schedule: Schedule
	onEdit?: (s: Schedule) => void
	onMove?: (s: Schedule) => void
	onPaid?: (s: Schedule) => void
	isExpense?: boolean
}

function formatPeriodicity(s: Schedule): string {
	const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
	if (s.period_type === 'one_time') {
		const d = s.single_date ? dayjs(s.single_date) : null
		return d ? `Разово — ${d.format('D MMMM YYYY')}` : 'Разово'
	}
	if (s.period_type === 'daily') {
		return `Ежедневно${s.time_of_day ? ` в ${s.time_of_day}` : ''}`
	}
	if (s.period_type === 'weekly') {
		const w = typeof s.day_of_week === 'number' ? days[s.day_of_week] : ''
		return `Еженедельно${w ? ` по ${w}` : ''}`
	}
	if (s.period_type === 'monthly') {
		const d = typeof s.day_of_month === 'number' ? s.day_of_month : null
		return `Ежемесячно${d ? `, ${d} числа` : ''}`
	}
	return ''
}

export default function ScheduleRow({
	schedule,
	onEdit,
	onMove,
	onPaid,
	isExpense
}: ScheduleRowProps) {
	const end = schedule.end_date ? dayjs(schedule.end_date) : null
	return (
		<Card>
			<CardBody className='flex flex-row items-center justify-between p-3 sm:p-4'>
				<div className='flex items-center gap-3'>
					<ScheduleIcon
						icon={schedule.icon}
						className='w-6 h-6'
					/>
					<div>
						<div className='flex items-center'>
							<span className='font-medium'>{schedule.name}</span>
							{/* Mobile: info popover */}
							<div className='sm:hidden'>
								<Popover placement='bottom-start'>
									<PopoverTrigger>
										<Button
											isIconOnly
											size='sm'
											variant='light'
											aria-label='Подробнее'
										>
											<Info size={16} />
										</Button>
									</PopoverTrigger>
									<PopoverContent className='max-w-xs'>
										<div className='text-sm'>
											<div className='font-semibold mb-1'>{schedule.name}</div>
											<div className='text-xs text-gray-600'>
												Периодичность: {formatPeriodicity(schedule)}
											</div>
											{end && (
												<div className='text-xs text-gray-600 mt-1'>
													До: {end.format('D MMMM YYYY')}
												</div>
											)}
											<div className='mt-2'>
												<div className='text-xs uppercase text-gray-500'>
													Описание
												</div>
												<div className='text-sm'>
													{schedule.description ? schedule.description : '—'}
												</div>
											</div>
										</div>
									</PopoverContent>
								</Popover>
							</div>
						</div>
						<div className='hidden sm:block text-xs text-gray-500'>
							{schedule.description}
						</div>
					</div>
				</div>
				<div className='flex items-center gap-2'>
					{/* Paid status */}
					{isExpense && (
						<div className='flex items-center gap-1 text-xs'>
							{schedule.is_paid ? (
								<span className='inline-flex items-center text-green-600'>
									<CheckCircle
										size={14}
										className='mr-1'
									/>{' '}
									Оплачен
								</span>
							) : (
								<span className='text-amber-600'>Не оплачен</span>
							)}
						</div>
					)}
					{/* Desktop: periodicity between name and amount */}
					<div className='hidden sm:block text-xs text-gray-600'>
						{formatPeriodicity(schedule)}
					</div>
					<div
						className={
							'text-sm font-semibold ' +
							(isExpense ? 'text-red-600' : 'text-green-700')
						}
					>
						{isExpense ? '-' : '+'}
						{Number(schedule.amount).toLocaleString('ru-RU')}
					</div>
					{isExpense && !schedule.is_paid && (
						<Button
							size='sm'
							variant='flat'
							onPress={() => onPaid?.(schedule)}
						>
							Оплатить
						</Button>
					)}
					{onMove && (
						<Button
							isIconOnly
							size='sm'
							variant='flat'
							onPress={() => onMove(schedule)}
							aria-label='move'
						>
							<MoveVertical size={16} />
						</Button>
					)}
					{onEdit && (
						<Button
							isIconOnly
							size='sm'
							variant='flat'
							onPress={() => onEdit(schedule)}
							aria-label='edit'
						>
							<Pencil size={16} />
						</Button>
					)}
				</div>
			</CardBody>
		</Card>
	)
}
