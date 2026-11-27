import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import './tower3d.css'

export interface T3Tower { id: string; name: string; code: string }
export interface T3Floor { id: string; towerId: string; number: number; name: string }
export interface T3Office { id: string; number: string; towerId: string; floorId: string; status: string; tenantId: string; area: number; rent: number; type: string }
export interface Tower3DProps {
  towers: T3Tower[]; floors: T3Floor[]; offices: T3Office[]
  tenantName: (id: string) => string | undefined
  live: Map<string, { pending: number; inside: number }>
  onOpenOffice?: (officeId: string) => void
  initialTowerId?: string
}

/* ── geometry (px, world units). x → right, y → down (up is negative), z → towards the viewer ── */
const W = 340, D = 200, FH = 30, FT = 27, ROOM_H = 24, CORR = 20, CORE_W = 52
const near = (target: number, cur: number) => target + 360 * Math.round((cur - target) / 360)
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function Box({ w, h, d, x = 0, y = 0, z = 0, sy, cls = '', fcls = '', style, top, front, label, onClick, onEnter, onLeave, only }: {
  w: number; h: number; d: number; x?: number; y?: number; z?: number; sy?: number; cls?: string; fcls?: string; style?: CSSProperties
  top?: ReactNode; front?: ReactNode; label?: ReactNode; onClick?: () => void; onEnter?: () => void; onLeave?: () => void; only?: 'top'
}) {
  const f = (name: string, fw: number, fh: number, left: number, topPx: number, tf: string, kids?: ReactNode, extra?: CSSProperties) =>
    <i className={`t3-f t3-${name} ${fcls}`} style={{ width: fw, height: fh, left, top: topPx, transform: tf, ...extra }}>{kids}</i>
  return (
    <div className={`t3-box ${cls}`} style={{ transform: `translate3d(${x}px,${y}px,${z}px)${sy === undefined ? '' : ` scaleY(${sy})`}`, ...style }} onClick={onClick} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      {only !== 'top' && <>
        {f('front', w, h, -w / 2, -h, `translateZ(${d / 2}px)`, front)}
        {f('back', w, h, -w / 2, -h, `rotateY(180deg) translateZ(${d / 2}px)`)}
        {f('right', d, h, -d / 2, -h, `rotateY(90deg) translateZ(${w / 2}px)`)}
        {f('left', d, h, -d / 2, -h, `rotateY(-90deg) translateZ(${w / 2}px)`)}
      </>}
      {f('top', w, d, -w / 2, -h / 2 - d / 2, `rotateX(90deg) translateZ(${h / 2}px)`, top)}
      {label && <div className="t3-bill" style={{ '--by': `${-h - 3}px`, maxWidth: Math.max(60, w * 0.98) } as CSSProperties}>{label}</div>}
    </div>
  )
}
/** Flat rectangle lying on the ground plane of its parent (y = height above parent base). */
function Plane({ w, d, x, z, y = 0, cls = '', style }: { w: number; d: number; x: number; z: number; y?: number; cls?: string; style?: CSSProperties }) {
  return <i className={`t3-f ${cls}`} style={{ width: w, height: d, left: -w / 2, top: -d / 2, transform: `translate3d(${x}px,${y}px,${z}px) rotateX(90deg)`, backfaceVisibility: 'visible', ...style }} />
}

interface Room { o: T3Office; x: number; z: number; w: number; d: number; doorX: number }
function layoutRooms(list: T3Office[]): Room[] {
  const offs = [...list].sort((a, b) => a.number.localeCompare(b.number)), cols = Math.max(1, Math.ceil(offs.length / 2))
  const x0 = -W / 2 + CORE_W + 8, L = W - CORE_W - 8 - 10, gap = 6, rw = (L - gap * (cols - 1)) / cols, rd = D / 2 - CORR - 8
  return offs.map((o, i) => { const row = i < cols ? 0 : 1, c = row === 0 ? i : i - cols, x = x0 + c * (rw + gap) + rw / 2, z = (row === 0 ? -1 : 1) * (CORR + rd / 2); return { o, x, z, w: rw, d: rd, doorX: x } })
}
const roomCls = (o: T3Office, live?: { pending: number; inside: number }) =>
  live?.inside ? 'st-in' : live?.pending ? 'st-pen' : ({ Occupied: 'st-ok', Vacant: 'st-vac', Reserved: 'st-res', 'Under Maintenance': 'st-bad' } as Record<string, string>)[o.status] ?? 'st-vac'

