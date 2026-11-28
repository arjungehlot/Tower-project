import { useState } from 'react'
import { CheckCircle2, RotateCcw, MapPin, UserCog } from 'lucide-react'
import { Button, Modal, Stars } from '@/components/ui'
import { useDb } from '@/store/db'
import { useMe } from '@/hooks/useMe'
import { useLookups } from '@/hooks/useLookups'
import * as ts from '@/services/ticketService'

const KEY = 'tf-resolved-later'
const later = (): string[] => { try { return JSON.parse(sessionStorage.getItem(KEY) || '[]') } catch { return [] } }

/** For office users: pops up when a ticket they raised has been resolved by staff, asking them to confirm and rate. */
export function ResolvedTicketPrompt() {
  const { me, host } = useMe(), L = useLookups(), tickets = useDb((s) => s.tickets)
  const [skipped, setSkipped] = useState<string[]>(later), [stars, setStars] = useState(5)
  const t = me?.role.startsWith('OFFICE') ? tickets.find((x) => x.status === 'RESOLVED' && x.reporterId === host?.id && !skipped.includes(x.id)) : undefined
  const skip = () => { if (!t) return; const n = [...skipped, t.id]; setSkipped(n); try { sessionStorage.setItem(KEY, JSON.stringify(n)) } catch { /* ignore */ } }
  const emp = L.employee(t?.assignedEmployeeId)
  return <Modal open={!!t} onClose={skip} title="Your ticket is resolved" size="sm"
    footer={t && <><Button onClick={skip}>Later</Button><Button icon={<RotateCcw size={14} />} onClick={() => { ts.reopen(t.id); setStars(5) }}>Not resolved</Button><Button variant="success" icon={<CheckCircle2 size={14} />} onClick={() => { ts.confirmClose(t.id, stars); setStars(5) }}>Confirm & close</Button></>}>
    {t && <>
      <div className="mb-3 flex items-start gap-3 rounded-xl bg-gradient-to-r from-ok/10 to-surface p-3 ring-1 ring-ok/20">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ok/15 text-ok"><CheckCircle2 size={18} /></span>
        <div className="min-w-0"><p className="text-[11px] font-semibold tracking-wide text-muted">{t.code}</p><p className="text-sm font-semibold leading-snug">{t.subject}</p>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11.5px] text-muted"><span className="inline-flex items-center gap-1"><MapPin size={11} />{L.location(t.towerId, t.floorId, t.officeId)}</span>{emp && <span className="inline-flex items-center gap-1"><UserCog size={11} />{emp.name}</span>}</div></div>
      </div>
      <p className="mb-3 text-xs text-muted">The ticket you raised has been marked resolved by our staff. Please confirm that the issue is fixed and rate the service.</p>
      <div className="flex justify-center"><Stars value={stars} onChange={setStars} size={30} /></div>
    </>}
  </Modal>
}
