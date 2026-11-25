import { useEffect, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from './Button'
import { cx } from '@/utils/helpers'

function useEsc(open: boolean, onClose: () => void) {
  useEffect(() => { if (!open) return; const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h) }, [open, onClose])
}
export function Modal({ open, onClose, title, children, footer, size = 'md' }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; size?: 'sm' | 'md' | 'lg' }) {
  useEsc(open, onClose)
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
          <motion.div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.15 }}
            className={cx('relative w-full rounded-2xl bg-surface shadow-pop border border-line max-h-[90vh] flex flex-col', { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-3xl' }[size])}>
            <div className="flex items-center justify-between border-b px-4 py-3"><h3 className="text-sm font-semibold">{title}</h3><button aria-label="Close" onClick={onClose} className="rounded-md p-1 text-muted hover:bg-subtle"><X size={16} /></button></div>
            <div className="overflow-y-auto p-4">{children}</div>
            {footer && <div className="flex justify-end gap-2 border-t px-4 py-3">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
export function Drawer({ open, onClose, title, subtitle, children, footer, width = 'max-w-md' }: { open: boolean; onClose: () => void; title: string; subtitle?: string; children: ReactNode; footer?: ReactNode; width?: string }) {
  useEsc(open, onClose)
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
          <motion.div className="absolute inset-0 bg-slate-900/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.2 }} className={cx('absolute right-0 top-0 flex h-full w-full flex-col bg-surface shadow-pop border-l border-line', width)}>
            <div className="flex items-start justify-between border-b px-4 py-3"><div><h3 className="text-sm font-semibold">{title}</h3>{subtitle && <p className="text-xs text-muted">{subtitle}</p>}</div><button aria-label="Close" onClick={onClose} className="rounded-md p-1 text-muted hover:bg-subtle"><X size={16} /></button></div>
            <div className="flex-1 overflow-y-auto p-4">{children}</div>
            {footer && <div className="flex justify-end gap-2 border-t px-4 py-3">{footer}</div>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Delete', danger = true }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; confirmLabel?: string; danger?: boolean }) {
  return <Modal open={open} onClose={onClose} title={title} size="sm" footer={<><Button onClick={onClose}>Cancel</Button><Button variant={danger ? 'danger' : 'primary'} onClick={() => { onConfirm(); onClose() }}>{confirmLabel}</Button></>}><p className="text-sm text-muted">{message}</p></Modal>
}
