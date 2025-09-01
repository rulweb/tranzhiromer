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

	useEffect(() => {
		if (income) {
			setIcon(income.icon || '')
			setPeriodType(income.period_type)
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
					<Form
						action={`/lk/schedules/${income.id}`}
						method='patch'
						onSuccess={() => {
							close()
							router.reload({ only: ['schedules'] })
						}}
						transform={data => ({
							...data,
							period_type: periodType,
							type: 'income'
						})}
					>
						{({ processing, errors }) => (
							<>
								<ModalHeader>Редактировать доход</ModalHeader>
								<ModalBody className='flex flex-col gap-3'>
									<Input
										name='name'
										label='Название'
										defaultValue={income.name}
										isRequired
										isInvalid={Boolean((errors as any)?.name)}
										errorMessage={(errors as any)?.name}
									/>
									<Input
										name='amount'
										type='number'
										step='0.01'
										label='Сумма'
										defaultValue={String(income.amount)}
										isRequired
										isInvalid={Boolean((errors as any)?.amount)}
										errorMessage={(errors as any)?.amount}
									/>
									<Textarea
										name='description'
										label='Описание'
										defaultValue={income.description || ''}
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
												<SelectItem
													key={key}
													value={key}
												>
													{key}
												</SelectItem>
											))}
										</Select>
										<Select
											label='Периодичность'
											selectedKeys={[periodType]}
											onChange={e => setPeriodType(e.target.value as any)}
										>
											<SelectItem
												key='daily'
												value='daily'
											>
												Ежедневно
											</SelectItem>
											<SelectItem
												key='weekly'
												value='weekly'
											>
												Еженедельно
											</SelectItem>
											<SelectItem
												key='monthly'
												value='monthly'
											>
												Ежемесячно
											</SelectItem>
											<SelectItem
												key='one_time'
												value='one_time'
											>
												Разово
											</SelectItem>
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
											<SelectItem
												key='1'
												value='1'
											>
												Понедельник
											</SelectItem>
											<SelectItem
												key='2'
												value='2'
											>
												Вторник
											</SelectItem>
											<SelectItem
												key='3'
												value='3'
											>
												Среда
											</SelectItem>
											<SelectItem
												key='4'
												value='4'
											>
												Четверг
											</SelectItem>
											<SelectItem
												key='5'
												value='5'
											>
												Пятница
											</SelectItem>
											<SelectItem
												key='6'
												value='6'
											>
												Суббота
											</SelectItem>
											<SelectItem
												key='0'
												value='0'
											>
												Воскресенье
											</SelectItem>
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
										<Input
											name='single_date'
											type='date'
											label='Дата'
											defaultValue={income.single_date || ''}
										/>
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
										<Input
											name='end_date'
											type='date'
											label='Дата окончания'
											defaultValue={income.end_date || ''}
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
										Сохранить
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
