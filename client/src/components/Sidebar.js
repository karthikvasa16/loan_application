import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  Shield,
  Users
} from 'lucide-react';

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isAdmin = user?.role === 'admin';
  const isSuperAdmin = user?.role === 'super_admin';
  const isStudent = !isAdmin && !isSuperAdmin;
  const forceCollapsedForStudent = isStudent;
  const sidebarCollapsed = isMobile || forceCollapsedForStudent;
  
  const adminMenuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/leads', icon: Users, label: 'Student Leads' },
    { path: '/admin/applications', icon: FileText, label: 'Loan Applications' },
    { path: '/admin/reports', icon: BarChart3, label: 'Reports' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' }
  ];

  const superAdminMenuItems = [
    { path: '/superadmin/dashboard', icon: Shield, label: 'Super Admin Overview' }
  ];

  const studentMenuItems = [
    { path: '/dashboard', hash: '#overview', icon: LayoutDashboard, label: 'My Dashboard' },
    { path: '/dashboard', hash: '#profile', icon: Settings, label: 'Profile' },
    { path: '/dashboard', hash: '#applications', icon: FileText, label: 'My Applications' },
    { path: '/dashboard', hash: '#resources', icon: BarChart3, label: 'Growth Hub' }
  ];

  const menuItems = isSuperAdmin ? superAdminMenuItems : isAdmin ? adminMenuItems : studentMenuItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (item) => {
    if (isStudent && item.hash) {
      if (location.pathname !== item.path) return false;
      if (!location.hash && item.hash === '#overview') return true;
      return location.hash === item.hash;
    }
    return location.pathname === item.path;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      {sidebarCollapsed && (
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            position: 'fixed',
            top: '1rem',
            left: '1rem',
            zIndex: 1001,
            padding: '0.5rem',
            backgroundColor: '#1e40af',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer'
          }}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Sidebar */}
      <aside
        style={{
          position: sidebarCollapsed ? 'fixed' : 'static',
          left: 0,
          top: 0,
          width: sidebarCollapsed ? '260px' : '260px',
          height: '100vh',
          backgroundColor: '#1e293b',
          color: 'white',
          padding: '2rem 0',
          zIndex: sidebarCollapsed ? 1000 : 'auto',
          transform: mobileMenuOpen || !sidebarCollapsed ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          overflowY: 'auto',
          flexShrink: 0,
          flexGrow: 0
        }}
      >
        <div style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#60a5fa' }}>LoanFlow</h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            {isSuperAdmin ? 'Super Admin Portal' : isAdmin ? 'Admin Portal' : 'Loan Portal'}
          </p>
          {user && (
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
              {user.name}
            </p>
          )}
        </div>

        <nav style={{ padding: '0 1rem' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            const target = item.hash ? `${item.path}${item.hash}` : item.path;
            return (
              <Link
                key={item.path}
                to={target}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  marginBottom: '0.5rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  color: active ? '#1e40af' : '#cbd5e1',
                  backgroundColor: active ? '#ffffff' : 'transparent',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = '#334155';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Icon size={20} style={{ marginRight: '0.75rem' }} />
                <span style={{ fontSize: '0.9375rem', fontWeight: active ? '600' : '400' }}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '1rem', marginTop: 'auto', borderTop: '1px solid #334155' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '0.9375rem',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#7f1d1d';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <LogOut size={20} style={{ marginRight: '0.75rem' }} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && sidebarCollapsed && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999
          }}
        />
      )}
    </>
  );
}

export default Sidebar;
