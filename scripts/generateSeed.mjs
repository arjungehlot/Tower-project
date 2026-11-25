// Deterministic seed generator. Run: npm run seed  → writes src/data/*.json
// Timestamps are generated relative to "now"; the app shifts them on first load so "today" is always today.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const out = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data')
const NOW = Date.now()
let s = 42
const rnd = () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
const pick = (a) => a[Math.floor(rnd() * a.length)]
const int = (a, b) => a + Math.floor(rnd() * (b - a + 1))
const ago = (min) => new Date(NOW - min * 60000).toISOString()
const day = (d) => new Date(NOW + d * 86400000).toISOString().slice(0, 10)
const pad = (n, l = 3) => String(n).padStart(l, '0')
const phone = () => '9' + String(int(100000000, 999999999))
const write = (n, d) => fs.writeFileSync(path.join(out, n + '.json'), JSON.stringify(d, null, 1))

const FIRST = ['Amit', 'Rahul', 'Priya', 'Neha', 'Vikash', 'Suresh', 'Anjali', 'Rohit', 'Pooja', 'Sanjay', 'Kavita', 'Manish', 'Deepak', 'Sneha', 'Arjun', 'Meera', 'Karan', 'Divya', 'Nikhil', 'Ritu', 'Ajay', 'Swati', 'Varun', 'Isha', 'Gaurav', 'Nisha', 'Harsh', 'Komal', 'Yash', 'Tanvi', 'Mohit', 'Shweta', 'Rajesh', 'Sunita', 'Pankaj', 'Aarti']
const LAST = ['Sharma', 'Verma', 'Singh', 'Gupta', 'Kumar', 'Patel', 'Mehta', 'Joshi', 'Reddy', 'Nair', 'Iyer', 'Das', 'Chopra', 'Malhotra', 'Bansal', 'Agarwal', 'Yadav', 'Mishra', 'Kapoor', 'Khanna']
const name = () => `${pick(FIRST)} ${pick(LAST)}`
const COMPANIES = [['ABC Technologies', 'IT Services'], ['Infosphere Solutions', 'Software'], ['Zenith Capital', 'Finance'], ['BlueOak Consulting', 'Consulting'], ['Nexa Pharma', 'Pharma'], ['Orbit Logistics', 'Logistics'], ['Pinnacle Realty', 'Real Estate'], ['Vertex Analytics', 'Data & AI'], ['Lotus Legal Associates', 'Legal'], ['Mantra Media', 'Media'], ['Apex Insurance Brokers', 'Insurance'], ['GreenLeaf Energy', 'Energy'], ['CloudNine Systems', 'Cloud'], ['Sapphire Design Studio', 'Design'], ['Kaveri Textiles', 'Retail'], ['Helix Biotech', 'Biotech'], ['Quantum Payments', 'Fintech'], ['Trident Engineering', 'Engineering'], ['Sunrise Education', 'EdTech'], ['Metro HR Partners', 'HR'], ['Aarav Chartered Accountants', 'Accounting'], ['Digital Dhaba', 'Marketing'], ['Rapid Couriers', 'Logistics'], ['Silverline Travels', 'Travel'], ['Everest Securities', 'Finance'], ['Ganga Foods Pvt Ltd', 'FMCG'], ['Prime Health Labs', 'Healthcare'], ['Skyline Architects', 'Architecture'], ['Taurus Auto Components', 'Automotive'], ['Bharat Telecom Services', 'Telecom'], ['Crescent Ventures', 'VC'], ['Nova Cybersecurity', 'Security']]

