import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react'
import { BadgeCheck } from 'lucide-react'
import { PropsWithChildren, useState } from 'react'

export type ConfirmPayModalProps = {
	isOpen: boolean
	onOpenChange: (v: boolean) => void
	title?: string
	description?: string
	confirmText?: string
	onConfirm: () => Promise<void> | void
}

export default function ConfirmPayModal({
	isOpen,
	onOpenChange,
	title = 'Подтверждение оплаты',
	description = 'Подтвердите проведение оплаты.',
	confirmText = 'Отметить как оплачено',
	onConfirm,
	children
}: PropsWithChildren<ConfirmPayModalProps>) {
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
							<BadgeCheck size={18} className='text-success' />
							{title}
						</ModalHeader>
						<ModalBody>
							<p className='text-sm text-foreground-500'>{description}</p>
							{children}
						</ModalBody>
						<ModalFooter>
							<Button variant='flat' onPress={() => close()} disabled={submitting}>
								Отмена
							</Button>
							<Button color='success' onPress={() => handleConfirm(close)} isLoading={submitting}>
								{confirmText}
							</Button>
						</ModalFooter>
					</>
				)}
			</ModalContent>
		</Modal>
	)
}
