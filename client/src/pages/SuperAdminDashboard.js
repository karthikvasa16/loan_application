import React, { useEffect, useMemo, useState } from 'react';
import apiClient from '../config/axios';
import { RefreshCcw, Users, UserCheck, UserMinus, Shield, Plus, Ban, Unlock, Trash2 } from 'lucide-react';

function MetricCard({ icon: Icon, title, value, subtitle, color }) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '1rem',
      padding: '1.5rem',
      boxShadow: '0 20px 35px -20px rgba(15, 23, 42, 0.25)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      border: '1px solid rgba(148, 163, 184, 0.12)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          backgroundColor: `${color}20`,
          color,
          width: '3rem',
          height: '3rem',
          borderRadius: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={20} />
        </div>
        <div>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{title}</p>
          <p style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a' }}>{value?.toLocaleString?.() ?? value ?? '-'}</p>
        </div>
      </div>
      {subtitle && (
        <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{subtitle}</p>
      )}
    </div>
  );
}

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return date.toLocaleString();
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

function SuperAdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    emailVerified: true
  });
  const [userFormMessage, setUserFormMessage] = useState('');
  const [userFormError, setUserFormError] = useState('');

  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);

  const fetchOverview = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/api/superadmin/overview');
      setData(response.data);
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Failed to load super admin data';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const response = await apiClient.get('/api/superadmin/users');
      setUsers(response.data.users || []);
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Failed to load users';
      setUsersError(message);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchApplications = async () => {
    setApplicationsLoading(true);
    try {
      const response = await apiClient.get('/api/loans/applications');
      setApplications(response.data.data || []);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setApplicationsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchUsers();
    fetchApplications();
  }, []);

  const handleRefreshAll = async () => {
    await Promise.all([fetchOverview(), fetchUsers(), fetchApplications()]);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserFormError('');
    setUserFormMessage('');
    try {
      if (!userForm.name.trim() || !userForm.email.trim() || !userForm.password.trim()) {
        setUserFormError('Name, email, and password are required.');
        return;
      }
      await apiClient.post('/api/superadmin/users', {
        name: userForm.name.trim(),
        email: userForm.email.trim(),
        password: userForm.password,
        role: userForm.role,
        emailVerified: userForm.emailVerified
      });
      setUserFormMessage('User created successfully.');
      setUserForm({ name: '', email: '', password: '', role: 'admin', emailVerified: true });
      fetchOverview();
      fetchUsers();
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Failed to create user';
      setUserFormError(message);
    }
  };

  const handleToggleBlock = async (userId, currentlyBlocked) => {
    const confirmation = window.confirm(`Are you sure you want to ${currentlyBlocked ? 'unblock' : 'block'} this user?`);
    if (!confirmation) return;
    try {
      await apiClient.patch(`/api/superadmin/users/${userId}`, { isBlocked: !currentlyBlocked });
      fetchUsers();
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Failed to update user status';
      alert(message);
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmation = window.confirm('Deleting a user is permanent. Continue?');
    if (!confirmation) return;
    try {
      await apiClient.delete(`/api/superadmin/users/${userId}`);
      fetchOverview();
      fetchUsers();
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Failed to delete user';
      alert(message);
    }
  };

  const metricCards = useMemo(() => ([
    {
      icon: Users,
      title: 'Total Users',
      value: (data?.metrics?.totalUsers) || 0,
      subtitle: `${data?.metrics?.totalAdmins || 0} admins · ${data?.metrics?.totalStudents || 0} students`,
      color: '#2563eb'
    },
    {
      icon: Shield,
      title: 'Super Admins',
      value: data?.metrics?.totalSuperAdmins || 0,
      subtitle: 'Users with super admin privileges',
      color: '#7c3aed'
    },
    {
      icon: UserCheck,
      title: 'Verified Accounts',
      value: data?.metrics?.verifiedUsers || 0,
      subtitle: `${data?.metrics?.unverifiedUsers || 0} pending verification`,
      color: '#16a34a'
    },
    {
      icon: UserMinus,
      title: 'Accounts Deleted',
      value: data?.metrics?.deletedAccounts || 0,
      subtitle: `${data?.metrics?.localUsers || 0} active native accounts`,
      color: '#dc2626'
    }
  ]), [data?.metrics]);

  const timeline = useMemo(() => {
    if (!data?.timeline) return [];
    return data.timeline.slice(-14);
  }, [data]);

  const recentActivity = data?.recentActivity || [];
  const recentRegistrations = data?.recentRegistrations || [];
  const recentDeletions = data?.recentDeletions || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>Super Admin Overview</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Monitor and control every account across the platform.</p>
        </div>
        <button
          onClick={handleRefreshAll}
          disabled={loading || usersLoading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            borderRadius: '0.75rem',
            border: '1px solid #2563eb',
            backgroundColor: loading || usersLoading ? '#bfdbfe' : '#2563eb',
            color: 'white',
            cursor: loading || usersLoading ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            transition: 'all 0.2s ease'
          }}
        >
          <RefreshCcw size={18} />
          {loading || usersLoading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '0.75rem',
          backgroundColor: '#fee2e2',
          color: '#b91c1c',
          border: '1px solid #fecaca'
        }}>
          {error}
        </div>
      )}

      {loading && !data && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '3rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#2563eb',
          fontWeight: 600,
          fontSize: '1rem'
        }}>
          Loading super admin metrics...
        </div>
      )}

      {data && (
        <>
          <section style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem'
          }}>
            {metricCards.map((card) => (
              <MetricCard key={card.title} {...card} />
            ))}
          </section>

          <section style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 20px 35px -20px rgba(15, 23, 42, 0.25)',
            border: '1px solid rgba(148, 163, 184, 0.12)'
          }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>Create New User</h2>
            <form onSubmit={handleCreateUser} style={{ display: 'grid', gap: '1rem', maxWidth: '600px' }}>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <label style={{ color: '#475569', fontSize: '0.85rem', fontWeight: 500 }}>Name</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                  style={{ padding: '0.7rem', borderRadius: '0.6rem', border: '1px solid #cbd5f5' }}
                  required
                />
              </div>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <label style={{ color: '#475569', fontSize: '0.85rem', fontWeight: 500 }}>Email</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email"
                  style={{ padding: '0.7rem', borderRadius: '0.6rem', border: '1px solid #cbd5f5' }}
                  required
                />
              </div>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <label style={{ color: '#475569', fontSize: '0.85rem', fontWeight: 500 }}>Password</label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Temporary password"
                  style={{ padding: '0.7rem', borderRadius: '0.6rem', border: '1px solid #cbd5f5' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <label style={{ color: '#475569', fontSize: '0.85rem', fontWeight: 500 }}>Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm((prev) => ({ ...prev, role: e.target.value }))}
                    style={{ padding: '0.7rem', borderRadius: '0.6rem', border: '1px solid #cbd5f5', minWidth: '150px' }}
                  >
                    <option value="admin">Admin</option>
                    <option value="student">Student</option>
                  </select>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.85rem', fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={userForm.emailVerified}
                    onChange={(e) => setUserForm((prev) => ({ ...prev, emailVerified: e.target.checked }))}
                  />
                  Mark email as verified
                </label>
              </div>
              {userFormError && (
                <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '0.6rem' }}>{userFormError}</div>
              )}
              {userFormMessage && (
                <div style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '0.75rem', borderRadius: '0.6rem' }}>{userFormMessage}</div>
              )}
              <button
                type="submit"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.8rem 1.5rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: 'fit-content'
                }}
              >
                <Plus size={18} /> Create User
              </button>
            </form>
          </section>

          <section style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 20px 35px -20px rgba(15, 23, 42, 0.25)',
              border: '1px solid rgba(148, 163, 184, 0.12)'
            }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>Recent Registrations</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recentRegistrations.length === 0 && (
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No recent registrations.</p>
                )}
                {recentRegistrations.map((item) => (
                  <div key={`reg-${item.id}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ color: '#0f172a', fontWeight: 600 }}>{item.email || 'Unknown email'}</span>
                    <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{formatDateTime(item.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 20px 35px -20px rgba(15, 23, 42, 0.25)',
              border: '1px solid rgba(148, 163, 184, 0.12)'
            }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>Recent Account Deletions</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recentDeletions.length === 0 && (
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No account deletions recorded.</p>
                )}
                {recentDeletions.map((item) => (
                  <div key={`del-${item.id}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ color: '#0f172a', fontWeight: 600 }}>{item.email || 'Unknown email'}</span>
                    <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{formatDateTime(item.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 20px 35px -20px rgba(15, 23, 42, 0.25)',
            border: '1px solid rgba(148, 163, 184, 0.12)'
          }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>Activity Timeline (Last 14 Days)</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
              {timeline.map((item) => (
                <div key={item.date} style={{
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '0.75rem',
                  padding: '0.75rem',
                  background: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem'
                }}>
                  <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>{formatDate(item.date)}</span>
                  <span style={{ fontSize: '0.75rem', color: '#2563eb' }}>Registrations: {item.registrations}</span>
                  <span style={{ fontSize: '0.75rem', color: '#dc2626' }}>Deletions: {item.deletions}</span>
                </div>
              ))}
            </div>
          </section>

          <section style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 20px 35px -20px rgba(15, 23, 42, 0.25)',
            border: '1px solid rgba(148, 163, 184, 0.12)'
          }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>Recent Activity</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: '#475569', fontSize: '0.8rem' }}>
                    <th style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid #e2e8f0' }}>Action</th>
                    <th style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid #e2e8f0' }}>Email</th>
                    <th style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid #e2e8f0' }}>Details</th>
                    <th style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid #e2e8f0' }}>When</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8' }}>No activity recorded yet.</td>
                    </tr>
                  )}
                  {recentActivity.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem 0.5rem', textTransform: 'capitalize', color: '#0f172a', fontWeight: 500 }}>{item.action.replace('_', ' ')}</td>
                      <td style={{ padding: '0.75rem 0.5rem', color: '#1d4ed8' }}>{item.email || '—'}</td>
                      <td style={{ padding: '0.75rem 0.5rem', color: '#475569', fontSize: '0.8rem' }}>
                        {item.metadata && Object.keys(item.metadata).length > 0 ? (
                          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{JSON.stringify(item.metadata)}</pre>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: '#475569', fontSize: '0.8rem' }}>{formatDateTime(item.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 20px 35px -20px rgba(15, 23, 42, 0.25)',
            border: '1px solid rgba(148, 163, 184, 0.12)'
          }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>Loan Applications</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: '#475569', fontSize: '0.8rem' }}>
                    <th style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid #e2e8f0' }}>App No</th>
                    <th style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid #e2e8f0' }}>Applicant</th>
                    <th style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid #e2e8f0' }}>Type</th>
                    <th style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid #e2e8f0' }}>Amount</th>
                    <th style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                    <th style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid #e2e8f0' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.length === 0 && !applicationsLoading && (
                    <tr>
                      <td colSpan={6} style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8' }}>No applications found.</td>
                    </tr>
                  )}
                  {applications.map((app) => (
                    <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: '#0f172a' }}>{app.applicationNumber || 'DRAFT'}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 500 }}>{app.firstName} {app.lastName}</span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{app.email}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textTransform: 'capitalize' }}>{app.loanType}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>₹{parseFloat(app.loanAmount).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span style={{
                          padding: '0.25rem 0.6rem',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: app.status === 'submitted' ? '#e0f2fe' : app.status === 'approved' ? '#dcfce7' : app.status === 'rejected' ? '#fee2e2' : '#f1f5f9',
                          color: app.status === 'submitted' ? '#0284c7' : app.status === 'approved' ? '#15803d' : app.status === 'rejected' ? '#b91c1c' : '#64748b'
                        }}>
                          {app.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', color: '#64748b' }}>{formatDate(app.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 20px 35px -20px rgba(15, 23, 42, 0.25)',
            border: '1px solid rgba(148, 163, 184, 0.12)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>All Users</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Block, unblock, or delete any user instantly.</p>
              </div>
              {usersLoading && <span style={{ color: '#2563eb', fontWeight: 600 }}>Loading users...</span>}
            </div>
            {usersError && (
              <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '0.6rem', marginBottom: '1rem' }}>{usersError}</div>
            )}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: '#475569', fontSize: '0.8rem' }}>
                    <th style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid #e2e8f0' }}>Name</th>
                    <th style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid #e2e8f0' }}>Email</th>
                    <th style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid #e2e8f0' }}>Role</th>
                    <th style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                    <th style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid #e2e8f0' }}>Created</th>
                    <th style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 && !usersLoading && (
                    <tr>
                      <td colSpan={6} style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8' }}>No users found.</td>
                    </tr>
                  )}
                  {users.map((user) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem 0.5rem', color: '#0f172a', fontWeight: 500 }}>{user.name}</td>
                      <td style={{ padding: '0.75rem 0.5rem', color: '#1d4ed8' }}>{user.email}</td>
                      <td style={{ padding: '0.75rem 0.5rem', textTransform: 'capitalize', color: user.role === 'admin' ? '#2563eb' : user.role === 'super_admin' ? '#7c3aed' : '#16a34a' }}>{user.role.replace('_', ' ')}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '9999px',
                          backgroundColor: user.isBlocked ? '#fee2e2' : '#dcfce7',
                          color: user.isBlocked ? '#b91c1c' : '#15803d',
                          fontSize: '0.75rem'
                        }}>
                          {user.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: '#475569', fontSize: '0.8rem' }}>{formatDateTime(user.createdAt)}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {user.role !== 'super_admin' && (
                            <button
                              onClick={() => handleToggleBlock(user.id, user.isBlocked)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                backgroundColor: user.isBlocked ? '#22c55e' : '#f97316',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                              }}
                            >
                              {user.isBlocked ? <Unlock size={16} /> : <Ban size={16} />}
                              {user.isBlocked ? 'Unblock' : 'Block'}
                            </button>
                          )}
                          {user.role !== 'super_admin' && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                              }}
                            >
                              <Trash2 size={16} /> Delete
                            </button>
                          )}
                          {user.role === 'super_admin' && (
                            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Immutable super admin</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default SuperAdminDashboard;

