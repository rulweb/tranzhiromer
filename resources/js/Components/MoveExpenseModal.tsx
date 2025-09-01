import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Select,
	SelectItem
} from '@heroui/react'
import { router } from '@inertiajs/react'
import { useState } from 'react'

import { Schedule } from '../types'

export type MoveExpenseModalProps = {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
	expense: Schedule | null
	incomes: Schedule[]
	onMoved?: () => void
}

export default function MoveExpenseModal({
	isOpen,
	onOpenChange,
	expense,
	incomes,
	onMoved
}: MoveExpenseModalProps) {
	const [targetId, setTargetId] = useState<string>(String(expense?.parent_id ?? ''))
	const options = incomes.filter(i => i.id !== (expense?.parent_id || 0))

	async function handleSave() {
		if (!expense) return
		await router.patch(
			`/lk/schedules/${expense.id}`,
			{ parent_id: targetId ? Number(targetId) : null },
			{
				onSuccess: () => {
					onMoved?.()
					onOpenChange(false)
				}
			}
		)
	}

	return (
		<Modal
			isOpen={isOpen}
			onOpenChange={onOpenChange}
		>
			<ModalContent>
				{() => (
					<>
						<ModalHeader>Переместить расход</ModalHeader>
						<ModalBody>
							<Select
								label='Новый доход'
								selectedKeys={[targetId]}
								onChange={e => setTargetId(e.target.value)}
							>
								<SelectItem key=''>Нераспределённые платежи</SelectItem>
								{options.map(i => (
									<SelectItem key={String(i.id)}>{i.name}</SelectItem>
								))}
							</Select>
						</ModalBody>
						<ModalFooter>
							<Button
								variant='light'
								onPress={() => onOpenChange(false)}
							>
								Отмена
							</Button>
							<Button
								color='primary'
								onPress={handleSave}
							>
								Сохранить
							</Button>
						</ModalFooter>
					</>
				)}
			</ModalContent>
		</Modal>
	)
}
