import {Head} from '@inertiajs/react'
import {Button, Card, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell} from '@heroui/react'

type Payment = {
  id: number
  name: string
  default_amount: string
  due_day?: number|null
}

type Template = { id:number, name:string }

type Props = {
  payments: Payment[]
  templates: Template[]
}

export default function Index({ payments }: Props) {
  return (
    <div className="mx-auto max-w-5xl p-4">
      <Head title="Обязательные платежи" />
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Обязательные платежи</h1>
        <div className="flex items-center gap-2">
          <Button color="primary" variant="flat">Добавить</Button>
        </div>
      </div>

      <Card className="p-2">
        <Table aria-label="Обязательные платежи">
          <TableHeader>
            <TableColumn className="text-left">Название</TableColumn>
            <TableColumn className="text-left">Сумма по умолчанию</TableColumn>
            <TableColumn className="text-left">День</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Нет платежей">
            {payments.map(p => (
              <TableRow key={p.id}>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.default_amount}</TableCell>
                <TableCell>{p.due_day ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
