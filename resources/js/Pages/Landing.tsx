import {Link} from "@inertiajs/react";
import {Button, Card} from "@heroui/react";
import {ArrowRight} from "lucide-react";

export default function Landing() {
    return (
        <div className="bg-white text-gray-900">
            <div className="relative isolate">
                <div className="mx-auto max-w-3xl pb-10">
                    <div className="text-center">
                        <Link href="/">
                            <img
                                src="/images/logo.png"
                                alt="Логотип ТранжироМер"
                                className="mx-auto h-56 w-56 sm:h-64 sm:w-64 lg:h-72 lg:w-72"
                                loading="eager"
                            />
                        </Link>
                        <p className="mt-6 text-xl leading-9 text-gray-700">
                            Простое и эффективное приложение для ведения домашней бухгалтерии.
                            Контролируйте свои расходы и достигайте финансовых целей.
                        </p>
                        <div className="mt-6 grid grid-cols-1 items-center justify-center gap-3 sm:flex sm:flex-row sm:gap-6">
                            <Button as={Link} href="/lk" variant='bordered' color="primary" endContent={<ArrowRight size={16}/>}>Начать бесплатно</Button>
                        </div>
                    </div>
                </div>

                <div className="mx-auto mt-4 max-w-5xl px-0 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl text-center">
                        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Помогаем видеть картину ваших финансов и принимать решения осознанно
                        </p>
                        <p className="mt-4 text-lg leading-8 text-gray-700">
                            ТранжироМер — это минималистичный инструмент для учета доходов и расходов, планирования бюджета и
                            анализа трат по категориям. Мы сфокусированы на скорости, простоте и наглядности. Подходит для
                            личного использования и семейной бухгалтерии.
                        </p>
                    </div>

                    <div className="mx-auto mt-16 max-w-6xl">
                        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                            <Card className="p-6">
                                <dt className="text-base font-semibold">Учет расходов</dt>
                                <dd className="mt-2 text-sm text-gray-600">Записывайте все траты и следите за балансом.</dd>
                            </Card>
                            <Card className="p-6">
                                <dt className="text-base font-semibold">Категории и отчеты</dt>
                                <dd className="mt-2 text-sm text-gray-600">Анализируйте расходы по категориям.</dd>
                            </Card>
                            <Card className="p-6">
                                <dt className="text-base font-semibold">Планирование бюджета</dt>
                                <dd className="mt-2 text-sm text-gray-600">Ставьте финансовые цели и достигайте их.</dd>
                            </Card>
                        </div>

                    </div>
                </div>
            </div>

            <footer className="mt-16 border-t border-gray-200/80 bg-white/80 backdrop-blur">
                <div className="mx-auto max-w-6xl px-6 py-8 sm:py-10">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <p className="text-center text-sm text-gray-500">© {new Date().getFullYear()} ТранжироМер. Все права защищены.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
