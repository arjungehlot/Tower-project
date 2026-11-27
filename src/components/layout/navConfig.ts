// Sidebar trimmed for the current demo: commented entries stay routed, just hidden. Uncomment to restore.
/* eslint-disable @typescript-eslint/no-unused-vars */
import { LayoutDashboard, Building2, Layers, DoorOpen, Building, FileText, UserRoundCheck, ScanLine, Radio, History, Users, UserCog, ClipboardList, MapPinned, Star, Ticket, TicketCheck, UserPlus, BarChart3, Bell, MessageCircle, Mail, FileBarChart, Shield, Settings, ScrollText, Siren, Wrench, CalendarClock, Files, ShieldCheck, Activity, Boxes, type LucideIcon } from 'lucide-react'
import type { Role } from '@/types'
const ADM: Role[] = ['SUPER_ADMIN', 'ADMIN'], SUP: Role[] = ['SUPERVISOR'], OFF: Role[] = ['OFFICE_ADMIN', 'OFFICE_EMPLOYEE'], STF: Role[] = ['STAFF'], GRD: Role[] = ['SECURITY_GUARD']
export interface NavItem { label: string; to: string; icon: LucideIcon; roles: Role[]; end?: boolean }
export interface NavSection { title: string; items: NavItem[] }
export const NAV: NavSection[] = [
  { title: 'Overview', items: [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, roles: [...ADM, ...SUP] },
    { label: 'Office Dashboard', to: '/office', icon: LayoutDashboard, roles: OFF },
    { label: 'My Work', to: '/my-work', icon: ClipboardList, roles: STF },
  ] },
  { title: 'Building', items: [
    { label: '3D Tower View', to: '/tower-3d', icon: Boxes, roles: [...ADM, ...SUP] },
    { label: 'Towers', to: '/towers', icon: Building2, roles: ADM },
    { label: 'Floors', to: '/floors', icon: Layers, roles: ADM },
    { label: 'Offices', to: '/offices', icon: DoorOpen, roles: [...ADM, ...SUP] },
    { label: 'Tenants / Companies', to: '/tenants', icon: Building, roles: ADM },
    { label: 'Lease Management', to: '/leases', icon: FileText, roles: ADM },
  ] },
  { title: 'Security', items: [
    { label: 'Visitor Management', to: '/visitors', icon: UserRoundCheck, roles: [...ADM, ...OFF, ...SUP], end: true },
    { label: 'Register Visitor', to: '/visitor/register', icon: UserPlus, roles: ADM },
    { label: 'Invite Visitor', to: '/visitor/register', icon: UserPlus, roles: OFF },
    { label: 'Live Visitors', to: '/visitors/live', icon: Radio, roles: [...ADM, ...SUP] },
    { label: 'Gate Entries', to: '/visitors/gate', icon: ScanLine, roles: ADM },
    { label: 'Visitor History', to: '/visitors/history', icon: History, roles: ADM },
  ] },
  { title: 'Operations', items: [
    { label: 'Staff Management', to: '/staff', icon: Users, roles: [...ADM, ...SUP], end: true },
    { label: 'Staff Availability', to: '/staff/availability', icon: Activity, roles: [...ADM, ...SUP] },
    { label: 'Supervisors', to: '/supervisors', icon: UserCog, roles: ADM },
    { label: 'Work Assignments', to: '/tasks', icon: ClipboardList, roles: [...ADM, ...SUP, ...STF], end: true },
    { label: 'Work Tracking', to: '/tasks/tracking', icon: MapPinned, roles: [...ADM, ...SUP] },
    { label: 'Ratings & Performance', to: '/ratings', icon: Star, roles: [...ADM, ...SUP] },
  ] },
  { title: 'Service Desk', items: [
    { label: 'Tickets', to: '/tickets', icon: Ticket, roles: [...ADM, ...SUP], end: true },
    { label: 'My Tickets', to: '/tickets/mine', icon: TicketCheck, roles: OFF },
    { label: 'Ticket Analytics', to: '/tickets/analytics', icon: BarChart3, roles: [...ADM, ...SUP] },
  ] },
  { title: 'Communication', items: [
    { label: 'Notifications', to: '/notifications', icon: Bell, roles: [...ADM, ...SUP, ...OFF, ...STF] },
    { label: 'WhatsApp', to: '/whatsapp', icon: MessageCircle, roles: ADM },
    { label: 'Email Logs', to: '/emails', icon: Mail, roles: ADM },
  ] },
  { title: 'Reports', items: [
    { label: 'Reports', to: '/reports', icon: FileBarChart, roles: [...ADM, ...SUP] },
    { label: 'Analytics', to: '/analytics', icon: BarChart3, roles: ADM },
  ] },
  { title: 'Facility', items: [
    { label: 'Assets', to: '/assets', icon: Wrench, roles: ADM },
    { label: 'Maintenance', to: '/maintenance', icon: CalendarClock, roles: ADM },
    { label: 'Documents', to: '/documents', icon: Files, roles: ADM },
    { label: 'Emergency', to: '/emergency', icon: Siren, roles: [...ADM, ...SUP] },
  ] },
  { title: 'Administration', items: [
    { label: 'Users & Roles', to: '/users', icon: Users, roles: ADM },
    { label: 'Permissions', to: '/roles', icon: Shield, roles: ADM },
    { label: 'Settings', to: '/settings', icon: Settings, roles: ADM },
    { label: 'Audit Logs', to: '/audit-logs', icon: ScrollText, roles: ADM },
  ] },
]
export const navFor = (role: Role): NavSection[] => NAV.map((s) => ({ ...s, items: s.items.filter((i) => i.roles.includes(role)) })).filter((s) => s.items.length)
export const GUARD_ICON = ShieldCheck
export const GUARD_ROLES = GRD
