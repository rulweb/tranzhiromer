import { Link, router, usePage } from '@inertiajs/react'
import {Avatar, Button, Card, User} from '@heroui/react'
import { LogOut } from 'lucide-react'

export default function Index() {
  const { props } = usePage()
  const user = (props as any).auth?.user || (props as any).user

  const handleLogout = () => {
    router.post('/logout')
  }

  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <Link href="/">
            <img
              src="/images/logo.png"
              alt="Логотип ТранжироМер"
              className="mx-auto h-56 w-56 sm:h-64 sm:w-64 lg:h-72 lg:w-72"
              loading="eager"
            />
          </Link>
        </div>

        <Card className="p-6">
          <div className="flex justify-between items-center gap-3 ">
              <User
                  avatarProps={{
                      src: user?.avatar,
                  }}
                  description={user?.email}
                  name={user?.name}
              />
              <Button color="danger" onPress={handleLogout} startContent={<LogOut size={16}/>}>Выйти</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
