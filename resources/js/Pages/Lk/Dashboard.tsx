import {Card} from '@heroui/react'
import { Calendar } from 'lucide-react'
import LkLayout from '../../Layouts/LkLayout'
import ScheduleRow from '../../Components/ScheduleRow'
import { Schedule } from '../../types'

type Props = {
  schedules: Schedule[]
}

export default function Dashboard({ schedules }: Props) {
  return (
    <LkLayout>
      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2 text-base font-medium">
          <Calendar size={18} /> Ближайшие обязательные платежи
        </div>
        <div className="flex flex-col gap-2">
          {schedules.length === 0 && (
            <div className="text-sm text-gray-500">Нет предстоящих платежей.</div>
          )}
          {schedules.map((s) => (
            <ScheduleRow key={s.id} schedule={s} isExpense={s.type === 'expense'} />
          ))}
        </div>
      </Card>
    </LkLayout>
  )
}
