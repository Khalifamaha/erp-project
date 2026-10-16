import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './hooks/useAuth'

// Layouts
import AppLayout from './components/layout/AppLayout'

// Auth
import Login from './pages/auth/Login'

// Pages
import Dashboard        from './pages/Dashboard'
import Employees        from './pages/hr/Employees'
import Attendance       from './pages/hr/Attendance'
import Payroll          from './pages/hr/Payroll'
import Products         from './pages/inventory/Products'
import StockMovements   from './pages/inventory/StockMovements'
import PurchaseOrders   from './pages/procurement/PurchaseOrders'
import Suppliers        from './pages/procurement/Suppliers'
import Orders           from './pages/production/Orders'
import Machines         from './pages/production/Machines'
import ProductionLine   from './pages/production/ProductionLine'
import Clients          from './pages/commercial/Clients'
import Commandes        from './pages/commercial/Commandes'
import Expeditions      from './pages/commercial/Expeditions'
import Breakdowns       from './pages/gmo/Breakdowns'
import PreventiveMaint  from './pages/gmo/PreventiveMaintenance'
import Controls         from './pages/quality/Controls'
import NCReports        from './pages/quality/NCReports'
import Planning         from './pages/planning/Planning'
import Journal          from './pages/comptabilite/Journal'
import BalanceSheet     from './pages/comptabilite/BalanceSheet'

// Guards
function PrivateRoute({ children }) {
  const { isAuthenticated, loadUser, user } = useAuth()
  useEffect(() => {
    if (isAuthenticated && !user) loadUser()
  }, [isAuthenticated, user, loadUser])
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function ModuleRoute({ module, children }) {
  const { hasAccess } = useAuth()
  if (!hasAccess(module)) return <Navigate to="/dashboard" replace />
  return children
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

        {/* Protected */}
        <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* RH */}
          <Route path="hr">
            <Route index element={<ModuleRoute module="hr"><Employees /></ModuleRoute>} />
            <Route path="attendance" element={<ModuleRoute module="hr"><Attendance /></ModuleRoute>} />
            <Route path="payroll"    element={<ModuleRoute module="hr"><Payroll /></ModuleRoute>} />
          </Route>

          {/* Inventory */}
          <Route path="inventory">
            <Route index element={<ModuleRoute module="inventory"><Products /></ModuleRoute>} />
            <Route path="movements" element={<ModuleRoute module="inventory"><StockMovements /></ModuleRoute>} />
          </Route>

          {/* Procurement */}
          <Route path="procurement">
            <Route index element={<ModuleRoute module="procurement"><Suppliers /></ModuleRoute>} />
            <Route path="orders" element={<ModuleRoute module="procurement"><PurchaseOrders /></ModuleRoute>} />
          </Route>

          {/* Production */}
          <Route path="production">
            <Route index element={<ModuleRoute module="production"><Orders /></ModuleRoute>} />
            <Route path="machines" element={<ModuleRoute module="production"><Machines /></ModuleRoute>} />
            <Route path="line"     element={<ModuleRoute module="production"><ProductionLine /></ModuleRoute>} />
          </Route>

          {/* Commercial */}
          <Route path="commercial">
            <Route index element={<ModuleRoute module="commercial"><Clients /></ModuleRoute>} />
            <Route path="commandes"   element={<ModuleRoute module="commercial"><Commandes /></ModuleRoute>} />
            <Route path="expeditions" element={<ModuleRoute module="commercial"><Expeditions /></ModuleRoute>} />
          </Route>

          {/* GMO */}
          <Route path="gmo">
            <Route index element={<ModuleRoute module="gmo"><Breakdowns /></ModuleRoute>} />
            <Route path="maintenance" element={<ModuleRoute module="gmo"><PreventiveMaint /></ModuleRoute>} />
          </Route>

          {/* Quality */}
          <Route path="quality">
            <Route index element={<ModuleRoute module="quality"><Controls /></ModuleRoute>} />
            <Route path="nc" element={<ModuleRoute module="quality"><NCReports /></ModuleRoute>} />
          </Route>

          {/* Planning */}
          <Route path="planning" element={<ModuleRoute module="planning"><Planning /></ModuleRoute>} />

          {/* Comptabilite */}
          <Route path="comptabilite">
            <Route index element={<ModuleRoute module="comptabilite"><Journal /></ModuleRoute>} />
            <Route path="bilan" element={<ModuleRoute module="comptabilite"><BalanceSheet /></ModuleRoute>} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}