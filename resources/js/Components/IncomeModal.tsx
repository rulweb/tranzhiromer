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
import {
	type DateValue,
	getLocalTimeZone,
	today
} from '@internationalized/date'
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

export type IncomeModalProps = {
	isOpen: boolean
	onOpenChange: (v: boolean) => void
	income?: Schedule | null // if provided -> edit mode
}

export default function IncomeModal({
	isOpen,
	onOpenChange,
	income
}: IncomeModalProps) {
	const { errors } = usePage().props as any
	const [processing, setProcessing] = useState(false)
	const [confirmOpen, setConfirmOpen] = useState(false)

	const isEditMode = Boolean(income)

	const [formData, setFormData] = useState({
		name: '',
		amount: '',
		description: '',
		icon: '',
		period_type: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'one_time',
		day_of_week: '',
		day_of_month: '',
		single_date: null as DateValue | null,
		end_date: null as DateValue | null
	})

	useEffect(() => {
		if (income && isEditMode) {
			setFormData({
				name: income.name || '',
				amount: String(income.amount || ''),
				description: income.description || '',
				icon: income.icon || '',
				period_type: income.period_type,
				day_of_week: (income.day_of_week ?? '').toString(),
				day_of_month: income.day_of_month ? String(income.day_of_month) : '',
				single_date: normalizeToCalendarDate(income.single_date),
				end_date: normalizeToCalendarDate(income.end_date)
			})
		} else {
			setFormData({
				name: '',
				amount: '',
				description: '',
				icon: '',
				period_type: 'monthly',
				day_of_week: '',
				day_of_month: '',
				single_date: null,
				end_date: null
			})
		}
	}, [income, isEditMode])

	const periodFields = useMemo(
		() => formData.period_type,
		[formData.period_type]
	)

	const handleChange = (field: keyof typeof formData, value: any) => {
		setFormData(prev => ({ ...prev, [field]: value }))
	}

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		handleChange(name as keyof typeof formData, value)
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		setProcessing(true)

		const submitData = {
			...formData,
			single_date: formData.single_date?.toString() || null,
			end_date: formData.end_date?.toString() || null
		}

		if (isEditMode && income) {
			router.patch(`/lk/schedules/${income.id}`, submitData, {
				onSuccess: () => {
					onOpenChange(false)
					router.reload({ only: ['schedules'] })
				},
				onFinish: () => setProcessing(false),
				preserveScroll: true
			})
		} else {
			router.post('/lk/schedules', { ...submitData, type: 'income' } as any, {
				onSuccess: () => {
					onOpenChange(false)
					router.reload({ only: ['schedules'] })
				},
				onFinish: () => setProcessing(false),
				preserveScroll: true
			})
		}
	}

	if (!isEditMode) {
		return null
	}

	return (
		<Modal
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			placement='center'
		>
			<ModalContent>
				{() => (
					<form onSubmit={handleSubmit}>
						<ModalHeader>
							{isEditMode ? 'Редактировать доход' : 'Добавить доход'}
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
							<Textarea
								name='description'
								label='Описание'
								value={formData.description}
								onChange={e => handleChange('description', e.target.value)}
								isInvalid={Boolean(errors?.description)}
								errorMessage={errors?.description as any}
							/>

							<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
								<Select
									label='Иконка'
									selectedKeys={formData.icon ? [formData.icon] : []}
									onChange={e => handleChange('icon', e.target.value)}
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
									onChange={e => handleChange('period_type', e.target.value)}
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
									onChange={e => handleChange('day_of_week', e.target.value)}
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
									label='День месяца'
									min={1}
									max={31}
									value={formData.day_of_month}
									onChange={handleInputChange}
									isInvalid={Boolean(errors?.day_of_month)}
									errorMessage={errors?.day_of_month as any}
								/>
							)}

							{periodFields === 'one_time' && (
								<DatePicker
									label='Дата'
									name='single_date'
									value={formData.single_date}
									onChange={v => handleChange('single_date', v)}
									isInvalid={Boolean(errors?.single_date)}
									errorMessage={errors?.single_date as any}
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
						</ModalBody>
						<ModalFooter>
							<Button
								size='sm'
								variant='light'
								startContent={<X size={16} />}
								onPress={() => onOpenChange(false)}
							>
								Отмена
							</Button>
							{isEditMode && (
								<Button
									color='danger'
									variant='ghost'
									onPress={() => setConfirmOpen(true)}
								>
									Удалить
								</Button>
							)}
							<Button
								color='primary'
								type='submit'
								isLoading={processing}
							>
								{isEditMode ? 'Сохранить' : 'Добавить'}
							</Button>
						</ModalFooter>

						{isEditMode && income && (
							<ConfirmDeleteModal
								isOpen={confirmOpen}
								onOpenChange={setConfirmOpen}
								onConfirm={() => {
									setProcessing(true)
									router.delete(`/lk/schedules/${income.id}` as any, {
										onSuccess: () => {
											setConfirmOpen(false)
											onOpenChange(false)
											router.reload({ only: ['schedules'] })
										},
										onFinish: () => setProcessing(false),
										preserveScroll: true
									})
								}}
							/>
						)}
					</form>
				)}
			</ModalContent>
		</Modal>
	)
}
