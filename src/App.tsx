import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SeasonProvider } from './contexts/SeasonContext'
import { ToastProvider } from './contexts/ToastContext'
import { Layout } from './components/Layout'
import { SeasonGate } from './components/SeasonGate'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/Login'
import { SeasonSelectPage } from './pages/SeasonSelectPage'
import { HomePage } from './pages/HomePage'
import { SuccessPage } from './pages/SuccessPage'
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
      <SeasonProvider>
        <ToastProvider>
          <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/season"
              element={
                <ProtectedRoute>
                  <SeasonSelectPage />
                </ProtectedRoute>
              }
            />
            <Route
              element={
                <ProtectedRoute>
                  <SeasonGate>
                    <Layout />
                  </SeasonGate>
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/home" replace />} />
              <Route path="home" element={<HomePage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="success" element={<SuccessPage />} />
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
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
          </BrowserRouter>
        </ToastProvider>
      </SeasonProvider>
    </AuthProvider>
  )
}
