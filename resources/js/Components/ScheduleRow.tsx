import {Button, Card, CardBody} from '@heroui/react'
import {Pencil, MoveVertical} from 'lucide-react'
import {Schedule} from '../types'
import {ScheduleIcon} from './ScheduleIcon'

export type ScheduleRowProps = {
    schedule: Schedule
    onEdit?: (s: Schedule) => void
    onMove?: (s: Schedule) => void
    isExpense?: boolean
}

export default function ScheduleRow({schedule, onEdit, onMove, isExpense}: ScheduleRowProps) {
    return (
        <Card>
            <CardBody className="flex flex-row items-center justify-between p-3 sm:p-4">
                <div className="flex items-center gap-3">
                    <ScheduleIcon icon={schedule.icon} className="w-6 h-6"/>
                    <div>
                        <div className="font-medium">{schedule.name}</div>
                        {schedule.description && (
                            <div className="text-xs text-gray-500">{schedule.description}</div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className={"text-sm font-semibold " + (isExpense ? 'text-red-600' : 'text-green-700')}>
                        {isExpense ? '-' : '+'}{Number(schedule.amount).toLocaleString('ru-RU')}
                    </div>
                    {onMove && (
                        <Button isIconOnly size="sm" variant="flat" onPress={() => onMove(schedule)} aria-label="move">
                            <MoveVertical size={16}/>
                        </Button>
                    )}
                    {onEdit && (
                        <Button isIconOnly size="sm" variant="flat" onPress={() => onEdit(schedule)} aria-label="edit">
                            <Pencil size={16}/>
                        </Button>
                    )}
                </div>
            </CardBody>
        </Card>
    )
}