// --- towers / floors / offices
const towers = [
  { id: 'tw-a', name: 'Tower A', code: 'TA', address: 'Plot 12, Sector 62, Noida, Uttar Pradesh 201301', floors: 10, totalOffices: 0, managementContact: '+91 98100 11001', securityDesk: '+91 120 4001 100', emergencyContact: '+91 98100 11999' },
  { id: 'tw-b', name: 'Tower B', code: 'TB', address: 'Plot 14, Sector 62, Noida, Uttar Pradesh 201301', floors: 8, totalOffices: 0, managementContact: '+91 98100 22002', securityDesk: '+91 120 4001 200', emergencyContact: '+91 98100 22999' },
]
const buildings = [{ id: 'bl-1', name: 'TowerFlow Business Park', city: 'Noida', towerIds: ['tw-a', 'tw-b'], capacity: 1200 }]
const floors = [], offices = [], tenants = []
COMPANIES.forEach(([n, ind], i) => tenants.push({ id: `tn-${pad(i + 1, 2)}`, name: n, industry: ind, contactPerson: name(), phone: phone(), email: `admin@${n.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '')}.in`, gst: `09${pick(['AAB', 'BCD', 'CDE', 'DEF'])}${int(1000, 9999)}F1Z${int(1, 9)}`, leaseStatus: 'Active', color: ['#4f46e5', '#0891b2', '#16a34a', '#d97706', '#9333ea', '#dc2626', '#0d9488'][i % 7] }))
let tIdx = 0
const OTYPE = ['Open Plan', 'Cabin Suite', 'Executive', 'Co-working']
for (const t of towers) {
  for (let f = 1; f <= t.floors; f++) {
    const fid = `fl-${t.code.toLowerCase()}-${f}`
    floors.push({ id: fid, towerId: t.id, number: f, name: f === 1 ? 'Ground+1' : `Floor ${f}` })
    for (let n = 1; n <= 6; n++) {
      const number = String(f * 100 + n)
      const roll = rnd()
      const status = roll < 0.74 ? 'Occupied' : roll < 0.86 ? 'Vacant' : roll < 0.93 ? 'Reserved' : roll < 0.97 ? 'Under Maintenance' : 'Vacant'
      const tenant = status === 'Occupied' || status === 'Reserved' ? tenants[tIdx++ % tenants.length] : null
      const start = day(-int(60, 900)), end = day(int(-10, 700))
      offices.push({ id: `of-${t.code.toLowerCase()}-${number}`, number, towerId: t.id, floorId: fid, area: int(5, 30) * 100, type: pick(OTYPE), status, tenantId: tenant?.id ?? '', ownerName: pick(['Mehra Estates', 'Rao Holdings', 'Singhania Group', 'TowerFlow Realty']), contactPerson: tenant?.contactPerson ?? '', contactNumber: tenant?.phone ?? '', email: tenant?.email ?? '', leaseStart: tenant ? start : '', leaseEnd: tenant ? end : '', rent: tenant ? int(60, 400) * 1000 : 0, deposit: tenant ? int(3, 12) * 100000 : 0, maintenanceCharge: tenant ? int(5, 25) * 1000 : 0, notes: status === 'Under Maintenance' ? 'False ceiling repair in progress' : '' })
    }
  }
  t.totalOffices = t.floors * 6
}
for (const id of ['of-ta-702', 'of-ta-1004', 'of-ta-301']) { const o = offices.find((x) => x.id === id); if (!o.tenantId) { const t = tenants[0]; Object.assign(o, { status: 'Occupied', tenantId: t.id, contactPerson: t.contactPerson, contactNumber: t.phone, email: t.email, leaseStart: day(-200), leaseEnd: day(300), rent: 180000, deposit: 540000, maintenanceCharge: 12000 }) } }
tenants.forEach((t) => { const c = offices.filter((o) => o.tenantId === t.id).length; t.officeCount = c; if (!c) t.leaseStatus = 'Inactive' })
const occupied = offices.filter((o) => o.tenantId)

// --- office employees (hosts)
const DESIG = ['Manager', 'Director', 'HR Executive', 'Admin Executive', 'Engineer', 'Analyst', 'Accountant', 'Receptionist']
const hosts = []
occupied.forEach((o) => { const c = int(2, 3); for (let i = 0; i < c; i++) { const n = name(); hosts.push({ id: `oe-${pad(hosts.length + 1)}`, name: n, officeId: o.id, designation: i === 0 ? 'Office Admin' : pick(DESIG), phone: phone(), email: `${n.toLowerCase().replace(' ', '.')}@${o.email.split('@')[1] || 'company.in'}` }) } })

