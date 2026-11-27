import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/ui'
import { Tower3D } from '@/components/business/Tower3D'
import { useOfficeLive } from '@/components/business/FloorMap'
import { useDb } from '@/store/db'

export default function Tower3DPage() {
  const towers = useDb((s) => s.towers), floors = useDb((s) => s.floors), offices = useDb((s) => s.offices), tenants = useDb((s) => s.tenants)
  const live = useOfficeLive(), nav = useNavigate()
  return <div className="flex h-full min-h-0 flex-col gap-3">
    <PageHeader title="3D Tower Explorer" subtitle="Click a floor to open it, then an office — the guide bot walks you there" />
    <div className="min-h-0 flex-1">
      <Tower3D towers={towers} floors={floors} offices={offices} live={live} tenantName={(id) => tenants.find((t) => t.id === id)?.name} onOpenOffice={(id) => nav(`/offices/${id}`)} />
    </div>
  </div>
}
