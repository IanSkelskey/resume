import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import App from './pages/App'
import Edit from './pages/Edit'
import Preview from './pages/Preview'
import Library from './pages/Library'
import Database from './pages/Database'
import Login from './pages/Login'
import Register from './pages/Register'
import DashboardLayout from './components/DashboardLayout'
import './styles.css'

function RedirectIfAuthenticated({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        color: 'var(--muted)'
      }}>
        Loading...
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

const router = createBrowserRouter([
  { 
    path: '/login', 
    element: (
      <RedirectIfAuthenticated>
        <Login />
      </RedirectIfAuthenticated>
    ) 
  },
  { 
    path: '/register', 
    element: (
      <RedirectIfAuthenticated>
        <Register />
      </RedirectIfAuthenticated>
    ) 
  },
  { 
    path: '/', 
    element: (
      <ProtectedRoute>
        <DashboardLayout><App /></DashboardLayout>
      </ProtectedRoute>
    ) 
  },
  { 
    path: '/edit/:id?', 
    element: (
      <ProtectedRoute>
        <Edit />
      </ProtectedRoute>
    ) 
  },
  { 
    path: '/library', 
    element: (
      <ProtectedRoute>
        <DashboardLayout><Library /></DashboardLayout>
      </ProtectedRoute>
    ) 
  },
  { 
    path: '/database', 
    element: (
      <ProtectedRoute>
        <DashboardLayout><Database /></DashboardLayout>
      </ProtectedRoute>
    ) 
  },
  { 
    path: '/preview/:id', 
    element: (
      <ProtectedRoute>
        <Preview />
      </ProtectedRoute>
    ) 
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <Toaster position="top-right" />
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
)
