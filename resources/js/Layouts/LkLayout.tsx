import {Link, router, usePage} from '@inertiajs/react'
import {Button, User, Navbar, NavbarBrand, NavbarContent, NavbarItem} from '@heroui/react'
import {LogOut} from 'lucide-react'
import {PropsWithChildren, useMemo} from 'react'

export default function LkLayout({children}: PropsWithChildren) {
  const { props, url } = usePage()
  const user = (props as any).auth?.user || (props as any).user

  const handleLogout = () => {
    router.post('/lk/logout')
  }

  const currentPath = (url as string) || ''
  const isActive = useMemo(() => ({ href }: { href: string }) => currentPath === href || currentPath.startsWith(href + '?'), [currentPath])

  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <Navbar maxWidth="xl" className="border-b border-gray-200/80">
        <NavbarBrand className="gap-3">
          <Link href="/lk" className="flex items-center gap-3">
            <img src="/images/logo.png" alt="Логотип ТранжироМер" className="h-10 w-10" loading="eager" />
            <span className="text-base font-semibold">Семейный бюджет</span>
          </Link>
        </NavbarBrand>
        <NavbarContent justify="center" className="hidden sm:flex">
          <NavbarItem isActive={isActive({ href: '/lk' })}>
            <Link href="/lk">Дашборд</Link>
          </NavbarItem>
          <NavbarItem isActive={isActive({ href: '/lk/budget' })}>
            <Link href="/lk/budget">Бюджет</Link>
          </NavbarItem>
          <NavbarItem isActive={isActive({ href: '/lk/groups' })}>
            <Link href="/lk/groups">Группы</Link>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="end">
          <NavbarItem>
            <User avatarProps={{ src: user?.avatar }} description={user?.email} name={user?.name} className="hidden sm:flex" />
          </NavbarItem>
          <NavbarItem>
            <Button size="sm" color="danger" onPress={handleLogout} startContent={<LogOut size={16}/>}>Выйти</Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6">
        {children}
      </div>
    </div>
  )
}
