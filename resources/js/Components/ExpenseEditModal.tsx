import {
	Button,
	Checkbox,
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
import {
	type DateValue,
	getLocalTimeZone,
	parseDate,
	today
} from '@internationalized/date'
import { AArrowUpIcon, X } from 'lucide-react'
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

export type ExpenseEditModalProps = {
	isOpen: boolean
	onOpenChange: (v: boolean) => void
	expense: Schedule | null
	incomes: Schedule[]
}

export default function ExpenseEditModal({
	isOpen,
	onOpenChange,
	expense,
	incomes
}: ExpenseEditModalProps) {
	const { errors } = usePage().props as any
	const [processing, setProcessing] = useState(false)
	const [confirmOpen, setConfirmOpen] = useState(false)

	const [formData, setFormData] = useState({
		name: '',
		amount: '',
		expected_leftover: '',
		description: '',
		parent_id: '',
		icon: '',
		period_type: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'one_time',
		day_of_week: '',
		day_of_month: '',
		time_of_day: '',
		single_date: null as DateValue | null,
		end_date: null as DateValue | null,
		is_cash_leftover: false
	})

	useEffect(() => {
		if (expense) {
			setFormData({
				name: expense.name || '',
				amount: String(expense.amount || ''),
				expected_leftover:
					expense.expected_leftover != null
						? String(expense.expected_leftover)
						: '',
				description: expense.description || '',
				parent_id: expense.parent_id != null ? String(expense.parent_id) : '',
				icon: expense.icon || '',
				period_type: expense.period_type,
				day_of_week: (expense.day_of_week ?? '').toString(),
				day_of_month: expense.day_of_month ? String(expense.day_of_month) : '',
				time_of_day: expense.time_of_day || '',
				single_date: normalizeToCalendarDate(expense.single_date),
				end_date: normalizeToCalendarDate(expense.end_date),
				is_cash_leftover: Boolean(expense.is_cash_leftover)
			})
		}
	}, [expense])

	// Определяем тип периода для условного рендеринга
	const periodFields = useMemo(() => {
		return formData.period_type
	}, [formData.period_type])

	// Обновление обычных полей формы
	const handleChange = (field: keyof typeof formData, value: any) => {
		setFormData(prev => ({ ...prev, [field]: value }))
	}

	// Обновление полей ввода
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type, checked } = e.target
		handleChange(
			name as keyof typeof formData,
			type === 'checkbox' ? checked : value
		)
	}

	const handleSelectChange = (field: string, key: string | number) => {
		handleChange(field as keyof typeof formData, String(key))
	}

	if (!expense) {
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
						onSubmit={e => {
							e.preventDefault()
							setProcessing(true)

							const fd = {
								...formData,
								single_date: formData.single_date?.toString(),
								end_date: formData.end_date?.toString()
							}

							router.patch(`/lk/schedules/${expense.id}`, fd, {
								onSuccess: () => {
									close()
									router.reload({ only: ['schedules'] })
								},
								onFinish: () => setProcessing(false),
								preserveScroll: true
							})
						}}
					>
						<ModalHeader>Редактировать расход</ModalHeader>
						<ModalBody className='flex flex-col gap-3'>
							<Input
								name='name'
								label='Название'
								value={formData.name}
								onChange={handleInputChange}
								isRequired
								isInvalid={Boolean(errors?.name)}
								errorMessage={errors?.name as any}
							/>
							<Input
								name='amount'
								type='number'
								step='0.01'
								label='Сумма'
								value={formData.amount}
								onChange={handleInputChange}
								isRequired
								isInvalid={Boolean(errors?.amount)}
								errorMessage={errors?.amount as any}
							/>
							<Input
								name='expected_leftover'
								type='number'
								step='0.01'
								label='Ожидаемый остаток (опционально)'
								value={formData.expected_leftover}
								onChange={handleInputChange}
								isInvalid={Boolean(errors?.expected_leftover)}
								errorMessage={errors?.expected_leftover as any}
							/>

							<Checkbox
								name='is_cash_leftover'
								radius='sm'
								color='primary'
								isSelected={formData.is_cash_leftover}
								onValueChange={value => handleChange('is_cash_leftover', value)}
							>
								Остаток наличными средствами
							</Checkbox>

							<Textarea
								name='description'
								label='Описание'
								value={formData.description}
								onChange={handleInputChange}
								isInvalid={Boolean(errors?.description)}
								errorMessage={errors?.description as any}
							/>

							<Select
								label='Привязать к доходу'
								isClearable
								selectedKeys={formData.parent_id ? [formData.parent_id] : []}
								onChange={e => handleSelectChange('parentId', e.target.value)}
								isInvalid={Boolean(errors?.parent_id)}
								errorMessage={errors?.parent_id as any}
							>
								{incomes.map(inc => (
									<SelectItem key={String(inc.id)}>{inc.name}</SelectItem>
								))}
							</Select>

							<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
								<Select
									label='Иконка'
									selectedKeys={formData.icon ? [formData.icon] : []}
									onChange={e => handleSelectChange('icon', e.target.value)}
									isInvalid={Boolean(errors?.icon)}
									errorMessage={errors?.icon as any}
								>
									{iconOptions.map(key => (
										<SelectItem key={key}>{key}</SelectItem>
									))}
								</Select>

								<Select
									label='Периодичность'
									selectedKeys={[formData.period_type]}
									onChange={e =>
										handleSelectChange('period_type', e.target.value)
									}
									isInvalid={Boolean(errors?.period_type)}
									errorMessage={errors?.period_type as any}
								>
									<SelectItem key='daily'>Ежедневно</SelectItem>
									<SelectItem key='weekly'>Еженедельно</SelectItem>
									<SelectItem key='monthly'>Ежемесячно</SelectItem>
									<SelectItem key='one_time'>Разово</SelectItem>
								</Select>
							</div>

							{periodFields === 'weekly' && (
								<Select
									name='day_of_week'
									label='День недели'
									selectedKeys={[formData.day_of_week]}
									onChange={e =>
										handleSelectChange('day_of_week', e.target.value)
									}
									isInvalid={Boolean(errors?.day_of_week)}
									errorMessage={errors?.day_of_week as any}
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
									value={formData.day_of_month}
									onChange={handleInputChange}
									isInvalid={Boolean(errors?.day_of_month)}
									errorMessage={errors?.day_of_month as any}
								/>
							)}

							{periodFields === 'one_time' && (
								<>
									<DatePicker
										label='Дата'
										value={formData.single_date ?? undefined}
										onChange={value => handleChange('single_date', value)}
										isInvalid={Boolean(errors?.single_date)}
										errorMessage={errors?.single_date as any}
										minValue={today(getLocalTimeZone())}
									/>
								</>
							)}

							{periodFields === 'daily' && (
								<Input
									name='time_of_day'
									type='time'
									label='Время'
									value={formData.time_of_day}
									onChange={handleInputChange}
									isInvalid={Boolean(errors?.time_of_day)}
									errorMessage={errors?.time_of_day as any}
								/>
							)}

							{periodFields !== 'one_time' && (
								<>
									<DatePicker
										label='Дата окончания'
										value={formData.end_date ?? undefined}
										onChange={value => handleChange('end_date', value)}
										isInvalid={Boolean(errors?.end_date)}
										errorMessage={errors?.end_date as any}
										minValue={today(getLocalTimeZone())}
										pageBehavior='single'
										visibleMonths={2}
										endContent={
											formData.end_date ? (
												<Button
													variant='light'
													isIconOnly
													onPress={() => handleChange('end_date', null)}
												>
													<X />
												</Button>
											) : (
												<></>
											)
										}
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
									if (processing) return
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
				title='Удалить расход?'
				description='Удалить этот расход?'
				confirmText='Удалить'
				onConfirm={async () => {
					await router.delete(`/lk/schedules/${expense.id}`, {
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
