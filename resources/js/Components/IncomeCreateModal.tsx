import {
	Button,
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
import { Form, router } from '@inertiajs/react'
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
					<Form
						action='/lk/schedules'
						method='post'
						onSuccess={() => {
							close()
							router.reload({ only: ['schedules'] })
						}}
						transform={data => ({
							...data,
							type: 'income',
							group_id: groupId,
							period_type: periodType
						})}
					>
						{({ processing, errors }) => (
							<>
								<ModalHeader>Добавить доход</ModalHeader>
								<ModalBody className='flex flex-col gap-3'>
									<Input
										name='name'
										label='Название'
										isRequired
										isInvalid={Boolean((errors as any)?.name)}
										errorMessage={(errors as any)?.name}
									/>
									<Input
										name='amount'
										type='number'
										step='0.01'
										label='Сумма'
										isRequired
										isInvalid={Boolean((errors as any)?.amount)}
										errorMessage={(errors as any)?.amount}
									/>
									<Textarea
										name='description'
										label='Описание'
										isInvalid={Boolean((errors as any)?.description)}
										errorMessage={(errors as any)?.description}
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
										/>
									)}
									{periodFields === 'one_time' && (
										<Input
											name='single_date'
											type='date'
											label='Дата'
										/>
									)}
									{periodFields === 'daily' && (
										<Input
											name='time_of_day'
											type='time'
											label='Время'
										/>
									)}
									{periodFields !== 'one_time' && (
										<Input
											name='end_date'
											type='date'
											label='Дата окончания'
										/>
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
							</>
						)}
					</Form>
				)}
			</ModalContent>
		</Modal>
	)
}
