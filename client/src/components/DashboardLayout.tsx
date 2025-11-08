import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MdDashboard, MdWork, MdLibraryBooks, MdVisibility, MdStorage } from 'react-icons/md';

interface DashboardLayoutProps {
  children: ReactNode;
  statusMessage?: { type: 'warning' | 'info' | 'error'; text: string } | null;
}

export default function DashboardLayout({ children, statusMessage }: DashboardLayoutProps) {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Resumes', icon: <MdDashboard /> },
    { path: '/library', label: 'Library', icon: <MdLibraryBooks /> },
    { path: '/database', label: 'Database', icon: <MdStorage /> },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-topbar">
        <div className="dashboard-topbar-left">
          <MdWork className="dashboard-logo-icon" />
          <h1 className="dashboard-title">Resume Builder</h1>
        </div>
      </header>
      
      <div className="dashboard-container">
        <nav className="dashboard-nav">
          {navItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`dashboard-nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="dashboard-nav-icon">{item.icon}</span>
              <span className="dashboard-nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <main className="dashboard-main">
          {children}
        </main>
      </div>
      
      {statusMessage && (
        <div className={`dashboard-statusbar dashboard-statusbar-${statusMessage.type}`}>
          {statusMessage.type === 'warning' && '⚠️ '}
          {statusMessage.type === 'error' && '❌ '}
          {statusMessage.type === 'info' && 'ℹ️ '}
          {statusMessage.text}
        </div>
      )}
    </div>
  );
}
