import { Button, Card } from '@heroui/react'
import { Head, Link } from '@inertiajs/react'
import { ArrowRight } from 'lucide-react'

export default function Landing() {
	return (
		<>
			<Head title={`ТранжироМер`} />
			<div className='bg-white text-gray-900'>
				<div className='relative isolate'>
					<div className='mx-auto max-w-3xl px-4 pb-10 sm:px-6'>
						<div className='text-center'>
							<Link href='/'>
								<img
									src='/images/logo.png'
									alt='Логотип ТранжироМер'
									className='mx-auto h-40 w-40 sm:h-56 sm:w-56 lg:h-72 lg:w-72'
									loading='eager'
								/>
							</Link>
							<p className='mt-5 text-base leading-7 text-gray-700 sm:mt-6 sm:text-xl sm:leading-9'>
								ТранжироМер помогает планировать бюджет «от доходов»:
								привязывайте расходы к источникам дохода, следите за остатком и
								управляйте тратами в понятном интерфейсе.
							</p>
							<div className='mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-6'>
								<Button
									as={Link}
									href='/lk'
									variant='solid'
									color='primary'
									size='lg'
									className='h-12 text-base sm:h-11 sm:text-sm'
									endContent={<ArrowRight size={18} />}
								>
									Начать бесплатно
								</Button>
							</div>
						</div>
					</div>

					<div className='mx-auto max-w-5xl px-4 sm:mt-8 sm:px-6 lg:px-8'>
						<div className='mx-auto max-w-3xl text-center'>
							<p className='text-2xl font-bold tracking-tight text-gray-900 sm:mt-2 sm:text-4xl'>
								Помогаем видеть картину ваших финансов и принимать решения
								осознанно
							</p>
							<p className='mt-3 text-base leading-7 text-gray-700 sm:mt-4 sm:text-lg sm:leading-8'>
								Учет доходов и расходов с акцентом на планирование: создавайте
								разовые и периодические платежи (ежедневно, еженедельно,
								ежемесячно) в удобном интерфейсе.
							</p>
						</div>

						<div className='mx-auto mt-10 max-w-6xl sm:mt-16'>
							<div className='grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4'>
								<Card className='p-5 sm:p-6'>
									<dt className='text-base font-semibold'>Бюджет от доходов</dt>
									<dd className='mt-2 text-sm text-gray-600'>
										Привязывайте расходы к доходам и контролируйте «Остаток» по
										каждому источнику.
									</dd>
								</Card>
								<Card className='p-5 sm:p-6'>
									<dt className='text-base font-semibold'>
										Расписания платежей
									</dt>
									<dd className='mt-2 text-sm text-gray-600'>
										Разовые и периодические: ежедневно, еженедельно, ежемесячно.
									</dd>
								</Card>
								<Card className='p-5 sm:p-6'>
									<dt className='text-base font-semibold'>
										Гибкое управление расходами
									</dt>
									<dd className='mt-2 text-sm text-gray-600'>
										Перемещайте расходы между доходами, редактируйте в модалках,
										подтверждайте удаление перед действием. Нераспределённые
										платежи — под контролем.
									</dd>
								</Card>
								<Card className='p-5 sm:p-6'>
									<dt className='text-base font-semibold'>Совместная работа</dt>
									<dd className='mt-2 text-sm text-gray-600'>
										Группы и приглашения: ведите общий бюджет с семьёй или
										партнёрами.
									</dd>
								</Card>
							</div>
						</div>
					</div>
				</div>

				<footer className='mt-14 border-t border-gray-200/80 bg-white/80 backdrop-blur sm:mt-16'>
					<div className='mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10'>
						<div className='flex flex-col items-center justify-between gap-3 sm:flex-row sm:gap-4'>
							<p className='text-center text-xs text-gray-500 sm:text-sm'>
								© {new Date().getFullYear()} ТранжироМер. Все права защищены.
							</p>
						</div>
					</div>
				</footer>
			</div>
		</>
	)
}
