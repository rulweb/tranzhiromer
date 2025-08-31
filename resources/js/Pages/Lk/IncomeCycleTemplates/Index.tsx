import {Head, Link} from '@inertiajs/react'
import {Button, Card, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell} from '@heroui/react'

type Template = {
  id: number
  name: string
  sequence: number
  default_expected_day?: number|null
  is_active: boolean
}

type Props = {
  templates: Template[]
}

export default function Index({ templates }: Props) {
  return (
    <div className="mx-auto max-w-4xl p-4">
      <Head title="Шаблоны доходов" />
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Шаблоны доходов</h1>
        <Button as={Link} href="/lk/income-cycles" color="primary" variant="flat">К циклам</Button>
      </div>

      <Card className="p-2">
        <Table aria-label="Шаблоны доходов">
          <TableHeader>
            <TableColumn className="text-left">Название</TableColumn>
            <TableColumn className="text-left">Порядок</TableColumn>
            <TableColumn className="text-left">Ожидаемый день</TableColumn>
            <TableColumn className="text-left">Активен</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Нет шаблонов">
            {templates.map(t => (
              <TableRow key={t.id}>
                <TableCell>{t.name}</TableCell>
                <TableCell>{t.sequence}</TableCell>
                <TableCell>{t.default_expected_day ?? '—'}</TableCell>
                <TableCell>{t.is_active ? 'Да' : 'Нет'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
