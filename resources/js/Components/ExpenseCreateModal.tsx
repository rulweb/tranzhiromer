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
	Textarea,
	DatePicker
} from '@heroui/react'
import { Form, router } from '@inertiajs/react'
import { useMemo, useState } from 'react'
import { parseDate, type DateValue } from '@internationalized/date'

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
	const [icon, setIcon] = useState<string>('')
	const [periodType, setPeriodType] = useState<
		'daily' | 'weekly' | 'monthly' | 'one_time'
	>('monthly')
	const [parentId, setParentId] = useState<string>('')
	const [singleDate, setSingleDate] = useState<DateValue | null>(null)
	const [endDate, setEndDate] = useState<DateValue | null>(null)

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
							type: 'expense',
							group_id: groupId,
							period_type: periodType,
							parent_id: parentId ? Number(parentId) : undefined
						})}
					>
						{({ processing, errors }) => (
							<>
								<ModalHeader>Добавить расход</ModalHeader>
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

									<Select
										label='Привязать к доходу'
										selectedKeys={[parentId]}
										onChange={e => setParentId(e.target.value)}
										isInvalid={Boolean((errors as any)?.parent_id)}
										errorMessage={(errors as any)?.parent_id}
									>
										<SelectItem key=''>Нераспределённые платежи</SelectItem>
										{incomes.map(inc => (
											<SelectItem key={inc.id}>{inc.name}</SelectItem>
										))}
									</Select>

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
										<>
											<DatePicker label='Дата' value={singleDate ?? undefined} onChange={setSingleDate} />
											<input type='hidden' name='single_date' value={singleDate ? singleDate.toString() : ''} />
										</>
									)}
									{periodFields === 'daily' && (
										<Input
											name='time_of_day'
											type='time'
											label='Время'
										/>
									)}
         {periodFields !== 'one_time' && (
										<>
											<DatePicker label='Дата окончания' value={endDate ?? undefined} onChange={setEndDate} />
											<input type='hidden' name='end_date' value={endDate ? endDate.toString() : ''} />
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
							</>
						)}
					</Form>
				)}
			</ModalContent>
		</Modal>
	)
}
