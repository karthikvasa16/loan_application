import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Clock, Download, Eye, FileText } from 'lucide-react';

function Applications() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchLoans = useCallback(async () => {
    try {
      const params = {
        status: statusFilter || undefined
      };
      const response = await axios.get('/api/loans/all', { params });
      setLoans(response.data.loans || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching loans:', error);
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const handleApprove = async (id) => {
    try {
      await axios.put(`/api/loans/${id}/approve`);
      fetchLoans();
    } catch (error) {
      console.error('Error approving loan:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle size={20} style={{ color: '#10b981' }} />;
      case 'Rejected':
        return <XCircle size={20} style={{ color: '#ef4444' }} />;
      default:
        return <Clock size={20} style={{ color: '#f59e0b' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return { backgroundColor: '#d1fae5', color: '#065f46' };
      case 'Rejected':
        return { backgroundColor: '#fee2e2', color: '#991b1b' };
      default:
        return { backgroundColor: '#fef3c7', color: '#92400e' };
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
          Loan Applications
        </h1>
        <p style={{ color: '#6b7280' }}>Review and manage all loan applications from borrowers</p>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            backgroundColor: 'white',
            minWidth: '150px'
          }}
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Loan Applications Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
        gap: '1.5rem'
      }}>
        {loans.length === 0 && !loading ? (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '4rem',
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            border: '2px dashed #e5e7eb'
          }}>
            <FileText size={64} style={{ color: '#9ca3af', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              No loan applications found
            </h3>
            <p style={{ color: '#6b7280' }}>
              {statusFilter ? `No ${statusFilter.toLowerCase()} applications.` : 'No loan applications have been submitted yet.'}
            </p>
          </div>
        ) : (
          loans.map((loan) => {
          const statusStyle = getStatusColor(loan.status);
          return (
            <div
              key={loan.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                    {loan.studentName}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Email: {loan.studentEmail}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {getStatusIcon(loan.status)}
                </div>
              </div>

              <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Loan Amount</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
                      ₹{loan.amount?.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Duration</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
                      {loan.duration} months
                    </p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Purpose</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                      {loan.purpose || 'Educational Loan'}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>CIBIL Score</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', color: loan.cibilScore >= 750 ? '#10b981' : loan.cibilScore >= 650 ? '#3b82f6' : '#f59e0b' }}>
                      {loan.cibilScore}
                    </p>
                  </div>
                </div>
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #e5e7eb' }}>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>PAN Number</p>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', fontFamily: 'monospace' }}>
                    {loan.pan}
                  </p>
                </div>
              </div>

              <div style={{
                display: 'inline-block',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '600',
                marginBottom: '1rem',
                ...statusStyle
              }}>
                {loan.status}
              </div>

              <div style={{ marginBottom: '1rem', fontSize: '0.75rem', color: '#6b7280' }}>
                <p>Applied: {new Date(loan.appliedDate).toLocaleDateString()}</p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                {loan.status === 'Pending' && (
                  <button
                    onClick={() => handleApprove(loan.id)}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Approve
                  </button>
                )}
                <button
                  style={{
                    padding: '0.5rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  <Eye size={18} />
                </button>
                <button
                  style={{
                    padding: '0.5rem',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  <Download size={18} />
                </button>
              </div>
            </div>
          );
        })
      )}
      </div>
    </div>
  );
}

export default Applications;
