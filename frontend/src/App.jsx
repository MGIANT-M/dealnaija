import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import ListingsPage from './pages/ListingsPage'
import PropertyDetailPage from './pages/PropertyDetailPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AgentDashboard from './pages/AgentDashboard'
import InvestorDashboard from './pages/InvestorDashboard'
import AdminDashboard from './pages/AdminDashboard'
import AddPropertyPage from './pages/AddPropertyPage'
import LeaderboardPage from './pages/LeaderboardPage'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="properties" element={<ListingsPage />} />
        <Route path="properties/:id" element={<PropertyDetailPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="join" element={<RegisterPage />} />
        <Route path="dashboard/agent" element={
          <ProtectedRoute roles={['agent']}>
            <AgentDashboard />
          </ProtectedRoute>
        } />
        <Route path="dashboard/investor" element={
          <ProtectedRoute roles={['investor']}>
            <InvestorDashboard />
          </ProtectedRoute>
        } />
        <Route path="dashboard/admin" element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="listings/new" element={
          <ProtectedRoute roles={['agent']}>
            <AddPropertyPage />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
