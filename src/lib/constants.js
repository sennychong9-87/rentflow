export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    limits: { units: 3, tenants: 3, documents: 5 },
    features: ['Up to 3 units', 'Maintenance tickets', 'Tenant portal', '5 document uploads'],
  },
  pro: {
    name: 'Pro',
    price: 29,
    limits: { units: 20, tenants: 20, documents: 100 },
    features: ['Up to 20 units', 'Rent ledger', 'Unlimited tickets', '100 document uploads', 'Messaging', 'Lease tracking'],
  },
  growth: {
    name: 'Growth',
    price: 49,
    limits: { units: Infinity, tenants: Infinity, documents: Infinity },
    features: ['Unlimited units', 'Everything in Pro', 'Unlimited documents', 'Priority support', 'Analytics'],
  },
}

export const MAINTENANCE_CATEGORIES = [
  { value: 'plumbing',    label: 'Plumbing' },
  { value: 'electrical',  label: 'Electrical' },
  { value: 'hvac',        label: 'HVAC / Heating & Cooling' },
  { value: 'appliance',   label: 'Appliance' },
  { value: 'structural',  label: 'Structural / Building' },
  { value: 'pest',        label: 'Pest Control' },
  { value: 'general',     label: 'General Maintenance' },
  { value: 'other',       label: 'Other' },
]

export const MAINTENANCE_PRIORITIES = [
  { value: 'emergency', label: '🚨 Emergency', description: 'Safety risk, needs immediate attention' },
  { value: 'high',      label: 'High',         description: 'Significantly impacts habitability' },
  { value: 'medium',    label: 'Medium',        description: 'Needs attention within a week' },
  { value: 'low',       label: 'Low',           description: 'Minor issue, can wait' },
]

export const DOCUMENT_CATEGORIES = [
  { value: 'lease',       label: 'Lease Agreement' },
  { value: 'notice',      label: 'Notice / Letter' },
  { value: 'inspection',  label: 'Inspection Report' },
  { value: 'photo',       label: 'Property Photo' },
  { value: 'receipt',     label: 'Receipt / Invoice' },
  { value: 'other',       label: 'Other' },
]

export const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cash',          label: 'Cash' },
  { value: 'check',         label: 'Check' },
  { value: 'online',        label: 'Online Payment' },
  { value: 'other',         label: 'Other' },
]

export const PROPERTY_TYPES = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'mixed', label: 'Mixed use' },
  { value: 'hmo', label: 'HMO / House Share' },
]

export const NAV_ITEMS = [
  { path: '/dashboard',            label: 'Dashboard',    icon: 'LayoutDashboard' },
  { path: '/dashboard/properties', label: 'Properties',   icon: 'Building2' },
  { path: '/dashboard/tenants',    label: 'Tenants',      icon: 'Users' },
  { path: '/dashboard/rent',       label: 'Rent Ledger',  icon: 'DollarSign' },
  { path: '/dashboard/maintenance',label: 'Maintenance',  icon: 'Wrench' },
  { path: '/dashboard/messages',   label: 'Messages',     icon: 'MessageSquare' },
  { path: '/dashboard/documents',  label: 'Documents',    icon: 'FileText' },
  { path: '/dashboard/activity',   label: 'Activity Log', icon: 'Activity' },
  { path: '/dashboard/settings',   label: 'Settings',     icon: 'Settings' },
]
