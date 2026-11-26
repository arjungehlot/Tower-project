import { useEffect, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { useDb } from '@/store/db'
import { auditLog } from '@/services/core'
import { Button, ConfirmDialog, DataTable, Dropdown, PageHeader, Select, type Column } from '@/components/ui'
import { CrudForm, type FieldDef } from './CrudForm'
import { uid } from '@/utils/helpers'
import type { Coll, Db } from '@/types'

export interface FilterDef<T> { label: string; options: string[]; pick: (r: T) => string }
interface Props<T extends { id: string }> {
  title: string; subtitle?: string; coll: Coll; entity: string; rows?: T[]; columns: Column<T>[]; fields: FieldDef[]
  make?: (v: Record<string, unknown>) => T; transform?: (v: Record<string, unknown>) => Record<string, unknown>
  searchText: (r: T) => string; filters?: FilterDef<T>[]; onRowClick?: (r: T) => void; readOnly?: boolean; label: (r: T) => string
  actions?: ReactNode; afterChange?: () => void; exportName?: string; canDelete?: boolean; pageSize?: number
}
/** Generic list + drawer-form CRUD used by towers, offices, tenants, staff, assets, documents, users… */
export function CrudPage<T extends { id: string }>(p: Props<T>) {
  const all = useDb((s) => s[p.coll]) as unknown as T[], { add, patch, remove } = useDb()
  const rows = p.rows ?? all
  const [params, setParams] = useSearchParams()
  const [form, setForm] = useState<{ open: boolean; item: T | null }>({ open: false, item: null })
  const [del, setDel] = useState<T | null>(null)
  const [fv, setFv] = useState<Record<string, string>>({})
  useEffect(() => { if (params.get('new') && !p.readOnly) { setForm({ open: true, item: null }); setParams({}, { replace: true }) } }, [params]) // eslint-disable-line
  const filtered = rows.filter((r) => (p.filters ?? []).every((f) => !fv[f.label] || f.pick(r) === fv[f.label]))
  const save = (v: Record<string, unknown>) => {
    const val = p.transform ? p.transform(v) : v
    if (form.item) { patch(p.coll, form.item.id, val as never); auditLog(`updated ${p.entity} ${p.label({ ...form.item, ...val } as T)}`, p.entity + 's', p.label({ ...form.item, ...val } as T)); useDb.getState().toast(`${p.entity} updated.`) }
    else { const item = p.make ? p.make(val) : ({ id: uid(p.coll.slice(0, 2)), ...val } as unknown as T); add(p.coll, item as never); auditLog(`created ${p.entity} ${p.label(item)}`, p.entity + 's', p.label(item)); useDb.getState().toast(`${p.entity} added.`) }
    p.afterChange?.()
  }
  const cols: Column<T>[] = p.readOnly ? p.columns : [...p.columns, { key: '_a', header: '', className: 'w-10 text-right', render: (r) => <Dropdown trigger={<button aria-label="Row actions" className="rounded p-1 text-muted hover:bg-subtle"><MoreHorizontal size={15} /></button>} items={[{ label: 'Edit', icon: <Pencil size={13} />, onClick: () => setForm({ open: true, item: r }) }, { label: 'Delete', icon: <Trash2 size={13} />, danger: true, hidden: p.canDelete === false, onClick: () => setDel(r) }]} /> }]
  return (
    <>
      <PageHeader title={p.title} subtitle={p.subtitle} actions={<>{p.actions}{!p.readOnly && <Button variant="primary" icon={<Plus size={14} />} onClick={() => setForm({ open: true, item: null })}>Add {p.entity}</Button>}</>} />
      <DataTable rows={filtered} columns={cols} rowKey={(r) => r.id} onRowClick={p.onRowClick} searchText={p.searchText} exportName={p.exportName ?? p.coll} pageSize={p.pageSize}
        filters={p.filters?.map((f) => <Select key={f.label} aria-label={f.label} className="w-36" value={fv[f.label] ?? ''} onChange={(e) => setFv({ ...fv, [f.label]: e.target.value })} options={f.options} placeholder={f.label} />)}
        empty={{ title: `No ${p.entity.toLowerCase()}s found`, text: 'Try a different search or add a new record.', action: p.readOnly ? undefined : `Add ${p.entity}`, onAction: () => setForm({ open: true, item: null }) }} />
      <CrudForm open={form.open} onClose={() => setForm({ open: false, item: null })} title={form.item ? `Edit ${p.entity}` : `Add ${p.entity}`} fields={p.fields} initial={form.item as unknown as Record<string, unknown>} onSubmit={save} />
      <ConfirmDialog open={!!del} onClose={() => setDel(null)} title={`Delete ${p.entity}`} message={`Delete ${del ? p.label(del) : ''}? This cannot be undone.`} onConfirm={() => { if (del) { remove(p.coll, del.id); auditLog(`deleted ${p.entity} ${p.label(del)}`, p.entity + 's', p.label(del)); useDb.getState().toast(`${p.entity} deleted.`, 'info'); p.afterChange?.() } }} />
    </>
  )
}
export type { Db }
