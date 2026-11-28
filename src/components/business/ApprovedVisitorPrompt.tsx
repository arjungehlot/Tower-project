import { useEffect, useState } from 'react'
import { BadgeCheck, DoorOpen, Building2, MapPin, User, Phone } from 'lucide-react'
import { Avatar, Button, Modal } from '@/components/ui'
import { useDb } from '@/store/db'
import { useMe } from '@/hooks/useMe'
import { useLookups } from '@/hooks/useLookups'
import { storage } from '@/services/storageService'
import * as vs from '@/services/visitorService'

const KEY = 'guardSeenApproved'

/** Security desk: pops up whenever a visitor newly gets approved by their host, so the guard can let them in. */
export function ApprovedVisitorPrompt() {
  const { me, can } = useMe(), L = useLookups(), visitors = useDb((s) => s.visitors)
  const [seen, setSeen] = useState<string[]>(() => storage.get<string[]>(KEY) ?? visitors.filter((v) => v.status === 'APPROVED').map((v) => v.id))
  useEffect(() => { storage.set(KEY, seen) }, [seen])
  // Another tab (e.g. the office user approving) writes visitors to localStorage — pick it up live.
  useEffect(() => {
    const h = (e: StorageEvent) => { if (e.key === storage.key('visitors') && e.newValue) { try { useDb.setState({ visitors: JSON.parse(e.newValue) }) } catch { /* ignore */ } } }
    window.addEventListener('storage', h); return () => window.removeEventListener('storage', h)
  }, [])
  const v = me?.role === 'SECURITY_GUARD' ? visitors.find((x) => x.status === 'APPROVED' && !seen.includes(x.id)) : undefined
  const close = () => v && setSeen((s) => [...s, v.id])
  const off = L.office(v?.officeId), ten = L.tenant(off?.tenantId), host = L.host(v?.hostId)
  return <Modal open={!!v} onClose={close} title="Visitor approved" size="sm"
    footer={v && <><Button onClick={close}>Later</Button>{can('visitors', 'exit') && <Button variant="primary" icon={<DoorOpen size={14} />} onClick={() => { vs.allowEntry(v.id); close() }}>Allow entry</Button>}</>}>
    {v && <>
      <div className="mb-3 flex items-center gap-3 rounded-xl bg-gradient-to-r from-ok/10 to-surface p-3 ring-1 ring-ok/20">
        {v.photo ? <img src={v.photo} alt={v.name} className="h-14 w-14 rounded-xl object-cover" /> : <Avatar name={v.name} size={56} />}
        <div className="min-w-0"><p className="truncate text-base font-semibold">{v.name}</p><p className="inline-flex items-center gap-1 text-xs text-muted"><Phone size={11} />{v.mobile}</p>
          <p className="mt-0.5 inline-flex items-center gap-1 rounded-md bg-ok/10 px-1.5 py-0.5 text-[11px] font-medium text-ok"><BadgeCheck size={12} />Approved for entry</p></div>
      </div>
      <div className="space-y-1.5 text-xs text-muted">
        <p className="flex items-center gap-2"><Building2 size={13} />{ten?.name ?? '—'}{off && <span className="rounded bg-subtle px-1.5 py-px text-[11px] text-ink">Office {off.number}</span>}</p>
        <p className="flex items-center gap-2"><MapPin size={13} />{L.location(v.towerId, v.floorId, v.officeId)}</p>
        <p className="flex items-center gap-2"><User size={13} />Host: {host?.name ?? '—'} · Purpose: {v.purpose}</p>
      </div>
    </>}
  </Modal>
}
