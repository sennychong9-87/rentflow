import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isAfter, isBefore, addDays } from 'date-fns'

// Tailwind class merging
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Currency formatting
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount ?? 0)
}

// Date formatting
export function formatDate(date, fmt = 'MMM d, yyyy') {
  if (!date) return '—'
  return format(new Date(date), fmt)
}

export function formatRelative(date) {
  if (!date) return '—'
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

// Rent status helpers
export function getRentStatus(ledgerEntry) {
  if (!ledgerEntry) return 'pending'
  if (ledgerEntry.rent_paid >= ledgerEntry.rent_due) return 'paid'
  if (ledgerEntry.rent_paid > 0) return 'partial'
  const dueDate = new Date(ledgerEntry.period_year, ledgerEntry.period_month - 1, 1)
  if (isAfter(new Date(), addDays(dueDate, 5))) return 'late'
  return 'pending'
}

export const RENT_STATUS_STYLES = {
  paid:    'badge-green',
  partial: 'badge-yellow',
  late:    'badge-red',
  pending: 'badge-slate',
  waived:  'badge-blue',
}

export const RENT_STATUS_LABELS = {
  paid:    'Paid',
  partial: 'Partial',
  late:    'Late',
  pending: 'Pending',
  waived:  'Waived',
}

// Maintenance priority styles
export const PRIORITY_STYLES = {
  emergency: 'badge-red',
  high:      'badge-red',
  medium:    'badge-yellow',
  low:       'badge-slate',
}

export const PRIORITY_LABELS = {
  emergency: '🚨 Emergency',
  high:      'High',
  medium:    'Medium',
  low:       'Low',
}

// Ticket status styles
export const TICKET_STATUS_STYLES = {
  open:        'badge-blue',
  in_progress: 'badge-yellow',
  resolved:    'badge-green',
  closed:      'badge-slate',
}

// Tenant status styles
export const TENANT_STATUS_STYLES = {
  active:   'badge-green',
  vacating: 'badge-yellow',
  vacated:  'badge-slate',
}

// Unit status styles
export const UNIT_STATUS_STYLES = {
  occupied:    'badge-green',
  vacant:      'badge-slate',
  maintenance: 'badge-yellow',
}

// Get initials from name
export function getInitials(name = '') {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Tenant portal URL
export function getPortalUrl(token) {
  return `${import.meta.env.VITE_APP_URL}/portal/${token}`
}

// Truncate text
export function truncate(str, maxLength = 60) {
  if (!str) return ''
  return str.length > maxLength ? str.slice(0, maxLength) + '…' : str
}

// Month name
export function getMonthName(month) {
  return format(new Date(2024, month - 1, 1), 'MMMM')
}

// Current period
export function getCurrentPeriod() {
  const now = new Date()
  return { month: now.getMonth() + 1, year: now.getFullYear() }
}
