import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './pages/App'
import Edit from './pages/Edit'
import Preview from './pages/Preview'
import './styles.css'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/edit/:id?', element: <Edit /> },
  { path: '/preview/:id', element: <Preview /> }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
