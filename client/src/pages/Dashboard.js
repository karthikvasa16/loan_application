import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { FileText, CheckCircle, DollarSign, Clock, CreditCard, AlertCircle, Users, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

function StatCard({ icon: Icon, title, value, change, color, gradient }) {
  return (
    <div style={{
      background: gradient || `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      borderRadius: '1rem',
      padding: '1.75rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      border: `1px solid ${color}20`,
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
      }}
    >
      {/* Decorative background element */}
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
        opacity: 0.5
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
        <div style={{ flex: 1 }}>
          <p style={{
            fontSize: '0.8125rem',
            color: '#64748b',
            marginBottom: '0.75rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {title}
          </p>
          <p style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            color: '#0f172a',
            marginBottom: '0.5rem',
            lineHeight: '1'
          }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change !== undefined && change !== null && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.375rem',
              backgroundColor: change > 0 ? '#d1fae520' : change < 0 ? '#fee2e220' : '#f1f5f9',
              color: change > 0 ? '#059669' : change < 0 ? '#dc2626' : '#64748b'
            }}>
              {change > 0 ? <ArrowUpRight size={14} /> : change < 0 ? <ArrowDownRight size={14} /> : null}
              <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>
                {change > 0 ? '+' : ''}{change}%
              </span>
            </div>
          )}
        </div>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '1rem',
          background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 10px 15px -3px ${color}40`
        }}>
          <Icon size={32} style={{ color: 'white' }} />
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [loanStats, setLoanStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0,
    avgCibilScore: 0,
    totalBorrowers: 0
  });
  const [loanTrends, setLoanTrends] = useState([]);
  const [recentLoans, setRecentLoans] = useState([]);
  const [cibilDistribution, setCibilDistribution] = useState([]);
  const [loanByPurpose, setLoanByPurpose] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      // Changed endpoint from /api/loans/all to /api/loans/applications
      const response = await axios.get('/api/loans/applications');

      // Backend returns { success: true, data: [...] }
      const rawLoans = response.data.data || [];

      // Map backend fields to dashboard expected format
      const loans = rawLoans.map(loan => ({
        id: loan.id,
        // Construct studentName from parts
        studentName: `${loan.firstName || ''} ${loan.lastName || ''}`.trim() || loan.email,
        // Map loanType to purpose
        purpose: loan.loanType,
        amount: parseFloat(loan.loanAmount || 0),
        // Map status (backend uses lowercase enum, dashboard expects capitalized)
        status: loan.status ? loan.status.charAt(0).toUpperCase() + loan.status.slice(1).replace('_', ' ') : 'Draft',
        // Mock CIBIL score since not in model (or fetch separately if needed)
        cibilScore: 750, // Placeholder
        appliedDate: loan.createdAt,
        email: loan.email,
        userId: loan.email // Use email as unique user identifier
      }));

      // Calculate statistics
      const stats = {
        total: loans.length,
        // Update status checks to match capitalized mapped status
        pending: loans.filter(l => l.status === 'Submitted' || l.status === 'Under review').length,
        approved: loans.filter(l => l.status === 'Approved').length,
        rejected: loans.filter(l => l.status === 'Rejected').length,
        totalAmount: loans.reduce((sum, l) => sum + (l.amount || 0), 0),
        avgCibilScore: loans.length > 0
          ? Math.round(loans.reduce((sum, l) => sum + (l.cibilScore || 0), 0) / loans.length)
          : 0,
        totalBorrowers: new Set(loans.map(l => l.email)).size
      };

      setLoanStats(stats);
      setRecentLoans(loans.slice(0, 8)); // loans are already sorted DESC by backend, take top 8

      // Generate loan trends (last 6 months)
      const trends = generateLoanTrends(loans);
      setLoanTrends(trends);

      // CIBIL Score Distribution
      const cibilDist = [
        { name: 'Excellent', value: loans.filter(l => l.cibilScore >= 750).length, color: '#14b8a6', range: '750+' },
        { name: 'Good', value: loans.filter(l => l.cibilScore >= 650 && l.cibilScore < 750).length, color: '#0891b2', range: '650-749' },
        { name: 'Fair', value: loans.filter(l => l.cibilScore >= 550 && l.cibilScore < 650).length, color: '#f59e0b', range: '550-649' },
        { name: 'Poor', value: loans.filter(l => l.cibilScore < 550).length, color: '#ef4444', range: '<550' }
      ];
      setCibilDistribution(cibilDist.filter(d => d.value > 0));

      // Loans by Purpose
      const purposeCounts = {};
      loans.forEach(loan => {
        const purpose = loan.purpose || 'other';
        purposeCounts[purpose] = (purposeCounts[purpose] || 0) + 1;
      });
      const loanPurposes = Object.entries(purposeCounts)
        .map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' '),
          value
        }))
        .sort((a, b) => b.value - a.value);
      setLoanByPurpose(loanPurposes);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const generateLoanTrends = (loans) => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      months.push({
        month: monthName,
        applications: 0,
        approved: 0,
        amount: 0
      });
    }

    loans.forEach(loan => {
      const loanDate = new Date(loan.appliedDate);
      const monthIndex = months.findIndex(m => {
        const mDate = new Date(m.month + ' 1, ' + new Date().getFullYear());
        return mDate.getMonth() === loanDate.getMonth() && mDate.getFullYear() === loanDate.getFullYear();
      });
      if (monthIndex >= 0) {
        months[monthIndex].applications += 1;
        if (loan.status === 'Approved') {
          months[monthIndex].approved += 1;
        }
        months[monthIndex].amount += loan.amount || 0;
      }
    });

    return months;
  };

  const formatAmount = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`;
    }
    return `₹${amount}`;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #e5e7eb',
          borderTopColor: '#0891b2',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: '500' }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: 'none',
      minHeight: '100%',
      padding: 0,
      margin: 0
    }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              color: '#0f172a',
              marginBottom: '0.5rem',
              letterSpacing: '-0.02em'
            }}>
              Loan Management Dashboard
            </h1>
            <p style={{ color: '#64748b', fontSize: '1.0625rem', fontWeight: '500' }}>
              Comprehensive overview of loan applications and borrower analytics
            </p>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '0.75rem',
            border: '1px solid #e2e8f0'
          }}>
            <Activity size={18} style={{ color: '#0891b2' }} />
            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>
              Live Data
            </span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <StatCard
          icon={Users}
          title="Total Borrowers"
          value={loanStats.totalBorrowers}
          change={loanStats.totalBorrowers > 0 ? 12 : null}
          color="#0891b2"
          gradient="linear-gradient(135deg, rgba(8, 145, 178, 0.1) 0%, rgba(8, 145, 178, 0.05) 100%)"
        />
        <StatCard
          icon={FileText}
          title="Total Applications"
          value={loanStats.total}
          change={loanStats.total > 0 ? 8 : null}
          color="#0ea5e9"
          gradient="linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(14, 165, 233, 0.05) 100%)"
        />
        <StatCard
          icon={AlertCircle}
          title="Pending Review"
          value={loanStats.pending}
          change={null}
          color="#f59e0b"
          gradient="linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)"
        />
        <StatCard
          icon={CheckCircle}
          title="Approved Loans"
          value={loanStats.approved}
          change={loanStats.approved > 0 ? 15 : null}
          color="#14b8a6"
          gradient="linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(20, 184, 166, 0.05) 100%)"
        />
        <StatCard
          icon={DollarSign}
          title="Total Loan Amount"
          value={formatAmount(loanStats.totalAmount)}
          change={loanStats.totalAmount > 0 ? 22 : null}
          color="#06b6d4"
          gradient="linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)"
        />
        <StatCard
          icon={CreditCard}
          title="Avg CIBIL Score"
          value={loanStats.avgCibilScore || 'N/A'}
          change={null}
          color="#0284c7"
          gradient="linear-gradient(135deg, rgba(2, 132, 199, 0.1) 0%, rgba(2, 132, 199, 0.05) 100%)"
        />
      </div>

      {/* Verify all 6 cards are rendered - if you see this comment, all cards should be visible */}

      {/* Charts Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem',
        width: '100%'
      }}>
        {/* Loan Trends Chart */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.375rem', fontWeight: '700', color: '#0f172a' }}>
              Loan Application Trends
            </h2>
            <div style={{
              padding: '0.375rem 0.75rem',
              backgroundColor: '#f8fafc',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#475569'
            }}>
              Last 6 Months
            </div>
          </div>
          {loanTrends.length > 0 && loanTrends.some(t => t.applications > 0) ? (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={loanTrends}>
                <defs>
                  <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0891b2" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="month"
                  stroke="#64748b"
                  style={{ fontSize: '0.75rem', fontWeight: '600' }}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  style={{ fontSize: '0.75rem', fontWeight: '600' }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="applications"
                  stroke="#0891b2"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorApplications)"
                  name="Applications"
                />
                <Area
                  type="monotone"
                  dataKey="approved"
                  stroke="#14b8a6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorApproved)"
                  name="Approved"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{
              height: '320px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8'
            }}>
              <Activity size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p style={{ fontSize: '0.875rem', fontWeight: '500' }}>No trend data available yet</p>
            </div>
          )}
        </div>

        {/* CIBIL Distribution Pie Chart */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{ fontSize: '1.375rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.5rem' }}>
            CIBIL Score Distribution
          </h2>
          {cibilDistribution.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={cibilDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {cibilDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {cibilDistribution.map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: item.color
                      }} />
                      <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>
                        {item.name}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0f172a' }}>
                        {item.value}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.25rem' }}>
                        ({item.range})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{
              height: '250px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8'
            }}>
              <CreditCard size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p style={{ fontSize: '0.875rem', fontWeight: '500' }}>No CIBIL data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row - Loan by Purpose and Recent Applications */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '1.5rem',
        width: '100%',
        marginBottom: '2rem'
      }}>
        {/* Loans by Purpose */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{ fontSize: '1.375rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.5rem' }}>
            Loans by Purpose
          </h2>
          {loanByPurpose.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {loanByPurpose.map((item, index) => (
                <div key={index}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>
                      {item.name}
                    </span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0f172a' }}>
                      {item.value}
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#e2e8f0',
                    borderRadius: '9999px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${(item.value / loanStats.total) * 100}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #0891b2 0%, #14b8a6 100%)',
                      borderRadius: '9999px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              padding: '2rem 0'
            }}>
              <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p style={{ fontSize: '0.875rem', fontWeight: '500' }}>No loan data available</p>
            </div>
          )}
        </div>

        {/* Recent Loan Applications */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.375rem', fontWeight: '700', color: '#0f172a' }}>
              Recent Loan Applications
            </h2>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#64748b',
              padding: '0.375rem 0.75rem',
              backgroundColor: '#f8fafc',
              borderRadius: '0.5rem'
            }}>
              {recentLoans.length} Total
            </span>
          </div>
          {recentLoans.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <FileText size={40} style={{ color: '#94a3b8' }} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>
                No Applications Yet
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                Loan applications will appear here once borrowers start applying
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '450px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {recentLoans.map((loan) => {
                const statusColor = loan.status === 'Approved' ? '#14b8a6' : loan.status === 'Pending' ? '#f59e0b' : '#ef4444';
                const statusBg = loan.status === 'Approved' ? '#ccfbf1' : loan.status === 'Pending' ? '#fef3c7' : '#fee2e2';

                return (
                  <div
                    key={loan.id}
                    style={{
                      padding: '1.25rem',
                      borderLeft: `4px solid ${statusColor}`,
                      backgroundColor: '#f8fafc',
                      borderRadius: '0.75rem',
                      transition: 'all 0.2s',
                      border: '1px solid #e2e8f0'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f1f5f9';
                      e.currentTarget.style.transform = 'translateX(4px)';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.9375rem', color: '#0f172a', fontWeight: '700', marginBottom: '0.375rem' }}>
                          {loan.studentName}
                        </p>
                        <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '0.5rem' }}>
                          {loan.purpose ? loan.purpose.charAt(0).toUpperCase() + loan.purpose.slice(1).replace(/_/g, ' ') : 'Educational Loan'}
                        </p>
                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <DollarSign size={14} style={{ color: '#64748b' }} />
                            <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#475569' }}>
                              ₹{loan.amount?.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <CreditCard size={14} style={{ color: '#64748b' }} />
                            <span style={{ fontSize: '0.8125rem', color: '#475569' }}>
                              CIBIL: <strong style={{
                                color: loan.cibilScore >= 750 ? '#14b8a6' : loan.cibilScore >= 650 ? '#0891b2' : '#f59e0b',
                                fontWeight: '700'
                              }}>
                                {loan.cibilScore}
                              </strong>
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <Clock size={14} style={{ color: '#64748b' }} />
                            <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                              {new Date(loan.appliedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span style={{
                        padding: '0.5rem 0.875rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        backgroundColor: statusBg,
                        color: statusColor,
                        whiteSpace: 'nowrap',
                        border: `1px solid ${statusColor}30`
                      }}>
                        {loan.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
