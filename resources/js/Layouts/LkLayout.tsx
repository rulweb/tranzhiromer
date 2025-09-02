import {
	Button,
	Drawer,
	DrawerBody,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Navbar,
	NavbarBrand,
	NavbarContent,
	NavbarItem,
	User
} from '@heroui/react'
import { Link, router, usePage } from '@inertiajs/react'
import { ChevronDown, Home, LogOut, Pencil, Wallet } from 'lucide-react'
import { PropsWithChildren, useMemo, useState } from 'react'

import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal'

function InviteForm({ groupId }: { groupId: number }) {
	const [email, setEmail] = useState('')
	return (
		<div className='flex items-center gap-2'>
			<Input
				size='sm'
				type='email'
				value={email}
				onValueChange={setEmail}
				placeholder='email@example.com'
				isInvalid={Boolean((usePage().props as any).errors?.email)}
				errorMessage={(usePage().props as any).errors?.email}
			/>
			<Button
				size='sm'
				onPress={() => {
					if (!email) return
					router.post(
						`/lk/groups/${groupId}/invite`,
						{ email },
						{
							preserveScroll: true,
							onSuccess: () => setEmail('')
						}
					)
				}}
			>
				Добавить
			</Button>
		</div>
	)
}

export default function LkLayout({ children }: PropsWithChildren) {
	const { props, url } = usePage()
	const auth = (props as any).auth || {}
	const user = auth.user
	const groups = (auth.groups || []) as { id: number; name: string }[]
	const currentGroup = auth.currentGroup as { id: number; name: string } | null
	const currentGroupMembers = (auth.currentGroupMembers || []) as {
		id: number
		name: string
		email: string
	}[]
	const [drawerOpen, setDrawerOpen] = useState(false)
	const [editOpen, setEditOpen] = useState(false)
	const [newGroupName, setNewGroupName] = useState('')
	const [editName, setEditName] = useState(currentGroup?.name ?? '')
	const [deleteModalOpen, setDeleteModalOpen] = useState(false)
	const [deleteMemberModalOpen, setDeleteMemberModalOpen] = useState(false)
	const [memberToDelete, setMemberToDelete] = useState<{
		id: number
		name: string
		email: string
	} | null>(null)

	const handleLogout = () => {
		router.post('/lk/logout')
	}

	const currentPath = (url as string) || ''
	const isActive = useMemo(
		() =>
			({ href }: { href: string }) =>
				currentPath === href || currentPath.startsWith(href + '?'),
		[currentPath]
	)

	const switchGroup = (id: number) => {
		router.post(
			'/lk/groups/current',
			{ group_id: id },
			{
				preserveScroll: true,
				onSuccess: () => setDrawerOpen(false)
			}
		)
	}

	const createGroup = () => {
		if (!newGroupName.trim()) return
		router.post(
			'/lk/groups',
			{ name: newGroupName },
			{
				preserveScroll: true,
				onSuccess: () => {
					setNewGroupName('')
				}
			}
		)
	}

	const saveEdit = () => {
		if (!currentGroup) return
		router.patch(
			`/lk/groups/${currentGroup.id}`,
			{ name: editName },
			{
				preserveScroll: true,
				onSuccess: () => setEditOpen(false)
			}
		)
	}

	return (
		<div className='bg-white text-gray-900 min-h-screen'>
			<Navbar
				maxWidth='xl'
				className='border-b border-gray-200/80'
			>
				<NavbarBrand className='gap-3'>
					<Link
						href='/lk'
						className='flex items-center gap-3'
					>
						<img
							src='/images/logo.png'
							alt='Логотип ТранжироМер'
							className='h-10 w-10'
							loading='eager'
						/>
					</Link>
					<button
						type='button'
						className='text-base font-semibold inline-flex items-center gap-1'
						onClick={() => setDrawerOpen(true)}
					>
						{currentGroup?.name || '— группа —'} <ChevronDown size={16} />
					</button>
				</NavbarBrand>
				<NavbarContent
					justify='center'
					className='hidden sm:flex'
				>
					<NavbarItem isActive={isActive({ href: '/lk' })}>
						<Link href='/lk'>Дашборд</Link>
					</NavbarItem>
					<NavbarItem isActive={isActive({ href: '/lk/budget' })}>
						<Link href='/lk/budget'>Бюджет</Link>
					</NavbarItem>
				</NavbarContent>
				<NavbarContent justify='end'>
					<NavbarItem>
						<User
							avatarProps={{ src: user?.avatar }}
							description={user?.email}
							name={user?.name}
							className='hidden sm:flex'
						/>
					</NavbarItem>
					<NavbarItem>
						<Button
							size='sm'
							color='danger'
							onPress={handleLogout}
							startContent={<LogOut size={16} />}
						>
							Выйти
						</Button>
					</NavbarItem>
				</NavbarContent>
			</Navbar>

			<Drawer
				isOpen={drawerOpen}
				onOpenChange={setDrawerOpen}
				placement='left'
			>
				<DrawerContent>
					{onClose => (
						<>
							<DrawerHeader className='flex items-center justify-between'>
								<div className='font-semibold'>Мои группы</div>
								{currentGroup && (
									<Button
										size='sm'
										variant='flat'
										startContent={<Pencil size={14} />}
										onPress={() => {
											setEditName(currentGroup.name)
											setEditOpen(true)
										}}
									>
										Редактировать
									</Button>
								)}
							</DrawerHeader>
							<DrawerBody>
								<div className='flex flex-col gap-2'>
									{groups.map(g => (
										<Button
											key={g.id}
											variant={
												g.id === (currentGroup?.id ?? 0) ? 'solid' : 'flat'
											}
											color={
												g.id === (currentGroup?.id ?? 0) ? 'primary' : 'default'
											}
											onPress={() => switchGroup(g.id)}
										>
											{g.name}
										</Button>
									))}
								</div>
								<div className='mt-6'>
									<div className='text-sm font-medium mb-2'>
										Создать новую группу
									</div>
									<div className='flex items-center gap-2'>
										<Input
											size='sm'
											value={newGroupName}
											onValueChange={setNewGroupName}
											isInvalid={Boolean((usePage().props as any).errors?.name)}
											errorMessage={(usePage().props as any).errors?.name}
											placeholder='Название группы'
										/>
										<Button
											size='sm'
											color='primary'
											onPress={createGroup}
										>
											Создать
										</Button>
									</div>
								</div>
							</DrawerBody>
							<DrawerFooter>
								<Button
									variant='light'
									onPress={onClose}
								>
									Закрыть
								</Button>
							</DrawerFooter>
						</>
					)}
				</DrawerContent>
			</Drawer>

			<Modal
				isOpen={editOpen}
				onOpenChange={setEditOpen}
			>
				<ModalContent>
					{() => (
						<>
							<ModalHeader>Редактировать группу</ModalHeader>
							<ModalBody>
								<Input
									label='Название'
									value={editName}
									onValueChange={setEditName}
									isInvalid={Boolean((usePage().props as any).errors?.name)}
									errorMessage={(usePage().props as any).errors?.name}
								/>
								<div className='mt-4'>
									<div className='text-sm font-medium mb-2'>Участники</div>
									<div className='flex flex-col gap-2'>
										{currentGroupMembers.map(m => (
											<div
												key={m.id}
												className='flex items-center justify-between text-sm'
											>
												<div>
													<div className='font-medium'>{m.name}</div>
													<div className='text-gray-500'>{m.email}</div>
												</div>
												<Button
													size='sm'
													variant='light'
													color='danger'
													onPress={() => {
														setMemberToDelete(m)
														setDeleteMemberModalOpen(true)
													}}
												>
													Удалить
												</Button>
											</div>
										))}
									</div>
								</div>
								<div className='mt-4'>
									<div className='text-sm font-medium mb-2'>
										Добавить участника
									</div>
									<InviteForm groupId={currentGroup?.id || 0} />
								</div>
							</ModalBody>
							<ModalFooter>
								<Button
									variant='light'
									onPress={() => setEditOpen(false)}
								>
									Отмена
								</Button>
								{/* Delete group with confirmation modal */}
								<Button
									color='danger'
									variant='flat'
									onPress={() => setDeleteModalOpen(true)}
								>
									Удалить группу
								</Button>
								<Button
									color='primary'
									onPress={saveEdit}
								>
									Сохранить
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>

			<ConfirmDeleteModal
				isOpen={deleteModalOpen}
				onOpenChange={setDeleteModalOpen}
				title='Удалить группу?'
				description='Вы уверены, что хотите удалить эту группу? Это действие необратимо и удалит все связанные данные.'
				confirmText='Удалить'
				onConfirm={async () => {
					if (!currentGroup) return
					await router.delete(`/lk/groups/${currentGroup.id}`, {
						preserveScroll: true,
						onSuccess: () => {
							setEditOpen(false)
							setDrawerOpen(false)
						}
					})
				}}
			/>

			<ConfirmDeleteModal
				isOpen={deleteMemberModalOpen}
				onOpenChange={setDeleteMemberModalOpen}
				title='Удалить участника?'
				description={
					memberToDelete
						? `Удалить ${memberToDelete.name} (${memberToDelete.email}) из группы?`
						: 'Удалить участника из группы?'
				}
				confirmText='Удалить'
				onConfirm={async () => {
					if (!currentGroup || !memberToDelete) return
					await router.delete(
						`/lk/groups/${currentGroup.id}/members/${memberToDelete.id}`,
						{
							preserveScroll: true,
							onSuccess: () => {
								setDeleteMemberModalOpen(false)
								setMemberToDelete(null)
							}
						}
					)
				}}
			/>

			<div className='mx-auto max-w-4xl px-4 sm:px-6 pt-6 pb-24 sm:pb-6'>
				{children}
			</div>

			{/* Mobile bottom navigation */}
			<nav className='sm:hidden fixed bottom-0 inset-x-0 z-40 border-t border-default-200 bg-white/95 backdrop-blur'>
				<div className='mx-auto max-w-4xl px-6'>
					<ul className='flex items-stretch justify-around h-14'>
						<li>
							<Link
								href='/lk'
								className={
									'flex flex-col items-center justify-center gap-1 text-xs h-full ' +
									(isActive({ href: '/lk' })
										? 'text-primary-600'
										: 'text-foreground-500')
								}
								aria-current={isActive({ href: '/lk' }) ? 'page' : undefined}
							>
								<Home size={18} />
								<span>Дашборд</span>
							</Link>
						</li>
						<li>
							<Link
								href='/lk/budget'
								className={
									'flex flex-col items-center justify-center gap-1 text-xs h-full ' +
									(isActive({ href: '/lk/budget' })
										? 'text-primary-600'
										: 'text-foreground-500')
								}
								aria-current={
									isActive({ href: '/lk/budget' }) ? 'page' : undefined
								}
							>
								<Wallet size={18} />
								<span>Бюджет</span>
							</Link>
						</li>
					</ul>
				</div>
			</nav>
		</div>
	)
}
