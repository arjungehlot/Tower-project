import { CrudPage } from '@/components/business/CrudPage'
import { Avatar, Badge } from '@/components/ui'
import { ROLE_LABEL } from '@/utils/constants'
import { uid } from '@/utils/helpers'
import type { User } from '@/types'

export default function Users() {
  return <CrudPage<User> title="Users & Roles" subtitle="Accounts that can sign in to TowerFlow" coll="users" entity="User" label={(u) => u.name} searchText={(u) => `${u.name} ${u.email} ${u.role}`}
    filters={[{ label: 'Role', options: Object.values(ROLE_LABEL), pick: (u) => ROLE_LABEL[u.role] }]}
    columns={[{ key: 'n', header: 'User', sort: (u) => u.name, render: (u) => <span className="flex items-center gap-2"><Avatar name={u.name} size={26} /><span><b>{u.name}</b><br /><span className="text-xxs text-muted">{u.email}</span></span></span>, csv: (u) => u.name }, { key: 'r', header: 'Role', sort: (u) => u.role, render: (u) => <Badge tone="brand">{ROLE_LABEL[u.role]}</Badge>, csv: (u) => u.role }, { key: 'p', header: 'Phone', render: (u) => u.phone, hideMobile: true }]}
    fields={[{ name: 'name', label: 'Full name', required: true }, { name: 'email', label: 'Email', type: 'email', required: true }, { name: 'phone', label: 'Phone', type: 'tel' }, { name: 'role', label: 'Role', type: 'select', required: true, options: Object.entries(ROLE_LABEL).map(([value, label]) => ({ value, label })) }, { name: 'password', label: 'Password', required: true }, { name: 'refId', label: 'Linked staff / office employee ID (optional)' }]}
    make={(v) => ({ id: uid('u'), ...v } as unknown as User)} />
}
