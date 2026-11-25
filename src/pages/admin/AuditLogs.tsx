import { useState } from 'react'
import { DataTable, PageHeader, Select, Badge } from '@/components/ui'
import { useDb } from '@/store/db'
import { fmtDateTime } from '@/utils/dateUtils'

export default function AuditLogs() {
  const logs = useDb((s) => s.auditLogs), [m, setM] = useState('')
  const rows = [...logs].filter((l) => !m || l.module === m).sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  return <><PageHeader title="Audit Logs" subtitle="Every important action, with who, what and when" />
    <DataTable rows={rows} rowKey={(l) => l.id} exportName="audit-logs" searchText={(l) => `${l.user} ${l.action} ${l.entity}`} pageSize={15} filters={<Select aria-label="Module" className="w-36" value={m} onChange={(e) => setM(e.target.value)} options={[...new Set(logs.map((l) => l.module))]} placeholder="All modules" />}
      columns={[{ key: 'u', header: 'User', sort: (l) => l.user, render: (l) => <b>{l.user}</b>, csv: (l) => l.user }, { key: 'a', header: 'Action', render: (l) => l.action, csv: (l) => l.action }, { key: 'm', header: 'Module', sort: (l) => l.module, render: (l) => <Badge tone="brand">{l.module}</Badge>, csv: (l) => l.module }, { key: 'e', header: 'Entity', render: (l) => l.entity, csv: (l) => l.entity, hideMobile: true }, { key: 't', header: 'Timestamp', sort: (l) => l.timestamp, render: (l) => fmtDateTime(l.timestamp), csv: (l) => l.timestamp }, { key: 'i', header: 'IP / device', render: (l) => <span className="text-muted">{l.ip} · {l.device}</span>, hideMobile: true, csv: (l) => `${l.ip} ${l.device}` }]} /></>
}
