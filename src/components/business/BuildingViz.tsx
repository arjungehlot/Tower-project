import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, Tabs } from '@/components/ui'
import { MapLegend, officeTone, useOfficeLive } from './FloorMap'
import { useDb } from '@/store/db'
import { cx } from '@/utils/helpers'

/** Animated tower cross-section: floors stacked top-down, each office a live-status cell. */
export function BuildingViz() {
  const { towers, floors, offices, towerFilter } = useDb(), nav = useNavigate(), live = useOfficeLive()
  const [tw, setTw] = useState(towerFilter !== 'all' ? towerFilter : towers[0].id)
  const t = towers.find((x) => x.id === tw) ?? towers[0]
  const fl = floors.filter((f) => f.towerId === t.id).sort((a, b) => b.number - a.number)
  return (
    <Card title="Live building status" action={<MapLegend />}>
      <Tabs value={t.id} onChange={setTw} tabs={towers.map((x) => ({ id: x.id, label: x.name }))} />
      <div className="mt-3 max-h-[372px] space-y-1 overflow-y-auto pr-1">
        {fl.map((f, i) => (
          <motion.div key={f.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="flex items-center gap-2">
            <button onClick={() => nav(`/floors/${f.id}`)} className="w-14 shrink-0 rounded-md bg-subtle px-1.5 py-1 text-left text-xxs font-semibold text-muted hover:bg-brand-soft hover:text-brand" aria-label={`Open floor ${f.number}`}>Floor {f.number}</button>
            <div className="grid flex-1 grid-cols-6 gap-1">
              {offices.filter((o) => o.floorId === f.id).sort((a, b) => a.number.localeCompare(b.number)).map((o) => (
                <button key={o.id} onClick={() => nav(`/offices/${o.id}`)} title={`Office ${o.number} — ${o.status}`} aria-label={`Office ${o.number}, ${o.status}`}
                  className={cx('rounded border px-1 py-1 text-[10px] font-semibold transition-transform hover:scale-105', officeTone(o, live.get(o.id)), (live.get(o.id)?.pending ?? 0) > 0 && !live.get(o.id)?.inside && 'animate-pulse')}>{o.number}</button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  )
}
