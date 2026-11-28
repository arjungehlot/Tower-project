import { Navigate, createBrowserRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import AppLayout from '@/layouts/AppLayout'
import GuardLayout from '@/layouts/GuardLayout'
import { useMe } from '@/hooks/useMe'
import { HOME } from '@/utils/permissions'
import type { Role } from '@/types'
import Login from '@/pages/auth/Login'
import { NotFound, Unauthorized } from '@/pages/auth/Fallbacks'
import Dashboard from '@/pages/dashboard/Dashboard'
import OwnerDashboard from '@/pages/dashboard/OwnerDashboard'
import OfficeDashboard from '@/pages/dashboard/OfficeDashboard'
import StaffDashboard from '@/pages/dashboard/StaffDashboard'
import GuardHome from '@/pages/guard/GuardHome'
import Towers from '@/pages/buildings/Towers'
import Tower3DPage from '@/pages/buildings/Tower3DPage'
import { Floors, FloorDetail } from '@/pages/buildings/Floors'
import Offices from '@/pages/buildings/Offices'
import OfficeDetail from '@/pages/buildings/OfficeDetail'
import Tenants from '@/pages/buildings/Tenants'
import TenantDetail from '@/pages/buildings/TenantDetail'
import Leases from '@/pages/buildings/Leases'
import VisitorList from '@/pages/visitors/VisitorList'
import VisitorDetail from '@/pages/visitors/VisitorDetail'
import VisitorRegister from '@/pages/visitors/VisitorRegister'
import LiveVisitors from '@/pages/visitors/LiveVisitors'
import StaffList from '@/pages/staff/StaffList'
import StaffDetail from '@/pages/staff/StaffDetail'
import Availability from '@/pages/staff/Availability'
import TaskList from '@/pages/tasks/TaskList'
import TaskDetail from '@/pages/tasks/TaskDetail'
import WorkTracking from '@/pages/tasks/WorkTracking'
import Ratings from '@/pages/tasks/Ratings'
import TicketList from '@/pages/tickets/TicketList'
import TicketDetail from '@/pages/tickets/TicketDetail'
import TicketAnalytics from '@/pages/tickets/TicketAnalytics'
import Notifications from '@/pages/comms/Notifications'
import MessageLog from '@/pages/comms/MessageLog'
import Reports from '@/pages/reports/Reports'
import Analytics from '@/pages/reports/Analytics'
import Users from '@/pages/admin/Users'
import Roles from '@/pages/admin/Roles'
import Settings from '@/pages/admin/Settings'
import AuditLogs from '@/pages/admin/AuditLogs'
import Profile from '@/pages/admin/Profile'
import Emergency from '@/pages/ops/Emergency'
import { Assets, MaintenanceSchedule, Documents } from '@/pages/ops/Facility'

const ADM: Role[] = ['SUPER_ADMIN', 'ADMIN'], SUP: Role[] = ['SUPERVISOR'], OFF: Role[] = ['OFFICE_ADMIN', 'OFFICE_EMPLOYEE'], OWN: Role[] = ['OWNER'], STF: Role[] = ['STAFF'], GRD: Role[] = ['SECURITY_GUARD']
/** Redirects unauthenticated users and blocks roles that may not see a route. */
function Guard({ roles, children }: { roles?: Role[]; children: ReactNode }) {
  const { me } = useMe()
  if (!me) return <Navigate to="/login" replace />
  if (roles && !roles.includes(me.role)) return <Unauthorized />
  return <>{children}</>
}
const g = (roles: Role[], el: ReactNode) => <Guard roles={roles}>{el}</Guard>
function Home() { const { me } = useMe(); return <Navigate to={me ? HOME[me.role] : '/login'} replace /> }
function Shell({ roles, layout }: { roles: Role[]; layout: ReactNode }) { return <Guard roles={roles}>{layout}</Guard> }

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/', element: <Home /> },
  { element: <Shell roles={GRD} layout={<GuardLayout />} />, children: [{ path: '/guard', element: <GuardHome /> }, { path: '/guard/register', element: <VisitorRegister /> }, { path: '/guard/emergency', element: <Emergency /> }] },
  { element: <Shell roles={[...ADM, ...SUP, ...OFF, ...OWN, ...STF]} layout={<AppLayout />} />, children: [
    { path: '/dashboard', element: g([...ADM, ...SUP], <Dashboard />) }, { path: '/office', element: g(OFF, <OfficeDashboard />) }, { path: '/owner', element: g(OWN, <OwnerDashboard />) }, { path: '/my-work', element: g(STF, <StaffDashboard />) },
    { path: '/towers', element: g(ADM, <Towers />) }, { path: '/tower-3d', element: g([...ADM, ...SUP], <Tower3DPage />) }, { path: '/floors', element: g(ADM, <Floors />) }, { path: '/floors/:id', element: g(ADM, <FloorDetail />) },
    { path: '/offices', element: g([...ADM, ...SUP], <Offices />) }, { path: '/offices/:id', element: g([...ADM, ...SUP, ...OFF, ...OWN], <OfficeDetail />) },
    { path: '/tenants', element: g(ADM, <Tenants />) }, { path: '/tenants/:id', element: g(ADM, <TenantDetail />) }, { path: '/leases', element: g(ADM, <Leases />) },
    { path: '/visitors', element: g([...ADM, ...SUP, ...OFF], <VisitorList />) }, { path: '/visitors/gate', element: g(ADM, <VisitorList mode="gate" />) }, { path: '/visitors/history', element: g(ADM, <VisitorList mode="history" />) },
    { path: '/visitors/live', element: g([...ADM, ...SUP], <LiveVisitors />) }, { path: '/visitors/:id', element: g([...ADM, ...SUP, ...OFF], <VisitorDetail />) }, { path: '/visitor/register', element: g([...ADM, ...OFF], <VisitorRegister />) },
    { path: '/staff', element: g([...ADM, ...SUP], <StaffList />) }, { path: '/staff/availability', element: g([...ADM, ...SUP], <Availability />) }, { path: '/staff/:id', element: g([...ADM, ...SUP], <StaffDetail />) }, { path: '/supervisors', element: g(ADM, <StaffList supervisorsOnly />) },
    { path: '/tasks', element: g([...ADM, ...SUP, ...STF], <TaskList />) }, { path: '/tasks/tracking', element: g([...ADM, ...SUP], <WorkTracking />) }, { path: '/tasks/:id', element: g([...ADM, ...SUP, ...STF], <TaskDetail />) }, { path: '/ratings', element: g([...ADM, ...SUP], <Ratings />) },
    { path: '/tickets', element: g([...ADM, ...SUP, ...STF], <TicketList />) }, { path: '/tickets/mine', element: g([...OFF, ...OWN], <TicketList mine />) }, { path: '/tickets/analytics', element: g([...ADM, ...SUP], <TicketAnalytics />) }, { path: '/tickets/:id', element: g([...ADM, ...SUP, ...OFF, ...OWN, ...STF], <TicketDetail />) },
    { path: '/notifications', element: <Notifications /> }, { path: '/whatsapp', element: g(ADM, <MessageLog channel="whatsapp" />) }, { path: '/emails', element: g(ADM, <MessageLog channel="email" />) },
    { path: '/reports', element: g([...ADM, ...SUP], <Reports />) }, { path: '/analytics', element: g(ADM, <Analytics />) },
    { path: '/assets', element: g(ADM, <Assets />) }, { path: '/maintenance', element: g(ADM, <MaintenanceSchedule />) }, { path: '/documents', element: g(ADM, <Documents />) }, { path: '/emergency', element: g([...ADM, ...SUP], <Emergency />) },
    { path: '/users', element: g(ADM, <Users />) }, { path: '/roles', element: g(ADM, <Roles />) }, { path: '/settings', element: g(ADM, <Settings />) }, { path: '/audit-logs', element: g(ADM, <AuditLogs />) }, { path: '/profile', element: <Profile /> },
  ] },
  { path: '*', element: <NotFound /> },
])
