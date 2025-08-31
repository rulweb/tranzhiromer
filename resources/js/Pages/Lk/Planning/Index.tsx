import { Head, Link, router } from '@inertiajs/react'
import {Button, Card, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Input} from '@heroui/react'
import dayjs from 'dayjs'
import { useState } from 'react'

// Types
interface Allocation { id:number; planned_amount:string; planned_due_on?:string|null; mandatory_payment:{ id:number; name:string } }
interface Cycle { id:number; period_ref:string; planned_amount?:string|null; expected_day?:number|null; template:{ id:number; name:string }; allocations: Allocation[] }
interface Template { id:number; name:string }

export default function PlanningIndex(props: Partial<{ month:string; cycles:Cycle[]; templates:Template[] }>) {
  const month = typeof props.month === 'string' && props.month ? props.month : dayjs().format('YYYY-MM')
  const cycles: Cycle[] = Array.isArray(props.cycles) ? props.cycles : []
  const templates: Template[] = Array.isArray(props.templates) ? props.templates : []
  const prev = dayjs(month + '-01').subtract(1, 'month').format('YYYY-MM')
  const next = dayjs(month + '-01').add(1, 'month').format('YYYY-MM')

  // Modals state
  const [editIncome, setEditIncome] = useState<{id:number, planned_amount:string, expected_day:string}|null>(null)
  const [editAlloc, setEditAlloc] = useState<{id:number, planned_amount:string, planned_due_on:string}|null>(null)
  const [addOneOff, setAddOneOff] = useState<{income_cycle_id:number, name:string, amount:string, planned_due_on:string}>|null>(null)

  const openIncomeModal = (c:Cycle) => setEditIncome({ id: c.id, planned_amount: String(c.planned_amount ?? ''), expected_day: String(c.expected_day ?? '') })
  const openAllocModal = (a:Allocation) => setEditAlloc({ id: a.id, planned_amount: String(a.planned_amount), planned_due_on: a.planned_due_on ?? '' })
  const openOneOffModal = (cycleId:number) => setAddOneOff({ income_cycle_id: cycleId, name: '', amount: '', planned_due_on: '' })

  const onBootstrap = () => router.post('/lk/income-cycles/bootstrap', { period_ref: month }, { preserveScroll: true, preserveState: true })

  const onUpdateIncome = () => {
    if (!editIncome) return
    router.patch(`/lk/income-cycles/${editIncome.id}`, {
      planned_amount: editIncome.planned_amount !== '' ? Number(editIncome.planned_amount) : null,
      expected_day: editIncome.expected_day !== '' ? Number(editIncome.expected_day) : null,
    }, { preserveScroll: true, preserveState: true, onSuccess: () => setEditIncome(null) })
  }

  const onUpdateAlloc = () => {
    if (!editAlloc) return
    router.patch(`/lk/allocations/${editAlloc.id}`, {
      planned_amount: Number(editAlloc.planned_amount),
      planned_due_on: editAlloc.planned_due_on || null,
    }, { preserveScroll: true, preserveState: true, onSuccess: () => setEditAlloc(null) })
  }

  const onCreateOneOff = () => {
    if (!addOneOff) return
    router.post('/lk/planning/one-off', {
      income_cycle_id: addOneOff.income_cycle_id,
      name: addOneOff.name,
      amount: Number(addOneOff.amount),
      planned_due_on: addOneOff.planned_due_on || null,
    }, { preserveScroll: true, preserveState: true, onSuccess: () => setAddOneOff(null) })
  }

  return (
    <div className="mx-auto max-w-6xl p-4">
      <Head title="Планирование" />
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button as={Link} href={`/lk/planning?month=${prev}`} variant="flat">{prev}</Button>
          <div className="text-lg font-medium">{month}</div>
          <Button as={Link} href={`/lk/planning?month=${next}`} variant="flat">{next}</Button>
        </div>
        <div className="flex items-center gap-2">
          <Button as={Link} href="/lk/income-cycles" variant="flat">К циклам</Button>
          <Button color="primary" onClick={onBootstrap}>Сформировать месяц</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Доходы */}
        <Card className="p-4">
          <div className="mb-2 text-base font-semibold">Доходы (план)</div>
          <div className="space-y-2">
            {cycles.map(c => (
              <div key={c.id} className="flex items-center justify-between rounded border border-gray-200 p-2 text-sm">
                <div>
                  <div className="font-medium">{c.template.name}</div>
                  <div className="text-gray-500">ожид. день: {c.expected_day ?? '—'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{c.planned_amount ?? '—'}</div>
                  <Button size="sm" variant="flat" onClick={() => openIncomeModal(c)}>Изменить</Button>
                </div>
              </div>
            ))}
            {cycles.length === 0 && <div className="text-sm text-gray-500">Нет циклов. Сформируйте месяц.</div>}
          </div>
        </Card>

        {/* Платежи */}
        <Card className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-base font-semibold">Платежи (обязательные/запланированные)</div>
          </div>
          <div className="space-y-3">
            {cycles.map(c => (
              <div key={c.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <div className="font-medium">{c.template.name}</div>
                  <Button size="sm" variant="flat" onClick={() => openOneOffModal(c.id)}>Добавить разовый</Button>
                </div>
                <div className="space-y-2">
                  {c.allocations.map(a => (
                    <div key={a.id} className="flex items-center justify-between rounded border border-gray-200 p-2 text-sm">
                      <div className="truncate">{a.mandatory_payment.name}</div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">{a.planned_due_on ?? '—'}</span>
                        <span className="font-medium">{a.planned_amount}</span>
                        <Button size="sm" variant="flat" onClick={() => openAllocModal(a)}>Изменить</Button>
                      </div>
                    </div>
                  ))}
                  {c.allocations.length === 0 && <div className="text-sm text-gray-500">Нет платежей</div>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Edit income modal */}
      <Modal isOpen={!!editIncome} onOpenChange={() => setEditIncome(null)}>
        <ModalContent>
          <>
            <ModalHeader>Изменить доход</ModalHeader>
            <ModalBody>
              <Input label="Плановая сумма" type="number" value={editIncome?.planned_amount ?? ''} onChange={(e) => setEditIncome(v => v ? ({...v, planned_amount: e.target.value}) : v)} />
              <Input label="Ожидаемый день" type="number" value={editIncome?.expected_day ?? ''} onChange={(e) => setEditIncome(v => v ? ({...v, expected_day: e.target.value}) : v)} />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={() => setEditIncome(null)}>Отмена</Button>
              <Button color="primary" onPress={onUpdateIncome}>Сохранить</Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>

      {/* Edit allocation modal */}
      <Modal isOpen={!!editAlloc} onOpenChange={() => setEditAlloc(null)}>
        <ModalContent>
          <>
            <ModalHeader>Изменить платёж</ModalHeader>
            <ModalBody>
              <Input label="Сумма" type="number" value={editAlloc?.planned_amount ?? ''} onChange={(e) => setEditAlloc(v => v ? ({...v, planned_amount: e.target.value}) : v)} />
              <Input label="Дата" type="date" value={editAlloc?.planned_due_on ?? ''} onChange={(e) => setEditAlloc(v => v ? ({...v, planned_due_on: e.target.value}) : v)} />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={() => setEditAlloc(null)}>Отмена</Button>
              <Button color="primary" onPress={onUpdateAlloc}>Сохранить</Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>

      {/* Add one-off modal */}
      <Modal isOpen={!!addOneOff} onOpenChange={() => setAddOneOff(null)}>
        <ModalContent>
          <>
            <ModalHeader>Добавить разовый платёж</ModalHeader>
            <ModalBody>
              <Input label="Название" value={addOneOff?.name ?? ''} onChange={(e) => setAddOneOff(v => v ? ({...v, name: e.target.value}) : v)} />
              <Input label="Сумма" type="number" value={addOneOff?.amount ?? ''} onChange={(e) => setAddOneOff(v => v ? ({...v, amount: e.target.value}) : v)} />
              <Input label="Дата" type="date" value={addOneOff?.planned_due_on ?? ''} onChange={(e) => setAddOneOff(v => v ? ({...v, planned_due_on: e.target.value}) : v)} />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={() => setAddOneOff(null)}>Отмена</Button>
              <Button color="primary" onPress={onCreateOneOff}>Создать</Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>
    </div>
  )
}
