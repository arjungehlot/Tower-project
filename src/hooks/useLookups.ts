import { useMemo } from 'react'
import { useDb } from '@/store/db'

/** Resolve foreign keys at render time so renamed entities propagate everywhere (no duplicated names). */
export function useLookups() {
  const { towers, floors, offices, tenants, employees, officeEmployees, users } = useDb()
  return useMemo(() => {
    const m = <T extends { id: string }>(a: T[]) => new Map(a.map((x) => [x.id, x]))
    const T = m(towers), F = m(floors), O = m(offices), TN = m(tenants), E = m(employees), H = m(officeEmployees), U = m(users)
    return {
      tower: (id?: string) => T.get(id ?? ''), floor: (id?: string) => F.get(id ?? ''), office: (id?: string) => O.get(id ?? ''), tenant: (id?: string) => TN.get(id ?? ''),
      employee: (id?: string) => E.get(id ?? ''), host: (id?: string) => H.get(id ?? ''), user: (id?: string) => U.get(id ?? ''),
      officeNo: (id?: string) => O.get(id ?? '')?.number ?? '—',
      officeTenant: (id?: string) => TN.get(O.get(id ?? '')?.tenantId ?? ''),
      location: (towerId?: string, floorId?: string, officeId?: string) =>
        [T.get(towerId ?? '')?.name, F.get(floorId ?? '') && `Floor ${F.get(floorId ?? '')!.number}`, O.get(officeId ?? '') && `Office ${O.get(officeId ?? '')!.number}`].filter(Boolean).join(' → '),
    }
  }, [towers, floors, offices, tenants, employees, officeEmployees, users])
}
export type Lookups = ReturnType<typeof useLookups>
