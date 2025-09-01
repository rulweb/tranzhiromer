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
import { useEffect, useMemo, useState } from 'react'

import { Schedule } from '../types'
import ConfirmDeleteModal from './ConfirmDeleteModal'

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
}

export default function ExpenseEditModal({
	isOpen,
	onOpenChange,
	expense
}: ExpenseEditModalProps) {
	const [icon, setIcon] = useState<string>('')
	const [periodType, setPeriodType] = useState<
		'daily' | 'weekly' | 'monthly' | 'one_time'
	>('monthly')
	const [confirmOpen, setConfirmOpen] = useState(false)

	useEffect(() => {
		if (expense) {
			setIcon(expense.icon || '')
			setPeriodType(expense.period_type)
		}
	}, [expense])

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
					<Form
						action={`/lk/schedules/${expense.id}`}
						method='patch'
						onSuccess={() => {
							close()
							router.reload({ only: ['schedules'] })
						}}
						transform={data => ({
							...data,
							period_type: periodType,
							type: 'expense',
							parent_id: expense.parent_id
						})}
					>
						{({ processing, errors }) => (
							<>
								<ModalHeader>Редактировать расход</ModalHeader>
								<ModalBody className='flex flex-col gap-3'>
									<Input
										name='name'
										label='Название'
										defaultValue={expense.name}
										isRequired
										isInvalid={Boolean((errors as any)?.name)}
										errorMessage={(errors as any)?.name}
									/>
									<Input
										name='amount'
										type='number'
										step='0.01'
										label='Сумма'
										defaultValue={String(expense.amount)}
										isRequired
										isInvalid={Boolean((errors as any)?.amount)}
										errorMessage={(errors as any)?.amount}
									/>
									<Textarea
										name='description'
										label='Описание'
										defaultValue={expense.description || ''}
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
											selectedKeys={[(expense.day_of_week ?? '').toString()]}
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
												expense.day_of_month ? String(expense.day_of_month) : ''
											}
										/>
									)}
									{periodFields === 'one_time' && (
										<Input
											name='single_date'
											type='date'
											label='Дата'
											defaultValue={expense.single_date || ''}
										/>
									)}
									{periodFields === 'daily' && (
										<Input
											name='time_of_day'
											type='time'
											label='Время'
											defaultValue={expense.time_of_day || ''}
										/>
									)}
									{periodFields !== 'one_time' && (
										<Input
											name='end_date'
											type='date'
											label='Дата окончания'
											defaultValue={expense.end_date || ''}
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
									<div className='flex-1' />
   						<Button
   							color='danger'
   							variant='bordered'
   							onPress={() => {
   								if (processing) { return }
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
							</>
						)}
					</Form>
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
