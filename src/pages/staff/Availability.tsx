import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, PageHeader, StatCard, Select } from '@/components/ui'
import { StaffCard } from '@/components/business/StaffCard'
import { useEmployees } from '@/hooks/useEmployees'
import { useDb } from '@/store/db'
import { useMe } from '@/hooks/useMe'
import { STAFF_CATEGORIES } from '@/utils/constants'
import { auditLog } from '@/services/core'
import { Users, CheckCircle2, Hammer, Coffee, UserX } from 'lucide-react'

export default function Availability() {
  const nav = useNavigate(), { staff, stats } = useEmployees(), patch = useDb((s) => s.patch), { can } = useMe()
  const rank: Record<string, number> = { AVAILABLE: 0, BUSY: 1, ON_BREAK: 2, OFF_DUTY: 3, ABSENT: 4 }
  return <>
    <PageHeader title="Staff Availability" subtitle="Live board — see who is free for new work" />
    <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-5"><StatCard label="Total staff" value={stats.total} icon={<Users size={15} />} /><StatCard label="Available" value={stats.available} icon={<CheckCircle2 size={15} />} tone="ok" /><StatCard label="Busy" value={stats.busy} icon={<Hammer size={15} />} tone="info" /><StatCard label="On break" value={stats.onBreak} icon={<Coffee size={15} />} tone="warn" /><StatCard label="Off duty / absent" value={stats.offDuty + stats.absent} icon={<UserX size={15} />} /></div>
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {STAFF_CATEGORIES.map((c) => { const list = staff.filter((e) => e.category === c).sort((a, b) => rank[a.status] - rank[b.status]); if (!list.length) return null
        return <Card key={c} title={<span>{c}s <span className="ml-1 text-xxs font-normal text-muted">{list.filter((e) => e.status === 'AVAILABLE').length}/{list.length} available</span></span>}>
          <div className="space-y-1.5">{list.map((e) => <motion.div layout key={e.id}><StaffCard e={e} onClick={() => nav(`/staff/${e.id}`)} right={can('staff', 'update') ? <div onClick={(ev) => ev.stopPropagation()}><Select aria-label={`${e.name} status`} className="!h-7 !w-28 !py-0 text-xxs" value={e.status} onChange={(ev) => { patch('employees', e.id, { status: ev.target.value as never }); auditLog(`set ${e.name} to ${ev.target.value}`, 'Staff', e.name) }} options={['AVAILABLE', 'BUSY', 'ON_BREAK', 'OFF_DUTY', 'ABSENT']} /></div> : undefined} /></motion.div>)}</div></Card> })}
    </div></>
}
