import { useEffect, useState } from 'react'
import { Button, Modal, Stars, Textarea } from '@/components/ui'
import * as taskService from '@/services/taskService'
import { avg } from '@/utils/helpers'
import type { Task } from '@/types'

const CRIT = ['quality', 'speed', 'professionalism', 'cleanliness'] as const
export function RateModal({ task, onClose }: { task: Task | null; onClose: () => void }) {
  const [r, setR] = useState({ quality: 5, speed: 5, professionalism: 5, cleanliness: 5 }), [c, setC] = useState('')
  useEffect(() => { setR({ quality: 5, speed: 5, professionalism: 5, cleanliness: 5 }); setC('') }, [task?.id])
  const overall = avg(Object.values(r))
  return <Modal open={!!task} onClose={onClose} title={`Verify & rate ${task?.code ?? ''}`} size="sm" footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" onClick={() => { if (task) taskService.verifyAndRate(task.id, { ...r, overall, comment: c }); onClose() }}>Save rating</Button></>}>
    <div className="space-y-3">{CRIT.map((k) => <div key={k} className="flex items-center justify-between"><span className="text-xs capitalize">{k}</span><Stars value={r[k]} onChange={(v) => setR({ ...r, [k]: v })} size={20} /></div>)}
      <div className="flex items-center justify-between border-t pt-3"><span className="text-xs font-semibold">Overall</span><span className="flex items-center gap-2"><Stars value={overall} size={16} /><b>{overall}</b></span></div>
      <Textarea placeholder="Comments (optional)" value={c} onChange={(e) => setC(e.target.value)} aria-label="Comments" /></div>
  </Modal>
}
