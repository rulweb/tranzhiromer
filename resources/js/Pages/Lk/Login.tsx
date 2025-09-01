import { Button, Card } from '@heroui/react'
import { Link } from '@inertiajs/react'
import { ArrowLeft, LogIn } from 'lucide-react'

export default function Login() {
	return (
		<div className='bg-white text-gray-900 min-h-screen flex items-center'>
			<div className='mx-auto max-w-md w-full px-6'>
				<div className='text-center'>
					<Link href='/'>
						<img
							src='/images/logo.png'
							alt='Логотип ТранжироМер'
							className='mx-auto h-40 w-40 sm:h-48 sm:w-48'
							loading='eager'
						/>
					</Link>

					<h1 className='mt-6 text-2xl font-bold tracking-tight text-gray-900'>
						Войти в кабинет
					</h1>
					<p className='mt-2 text-sm text-gray-600'>
						Выберите удобный способ авторизации
					</p>

					<div className='mt-8 space-y-3'>
						<Button
							as='a'
							href='/auth/yandex/redirect'
							className='w-full bg-[#ffcc00] text-black hover:opacity-90'
							startContent={<LogIn size={16} />}
						>
							Войти через Яндекс ID
						</Button>
					</div>

					<div className='mt-8'>
						<Button
							as={Link}
							href='/'
							variant='light'
							startContent={<ArrowLeft size={16} />}
						>
							На главную
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}
