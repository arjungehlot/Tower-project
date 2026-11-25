import { AlertTriangle, CheckCircle2, CircleDot, Clock, Flame, Hourglass, Loader, UserCheck } from 'lucide-react'
import { Card, PageHeader, StatCard } from '@/components/ui'
import { Bars, Donut } from '@/components/charts'
import { useTickets } from '@/hooks/useTickets'
import { useDb } from '@/store/db'
import { useLookups } from '@/hooks/useLookups'
import { useNavigate } from 'react-router-dom'
import { countBy, avg } from '@/utils/helpers'
import { TICKET_CATEGORIES } from '@/utils/constants'

export default function TicketAnalytics() {
  const { tickets, stats } = useTickets(), tasks = useDb((s) => s.tasks), employees = useDb((s) => s.employees), L = useLookups(), nav = useNavigate()
  const cat = countBy(tickets, (t) => t.category), pri = countBy(tickets, (t) => t.priority), floor = countBy(tickets, (t) => `${L.tower(t.towerId)?.code}-F${L.floor(t.floorId)?.number}`)
  const resolved = tickets.filter((t) => t.status === 'CLOSED' || t.status === 'RESOLVED')
  const hrs = (c: string) => avg(resolved.filter((t) => t.category === c).map((t) => { const tk = tasks.find((x) => x.id === t.taskId); return tk?.completedAt ? (new Date(tk.completedAt).getTime() - new Date(t.createdAt).getTime()) / 3600000 : NaN }).filter((n) => !isNaN(n)))
  const load = employees.filter((e) => e.role === 'staff').map((e) => ({ name: e.name.split(' ')[0], Active: tasks.filter((t) => t.assignedEmployeeId === e.id && ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'ON_HOLD'].includes(t.status)).length })).filter((x) => x.Active).sort((a, b) => b.Active - a.Active).slice(0, 8)
  return <><PageHeader title="Ticket Analytics" subtitle="Service desk performance at a glance" />
    <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
      <StatCard label="Open" value={stats.open} icon={<CircleDot size={15} />} tone="info" onClick={() => nav('/tickets')} /><StatCard label="Assigned" value={stats.assigned} icon={<UserCheck size={15} />} tone="warn" /><StatCard label="In progress" value={stats.progress} icon={<Loader size={15} />} tone="info" /><StatCard label="Waiting" value={stats.waiting} icon={<Hourglass size={15} />} tone="warn" />
      <StatCard label="Resolved" value={stats.resolved} icon={<CheckCircle2 size={15} />} tone="ok" /><StatCard label="Closed" value={stats.closed} icon={<CheckCircle2 size={15} />} /><StatCard label="Overdue" value={stats.overdue} icon={<Clock size={15} />} tone="bad" /><StatCard label="Critical" value={stats.critical} icon={<Flame size={15} />} tone="bad" /></div>
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <Card title="Tickets by category"><Bars data={TICKET_CATEGORIES.map((c) => ({ name: c, value: cat[c] || 0 }))} horizontal h={260} /></Card>
      <Card title="Tickets by priority"><Donut data={['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => ({ name: p, value: pri[p] || 0 }))} h={260} /></Card>
      <Card title="Avg resolution time (hours)"><Bars data={TICKET_CATEGORIES.map((c) => ({ name: c, value: hrs(c) })).filter((x) => x.value)} h={260} /></Card>
      <Card title="Tickets by floor"><Bars data={Object.entries(floor).map(([name, value]) => ({ name, value }))} h={260} /></Card>
      <Card title="Staff workload (active tasks)" className="xl:col-span-2"><Bars data={load.map((l) => ({ name: l.name, value: l.Active }))} h={260} /></Card>
    </div>
    <p className="sr-only"><AlertTriangle /></p></>
}
