import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './pages/App'
import Edit from './pages/Edit'
import Preview from './pages/Preview'
import Library from './pages/Library'
import Database from './pages/Database'
import DashboardLayout from './components/DashboardLayout'
import './styles.css'

const router = createBrowserRouter([
  { path: '/', element: <DashboardLayout><App /></DashboardLayout> },
  { path: '/edit/:id?', element: <DashboardLayout><Edit /></DashboardLayout> },
  { path: '/library', element: <DashboardLayout><Library /></DashboardLayout> },
  { path: '/database', element: <DashboardLayout><Database /></DashboardLayout> },
  { path: '/preview/:id', element: <Preview /> }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Toaster position="top-right" />
    <RouterProvider router={router} />
  </React.StrictMode>
)
