import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { useAuthStore } from '@/store/authStore'

// Layouts
import PublicLayout from '@/components/layout/PublicLayout'
import DashboardLayout from '@/components/layout/DashboardLayout'

// Public pages
import Landing from '@/pages/public/Landing'
import Pricing from '@/pages/public/Pricing'
import Login from '@/pages/public/Login'
import Register from '@/pages/public/Register'
import TenantPortal from '@/pages/public/TenantPortal'

// Dashboard pages
import Dashboard from '@/pages/dashboard/Dashboard'
import Properties from '@/pages/dashboard/Properties'
import Tenants from '@/pages/dashboard/Tenants'
import TenantDetail from '@/pages/dashboard/TenantDetail'
import Maintenance from '@/pages/dashboard/Maintenance'
import RentLedger from '@/pages/dashboard/RentLedger'
import Documents from '@/pages/dashboard/Documents'
import Messages from '@/pages/dashboard/Messages'
import Settings from '@/pages/dashboard/Settings'
import ActivityLog from '@/pages/dashboard/ActivityLog'

// Loading screen
import LoadingSpinner from '@/components/shared/LoadingSpinner'

// Auth guard
function PrivateRoute({ children }) {
  const { user, initialized } = useAuthStore()
  if (!initialized) return <LoadingSpinner fullScreen />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function PublicOnlyRoute({ children }) {
  const { user, initialized } = useAuthStore()
  if (!initialized) return <LoadingSpinner fullScreen />
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  const initialize = useAuthStore(s => s.initialize)

  useEffect(() => {
    initialize()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={
            <PublicOnlyRoute><Login /></PublicOnlyRoute>
          } />
          <Route path="/register" element={
            <PublicOnlyRoute><Register /></PublicOnlyRoute>
          } />
        </Route>

        {/* Tenant portal — no auth, unique token URL */}
        <Route path="/portal/:token" element={<TenantPortal />} />

        {/* Protected dashboard routes */}
        <Route path="/dashboard" element={
          <PrivateRoute><DashboardLayout /></PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="properties" element={<Properties />} />
          <Route path="tenants" element={<Tenants />} />
          <Route path="tenants/:id" element={<TenantDetail />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="rent" element={<RentLedger />} />
          <Route path="documents" element={<Documents />} />
          <Route path="messages" element={<Messages />} />
          <Route path="activity" element={<ActivityLog />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Analytics />
    </BrowserRouter>
  )
}
