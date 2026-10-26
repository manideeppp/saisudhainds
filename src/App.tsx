import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/Login'
import { DashboardPage } from './pages/Dashboard'
import { ExpensesPage } from './pages/Expenses'
import { CategoriesPage } from './pages/Categories'
import { ReceivablesPage } from './pages/Receivables'
import { FarmerIntakePage } from './pages/paddy/FarmerIntakePage'
import { IkpIntakePage } from './pages/paddy/IkpIntakePage'
import { GunnyDispatchPage } from './pages/paddy/GunnyDispatchPage'
import { RiceDeliveryPage } from './pages/rice/RiceDeliveryPage'
import { ByProductRoute } from './pages/rice/ByProductRoute'
import { MillReportsPage } from './pages/reports/MillReportsPage'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="reports" element={<MillReportsPage />} />
              <Route path="expenses" element={<ExpensesPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="receivables" element={<ReceivablesPage />} />
              <Route path="paddy/farmer" element={<FarmerIntakePage />} />
              <Route path="paddy/ikp" element={<IkpIntakePage />} />
              <Route path="paddy/gunny" element={<GunnyDispatchPage />} />
              <Route path="rice/delivery" element={<RiceDeliveryPage />} />
              <Route path="byproducts/:slug" element={<ByProductRoute />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}
