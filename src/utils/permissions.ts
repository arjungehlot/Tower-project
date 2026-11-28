import type { Role } from '@/types'
export type Action = 'view' | 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'exit' | 'assign' | 'close' | 'rate'
export const MODULES = ['visitors', 'tickets', 'tasks', 'staff', 'offices', 'tenants', 'towers', 'reports', 'settings', 'users', 'audit'] as const
export type Module = (typeof MODULES)[number]
const ALL: Action[] = ['view', 'create', 'update', 'delete', 'approve', 'reject', 'exit', 'assign', 'close', 'rate']
const A = (...a: Action[]) => a
export const PERMISSIONS: Record<Role, Partial<Record<Module, Action[]>>> = {
  SUPER_ADMIN: Object.fromEntries(MODULES.map((m) => [m, ALL])),
  ADMIN: { visitors: ALL, tickets: ALL, tasks: ALL, staff: ALL, offices: ALL, tenants: ALL, towers: ALL, reports: A('view'), settings: A('view', 'update'), users: A('view', 'create', 'update'), audit: A('view') },
  SUPERVISOR: { visitors: A('view'), tickets: A('view', 'update', 'assign'), tasks: A('view', 'create', 'update', 'assign', 'rate'), staff: A('view', 'update', 'rate'), offices: A('view'), reports: A('view') },
  SECURITY_GUARD: { visitors: A('view', 'create', 'exit', 'update') },
  OFFICE_ADMIN: { visitors: A('view', 'create', 'approve', 'reject'), tickets: A('view', 'create', 'close'), offices: A('view') },
  OFFICE_EMPLOYEE: { visitors: A('view', 'create', 'approve', 'reject'), tickets: A('view', 'create') },
  OWNER: { tickets: A('view', 'approve', 'reject'), offices: A('view') },
  STAFF: { tasks: A('view', 'update'), tickets: A('view') },
}
export const can = (role: Role | undefined, m: Module, a: Action) => !!role && !!PERMISSIONS[role]?.[m]?.includes(a)
export const HOME: Record<Role, string> = { SUPER_ADMIN: '/dashboard', ADMIN: '/dashboard', SUPERVISOR: '/dashboard', SECURITY_GUARD: '/guard', OFFICE_ADMIN: '/office', OFFICE_EMPLOYEE: '/office', OWNER: '/owner', STAFF: '/my-work' }