type View = 'tower' | 'floor' | 'office'

export function Tower3D({ towers, floors, offices, tenantName, live, onOpenOffice, initialTowerId }: Tower3DProps) {
  const [towerId, setTowerId] = useState(initialTowerId ?? towers[0]?.id)
  const [view, setView] = useState<View>('tower')
  const [floorId, setFloorId] = useState<string | null>(null)
  const [officeId, setOfficeId] = useState<string | null>(null)
  const [hoverFloor, setHoverFloor] = useState<string | null>(null)
  const [yaw, setYaw] = useState(-32)
  const [dragging, setDragging] = useState(false)
  const [switching, setSwitching] = useState(false)
  const [roomsOn, setRoomsOn] = useState(false)
  const [size, setSize] = useState({ w: 900, h: 600 })
  const [bot, setBot] = useState({ x: -W / 2 + 26, y: 0, z: 0, dur: 0, idle: true })
  const [msg, setMsg] = useState('')
  const [arrived, setArrived] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'lift' | 'walk' | 'arrive'>('idle')
  const [botOn, setBotOn] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null), run = useRef(0), drag = useRef<{ x: number; yaw: number } | null>(null), yawRef = useRef(yaw)
  yawRef.current = yaw

  const tower = towers.find((t) => t.id === towerId) ?? towers[0]
  const tFloors = useMemo(() => floors.filter((f) => f.towerId === tower?.id).sort((a, b) => a.number - b.number), [floors, tower])
  const N = tFloors.length, towerH = N * FH
  const floor = tFloors.find((f) => f.id === floorId) ?? null, fIdx = floor ? tFloors.indexOf(floor) : -1
  const fOffices = useMemo(() => (floor ? offices.filter((o) => o.floorId === floor.id) : []), [offices, floor])
  const rooms = useMemo(() => layoutRooms(fOffices), [fOffices])
  const room = rooms.find((r) => r.o.id === officeId) ?? null

  useEffect(() => {
    const el = stageRef.current; if (!el) return
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight })); ro.observe(el)
    setSize({ w: el.clientWidth, h: el.clientHeight }); return () => ro.disconnect()
  }, [])

  /* idle spin while looking at the whole tower */
  useEffect(() => {
    if (view !== 'tower' || dragging || switching) return
    let raf = 0, last = performance.now()
    const tick = (t: number) => { const dt = Math.min(64, t - last); last = t; setYaw((y) => y + dt * 0.011); raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf)
  }, [view, dragging, switching])

  const changeView = useCallback((next: () => void) => { setSwitching(true); next(); setTimeout(() => setSwitching(false), 1000) }, [])

  /* ── navigation ── */
  const START_X = -W / 2 + CORE_W + 8
  const reset = () => { setOfficeId(null); setArrived(false); setMsg(''); setPhase('idle'); setBotOn(false) }
  const toTower = () => { run.current++; changeView(() => { setView('tower'); reset(); setRoomsOn(false); setTimeout(() => setFloorId(null), 700) }) }
  const toFloor = (id: string) => {
    run.current++
    changeView(() => { setFloorId(id); setView('floor'); reset(); setYaw((y) => near(-6, y)) })
    setRoomsOn(false); setTimeout(() => setRoomsOn(true), 650)
  }
  const goToOffice = async (id: string, fromFloor = floor, list = rooms) => {
    const r = list.find((x) => x.o.id === id); if (!r || !fromFloor) return
    const token = ++run.current, topY = -FT, ok = () => run.current === token
    setOfficeId(id); setView('office'); setArrived(false); setBotOn(false); setPhase('lift'); setSwitching(true); setTimeout(() => setSwitching(false), 1000)
    setBot({ x: START_X, y: topY, z: 0, dur: 0, idle: true }); setMsg(`Taking the lift to ${fromFloor.name}…`)
    await sleep(1300); if (!ok()) return
    setBotOn(true); setMsg(`Guiding you to Office ${r.o.number}…`); await sleep(500); if (!ok()) return
    setPhase('walk')
    const d1 = Math.max(0.3, Math.abs(r.doorX - START_X) / 70); setBot({ x: r.doorX, y: topY, z: 0, dur: d1, idle: false }); await sleep(d1 * 1000 + 120); if (!ok()) return
    const d2 = Math.max(0.3, Math.abs(r.z * 0.6) / 70); setBot({ x: r.doorX, y: topY, z: r.z * 0.6, dur: d2, idle: false }); await sleep(d2 * 1000 + 150); if (!ok()) return
    setBot((b) => ({ ...b, dur: 0, idle: true })); setPhase('arrive'); setArrived(true); setMsg(`You have arrived at Office ${r.o.number}`)
  }
  const clickRoom = (id: string) => { void goToOffice(id) }
  const backToFloor = () => { run.current++; changeView(() => { setView('floor'); reset() }) }

  /* ── drag to orbit (tower view) ── */
  const onDown = (e: React.PointerEvent) => { if (view !== 'tower') return; drag.current = { x: e.clientX, yaw: yawRef.current }; setDragging(true) }
  const onMove = (e: React.PointerEvent) => { if (drag.current) setYaw(drag.current.yaw + (e.clientX - drag.current.x) * 0.45) }
  const onUp = () => { drag.current = null; setDragging(false) }

  /* ── camera ── */
  const sw = size.w, sh = size.h
  const sTower = Math.min(sh / (towerH * 0.92 + D * 0.55 + 110), sw / (Math.hypot(W, D) * 1.25))
  const sFloor = Math.min(sw / (W * 1.12), sh / (D * 0.95 + 120))
  const ryFixed = near(-6, yaw)
  let cam = { s: sTower, rx: -24, ry: yaw, fx: 0, fy: -towerH / 2, fz: 0 }
  const topWorldY = -(fIdx * FH + FT) - 4
  if (view === 'floor') cam = { s: sFloor, rx: -58, ry: ryFixed, fx: 0, fy: topWorldY, fz: 0 }
  let worldTransition: string | undefined
  if (view === 'office' && room) {
    const follow = phase === 'walk' || phase === 'lift'
    cam = { s: sFloor * 1.7, rx: -54, ry: ryFixed, fx: follow ? bot.x : room.x, fy: topWorldY, fz: follow ? bot.z : room.z }
    if (phase === 'walk') worldTransition = `transform ${Math.max(bot.dur, 0.2)}s linear`
  }
  const camStyle = { transform: `scale(${cam.s}) rotateX(${cam.rx}deg) rotateY(${cam.ry}deg)`, '--rx': `${cam.rx}deg`, '--ry': `${cam.ry}deg` } as CSSProperties
  const worldStyle: CSSProperties = { transform: `translate3d(${-cam.fx}px,${-cam.fy}px,${-cam.fz}px)`, transition: worldTransition }
  const useAnim = switching || view !== 'tower'

  const occ = (fid: string) => { const l = offices.filter((o) => o.floorId === fid); return { n: l.length, occ: l.filter((o) => o.tenantId).length } }
  const hov = hoverFloor ? tFloors.find((f) => f.id === hoverFloor) : null
  const selOffice = room?.o
  const botTf = `translate3d(${bot.x}px,${bot.y}px,${bot.z}px)`

  if (!tower) return null
  return (
    <div className="t3">
      <div ref={stageRef} className={`t3-stage ${dragging ? 'drag' : ''}`} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
        <span className="t3-cloud" style={{ width: 150, height: 26, top: '12%', animationDuration: '70s' }} />
        <span className="t3-cloud" style={{ width: 110, height: 20, top: '26%', animationDuration: '95s', animationDelay: '-40s', opacity: .6 }} />
        <span className="t3-cloud" style={{ width: 190, height: 30, top: '6%', animationDuration: '120s', animationDelay: '-80s', opacity: .5 }} />

        <div className={`t3-cam ${useAnim ? 'anim' : ''}`} style={camStyle}>
          <div className="t3-world" style={worldStyle}>
            {/* ground */}
            <Plane w={1500} d={1500} x={0} z={0} y={2} cls="t3-ground" />
            <Plane w={W + 120} d={D + 120} x={0} z={0} y={1} cls="t3-shadow" />

            <Plane w={W + 150} d={D + 150} x={0} z={0} y={1.5} cls="t3-lawn" />
            <Box w={W + 36} h={7} d={D + 36} fcls="t3-podium" />

            {/* floors */}
            {tFloors.map((f, i) => {
              const focused = view !== 'tower' && f.id === floorId, above = view !== 'tower' && i > fIdx, below = view !== 'tower' && i < fIdx
              const lift = above ? 520 : focused ? 4 : 0
              return (
                <div key={f.id} className={`t3-box t3-floor ${focused ? 'on' : ''} ${above ? 'gone' : ''} ${below ? 'dim below' : ''}`}
                  style={{ transform: `translate3d(0,${-i * FH - lift}px,0)` }}
                  onClick={(e) => { if (!above && !below && view === 'tower') { e.stopPropagation(); toFloor(f.id) } else if (below) { e.stopPropagation(); toFloor(f.id) } }}
                  onMouseEnter={() => setHoverFloor(f.id)} onMouseLeave={() => setHoverFloor(null)}>
                  <Box w={W} h={FT} d={D} fcls={`t3-glass ${i % 2 ? 'alt' : ''}`}
                    front={i === 0 ? <><span className="t3-door" style={{ position: 'absolute', left: W / 2 - 34, bottom: 0, width: 68, height: FT - 2 }} /></> : i === Math.min(N - 1, 2) ? <span className="t3-sign" style={{ position: 'absolute', left: W / 2 - 80, top: 3, width: 160, height: FT - 7, borderRadius: 3 }}>{tower.name}</span> : undefined} />

                  {/* floor plan (only for the focused floor) */}
                  {focused && <>
                    <Plane w={W - CORE_W - 12} d={CORR * 2} x={CORE_W / 2 + 1} z={0} y={-FT - 0.6} cls="t3-corr" />
                    <Box w={CORE_W - 4} h={ROOM_H + 8} d={64} x={-W / 2 + CORE_W / 2 + 2} y={-FT} z={0} fcls={`t3-core ${phase === 'lift' ? 'ding' : ''}`} top={<span className="t3-core-t">LIFT</span>} />
                    {rooms.map((r, k) => {
                      const lv = live.get(r.o.id), sel = r.o.id === officeId, cls = roomCls(r.o, lv)
                      return <Box key={r.o.id} w={r.w} h={ROOM_H} d={r.d} x={r.x} y={-FT} z={r.z} sy={roomsOn ? 1 : 0.001} cls={`t3-room ${cls} ${sel ? 'sel' : ''} ${view === 'office' && !sel ? 'fade' : ''} ${sel && arrived ? 'pulse' : ''}`}
                        style={{ transitionDelay: roomsOn ? `${k * 60}ms` : '0ms' }} onClick={() => clickRoom(r.o.id)}
                        label={<><i /><b>{r.o.number}</b></>} />
                    })}
                    {/* route trail + bot */}
                    {view === 'office' && room && <>
                      <Plane w={Math.abs(room.doorX - START_X)} d={4} x={(room.doorX + START_X) / 2} z={0} y={-FT - 1} cls="t3-route" />
                      <Plane w={4} d={Math.abs(room.z)} x={room.doorX} z={room.z / 2} y={-FT - 1} cls="t3-route v" />
                    </>}
                    {view === 'office' && <div className={`t3-bot ${bot.idle ? 'idle' : ''} ${botOn ? 'on' : ''}`} style={{ transform: botTf, transitionDuration: `${bot.dur}s` }}>
                      <div className="t3-bot-in">
                        <Plane w={34} d={34} x={0} z={0} y={0} cls="t3-bot-glow" />
                        <Box w={14} h={14} d={14} fcls="t3-bot-body" />
                        <Box w={12} h={10} d={12} y={-15} fcls="t3-bot-head" front={<><i className="t3-bot-eye" style={{ position: 'absolute', left: 2, top: 3, width: 3, height: 3 }} /><i className="t3-bot-eye" style={{ position: 'absolute', right: 2, top: 3, width: 3, height: 3 }} /></>} />
                        <Box w={1.5} h={7} d={1.5} y={-25} fcls="t3-ant" />
                        <Box w={4} h={4} d={4} y={-32} fcls="t3-beacon" />
                      </div>
                    </div>}
                  </>}
                </div>
              )
            })}

            {/* roof + antenna (hidden when exploring a floor) */}
            <div className="t3-box" style={{ transform: `translate3d(0,${-towerH - (view === 'tower' ? 0 : 520)}px,0)`, transition: 'transform .95s cubic-bezier(.6,.02,.2,1)' }}>
              <Box w={W * 0.5} h={9} d={D * 0.5} fcls="t3-roof" />
              <Box w={3} h={46} d={3} y={-9} fcls="t3-ant" />
              <Box w={7} h={7} d={7} y={-55} fcls="t3-beacon" />
            </div>
          </div>
        </div>

        {/* HUD */}
        <div className="t3-hud" style={{ left: 14, top: 14 }}>
          <span className="t3-chip dark">{view === 'tower' ? (hov ? `${hov.name} · ${occ(hov.id).occ}/${occ(hov.id).n} occupied · click to enter` : `${tower.name} · ${N} floors — drag to rotate, click a floor`) : view === 'floor' ? `${floor?.name} · pick an office to be guided` : `Office ${selOffice?.number}`}</span>
        </div>
        {view !== 'tower' && <div className="t3-ctrl" style={{ right: 14, top: 14 }}>
          {view === 'office' && <button className="t3-btn" onClick={backToFloor}>← Floor plan</button>}
          <button className="t3-btn" onClick={toTower}>⌂ Whole tower</button>
        </div>}
        {msg && <div className="t3-hud" style={{ left: '50%', bottom: 18, transform: 'translateX(-50%)' }}><span className="t3-chip">{!arrived && <i className="t3-dot" />}{arrived ? '✓ ' : ''}{msg}</span></div>}
      </div>

      {/* side panel */}
      <aside className="t3-panel">
        <div className="t3-tabs">{towers.map((t) => <button key={t.id} className={`t3-tab ${t.id === tower.id ? 'on' : ''}`} onClick={() => { run.current++; setTowerId(t.id); setView('tower'); setFloorId(null); setOfficeId(null); setArrived(false); setMsg(''); setRoomsOn(false) }}>{t.name}</button>)}</div>
        <div className="t3-card">
          <div className="t3-crumb"><button onClick={toTower}>{tower.name}</button>{floor && <> › <button onClick={backToFloor}>{floor.name}</button></>}{selOffice && <> › <b>Office {selOffice.number}</b></>}</div>
        </div>
        {view === 'tower' && <div className="t3-card"><div className="t3-h">Floors — click to enter</div>
          <div className="t3-list">{[...tFloors].reverse().map((f) => { const c = occ(f.id); return <button key={f.id} className="t3-row" onClick={() => toFloor(f.id)} onMouseEnter={() => setHoverFloor(f.id)} onMouseLeave={() => setHoverFloor(null)}><span className="n">{f.name}</span><span className="s">{c.occ}/{c.n}</span><span className="t3-bar"><i style={{ width: `${c.n ? (c.occ / c.n) * 100 : 0}%` }} /></span></button> })}</div></div>}
        {view !== 'tower' && <div className="t3-card"><div className="t3-h">{floor?.name} · offices</div>
          <div className="t3-list">{rooms.map((r) => <button key={r.o.id} className={`t3-row ${r.o.id === officeId ? 'on' : ''}`} onClick={() => clickRoom(r.o.id)}><span className="n">{r.o.number}</span><span>{tenantName(r.o.tenantId) ?? '—'}</span><span className="s">{live.get(r.o.id)?.inside ? 'visitor inside' : live.get(r.o.id)?.pending ? 'visitor waiting' : r.o.status}</span></button>)}</div></div>}
        {selOffice && <div className="t3-card"><div className="t3-h">Office {selOffice.number}</div>
          <div className="t3-kv"><div><small>Tenant</small><span>{tenantName(selOffice.tenantId) ?? 'Vacant'}</span></div><div><small>Status</small><span>{selOffice.status}</span></div><div><small>Area</small><span>{selOffice.area.toLocaleString('en-IN')} sqft</span></div><div><small>Type</small><span>{selOffice.type}</span></div><div><small>Rent / mo</small><span>{selOffice.rent ? `₹${selOffice.rent.toLocaleString('en-IN')}` : '—'}</span></div><div><small>Visitors</small><span>{(live.get(selOffice.id)?.inside ?? 0)} in · {(live.get(selOffice.id)?.pending ?? 0)} waiting</span></div></div>
          <div className="t3-act"><button onClick={() => void goToOffice(selOffice.id)}>↻ Replay route</button><button className="p" onClick={() => onOpenOffice?.(selOffice.id)}>Open office →</button></div></div>}
        <div className="t3-card"><div className="t3-legend">{[['#4ade80', 'Occupied'], ['#cbd5e1', 'Vacant'], ['#fbbf24', 'Visitor waiting'], ['#60a5fa', 'Visitor inside'], ['#f87171', 'Maintenance'], ['#c084fc', 'Reserved']].map(([c, l]) => <span key={l}><i style={{ background: c }} />{l}</span>)}</div></div>
      </aside>
    </div>
  )
}
