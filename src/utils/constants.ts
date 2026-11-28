export const BRAND = { name: 'TowerFlow', subtitle: 'Smart Building Management' }
export const STAFF_CATEGORIES = ['Electrician', 'Plumber', 'Cleaner', 'Security', 'HVAC Technician', 'Carpenter', 'IT Support', 'Maintenance', 'Gardener', 'General Worker', 'Other']
export const TICKET_CATEGORIES = ['Electrical', 'Plumbing', 'Cleaning', 'HVAC', 'Internet', 'Security', 'Maintenance', 'Lift', 'Fire Safety', 'General']
export const TICKET_TO_STAFF: Record<string, string> = { Electrical: 'Electrician', Plumbing: 'Plumber', Cleaning: 'Cleaner', HVAC: 'HVAC Technician', Internet: 'IT Support', Security: 'Security', Maintenance: 'Maintenance', Lift: 'Maintenance', 'Fire Safety': 'Maintenance', General: 'General Worker' }
export const STAFF_TO_TICKET: Record<string, string> = { Electrician: 'Electrical', Plumber: 'Plumbing', Cleaner: 'Cleaning', 'HVAC Technician': 'HVAC', 'IT Support': 'Internet', Security: 'Security', Maintenance: 'Maintenance', 'General Worker': 'General' }
export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
export const PURPOSES = ['Meeting', 'Interview', 'Delivery', 'Maintenance', 'Personal', 'Other']
export const ID_TYPES = ['Aadhaar', 'Driving License', 'PAN', 'Passport', 'Voter ID']
export const SHIFTS = ['Morning', 'General', 'Evening', 'Night']
export const OFFICE_STATUSES = ['Occupied', 'Vacant', 'Reserved', 'Under Maintenance']
export const OFFICE_TYPES = ['Open Plan', 'Cabin Suite', 'Executive', 'Co-working']
export const ASSET_CATEGORIES = ['Generator', 'Lift', 'AC', 'Fire Extinguisher', 'CCTV', 'Electrical Panel', 'Water Pump', 'Other']
export const CHART = ['#4f46e5', '#0891b2', '#16a34a', '#d97706', '#9333ea', '#dc2626', '#0d9488', '#64748b']
export const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: 'Super Admin', ADMIN: 'Admin', SUPERVISOR: 'Supervisor', SECURITY_GUARD: 'Security Guard', OFFICE_ADMIN: 'Office Admin', OFFICE_EMPLOYEE: 'Office Employee', OWNER: 'Office Owner', STAFF: 'Staff' }
export const currency = (n: number) => '₹' + n.toLocaleString('en-IN')