// --- staff
const CATS = [['Electrician', 7, ['Wiring', 'Panel repair', 'Lighting']], ['Plumber', 5, ['Pipe fitting', 'Drainage']], ['Cleaner', 10, ['Deep cleaning', 'Washroom care']], ['Security', 6, ['Patrolling', 'CCTV monitoring']], ['HVAC Technician', 5, ['AC servicing', 'Chiller ops']], ['Carpenter', 3, ['Furniture repair', 'Partitions']], ['IT Support', 4, ['Networking', 'CCTV setup']], ['Maintenance', 5, ['General repair', 'Painting']], ['Gardener', 3, ['Landscaping']], ['General Worker', 4, ['Material handling']], ['Other', 2, ['Misc']]]
const supervisors = ['Vikash Kumar', 'Sanjay Mehta', 'Kavita Joshi', 'Manish Bansal', 'Ritu Chopra', 'Rajesh Yadav'].map((n, i) => ({ id: `sv-${i + 1}`, empId: `SUP-${pad(i + 1)}`, name: n, role: 'supervisor', category: 'Maintenance', phone: phone(), email: `${n.toLowerCase().replace(' ', '.')}@towerflow.in`, supervisorId: '', joiningDate: day(-int(400, 2000)), skills: ['Team management'], shift: 'General', location: 'Control Room', status: 'AVAILABLE', employment: 'Active', attendance: 96, rating: 4.4 }))
const STAT = ['AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'BUSY', 'BUSY', 'ON_BREAK', 'OFF_DUTY', 'ABSENT']
const SHIFT = ['Morning', 'General', 'Evening', 'Night']
const staff = []
const used = new Set(['Amit Sharma'])
CATS.forEach(([cat, cnt, skills]) => {
  for (let i = 0; i < cnt; i++) {
    let n = staff.length === 0 ? 'Amit Sharma' : name(); while (used.has(n) && staff.length) n = name(); used.add(n)
    staff.push({ id: `st-${pad(staff.length + 1)}`, empId: `EMP-${pad(1000 + staff.length + 1, 4)}`, name: n, role: 'staff', category: cat, phone: phone(), email: `${n.toLowerCase().replace(' ', '.')}@towerflow.in`, supervisorId: pick(supervisors).id, joiningDate: day(-int(60, 1800)), skills, shift: pick(SHIFT), location: pick(['Tower A', 'Tower B', 'Basement', 'Control Room']), status: pick(STAT), employment: 'Active', attendance: int(86, 100), rating: 0 })
  }
})
const people = [...supervisors, ...staff]

// --- users
const users = [
  { id: 'u-super', name: 'Ravi Malhotra', email: 'super@towerflow.in', password: 'demo123', role: 'SUPER_ADMIN', refId: '', phone: '9810000001' },
  { id: 'u-admin', name: 'Anil Kapoor', email: 'admin@towerflow.in', password: 'demo123', role: 'ADMIN', refId: '', phone: '9810000002' },
  { id: 'u-sup', name: supervisors[0].name, email: 'supervisor@towerflow.in', password: 'demo123', role: 'SUPERVISOR', refId: supervisors[0].id, phone: supervisors[0].phone },
  { id: 'u-guard', name: 'Ramesh Yadav', email: 'guard@towerflow.in', password: 'demo123', role: 'SECURITY_GUARD', refId: '', phone: '9810000004' },
  { id: 'u-guard2', name: 'Bhupender Singh', email: 'guard2@towerflow.in', password: 'demo123', role: 'SECURITY_GUARD', refId: '', phone: '9810000005' },
  { id: 'u-oadmin', name: hosts[0].name, email: 'office@towerflow.in', password: 'demo123', role: 'OFFICE_ADMIN', refId: hosts[0].id, phone: hosts[0].phone },
  { id: 'u-oemp', name: hosts[1].name, email: 'employee@towerflow.in', password: 'demo123', role: 'OFFICE_EMPLOYEE', refId: hosts[1].id, phone: hosts[1].phone },
  { id: 'u-staff', name: 'Amit Sharma', email: 'staff@towerflow.in', password: 'demo123', role: 'STAFF', refId: 'st-001', phone: staff[0].phone },
]
staff[0].status = 'AVAILABLE'
const guards = users.filter((u) => u.role === 'SECURITY_GUARD')

// --- visitors
const PURPOSE = ['Meeting', 'Meeting', 'Meeting', 'Interview', 'Interview', 'Delivery', 'Delivery', 'Maintenance', 'Personal', 'Other']
const visitors = []
function mkVisitor(state, minsAgoRequested, durMin) {
  const o = pick(occupied), h = hosts.filter((x) => x.officeId === o.id)[0] || hosts[0]
  const n = name(), guard = pick(guards)
  const req = NOW - minsAgoRequested * 60000
  const v = { id: `vs-${pad(visitors.length + 1)}`, name: n, mobile: phone(), email: `${n.toLowerCase().replace(' ', '.')}@gmail.com`, photo: '', idType: pick(['Aadhaar', 'Driving License', 'PAN', 'Passport']), idNumber: String(int(100000, 999999)) + 'XXXX', purpose: pick(PURPOSE), towerId: o.towerId, floorId: o.floorId, officeId: o.id, hostId: h.id, expectedDuration: pick(['30 min', '1 hour', '2 hours']), count: int(1, 2) === 2 && rnd() > 0.7 ? 2 : 1, status: state, guardId: guard.id, gate: pick(['Gate 1', 'Gate 1', 'Gate 2']), requestedAt: new Date(req).toISOString(), approvedAt: '', entryAt: '', exitAt: '', remark: '', timeline: [] }
  const tl = (min, label) => v.timeline.push({ at: new Date(req + min * 60000).toISOString(), label })
  tl(0, 'Visitor registered'); tl(1, 'Approval request sent')
  if (state === 'PENDING') return visitors.push(v)
  if (state === 'REJECTED') { tl(3, 'Host rejected the request'); v.remark = pick(['Not expecting any visitor', 'Meeting cancelled']); return visitors.push(v) }
  v.approvedAt = new Date(req + 3 * 60000).toISOString(); tl(3, 'Host approved'); tl(4, 'Guard notified')
  if (state === 'APPROVED') return visitors.push(v)
  v.entryAt = new Date(req + 6 * 60000).toISOString(); tl(6, 'Visitor entered building')
  if (state === 'INSIDE') return visitors.push(v)
  v.exitAt = new Date(req + (6 + durMin) * 60000).toISOString(); tl(6 + durMin, 'Visitor exited building')
  visitors.push(v)
}
for (let i = 0; i < 3; i++) mkVisitor('PENDING', int(2, 12))
for (let i = 0; i < 2; i++) mkVisitor('APPROVED', int(8, 20))
for (let i = 0; i < 8; i++) mkVisitor('INSIDE', int(20, 230))
for (let i = 0; i < 12; i++) mkVisitor('EXITED', int(240, 420), int(25, 110))
mkVisitor('REJECTED', 100)
for (let d = 1; d <= 9; d++) for (let i = 0; i < 11; i++) mkVisitor(rnd() > 0.1 ? 'EXITED' : 'REJECTED', d * 1440 + int(-420, 120), int(20, 150))
{ const ho = hosts[0], of0 = offices.find((o) => o.id === ho.officeId); const mine = (v) => Object.assign(v, { officeId: of0.id, hostId: ho.id, towerId: of0.towerId, floorId: of0.floorId }); [0, 1, 3, 4, 5, 6, 13].forEach((i) => mine(visitors[i])) }
const hostOf = (id) => hosts.find((h) => h.id === id)

// --- tickets & tasks
const TCAT = { Electrical: 'Electrician', Plumbing: 'Plumber', Cleaning: 'Cleaner', HVAC: 'HVAC Technician', Internet: 'IT Support', Security: 'Security', Maintenance: 'Maintenance', Lift: 'Maintenance', 'Fire Safety': 'Maintenance', General: 'General Worker' }
const SUBJ = { Electrical: ['Power socket sparking', 'Tube lights flickering in cabin', 'MCB trips frequently'], Plumbing: ['Washroom tap leaking', 'Water seepage near pantry'], Cleaning: ['Carpet cleaning needed', 'Pantry deep cleaning'], HVAC: ['AC not cooling', 'Strange noise from AC vent'], Internet: ['Leased line down', 'Wi-Fi access point offline'], Security: ['Access card not working'], Maintenance: ['Cabin door lock jammed', 'Ceiling tile broken'], Lift: ['Lift 2 stops between floors'], 'Fire Safety': ['Fire extinguisher expired'], General: ['Move furniture to storage'] }
const tickets = [], tasks = [], comments = (arr) => arr
const TST = ['OPEN', 'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED', 'CLOSED', 'CLOSED']
const PRI = ['LOW', 'MEDIUM', 'MEDIUM', 'HIGH', 'HIGH', 'CRITICAL']
function mkTask(o) {
  const staffPool = staff.filter((x) => x.category === o.cat)
  const emp = o.assigned === false ? null : (o.empId ? staff.find((x) => x.id === o.empId) : pick(staffPool.length ? staffPool : staff))
  const created = NOW - o.minsAgo * 60000
  const t = { id: `tk-${pad(tasks.length + 1)}`, code: `TASK-${101 + tasks.length}`, title: o.title, description: o.desc || o.title + '. Please attend and share completion photos.', category: o.cat, towerId: o.towerId, floorId: o.floorId, officeId: o.officeId, locationNote: '', priority: o.priority, assignedEmployeeId: emp?.id ?? '', supervisorId: emp?.supervisorId ?? '', ticketId: o.ticketId || '', createdBy: 'u-admin', createdAt: new Date(created).toISOString(), deadline: new Date(created + int(3, 30) * 3600000).toISOString(), status: o.status, progress: 0, startedAt: '', completedAt: '', verifiedAt: '', verifiedBy: '', rating: null, proof: '', notes: '', comments: [], timeline: [{ at: new Date(created).toISOString(), label: 'Task created' }] }
  const tl = (m, l) => t.timeline.push({ at: new Date(created + m * 60000).toISOString(), label: l })
  if (emp) tl(1, `Assigned to ${emp.name}`)
  const st = o.status
  if (['ACCEPTED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED'].includes(st)) tl(10, 'Accepted by employee')
  if (['IN_PROGRESS', 'ON_HOLD', 'COMPLETED'].includes(st)) { t.startedAt = new Date(created + 20 * 60000).toISOString(); tl(20, 'Work started'); t.progress = st === 'COMPLETED' ? 100 : int(20, 80) }
  if (st === 'ON_HOLD') tl(50, 'On hold — waiting for spare parts')
  if (st === 'COMPLETED') { const d = int(30, 120); t.completedAt = new Date(created + (20 + d) * 60000).toISOString(); tl(20 + d, 'Work completed'); if (o.verified) { t.verifiedAt = new Date(created + (30 + d) * 60000).toISOString(); t.verifiedBy = emp.supervisorId; tl(30 + d, 'Verified by supervisor'); const q = int(3, 5), sp = int(3, 5), pr = int(4, 5), cl = int(3, 5); t.rating = { quality: q, speed: sp, professionalism: pr, cleanliness: cl, overall: Math.round(((q + sp + pr + cl) / 4) * 10) / 10, comment: pick(['Good work.', 'Neat and quick.', 'Satisfactory.', 'Excellent job!']) }; tl(35 + d, 'Rated by supervisor') } }
  tasks.push(t); return t
}
for (let i = 0; i < 36; i++) {
  const cat = pick(Object.keys(TCAT)), o = pick(occupied), status = TST[i % TST.length], pri = pick(PRI)
  const tk = { id: `tkt-${pad(i + 1)}`, code: `TK-${1001 + i}`, subject: pick(SUBJ[cat]), description: 'Reported by the office. Please check at the earliest and update.', category: cat, priority: pri, status, towerId: o.towerId, floorId: o.floorId, officeId: o.officeId, reporterId: hosts.find((h) => h.officeId === o.id).id, assignedEmployeeId: '', preferredVisit: 'Anytime today', attachments: [], createdAt: ago(i < 12 ? int(20, 600) : int(1500, 12000)), dueAt: '', rating: null, taskId: '', comments: [], timeline: [] }
  tk.dueAt = new Date(new Date(tk.createdAt).getTime() + { LOW: 72, MEDIUM: 48, HIGH: 24, CRITICAL: 4 }[pri] * 3600000).toISOString()
  const base = new Date(tk.createdAt).getTime(), tl = (m, l) => tk.timeline.push({ at: new Date(base + m * 60000).toISOString(), label: l })
  tl(0, 'Ticket raised')
  tk.comments.push({ id: `c-${i}-1`, by: 'Office', kind: 'office', text: tk.description, at: tk.createdAt })
  if (status !== 'OPEN') {
    const tstat = { ASSIGNED: 'ASSIGNED', IN_PROGRESS: 'IN_PROGRESS', WAITING: 'ON_HOLD', RESOLVED: 'COMPLETED', CLOSED: 'COMPLETED' }[status]
    const t = mkTask({ title: tk.subject, desc: tk.description, cat: TCAT[cat], towerId: o.towerId, floorId: o.floorId, officeId: o.officeId, priority: pri, status: tstat, minsAgo: (Date.now() - base) / 60000 - 5, ticketId: tk.id, verified: status === 'CLOSED' })
    tk.assignedEmployeeId = t.assignedEmployeeId; tk.taskId = t.id
    tl(15, `Assigned to ${staff.find((x) => x.id === t.assignedEmployeeId)?.name}`)
    if (status !== 'ASSIGNED') tl(40, 'Work in progress')
    if (status === 'RESOLVED' || status === 'CLOSED') tl(150, 'Marked resolved')
    if (status === 'CLOSED') { tl(220, 'Office confirmed resolution — ticket closed'); tk.rating = int(3, 5) }
    tk.comments.push({ id: `c-${i}-2`, by: staff.find((x) => x.id === t.assignedEmployeeId)?.name, kind: 'staff', text: 'On it. Will update shortly.', at: new Date(base + 30 * 60000).toISOString() })
  }
  tickets.push(tk)
}
const STITLE = { Electrician: ['Replace corridor lights', 'Inspect UPS room wiring'], Plumber: ['Clear drainage block', 'Fix pantry tap'], Cleaner: ['Deep clean lobby', 'Washroom sanitisation'], Security: ['Night patrol check'], 'HVAC Technician': ['Quarterly AC service'], Carpenter: ['Repair reception desk'], 'IT Support': ['Configure access points'], Maintenance: ['Repaint stairwell'], Gardener: ['Trim podium plants'], 'General Worker': ['Shift storage boxes'], Other: ['Event setup support'] }
const TS2 = ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'ON_HOLD', 'CANCELLED', 'REJECTED']
for (let i = 0; i < 28; i++) {
  const cat = pick(CATS)[0], o = pick(offices), status = TS2[i % TS2.length]
  mkTask({ title: pick(STITLE[cat]), cat, towerId: o.towerId, floorId: o.floorId, officeId: o.id, priority: pick(PRI), status, minsAgo: int(60, 9000), verified: status === 'COMPLETED' && rnd() > 0.25 })
}
{ const ho = hosts[0], of0 = offices.find((o) => o.id === ho.officeId);[0, 1, 2, 3, 6].forEach((i) => { Object.assign(tickets[i], { officeId: of0.id, towerId: of0.towerId, floorId: of0.floorId, reporterId: ho.id }); tasks.filter((t) => t.ticketId === tickets[i].id).forEach((t) => Object.assign(t, { officeId: of0.id, towerId: of0.towerId, floorId: of0.floorId })) }) }
// make Amit (st-001) have visible work
mkTask({ title: 'Fix electricity issue — Office 702', cat: 'Electrician', towerId: 'tw-a', floorId: 'fl-ta-7', officeId: 'of-ta-702', priority: 'HIGH', status: 'ASSIGNED', minsAgo: 15, empId: 'st-001' })
mkTask({ title: 'Replace tube lights — Floor 3 corridor', cat: 'Electrician', towerId: 'tw-a', floorId: 'fl-ta-3', officeId: 'of-ta-301', priority: 'MEDIUM', status: 'IN_PROGRESS', minsAgo: 90, empId: 'st-001' })
// roll up staff status + ratings from tasks
staff.forEach((p) => { const rated = tasks.filter((t) => t.assignedEmployeeId === p.id && t.rating); p.rating = rated.length ? Math.round((rated.reduce((a, t) => a + t.rating.overall, 0) / rated.length) * 10) / 10 : Math.round((3.8 + rnd()) * 10) / 10; if (tasks.some((t) => t.assignedEmployeeId === p.id && ['IN_PROGRESS'].includes(t.status)) && !['ABSENT', 'OFF_DUTY'].includes(p.status)) p.status = 'BUSY' })

