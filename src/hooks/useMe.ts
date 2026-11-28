import { useEffect, useState } from 'react'
import { useDb } from '@/store/db'
import { can, type Action, type Module } from '@/utils/permissions'

export function useMe() {
  const userId = useDb((s) => s.userId), users = useDb((s) => s.users), hosts = useDb((s) => s.officeEmployees), allOffices = useDb((s) => s.offices)
  const me = users.find((u) => u.id === userId) ?? null
  const host = hosts.find((h) => h.id === me?.refId)
  const ownedIds = me?.role === 'OWNER' ? allOffices.filter((o) => o.ownerName === me.refId).map((o) => o.id) : []
  return { me, officeId: host?.officeId ?? '', ownedIds, host, can: (m: Module, a: Action) => can(me?.role, m, a) }
}
/** Re-render every `ms` — used for live duration timers. */
export function useNow(ms = 30000) {
  const [n, setN] = useState(Date.now())
  useEffect(() => { const i = setInterval(() => setN(Date.now()), ms); return () => clearInterval(i) }, [ms])
  return n
}
