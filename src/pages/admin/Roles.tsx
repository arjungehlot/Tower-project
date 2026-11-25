import { useState } from 'react'
import { Check, Minus } from 'lucide-react'
import { Card, PageHeader, Tabs } from '@/components/ui'
import { MODULES, PERMISSIONS } from '@/utils/permissions'
import { ROLE_LABEL } from '@/utils/constants'
import type { Role } from '@/types'

const ACTIONS = ['view', 'create', 'update', 'delete', 'approve', 'reject', 'exit', 'assign', 'close', 'rate'] as const
export default function Roles() {
  const [role, setRole] = useState<Role>('ADMIN')
  return <><PageHeader title="Permissions" subtitle="Role-based access matrix — also drives navigation and action buttons" />
    <Tabs value={role} onChange={(r) => setRole(r as Role)} tabs={(Object.keys(ROLE_LABEL) as Role[]).map((r) => ({ id: r, label: ROLE_LABEL[r] }))} />
    <Card className="mt-3" pad={false}><div className="overflow-x-auto"><table className="w-full text-xs"><thead className="bg-subtle text-xxs uppercase tracking-wide text-muted"><tr><th className="px-3 py-2 text-left">Module</th>{ACTIONS.map((a) => <th key={a} className="px-2 py-2 text-center capitalize">{a}</th>)}</tr></thead>
      <tbody className="divide-y divide-line">{MODULES.map((m) => <tr key={m}><td className="px-3 py-2 font-medium capitalize">{m}</td>{ACTIONS.map((a) => <td key={a} className="px-2 py-2 text-center">{PERMISSIONS[role][m]?.includes(a) ? <Check size={14} className="mx-auto text-ok" aria-label="Allowed" /> : <Minus size={14} className="mx-auto text-line" aria-label="Denied" />}</td>)}</tr>)}</tbody></table></div></Card>
    <p className="mt-2 text-xxs text-muted">Permissions are defined in <code>src/utils/permissions.ts</code>. Replace with server-issued claims when a backend is connected.</p></>
}
