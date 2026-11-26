import { useState } from 'react'
import { FlaskConical, X } from 'lucide-react'
import { demo } from '@/services/demoService'
import { Button, confirmAction } from '@/components/ui'
import { useDb } from '@/store/db'

export function DemoPanel() {
  const [open, setOpen] = useState(false), enabled = useDb((s) => s.demoMode), resetData = useDb((s) => s.resetData)
  if (!enabled) return null
  const A: [string, () => void][] = [['Simulate Visitor Entry', demo.simulateEntry], ['Simulate Visitor Exit', demo.simulateExit], ['Register Demo Visitor', demo.registerVisitor], ['Approve Visitor', demo.approveVisitor], ['Create Ticket', demo.createTicket], ['Assign Ticket', demo.assignTicket], ['Complete Task', demo.completeTask], ['Generate Notification', demo.generateNotification]]
  return (
    <div className="no-print fixed bottom-4 right-4 z-30 flex flex-col items-end">
      {open && <div className="mb-2 w-56 rounded-xl border border-line bg-surface p-2.5 shadow-pop">
        <div className="mb-2 flex items-center justify-between"><p className="text-xs font-semibold">Demo controls</p><button onClick={() => setOpen(false)} aria-label="Close"><X size={14} /></button></div>
        <div className="grid gap-1">{A.map(([l, f]) => <Button key={l} size="sm" onClick={f}>{l}</Button>)}<Button size="sm" variant="danger" onClick={async () => { if (await confirmAction({ title: 'Reset demo data', message: 'Reset all demo data to the original seed? Everything you changed will be lost.', confirmLabel: 'Reset all data' })) resetData() }}>Reset all data</Button></div>
      </div>}
      <button onClick={() => setOpen(!open)} aria-label="Demo controls" className="flex h-9 w-9 items-center justify-center rounded-full bg-vis text-white shadow-pop dark:text-slate-900"><FlaskConical size={16} /></button>
    </div>
  )
}
