import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { Search as SearchIcon } from 'lucide-react'
import { cx } from '@/utils/helpers'

export const Field = ({ label, error, children, className, hint }: { label?: string; error?: string; children: ReactNode; className?: string; hint?: string }) => (
  <div className={className}>{label && <label className="label">{label}</label>}{children}{hint && !error && <p className="mt-1 text-xxs text-faint">{hint}</p>}{error && <p role="alert" className="mt-1 text-xxs text-bad">{error}</p>}</div>
)
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...p }, r) => <input ref={r} {...p} className={cx('input', className)} />)
Input.displayName = 'Input'
export const DatePicker = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>((p, r) => <Input ref={r} type="date" {...p} />)
DatePicker.displayName = 'DatePicker'
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...p }, r) => <textarea ref={r} rows={3} {...p} className={cx('input resize-none', className)} />)
Textarea.displayName = 'Textarea'
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { options?: (string | { value: string; label: string })[]; placeholder?: string }>(({ options, placeholder, className, children, ...p }, r) => (
  <select ref={r} {...p} className={cx('input pr-7', className)}>
    {placeholder !== undefined && <option value="">{placeholder}</option>}
    {options?.map((o) => typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}{children}
  </select>
))
Select.displayName = 'Select'
export function SearchBox({ value, onChange, placeholder = 'Search…', className }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return <div className={cx('relative', className)}><SearchIcon size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-faint" /><input aria-label={placeholder} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input pl-8" /></div>
}
