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
import { type DateValue, parseDate } from '@internationalized/date'
import { useMemo, useState } from 'react'

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

export type IncomeCreateModalProps = {
	isOpen: boolean
	onOpenChange: (v: boolean) => void
	groupId: number
}

export default function IncomeCreateModal({
	isOpen,
	onOpenChange,
	groupId
}: IncomeCreateModalProps) {
	const [icon, setIcon] = useState<string>('')
	const [periodType, setPeriodType] = useState<
		'daily' | 'weekly' | 'monthly' | 'one_time'
	>('monthly')
	const [singleDate, setSingleDate] = useState<DateValue | null>(null)
	const [endDate, setEndDate] = useState<DateValue | null>(null)
	const [processing, setProcessing] = useState(false)
	const { errors } = usePage().props as any

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
							const form = e.currentTarget as HTMLFormElement
							const fd = new FormData(form)
							fd.set('type', 'income')
							fd.set('group_id', String(groupId))
							fd.set('period_type', periodType)
							router.post('/lk/schedules', fd, {
								onSuccess: () => {
									close()
									router.reload({ only: ['schedules'] })
								},
								onFinish: () => setProcessing(false),
								preserveScroll: true
							})
						}}
					>
						<ModalHeader>Добавить доход</ModalHeader>
						<ModalBody className='flex flex-col gap-3'>
							<Input
								name='name'
								label='Название'
								isRequired
								isInvalid={Boolean(errors?.name)}
								errorMessage={errors?.name as any}
							/>
							<Input
								name='amount'
								type='number'
								step='0.01'
								label='Сумма'
								isRequired
								isInvalid={Boolean(errors?.amount)}
								errorMessage={errors?.amount as any}
							/>
							<Textarea
								name='description'
								label='Описание'
								isInvalid={Boolean(errors?.description)}
								errorMessage={errors?.description as any}
							/>
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
								<Select
									label='Иконка'
									isRequired
									selectedKeys={icon ? [icon] : []}
									onChange={e => setIcon(e.target.value)}
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
									selectedKeys={[periodType]}
									onChange={e => setPeriodType(e.target.value as any)}
									isInvalid={Boolean(errors?.period_type)}
									errorMessage={errors?.period_type as any}
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
									isRequired
									label='День недели'
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
									isRequired
									type='number'
									min={1}
									max={31}
									label='День месяца'
									isInvalid={Boolean(errors?.day_of_month)}
									errorMessage={errors?.day_of_month as any}
								/>
							)}
							{periodFields === 'one_time' && (
								<>
									<DatePicker
										label='Дата'
										isRequired
										value={singleDate ?? undefined}
										onChange={setSingleDate}
										isInvalid={Boolean(errors?.single_date)}
										errorMessage={errors?.single_date as any}
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
									isRequired
									isInvalid={Boolean(errors?.time_of_day)}
									errorMessage={errors?.time_of_day as any}
								/>
							)}
							{periodFields !== 'one_time' && (
								<>
									<DatePicker
										label='Дата окончания'
										isRequired
										value={endDate ?? undefined}
										onChange={setEndDate}
										isInvalid={Boolean(errors?.end_date)}
										errorMessage={errors?.end_date as any}
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
