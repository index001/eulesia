import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import {
  LoginPage,
  AgoraPage,
  ThreadPage,
  ClubsPage,
  ClubViewPage,
  HomePage,
  ProfilePage,
  ServicesPage,
  AboutPage
} from './pages'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/agora" replace /> : <LoginPage />}
      />

      {/* Protected routes */}
      <Route
        path="/agora"
        element={
          <ProtectedRoute>
            <AgoraPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agora/thread/:threadId"
        element={
          <ProtectedRoute>
            <ThreadPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/clubs"
        element={
          <ProtectedRoute>
            <ClubsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clubs/:clubId"
        element={
          <ProtectedRoute>
            <ClubViewPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/services"
        element={
          <ProtectedRoute>
            <ServicesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/about"
        element={
          <ProtectedRoute>
            <AboutPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
