import { HeroUIProvider } from '@heroui/react'
import { createInertiaApp } from '@inertiajs/react'
import { I18nProvider } from '@react-aria/i18n'
import dayjs from 'dayjs'
import ru from 'dayjs/locale/ru'
import duration from 'dayjs/plugin/duration'
import isToday from 'dayjs/plugin/isToday'
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'

import '../css/app.css'

dayjs.locale({ ...ru, weekStart: 1 })
dayjs.extend(duration)
dayjs.extend(isToday)

createInertiaApp({
	resolve: (name: string) =>
		resolvePageComponent(
			`./Pages/${name}.tsx`,
			import.meta.glob('./Pages/**/*.tsx')
		),
	setup({ el, App, props }) {
		createRoot(el as HTMLElement).render(
			<HeroUIProvider>
				<I18nProvider locale='ru'>
					<Toaster />
					<App {...props} />
				</I18nProvider>
			</HeroUIProvider>
		)
	},
	progress: {
		color: '#4B5563'
	}
})
