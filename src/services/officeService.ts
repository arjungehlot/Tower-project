import { db } from '@/store/db'
import { auditLog } from './core'
export function changeOfficeStatus(id: string, status: string) { db().patch('offices', id, { status: status as never }); const o = db().offices.find((x) => x.id === id)!; auditLog(`changed Office ${o.number} status to ${status}`, 'Offices', `Office ${o.number}`); db().toast('Office updated.') }
export function syncTenantOfficeCounts() { db().tenants.forEach((t) => { const c = db().offices.filter((o) => o.tenantId === t.id).length; if (c !== t.officeCount) db().patch('tenants', t.id, { officeCount: c }) }) }