// --- notifications, logs
const notifications = [], messages = [], audit = []
const NT = [['Visitor', 'Visitor waiting at Gate 1', 'is waiting to meet you.'], ['Ticket', 'New ticket raised', 'has been raised by an office.'], ['Task', 'Task update', 'status changed.'], ['Approval', 'Approval pending', 'requires your action.'], ['System', 'Daily backup completed', 'All data synced.'], ['Payment', 'Rent received', 'Rent payment received for this month.'], ['Security', 'After-hours access', 'Access card used after 9 PM.']]
for (let i = 0; i < 26; i++) { const [cat, title, body] = NT[i % NT.length]; notifications.push({ id: `nt-${pad(i + 1)}`, userId: i % 3 === 0 ? 'u-admin' : '', roles: ['ADMIN', 'SUPER_ADMIN'], category: cat, title, body: cat === 'Visitor' ? `${visitors[i].name} ${body}` : cat === 'Ticket' ? `${tickets[i].code} ${body}` : body, createdAt: ago(i * 37 + 4), read: i > 5, link: cat === 'Ticket' ? `/tickets/${tickets[i].id}` : cat === 'Visitor' ? `/visitors/${visitors[i].id}` : '' }) }
const MT = ['Visitor approval', 'Ticket assignment', 'Work assignment']
for (let i = 0; i < 24; i++) {
  const ch = i % 3 === 0 ? 'email' : 'whatsapp', v = visitors[i], tk = tickets[i], type = MT[i % 3], h = hostOf(v.hostId)
  const msg = type === 'Visitor approval' ? `Visitor ${v.name} is waiting at ${v.gate} to visit Office ${offices.find((o) => o.id === v.officeId).number}. Please approve or reject.` : type === 'Ticket assignment' ? `New maintenance ticket #${tk.code} has been assigned to you. Priority: ${tk.priority}.` : `New task assigned: ${tasks[i].title}.`
  messages.push({ id: `ms-${pad(i + 1)}`, channel: ch, recipient: type === 'Visitor approval' ? h.name : staff[i % staff.length].name, contact: type === 'Visitor approval' ? (ch === 'email' ? h.email : h.phone) : (ch === 'email' ? staff[i % staff.length].email : staff[i % staff.length].phone), subject: ch === 'email' ? type : '', message: msg, type, status: pick(['SENT', 'DELIVERED', 'READ', 'READ', 'READ', 'FAILED']), sentAt: ago(i * 55 + 8), related: type === 'Visitor approval' ? v.id : type === 'Ticket assignment' ? tk.id : tasks[i].id, relatedLabel: type === 'Visitor approval' ? v.name : type === 'Ticket assignment' ? tk.code : tasks[i].code })
}
const AC = [['Admin', 'assigned Ticket #TK-1024 to Amit', 'Tickets', 'TK-1024'], ['Admin', 'changed Office 1004 status', 'Offices', 'Office 1004'], ['Supervisor', 'rated task #TASK-102', 'Tasks', 'TASK-102'], ['Guard', 'allowed entry for a visitor', 'Visitors', 'Visitor'], ['Admin', 'added tenant Nova Cybersecurity', 'Tenants', 'Nova Cybersecurity'], ['Admin', 'updated rent for Office 502', 'Offices', 'Office 502']]
for (let i = 0; i < 24; i++) { const a = AC[i % AC.length]; audit.push({ id: `au-${pad(i + 1)}`, user: a[0], action: a[1], module: a[2], entity: a[3], timestamp: ago(i * 71 + 12), ip: `192.168.1.${int(10, 90)}`, device: pick(['Chrome · Windows', 'Safari · iPad', 'Chrome · Android', 'Edge · Windows']) }) }

