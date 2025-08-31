import {Link} from "@inertiajs/react";
import {Button, Card} from "@heroui/react";
import {ArrowRight} from "lucide-react";

export default function Landing() {
    return (
        <div className="bg-white text-gray-900">
            <div className="relative isolate">
                <div className="mx-auto max-w-3xl px-4 pb-10 sm:px-6">
                    <div className="text-center">
                        <Link href="/">
                            <img
                                src="/images/logo.png"
                                alt="Логотип ТранжироМер"
                                className="mx-auto h-40 w-40 sm:h-56 sm:w-56 lg:h-72 lg:w-72"
                                loading="eager"
                            />
                        </Link>
                        <p className="mt-5 text-base leading-7 text-gray-700 sm:mt-6 sm:text-xl sm:leading-9">
                            Простое и эффективное приложение для ведения домашней бухгалтерии.
                            Контролируйте свои расходы и достигайте финансовых целей.
                        </p>
                        <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-6">
                            <Button as={Link} href="/lk" variant='solid' color="primary" size="lg" className="h-12 text-base sm:h-11 sm:text-sm" endContent={<ArrowRight size={18}/>}>Начать бесплатно</Button>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-5xl px-4 sm:mt-8 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl text-center">
                        <p className="text-2xl font-bold tracking-tight text-gray-900 sm:mt-2 sm:text-4xl">
                            Помогаем видеть картину ваших финансов и принимать решения осознанно
                        </p>
                        <p className="mt-3 text-base leading-7 text-gray-700 sm:mt-4 sm:text-lg sm:leading-8">
                            ТранжироМер — это минималистичный инструмент для учета доходов и расходов, планирования бюджета и
                            анализа трат по категориям. Мы сфокусированы на скорости, простоте и наглядности. Подходит для
                            личного использования и семейной бухгалтерии.
                        </p>
                    </div>

                    <div className="mx-auto mt-10 max-w-6xl sm:mt-16">
                        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <Card className="p-5 sm:p-6">
                                <dt className="text-base font-semibold">Учет расходов</dt>
                                <dd className="mt-2 text-sm text-gray-600">Записывайте все траты и следите за балансом.</dd>
                            </Card>
                            <Card className="p-5 sm:p-6">
                                <dt className="text-base font-semibold">Категории и отчеты</dt>
                                <dd className="mt-2 text-sm text-gray-600">Анализируйте расходы по категориям.</dd>
                            </Card>
                            <Card className="p-5 sm:p-6">
                                <dt className="text-base font-semibold">Планирование бюджета</dt>
                                <dd className="mt-2 text-sm text-gray-600">Ставьте финансовые цели и достигайте их.</dd>
                            </Card>
                        </div>

                    </div>
                </div>
            </div>

            <footer className="mt-14 border-t border-gray-200/80 bg-white/80 backdrop-blur sm:mt-16">
                <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
                    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row sm:gap-4">
                        <p className="text-center text-xs text-gray-500 sm:text-sm">© {new Date().getFullYear()} ТранжироМер. Все права защищены.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
