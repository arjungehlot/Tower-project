import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CHART } from '@/utils/constants'

const axis = { fontSize: 11, fill: 'rgb(var(--muted))' }
const grid = <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--line))" vertical={false} />
const tip = <Tooltip contentStyle={{ background: 'rgb(var(--surface))', border: '1px solid rgb(var(--line))', borderRadius: 8, fontSize: 12 }} cursor={{ fill: 'rgb(var(--subtle))', opacity: 0.6 }} />
type D = Record<string, string | number>[]
export const Empty = () => <div className="flex h-full items-center justify-center text-xs text-muted">No data for this period</div>
const Wrap = ({ h, data, children }: { h: number; data: D; children: React.ReactElement }) => <div style={{ height: h }} role="img" aria-label="Chart">{data.length ? <ResponsiveContainer>{children}</ResponsiveContainer> : <Empty />}</div>
export const LineSeries = ({ data, keys, x = 'name', h = 220 }: { data: D; keys: string[]; x?: string; h?: number }) => (
  <Wrap h={h} data={data}><LineChart data={data} margin={{ left: -20, right: 8, top: 8 }}>{grid}<XAxis dataKey={x} tick={axis} tickLine={false} axisLine={false} /><YAxis tick={axis} tickLine={false} axisLine={false} allowDecimals={false} />{tip}{keys.length > 1 && <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />}
    {keys.map((k, i) => <Line key={k} type="monotone" dataKey={k} stroke={CHART[i]} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />)}</LineChart></Wrap>)
export const AreaSeries = ({ data, keys, x = 'name', h = 220 }: { data: D; keys: string[]; x?: string; h?: number }) => (
  <Wrap h={h} data={data}><AreaChart data={data} margin={{ left: -20, right: 8, top: 8 }}>{grid}<XAxis dataKey={x} tick={axis} tickLine={false} axisLine={false} /><YAxis tick={axis} tickLine={false} axisLine={false} allowDecimals={false} />{tip}<Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
    {keys.map((k, i) => <Area key={k} type="monotone" dataKey={k} stroke={CHART[i]} fill={CHART[i]} fillOpacity={0.15} strokeWidth={2} />)}</AreaChart></Wrap>)
export const Bars = ({ data, keys = ['value'], x = 'name', h = 220, horizontal, stacked }: { data: D; keys?: string[]; x?: string; h?: number; horizontal?: boolean; stacked?: boolean }) => (
  <Wrap h={h} data={data}><BarChart data={data} layout={horizontal ? 'vertical' : 'horizontal'} margin={{ left: horizontal ? 24 : -20, right: 8, top: 8 }}>{grid}
    {horizontal ? <><XAxis type="number" tick={axis} tickLine={false} axisLine={false} allowDecimals={false} /><YAxis type="category" dataKey={x} tick={axis} tickLine={false} axisLine={false} width={72} /></> : <><XAxis dataKey={x} tick={axis} tickLine={false} axisLine={false} /><YAxis tick={axis} tickLine={false} axisLine={false} allowDecimals={false} /></>}
    {tip}{keys.length > 1 && <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />}{keys.map((k, i) => <Bar key={k} dataKey={k} fill={CHART[i]} radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} stackId={stacked ? 's' : undefined} maxBarSize={28} />)}</BarChart></Wrap>)
export const Donut = ({ data, h = 220 }: { data: { name: string; value: number }[]; h?: number }) => (
  <Wrap h={h} data={data as unknown as D}><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="85%" paddingAngle={2} stroke="none">{data.map((_, i) => <Cell key={i} fill={CHART[i % CHART.length]} />)}</Pie>{tip}<Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} /></PieChart></Wrap>)
