import {Button, Input, Select, SelectItem} from '@heroui/react'
import {Form, router} from '@inertiajs/react'
import {useState} from 'react'

const iconOptions = ['home', 'wallet', 'car', 'food', 'grocery', 'education', 'gift', 'investment']

export type AddExpenseFormProps = {
  parentId: number
  groupId: number
  onSuccess?: () => void
}

export default function AddExpenseForm({parentId, groupId, onSuccess}: AddExpenseFormProps) {
  const [icon, setIcon] = useState<string>('')

  return (
    <Form
      action="/lk/schedules"
      method="post"
      onSuccess={() => {
        onSuccess?.()
        router.reload({ only: ['schedules', 'groups'] })
      }}
      transform={(data) => ({...data, parent_id: parentId, group_id: groupId, type: 'expense'})}
    >
      {({processing, errors}) => (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <Input name="name" label="Название" isRequired className="sm:flex-1" isInvalid={Boolean((errors as any)?.name)} errorMessage={(errors as any)?.name} />
          <Input name="amount" label="Сумма" type="number" step="0.01" isRequired className="sm:w-40" isInvalid={Boolean((errors as any)?.amount)} errorMessage={(errors as any)?.amount} />
          <Select selectedKeys={icon ? [icon] : []} label="Иконка" onChange={(e) => setIcon(e.target.value)} className="sm:w-44">
            {iconOptions.map(key => (
              <SelectItem key={key} value={key}>{key}</SelectItem>
            ))}
          </Select>
          <input type="hidden" name="icon" value={icon} />
          <Button type="submit" color="primary" isLoading={processing}>Добавить</Button>
        </div>
      )}
    </Form>
  )
}
