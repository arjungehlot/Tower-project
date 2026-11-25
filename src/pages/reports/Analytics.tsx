import { Card, PageHeader } from '@/components/ui'
import { AreaSeries, Bars, Donut, LineSeries } from '@/components/charts'
import { useDb } from '@/store/db'
import { useLookups } from '@/hooks/useLookups'
import { countBy, avg } from '@/utils/helpers'
import { dayKey } from '@/utils/dateUtils'
import { PURPOSES, TICKET_CATEGORIES } from '@/utils/constants'

const last = (n: number) => [...Array(n)].map((_, i) => new Date(Date.now() - (n - 1 - i) * 86400000).toISOString().slice(0, 10))
export default function Analytics() {
  const { visitors, offices, tickets, tasks, employees, floors, towers } = useDb(), L = useLookups()
  const d14 = last(14), growth = d14.map((d) => ({ name: d.slice(5), Visitors: visitors.filter((v) => dayKey(v.requestedAt) === d).length }))
  const hourData = [...Array(12)].map((_, i) => 8 + i).map((h) => ({ name: `${h}:00`, Visitors: visitors.filter((v) => v.entryAt && new Date(v.entryAt).getHours() === h).length }))
  const byOffice = Object.entries(countBy(visitors, (v) => `${L.officeNo(v.officeId)} ${L.tower(v.towerId)?.code}`)).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8)
  const occ = towers.map((t) => { const o = offices.filter((x) => x.towerId === t.id); return { name: t.name, Occupied: o.filter((x) => x.status === 'Occupied').length, Vacant: o.filter((x) => x.status === 'Vacant').length, Reserved: o.filter((x) => x.status === 'Reserved').length, Maintenance: o.filter((x) => x.status === 'Under Maintenance').length } })
  const tc = countBy(tickets, (t) => t.category), purpose = countBy(visitors, (v) => v.purpose)
  const util = d14.map((d) => ({ name: d.slice(5), Utilization: Math.min(100, Math.round((tasks.filter((t) => dayKey(t.createdAt) === d).length / Math.max(1, employees.filter((e) => e.role === 'staff').length)) * 100 * 3)) }))
  const res = d14.map((d) => ({ name: d.slice(5), Raised: tickets.filter((t) => dayKey(t.createdAt) === d).length, Resolved: tasks.filter((t) => t.ticketId && t.completedAt && dayKey(t.completedAt) === d).length }))
  const perf = employees.filter((e) => e.role === 'staff' && e.rating).sort((a, b) => b.rating - a.rating).slice(0, 8).map((e) => ({ name: e.name.split(' ')[0], value: e.rating }))
  const floorVis = Object.entries(countBy(visitors, (v) => `${L.tower(v.towerId)?.code}-F${L.floor(v.floorId)?.number}`)).map(([name, value]) => ({ name, value })).sort((a, b) => a.name.localeCompare(b.name))
  void floors; void avg
  return <><PageHeader title="Analytics" subtitle="Computed live from building data" />
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <Card title="Visitor growth (14 days)"><AreaSeries data={growth} keys={['Visitors']} /></Card>
      <Card title="Peak hours"><Bars data={hourData} keys={['Visitors']} /></Card>
      <Card title="Visit purpose"><Donut data={PURPOSES.map((p) => ({ name: p, value: purpose[p] || 0 }))} /></Card>
      <Card title="Office occupancy by tower"><Bars data={occ} keys={['Occupied', 'Vacant', 'Reserved', 'Maintenance']} stacked /></Card>
      <Card title="Top offices by visitors"><Bars data={byOffice} horizontal /></Card>
      <Card title="Visitors by floor"><Bars data={floorVis} /></Card>
      <Card title="Top issue categories"><Bars data={TICKET_CATEGORIES.map((c) => ({ name: c, value: tc[c] || 0 })).sort((a, b) => b.value - a.value)} horizontal /></Card>
      <Card title="Ticket resolution"><LineSeries data={res} keys={['Raised', 'Resolved']} /></Card>
      <Card title="Staff utilization (%)"><LineSeries data={util} keys={['Utilization']} /></Card>
      <Card title="Employee performance (rating)" className="md:col-span-2 xl:col-span-3"><Bars data={perf} h={200} /></Card>
    </div></>
}
