import React from 'react';
import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import { useAuth } from '../contexts/AuthContext';
import AdminTopNav from './AdminTopNav';

function Layout() {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{
      display: 'flex',
      width: '100%',
      height: '100vh',
      backgroundColor: '#f5f7fa',
      overflow: 'hidden',
      margin: 0,
      padding: 0,
      position: 'relative',
      flexDirection: 'column'
    }}>
      {isAdmin ? <AdminTopNav /> : null}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <main style={{
          flex: 1,
          padding: isMobile ? '1rem' : '2rem',
          overflowX: 'hidden',
          overflowY: 'auto',
          paddingTop: isAdmin ? '1rem' : (isMobile ? '4rem' : '2rem'),
          paddingBottom: '2rem',
          boxSizing: 'border-box',
          backgroundColor: '#f5f7fa',
          margin: 0,
          width: 'auto',
          position: 'relative',
          WebkitOverflowScrolling: 'touch',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ flex: '1 0 auto' }}>
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}

export default Layout;