// --- assets & maintenance
const AS = [['Generator', 'Basement 1'], ['Lift 1', 'Tower A'], ['Lift 2', 'Tower A'], ['Lift 3', 'Tower B'], ['Chiller Unit', 'Terrace'], ['Fire Extinguisher Bank', 'Floor 1'], ['CCTV Main DVR', 'Control Room'], ['Electrical Panel LT-1', 'Basement 1'], ['Water Pump 1', 'Basement 2'], ['Water Pump 2', 'Basement 2'], ['AC Plant Tower B', 'Terrace'], ['UPS Rack', 'Control Room']]
const assets = AS.map(([n, loc], i) => ({ id: `as-${pad(i + 1, 2)}`, assetCode: `AST-${pad(i + 1)}`, name: n, category: n.split(' ')[0].replace(/\d/g, '').trim() === 'Lift' ? 'Lift' : n.includes('Pump') ? 'Water Pump' : n.includes('CCTV') ? 'CCTV' : n.includes('Fire') ? 'Fire Extinguisher' : n.includes('Panel') ? 'Electrical Panel' : n.includes('AC') || n.includes('Chiller') ? 'AC' : n.includes('Generator') ? 'Generator' : 'Other', location: loc, purchaseDate: day(-int(300, 2500)), warrantyEnd: day(int(-200, 700)), lastService: day(-int(5, 90)), nextService: day(int(-5, 80)), status: pick(['Operational', 'Operational', 'Operational', 'Needs Service', 'Under Repair']) }))
const maintenance = [['Lift maintenance', 'Monthly'], ['Generator load test', 'Monthly'], ['Fire extinguisher audit', 'Quarterly'], ['AC filter cleaning', 'Quarterly'], ['Water tank cleaning', 'Half-yearly'], ['Electrical panel thermography', 'Yearly'], ['CCTV health check', 'Monthly'], ['Pest control', 'Quarterly']].map(([n, f], i) => ({ id: `mt-${pad(i + 1, 2)}`, title: n, frequency: f, assetId: assets[i % assets.length].id, nextDue: day(int(-3, 60)), status: 'Upcoming' }))
const documents = [['Lease Agreement — ABC Technologies', 'Lease', 'Tenant', 'tn-01'], ['ID Proof — Amit Sharma', 'ID Proof', 'Staff', 'st-001'], ['Invoice INV-2201', 'Invoice', 'Tenant', 'tn-02'], ['Lift AMC Contract', 'Maintenance document', 'Asset', 'as-02'], ['Completion proof — TASK-103', 'Completion proof', 'Ticket', 'tkt-003']].map(([title, type, entity, entityId], i) => ({ id: `dc-${i + 1}`, title, type, entity, entityId, uploadedBy: 'Admin', uploadedAt: ago(i * 1000 + 100), fileName: title.replace(/[^a-z0-9]+/gi, '_') + '.pdf', size: '240 KB' }))
const settings = { id: 'settings', seedAt: new Date(NOW).toISOString(), productName: 'TowerFlow', subtitle: 'Smart Building Management', visitor: { autoRejectMinutes: 15, requirePhoto: true, requireId: true }, notifications: { whatsapp: true, email: true, inApp: true, types: { visitor: true, ticket: true, task: true, payment: false } }, whatsapp: { number: '+91 98100 55000', provider: 'Meta Cloud API (simulated)', apiStatus: 'Connected', templates: { visitor: 'Visitor {{visitorName}} is waiting at {{gate}} to visit {{office}}. Please approve or reject.', ticket: 'New maintenance ticket #{{ticket}} has been assigned to you. Priority: {{priority}}.', task: 'New task assigned: {{task}}.' } }, email: { provider: 'SMTP (simulated)', host: 'smtp.towerflow.in', status: 'Connected' }, emergencyContacts: [{ label: 'Fire Brigade', number: '101' }, { label: 'Ambulance', number: '102' }, { label: 'Police', number: '100' }, { label: 'Building Control Room', number: '+91 120 4001 000' }, { label: 'Lift AMC Vendor', number: '+91 98100 33777' }] }
const roles = ['SUPER_ADMIN', 'ADMIN', 'SUPERVISOR', 'SECURITY_GUARD', 'OFFICE_ADMIN', 'OFFICE_EMPLOYEE', 'STAFF'].map((r) => ({ id: r, name: r.replace('_', ' ') }))

fs.mkdirSync(out, { recursive: true })
write('buildings', buildings); write('towers', towers); write('floors', floors); write('offices', offices); write('tenants', tenants)
write('employees', people); write('officeEmployees', hosts); write('visitors', visitors); write('tickets', tickets); write('tasks', tasks)
write('notifications', notifications); write('messages', messages); write('auditLogs', audit); write('assets', assets); write('maintenance', maintenance)
write('documents', documents); write('users', users); write('roles', roles); write('settings', [settings])
console.log({ towers: towers.length, floors: floors.length, offices: offices.length, tenants: tenants.length, staff: people.length, hosts: hosts.length, visitors: visitors.length, tickets: tickets.length, tasks: tasks.length })
