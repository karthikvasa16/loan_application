import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function AdminTopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const links = [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/leads', label: 'Student Leads' },
    { to: '/admin/applications', label: 'Applications' },
    { to: '/admin/reports', label: 'Reports' },
    { to: '/admin/settings', label: 'Settings' }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      color: 'white',
      boxShadow: '0 2px 10px rgba(16, 185, 129, 0.25)'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <GraduationCap size={24} color="white" />
          <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Kubera Admin</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              style={{
                color: 'white',
                opacity: isActive(l.to) ? 1 : 0.85,
                fontWeight: isActive(l.to) ? 700 : 500,
                textDecoration: 'none',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <button
          onClick={handleLogout}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'rgba(255,255,255,0.12)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: '0.5rem',
            padding: '0.45rem 0.75rem',
            cursor: 'pointer'
          }}
          title="Logout"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </nav>
  );
}

export default AdminTopNav;


