import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react'
import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'

export type ConfirmDeleteModalProps = {
	isOpen: boolean
	onOpenChange: (v: boolean) => void
	title?: string
	description?: string
	confirmText?: string
	onConfirm: () => Promise<void> | void
}

export default function ConfirmDeleteModal({
	isOpen,
	onOpenChange,
	title = 'Подтверждение удаления',
	description = 'Вы уверены, что хотите удалить этот элемент? Это действие невозможно отменить.',
	confirmText = 'Удалить',
	onConfirm
}: ConfirmDeleteModalProps) {
	const [submitting, setSubmitting] = useState(false)

	async function handleConfirm(close: () => void) {
		if (submitting) {
			return
		}
		setSubmitting(true)
		try {
			await onConfirm()
			close()
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange} placement='center'>
			<ModalContent>
				{close => (
					<>
						<ModalHeader className='flex items-center gap-2'>
							<AlertTriangle size={18} className='text-danger' />
							{title}
						</ModalHeader>
						<ModalBody>
							<p className='text-sm text-foreground-500'>{description}</p>
						</ModalBody>
						<ModalFooter>
							<Button variant='flat' onPress={() => close()} disabled={submitting}>
								Отмена
							</Button>
							<Button color='danger' onPress={() => handleConfirm(close)} isLoading={submitting}>
								{confirmText}
							</Button>
						</ModalFooter>
					</>
				)}
			</ModalContent>
		</Modal>
	)
}
