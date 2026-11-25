export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'SUPERVISOR' | 'SECURITY_GUARD' | 'OFFICE_ADMIN' | 'OFFICE_EMPLOYEE' | 'STAFF'
export interface Building { id: string; name: string; city: string; towerIds: string[]; capacity: number }
export interface Tower { id: string; name: string; code: string; address: string; floors: number; totalOffices: number; managementContact: string; securityDesk: string; emergencyContact: string }
export interface Floor { id: string; towerId: string; number: number; name: string }
export type OfficeStatus = 'Occupied' | 'Vacant' | 'Reserved' | 'Under Maintenance'
export interface Office { id: string; number: string; towerId: string; floorId: string; area: number; type: string; status: OfficeStatus; tenantId: string; ownerName: string; contactPerson: string; contactNumber: string; email: string; leaseStart: string; leaseEnd: string; rent: number; deposit: number; maintenanceCharge: number; notes: string }
export interface Tenant { id: string; name: string; industry: string; contactPerson: string; phone: string; email: string; gst: string; leaseStatus: string; officeCount: number; color: string }
export type StaffStatus = 'AVAILABLE' | 'BUSY' | 'ON_BREAK' | 'OFF_DUTY' | 'ABSENT'
export interface Employee { id: string; empId: string; name: string; role: 'staff' | 'supervisor'; category: string; phone: string; email: string; supervisorId: string; joiningDate: string; skills: string[]; shift: string; location: string; status: StaffStatus; employment: string; attendance: number; rating: number; photo?: string }
export interface OfficeEmployee { id: string; name: string; officeId: string; designation: string; phone: string; email: string }
export interface User { id: string; name: string; email: string; password: string; role: Role; refId: string; phone: string }
export interface TimelineItem { at: string; label: string }
export type VisitorStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'INSIDE' | 'EXITED' | 'INFO_REQUESTED'
export interface Visitor { id: string; name: string; mobile: string; email: string; photo: string; idType: string; idNumber: string; purpose: string; towerId: string; floorId: string; officeId: string; hostId: string; expectedDuration: string; count: number; status: VisitorStatus; guardId: string; gate: string; requestedAt: string; approvedAt: string; entryAt: string; exitAt: string; remark: string; timeline: TimelineItem[] }
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type TicketStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED' | 'CLOSED'
export interface Comment { id: string; by: string; kind: 'admin' | 'staff' | 'office' | 'internal'; text: string; at: string }
export interface Ticket { id: string; code: string; subject: string; description: string; category: string; priority: Priority; status: TicketStatus; towerId: string; floorId: string; officeId: string; reporterId: string; assignedEmployeeId: string; preferredVisit: string; attachments: string[]; createdAt: string; dueAt: string; rating: number | null; taskId: string; comments: Comment[]; timeline: TimelineItem[] }
export type TaskStatus = 'ASSIGNED' | 'ACCEPTED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'REJECTED' | 'CANCELLED'
export interface Rating { quality: number; speed: number; professionalism: number; cleanliness: number; overall: number; comment: string }
export interface Task { id: string; code: string; title: string; description: string; category: string; towerId: string; floorId: string; officeId: string; locationNote: string; priority: Priority; assignedEmployeeId: string; supervisorId: string; ticketId: string; createdBy: string; createdAt: string; deadline: string; status: TaskStatus; progress: number; startedAt: string; completedAt: string; verifiedAt: string; verifiedBy: string; rating: Rating | null; proof: string; notes: string; comments: Comment[]; timeline: TimelineItem[]; attachments?: string[] }
export interface Notification { id: string; userId: string; roles: Role[]; category: string; title: string; body: string; createdAt: string; read: boolean; link: string; officeId?: string }
export interface MessageLog { id: string; channel: 'whatsapp' | 'email'; recipient: string; contact: string; subject: string; message: string; type: string; status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED'; sentAt: string; related: string; relatedLabel: string }
export interface AuditLog { id: string; user: string; action: string; module: string; entity: string; timestamp: string; ip: string; device: string }
export interface Asset { id: string; assetCode: string; name: string; category: string; location: string; purchaseDate: string; warrantyEnd: string; lastService: string; nextService: string; status: string }
export interface Maintenance { id: string; title: string; frequency: string; assetId: string; nextDue: string; status: string }
export interface DocumentRec { id: string; title: string; type: string; entity: string; entityId: string; uploadedBy: string; uploadedAt: string; fileName: string; size: string }
export interface Settings { id: string; seedAt: string; productName: string; subtitle: string; visitor: { autoRejectMinutes: number; requirePhoto: boolean; requireId: boolean }; notifications: { whatsapp: boolean; email: boolean; inApp: boolean; types: Record<string, boolean> }; whatsapp: { number: string; provider: string; apiStatus: string; templates: Record<string, string> }; email: { provider: string; host: string; status: string }; emergencyContacts: { label: string; number: string }[] }
export interface Db {
  buildings: Building[]; towers: Tower[]; floors: Floor[]; offices: Office[]; tenants: Tenant[]; employees: Employee[]; officeEmployees: OfficeEmployee[]
  visitors: Visitor[]; tickets: Ticket[]; tasks: Task[]; notifications: Notification[]; messages: MessageLog[]; auditLogs: AuditLog[]
  assets: Asset[]; maintenance: Maintenance[]; documents: DocumentRec[]; users: User[]; roles: { id: string; name: string }[]; settings: Settings[]
}
export type Coll = keyof Db
