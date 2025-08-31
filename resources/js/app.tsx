import {HeroUIProvider} from '@heroui/react'
import {createInertiaApp} from '@inertiajs/react'
import dayjs from 'dayjs'
import ru from 'dayjs/locale/ru'
import duration from 'dayjs/plugin/duration'
import {resolvePageComponent} from 'laravel-vite-plugin/inertia-helpers'
import {createRoot} from 'react-dom/client'
import {Toaster} from 'sonner'

import '../css/app.css'

dayjs.locale({...ru, weekStart: 1})
dayjs.extend(duration)

createInertiaApp({
    resolve: (name: string) => resolvePageComponent(
        `./Pages/${name}.tsx`,
        import.meta.glob('./Pages/**/*.tsx')
    ),
    setup({el, App, props}) {
        createRoot(el as HTMLElement).render(
            <HeroUIProvider>
                <Toaster/>
                <App {...props} />
            </HeroUIProvider>
        )
    },
    progress: {
        color: '#4B5563'
    }
})
