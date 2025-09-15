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
	today
} from '@internationalized/date'
import dayjs from 'dayjs'
import { X } from 'lucide-react'
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

export type ExpenseModalProps = {
	isOpen: boolean
	onOpenChange: (v: boolean) => void
	expense?: Schedule | null // Для редактирования
	incomes: Schedule[]
}

export default function ExpenseModal({
	isOpen,
	onOpenChange,
	expense,
	incomes
}: ExpenseModalProps) {
	const { errors, month } = usePage().props as any
	const [processing, setProcessing] = useState(false)
	const [confirmOpen, setConfirmOpen] = useState(false)
	const [payLeftover, setPayLeftover] = useState<string>('')

	const isEditMode = Boolean(expense)

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

	// Инициализация формы при редактировании
	useEffect(() => {
		if (expense && isEditMode) {
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
		} else if (!isEditMode) {
			// Сброс формы для создания
			setFormData({
				name: '',
				amount: '',
				expected_leftover: '',
				description: '',
				parent_id: '',
				icon: '',
				period_type: 'monthly',
				day_of_week: '',
				day_of_month: '',
				time_of_day: '',
				single_date: null,
				end_date: null,
				is_cash_leftover: false
			})
		}
		if (expense) {
			setPayLeftover(
				expense.expected_leftover != null
					? String(expense.expected_leftover)
					: '0'
			)
		}
	}, [expense, isEditMode])

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

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		setProcessing(true)

		const submitData = {
			...formData,
			single_date: formData.single_date?.toString() || null,
			end_date: formData.end_date?.toString() || null
		}

		if (isEditMode && expense) {
			// Редактирование
			router.patch(`/lk/schedules/${expense.id}`, submitData, {
				onSuccess: () => {
					onOpenChange(false)
					router.reload({ only: ['schedules'] })
				},
				onFinish: () => setProcessing(false),
				preserveScroll: true
			})
		} else {
			// Создание
			router.post('/lk/schedules', { ...submitData, type: 'expense' } as any, {
				onSuccess: () => {
					onOpenChange(false)
					router.reload({ only: ['schedules'] })
				},
				onFinish: () => setProcessing(false),
				preserveScroll: true
			})
		}
	}

	const handleDelete = async () => {
		if (!expense) return

		await router.delete(`/lk/schedules/${expense.id}`, {
			preserveScroll: true,
			onSuccess: () => {
				onOpenChange(false)
				router.reload({ only: ['schedules'] })
			}
		})
	}

	if (isEditMode && !expense) {
		return null
	}

	const handlePay = async () => {
		if (!expense) return
		await router.post(
			`/lk/schedules/${expense.id}/pay`,
			{ leftover: payLeftover, month },
			{
				preserveScroll: true,
				onSuccess: () => {
					onOpenChange(false)
					router.reload({ only: ['schedules'] })
				}
			}
		)
	}

	const handleUnpay = async () => {
		if (!expense) return
		await router.post(
			`/lk/schedules/${expense.id}/unpay`,
			{ payment_id: (expense as any).payment_id },
			{
				preserveScroll: true,
				onSuccess: () => {
					onOpenChange(false)
					router.reload({ only: ['schedules'] })
				}
			}
		)
	}

	return (
		<Modal
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			placement='center'
		>
			<ModalContent>
				{close => (
					<form onSubmit={handleSubmit}>
						<ModalHeader>
							{isEditMode ? 'Редактировать расход' : 'Добавить расход'}
						</ModalHeader>
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
								onChange={e => handleSelectChange('parent_id', e.target.value)}
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
									isRequired
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
									isRequired={!isEditMode}
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
									isRequired={!isEditMode}
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
										isRequired={!isEditMode}
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
									isRequired={!isEditMode}
									label='Время'
									value={formData.time_of_day}
									onChange={handleInputChange}
									isInvalid={Boolean(errors?.time_of_day)}
									errorMessage={errors?.time_of_day as any}
								/>
							)}

							{periodFields !== 'one_time' && (
								<div className='relative'>
									<DatePicker
										label='Дата окончания'
										value={formData.end_date ?? undefined}
										onChange={value => handleChange('end_date', value)}
										isInvalid={Boolean(errors?.end_date)}
										errorMessage={errors?.end_date as any}
										minValue={today(getLocalTimeZone())}
										pageBehavior='single'
										visibleMonths={2}
									/>
									{formData.end_date && (
										<Button
											isIconOnly
											size='sm'
											variant='light'
											className='absolute right-9 top-9 -translate-y-1/2'
											onPress={() => handleChange('end_date', null)}
										>
											<X size={16} />
										</Button>
									)}
								</div>
							)}

							<div className='flex justify-between gap-3'>
								<Button
									variant='flat'
									onPress={close}
									disabled={processing}
								>
									Отмена
								</Button>
								{isEditMode && (
									<>
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
									</>
								)}
								<Button
									color='primary'
									type='submit'
									isLoading={processing}
								>
									{isEditMode ? 'Сохранить' : 'Создать'}
								</Button>
							</div>
							<div>
								{isEditMode && expense && (
									<div className='m-2 border-t border-default-200 pt-3'>
										<div className='text-xs uppercase text-foreground-500 mb-2'>
											Статус оплаты на {dayjs(expense.day).format('MMMM YYYY')}
										</div>
										{expense.is_paid ? (
											<div className='flex items-center justify-between gap-3'>
												<div className='text-sm text-success'>Оплачено</div>
												<Button
													color='warning'
													variant='flat'
													onPress={handleUnpay}
												>
													Отменить оплату
												</Button>
											</div>
										) : (
											<div className='flex flex-col sm:flex-row sm:items-end gap-3'>
												<Input
													label='Остаток'
													type='number'
													step='0.01'
													value={payLeftover}
													onChange={e => setPayLeftover(e.target.value)}
												/>
												<Button
													color='success'
													variant='flat'
													onPress={handlePay}
												>
													Оплатить
												</Button>
											</div>
										)}
									</div>
								)}
							</div>
						</ModalBody>
					</form>
				)}
			</ModalContent>

			{isEditMode && (
				<ConfirmDeleteModal
					isOpen={confirmOpen}
					onOpenChange={setConfirmOpen}
					title='Удалить расход?'
					description='Удалить этот расход?'
					confirmText='Удалить'
					onConfirm={handleDelete}
				/>
			)}
		</Modal>
	)
}
