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
import { type DateValue } from '@internationalized/date'
import { useMemo, useState } from 'react'

import { Schedule } from '../types'

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

export type ExpenseCreateModalProps = {
	isOpen: boolean
	onOpenChange: (v: boolean) => void
	groupId: number
	incomes: Schedule[]
}

export default function ExpenseCreateModal({
	isOpen,
	onOpenChange,
	groupId,
	incomes
}: ExpenseCreateModalProps) {
	const { errors } = usePage().props as any
	const [processing, setProcessing] = useState(false)
	const [confirmOpen, setConfirmOpen] = useState(false)

	const [formData, setFormData] = useState({
		name: '',
		amount: '',
		expected_leftover: '',
		description: '',
		parentId: null,
		icon: '',
		period_type: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'one_time',
		day_of_week: '',
		day_of_month: '',
		time_of_day: '',
		single_date: null as DateValue | null,
		end_date: null as DateValue | null,
		is_cash_leftover: false
	})

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

	return (
		<Modal
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			placement='center'
		>
			<ModalContent>
				{close => (
					<form
						action='/lk/schedules'
						method='post'
						onSubmit={e => {
							e.preventDefault()
							setProcessing(true)

							router.post('/lk/schedules', formData as any, {
								onSuccess: () => {
									close()
									router.reload({ only: ['schedules'] })
								},
								onFinish: () => setProcessing(false),
								preserveScroll: true
							})
						}}
					>
						<ModalHeader>Добавить расход</ModalHeader>
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
								selectedKeys={formData.parentId ? [formData.parentId] : []}
								onChange={e => handleSelectChange('parentId', e.target.value)}
								isInvalid={Boolean(errors?.parent_id)}
								errorMessage={errors?.parent_id as any}
							>
								{incomes.map(inc => (
									<SelectItem key={inc.id}>{inc.name}</SelectItem>
								))}
							</Select>

							<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
								<Select
									label='Иконка'
									selectedKeys={formData.icon ? [formData.icon] : []}
									onChange={e => handleSelectChange('icon', e.target.value)}
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
									isRequired
									selectedKeys={[formData.day_of_week]}
									onChange={e =>
										handleSelectChange('day_of_week', e.target.value)
									}
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
									isRequired
									min={1}
									max={31}
									label='День месяца'
									value={formData.day_of_month}
									onChange={handleInputChange}
								/>
							)}

							{periodFields === 'one_time' && (
								<>
									<DatePicker
										label='Дата'
										isRequired
										value={formData.single_date ?? undefined}
										onChange={value => handleChange('single_date', value)}
									/>
								</>
							)}

							{periodFields === 'daily' && (
								<Input
									name='time_of_day'
									type='time'
									isRequired
									label='Время'
									value={formData.time_of_day}
									onChange={handleInputChange}
								/>
							)}

							{periodFields !== 'one_time' && (
								<>
									<DatePicker
										label='Дата окончания'
										value={formData.end_date ?? undefined}
										onChange={value => handleChange('end_date', value)}
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
							<Button
								color='primary'
								type='submit'
								isLoading={processing}
							>
								Создать
							</Button>
						</ModalFooter>
					</form>
				)}
			</ModalContent>
		</Modal>
	)
}
