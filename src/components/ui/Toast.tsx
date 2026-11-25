import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, XCircle } from 'lucide-react'
import { useDb } from '@/store/db'
export function ToastHost() {
  const toasts = useDb((s) => s.toasts)
  const icon = { success: <CheckCircle2 size={16} className="text-ok" />, error: <XCircle size={16} className="text-bad" />, info: <Info size={16} className="text-info" /> }
  return (
    <div className="pointer-events-none fixed right-4 top-16 z-[60] flex flex-col gap-2" aria-live="polite">
      <AnimatePresence>{toasts.map((t) => <motion.div key={t.id} layout initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} className="pointer-events-auto flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-pop">{icon[t.kind]}{t.msg}</motion.div>)}</AnimatePresence>
    </div>
  )
}
