import {
	Button,
	DatePicker,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Select,
	SelectItem,
	Textarea
} from '@heroui/react'
import { router, usePage } from '@inertiajs/react'
import { type DateValue } from '@internationalized/date'
import { useEffect, useMemo, useState } from 'react'

import { Schedule } from '../types'

import ConfirmDeleteModal from './ConfirmDeleteModal'
import { normalizeToCalendarDate } from '@/utils/date'

const iconOptions = [
	'home',
	'wallet',
	'car',
	'food',
	'grocery',
	'education',
	'gift',
	'investment'
]

export type IncomeEditModalProps = {
	isOpen: boolean
	onOpenChange: (v: boolean) => void
	income: Schedule | null
}

export default function IncomeEditModal({
	isOpen,
	onOpenChange,
	income
}: IncomeEditModalProps) {
	const [icon, setIcon] = useState<string>('')
	const [periodType, setPeriodType] = useState<
		'daily' | 'weekly' | 'monthly' | 'one_time'
	>('monthly')
	const [confirmOpen, setConfirmOpen] = useState(false)
	const [singleDate, setSingleDate] = useState<DateValue | null>(null)
	const [endDate, setEndDate] = useState<DateValue | null>(null)
	const [processing, setProcessing] = useState(false)
	const { errors } = usePage().props as any

	useEffect(() => {
		if (income) {
			setIcon(income.icon || '')
			setPeriodType(income.period_type)
			setSingleDate(normalizeToCalendarDate(income.single_date))
			setEndDate(normalizeToCalendarDate(income.end_date))
		}
	}, [income])

	const periodFields = useMemo(() => {
		if (periodType === 'weekly') {
			return 'weekly'
		}
		if (periodType === 'monthly') {
			return 'monthly'
		}
		if (periodType === 'one_time') {
			return 'one_time'
		}
		return 'daily'
	}, [periodType])

	if (!income) {
		return null
	}

	return (
		<Modal
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			placement='center'
		>
			<ModalContent>
				{close => (
					<form
						action={`/lk/schedules/${income.id}`}
						method='post'
						onSubmit={e => {
							e.preventDefault()
							setProcessing(true)
							const form = e.currentTarget as HTMLFormElement
							const fd = new FormData(form)
							fd.set('period_type', periodType)
							fd.set('type', 'income')
							router.patch(`/lk/schedules/${income.id}`, fd, {
								onSuccess: () => {
									close()
									router.reload({ only: ['schedules'] })
								},
								onFinish: () => setProcessing(false),
								preserveScroll: true
							})
						}}
					>
						<ModalHeader>Редактировать доход</ModalHeader>
						<ModalBody className='flex flex-col gap-3'>
							<Input
								name='name'
								label='Название'
								defaultValue={income.name}
								isRequired
								isInvalid={Boolean(errors?.name)}
								errorMessage={errors?.name as any}
							/>
							<Input
								name='amount'
								type='number'
								step='0.01'
								label='Сумма'
								defaultValue={String(income.amount)}
								isRequired
								isInvalid={Boolean(errors?.amount)}
								errorMessage={errors?.amount as any}
							/>
							<Textarea
								name='description'
								label='Описание'
								defaultValue={income.description || ''}
								isInvalid={Boolean(errors?.description)}
								errorMessage={errors?.description as any}
							/>
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
								<Select
									label='Иконка'
									selectedKeys={icon ? [icon] : []}
									onChange={e => setIcon(e.target.value)}
								>
									{iconOptions.map(key => (
										<SelectItem key={key}>{key}</SelectItem>
									))}
								</Select>
								<Select
									label='Периодичность'
									selectedKeys={[periodType]}
									onChange={e => setPeriodType(e.target.value as any)}
								>
									<SelectItem key='daily'>Ежедневно</SelectItem>
									<SelectItem key='weekly'>Еженедельно</SelectItem>
									<SelectItem key='monthly'>Ежемесячно</SelectItem>
									<SelectItem key='one_time'>Разово</SelectItem>
								</Select>
							</div>
							<input
								type='hidden'
								name='icon'
								value={icon}
							/>

							{periodFields === 'weekly' && (
								<Select
									name='day_of_week'
									label='День недели'
									selectedKeys={[(income.day_of_week ?? '').toString()]}
								>
									<SelectItem key='1'>Понедельник</SelectItem>
									<SelectItem key='2'>Вторник</SelectItem>
									<SelectItem key='3'>Среда</SelectItem>
									<SelectItem key='4'>Четверг</SelectItem>
									<SelectItem key='5'>Пятница</SelectItem>
									<SelectItem key='6'>Суббота</SelectItem>
									<SelectItem key='0'>Воскресенье</SelectItem>
								</Select>
							)}
							{periodFields === 'monthly' && (
								<Input
									name='day_of_month'
									type='number'
									min={1}
									max={31}
									label='День месяца'
									defaultValue={
										income.day_of_month ? String(income.day_of_month) : ''
									}
								/>
							)}
							{periodFields === 'one_time' && (
								<>
									<DatePicker
										label='Дата'
										value={singleDate ?? undefined}
										onChange={setSingleDate}
									/>
									<input
										type='hidden'
										name='single_date'
										value={singleDate ? singleDate.toString() : ''}
									/>
								</>
							)}
							{periodFields === 'daily' && (
								<Input
									name='time_of_day'
									type='time'
									label='Время'
									defaultValue={income.time_of_day || ''}
								/>
							)}
							{periodFields !== 'one_time' && (
								<>
									<DatePicker
										label='Дата окончания'
										value={endDate ?? undefined}
										onChange={setEndDate}
									/>
									<input
										type='hidden'
										name='end_date'
										value={endDate ? endDate.toString() : ''}
									/>
								</>
							)}
						</ModalBody>
						<ModalFooter>
							<Button
								variant='flat'
								onPress={close}
								disabled={processing}
							>
								Отмена
							</Button>
							<div className='flex-1' />
							<Button
								color='danger'
								variant='bordered'
								onPress={() => {
									if (processing) {
										return
									}
									setConfirmOpen(true)
								}}
								disabled={processing}
							>
								Удалить
							</Button>
							<Button
								color='primary'
								type='submit'
								isLoading={processing}
							>
								Сохранить
							</Button>
						</ModalFooter>
					</form>
				)}
			</ModalContent>
			<ConfirmDeleteModal
				isOpen={confirmOpen}
				onOpenChange={setConfirmOpen}
				title='Удалить доход?'
				description='Удалить этот доход? Все связанные расходы останутся без привязки.'
				confirmText='Удалить'
				onConfirm={async () => {
					await router.delete(`/lk/schedules/${income.id}`, {
						preserveScroll: true,
						onSuccess: () => {
							onOpenChange(false)
							router.reload({ only: ['schedules'] })
						}
					})
				}}
			/>
		</Modal>
	)
}
