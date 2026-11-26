import { useEffect, useState } from 'react'
import { AlertTriangle, HelpCircle } from 'lucide-react'
import { Modal } from './Overlay'
import { Button } from './Button'

export interface ConfirmOptions { title?: string; message: string; confirmLabel?: string; cancelLabel?: string; danger?: boolean }
type Pending = ConfirmOptions & { resolve: (ok: boolean) => void }
let push: ((p: Pending) => void) | null = null

/** Promise-based in-app replacement for window.confirm — `if (await confirmAction({ message })) …` */
export const confirmAction = (o: ConfirmOptions | string): Promise<boolean> =>
  new Promise((resolve) => { const opts = typeof o === 'string' ? { message: o } : o; if (push) push({ ...opts, resolve }); else resolve(window.confirm(opts.message)) })

export function ConfirmHost() {
  const [p, setP] = useState<Pending | null>(null)
  useEffect(() => { push = setP; return () => { push = null } }, [])
  const done = (ok: boolean) => { p?.resolve(ok); setP(null) }
  const danger = p?.danger ?? true
  return (
    <Modal open={!!p} onClose={() => done(false)} title={p?.title ?? 'Please confirm'} size="sm"
      footer={<><Button onClick={() => done(false)}>{p?.cancelLabel ?? 'Cancel'}</Button><Button variant={danger ? 'danger' : 'primary'} onClick={() => done(true)}>{p?.confirmLabel ?? 'Confirm'}</Button></>}>
      <div className="flex items-start gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${danger ? 'bg-bad/15 text-bad' : 'bg-brand-soft text-brand'}`}>{danger ? <AlertTriangle size={18} /> : <HelpCircle size={18} />}</span>
        <p className="pt-1.5 text-[13px] leading-relaxed text-muted">{p?.message}</p>
      </div>
    </Modal>
  )
}
