import {Head, Link} from '@inertiajs/react'
import {Card, CardBody, CardHeader, Button} from '@heroui/react'
import LkLayout from '../../../Layouts/LkLayout'
import {Group} from '../../../types'

type Props = {
  groups: (Group & { members_count?: number })[]
}

export default function GroupsIndex({groups}: Props) {
  return (
    <LkLayout>
      <Head title="Группы" />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Мои группы</h1>
        <Button as={Link} href="#" color="primary">Создать группу</Button>
      </div>
      <div className="grid gap-3">
        {groups.map((g) => (
          <Card key={g.id}>
            <CardHeader className="flex items-center justify-between">
              <div className="font-medium">{g.name}</div>
              <div className="text-sm text-gray-500">Участников: {g.members_count ?? g.members?.length ?? 0}</div>
            </CardHeader>
            <CardBody className="pt-0">
              <Button as={Link} href={`/lk/groups/${g.id}`} variant="flat">Управлять</Button>
            </CardBody>
          </Card>
        ))}
      </div>
    </LkLayout>
  )
}
