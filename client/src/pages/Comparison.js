import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  CheckCircle,
  X,
  ArrowLeft,
  Search,
  Filter,
  TrendingUp,
  Shield,
  Clock,
  DollarSign,
  Users
} from 'lucide-react';

const loanOptions = [
  {
    id: 'option1',
    lenderName: 'Kubera Prime',
    interestRate: '8.5% - 11.5%',
    maxLoanAmount: '₹1.5 Cr',
    minLoanAmount: '₹5 Lacs',
    tenure: 'Up to 20 years',
    processingFee: '0.5% - 2%',
    moratorium: 'Course + 1 year',
    prepayment: 'No charges after 1 year',
    coApplicant: 'Required',
    features: [
      '100% tuition coverage',
      'Living expenses included',
      'Quick disbursal (48 hours)',
      'Flexible repayment options',
      'CIBIL score check included'
    ],
    eligibility: '650+ CIBIL',
    highlight: true
  },
  {
    id: 'option2',
    lenderName: 'Kubera Global',
    interestRate: '9.5% - 12.5%',
    maxLoanAmount: '₹1 Cr',
    minLoanAmount: '₹5 Lacs',
    tenure: 'Up to 15 years',
    processingFee: '1% - 2.5%',
    moratorium: 'Course duration',
    prepayment: '2% charges',
    coApplicant: 'Required',
    features: [
      'Coverage for top universities',
      'Multi-currency disbursal',
      'Visa assistance included',
      'Education counseling',
      'Travel insurance coverage'
    ],
    eligibility: '700+ CIBIL',
    highlight: false
  },
  {
    id: 'option3',
    lenderName: 'Kubera Student',
    interestRate: '10.5% - 13.5%',
    maxLoanAmount: '₹50 Lacs',
    minLoanAmount: '₹2 Lacs',
    tenure: 'Up to 10 years',
    processingFee: '1.5% - 3%',
    moratorium: 'Course + 6 months',
    prepayment: '3% charges',
    coApplicant: 'Optional',
    features: [
      'No collateral required',
      'Easy documentation',
      'Online application',
      'Student-friendly terms',
      'Post-study repayment start'
    ],
    eligibility: '600+ CIBIL',
    highlight: false
  },
  {
    id: 'option4',
    lenderName: 'Kubera Pro',
    interestRate: '7.5% - 10.5%',
    maxLoanAmount: '₹2 Cr',
    minLoanAmount: '₹10 Lacs',
    tenure: 'Up to 25 years',
    processingFee: '0.25% - 1.5%',
    moratorium: 'Course + 2 years',
    prepayment: 'No charges',
    coApplicant: 'Required',
    features: [
      'Premium interest rates',
      'Maximum coverage',
      'Priority processing',
      'Dedicated relationship manager',
      'Scholarship matching service'
    ],
    eligibility: '750+ CIBIL',
    highlight: true
  }
];

function Comparison() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('interest');

  const filteredOptions = loanOptions.filter(option =>
    option.lenderName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedOptions = [...filteredOptions].sort((a, b) => {
    switch (sortBy) {
      case 'interest':
        const rateA = parseFloat(a.interestRate.split(' - ')[0]);
        const rateB = parseFloat(b.interestRate.split(' - ')[0]);
        return rateA - rateB;
      case 'amount':
        const amountA = parseFloat(a.maxLoanAmount.replace(/[₹CrLacs ]/g, '').replace('Cr', '100').replace('Lacs', '1'));
        const amountB = parseFloat(b.maxLoanAmount.replace(/[₹CrLacs ]/g, '').replace('Cr', '100').replace('Lacs', '1'));
        return amountB - amountA;
      case 'tenure':
        const tenureA = parseInt(a.tenure.match(/\d+/)?.[0] || '0');
        const tenureB = parseInt(b.tenure.match(/\d+/)?.[0] || '0');
        return tenureB - tenureA;
      default:
        return 0;
    }
  });

  return (
    <div style={{
      fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      {/* Top Navigation */}
      <nav style={topNavStyle}>
        <div style={topNavContainerStyle}>
          <div style={topNavLeftStyle}>
            <GraduationCap size={24} color="#0891b2" />
            <span style={topNavLogoStyle}>Kubera</span>
          </div>
          <div style={topNavMenuStyle}>
            <button
              onClick={() => navigate('/')}
              style={topNavMenuItemStyle}
            >
              Home
            </button>
            <button
              onClick={() => navigate('/#loan-options')}
              style={topNavMenuItemStyle}
            >
              Loan Options
            </button>
            <button
              onClick={() => navigate('/#eligibility')}
              style={topNavMenuItemStyle}
            >
              Eligibility
            </button>
            <button
              onClick={() => navigate('/#testimonials')}
              style={topNavMenuItemStyle}
            >
              Testimonials
            </button>
            <button
              onClick={() => navigate('/comparison')}
              style={{
                ...topNavMenuItemStyle,
                color: '#0891b2',
                fontWeight: 600,
                borderBottom: '2px solid #0891b2'
              }}
            >
              Comparison
            </button>
          </div>
          <div style={topNavRightStyle}>
            <button
              onClick={() => navigate('/login')}
              style={topNavButtonStyle}
            >
              Login
            </button>
            <button
              onClick={() => {
                const eligibilitySection = document.getElementById('eligibility');
                if (eligibilitySection) {
                  eligibilitySection.scrollIntoView({ behavior: 'smooth' });
                  navigate('/#eligibility');
                } else {
                  navigate('/');
                }
              }}
              style={topNavPrimaryButtonStyle}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <header style={comparisonHeaderStyle}>
        <button
          onClick={() => navigate('/')}
          style={backButtonStyle}
        >
          <ArrowLeft size={20} />
          Back to Home
        </button>
        <div style={comparisonHeaderContentStyle}>
          <h1 style={comparisonTitleStyle}>Compare Education Loan Options</h1>
          <p style={comparisonSubtitleStyle}>
            Compare interest rates, features, and benefits to find the perfect loan for your education journey
          </p>
        </div>
      </header>

      {/* Filters and Search */}
      <section style={filtersSectionStyle}>
        <div style={filtersContainerStyle}>
          <div style={searchWrapperStyle}>
            <Search size={20} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search loan options..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={searchInputStyle}
            />
          </div>
          <div style={sortWrapperStyle}>
            <Filter size={20} color="#64748b" style={{ marginRight: '0.5rem' }} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={sortSelectStyle}
            >
              <option value="interest">Sort by Interest Rate</option>
              <option value="amount">Sort by Loan Amount</option>
              <option value="tenure">Sort by Tenure</option>
            </select>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section style={comparisonTableSectionStyle}>
        <div style={comparisonTableWrapperStyle}>
          <div style={comparisonTableStyle}>
            {/* Table Header */}
            <div style={tableHeaderStyle}>
              <div style={tableHeaderCellStyle}></div>
              {sortedOptions.map((option) => (
                <div
                  key={option.id}
                  style={{
                    ...tableHeaderCellStyle,
                    ...(option.highlight ? highlightHeaderCellStyle : {})
                  }}
                >
                  {option.highlight && (
                    <span style={popularBadgeStyle}>
                      <TrendingUp size={12} style={{ marginRight: '0.25rem' }} />
                      Popular
                    </span>
                  )}
                  <h3 style={lenderNameStyle}>{option.lenderName}</h3>
                </div>
              ))}
            </div>

            {/* Interest Rate Row */}
            <div style={tableRowStyle}>
              <div style={tableLabelCellStyle}>
                <DollarSign size={18} color="#0891b2" style={{ marginRight: '0.5rem' }} />
                Interest Rate
              </div>
              {sortedOptions.map((option) => (
                <div key={option.id} style={tableDataCellStyle}>
                  <span style={interestRateStyle}>{option.interestRate}</span>
                  <span style={rateSubtextStyle}>p.a.</span>
                </div>
              ))}
            </div>

            {/* Loan Amount Row */}
            <div style={tableRowStyle}>
              <div style={tableLabelCellStyle}>
                <Shield size={18} color="#0891b2" style={{ marginRight: '0.5rem' }} />
                Loan Amount
              </div>
              {sortedOptions.map((option) => (
                <div key={option.id} style={tableDataCellStyle}>
                  <span style={amountStyle}>{option.maxLoanAmount}</span>
                  <span style={subtextStyle}>Max amount</span>
                </div>
              ))}
            </div>

            {/* Tenure Row */}
            <div style={tableRowStyle}>
              <div style={tableLabelCellStyle}>
                <Clock size={18} color="#0891b2" style={{ marginRight: '0.5rem' }} />
                Repayment Tenure
              </div>
              {sortedOptions.map((option) => (
                <div key={option.id} style={tableDataCellStyle}>
                  {option.tenure}
                </div>
              ))}
            </div>

            {/* Processing Fee Row */}
            <div style={tableRowStyle}>
              <div style={tableLabelCellStyle}>Processing Fee</div>
              {sortedOptions.map((option) => (
                <div key={option.id} style={tableDataCellStyle}>
                  {option.processingFee}
                </div>
              ))}
            </div>

            {/* Moratorium Period Row */}
            <div style={tableRowStyle}>
              <div style={tableLabelCellStyle}>Moratorium Period</div>
              {sortedOptions.map((option) => (
                <div key={option.id} style={tableDataCellStyle}>
                  {option.moratorium}
                </div>
              ))}
            </div>

            {/* Prepayment Charges Row */}
            <div style={tableRowStyle}>
              <div style={tableLabelCellStyle}>Prepayment Charges</div>
              {sortedOptions.map((option) => (
                <div key={option.id} style={tableDataCellStyle}>
                  {option.prepayment}
                </div>
              ))}
            </div>

            {/* Co-Applicant Row */}
            <div style={tableRowStyle}>
              <div style={tableLabelCellStyle}>
                <Users size={18} color="#0891b2" style={{ marginRight: '0.5rem' }} />
                Co-Applicant
              </div>
              {sortedOptions.map((option) => (
                <div key={option.id} style={tableDataCellStyle}>
                  {option.coApplicant}
                </div>
              ))}
            </div>

            {/* Eligibility Row */}
            <div style={tableRowStyle}>
              <div style={tableLabelCellStyle}>Min CIBIL Score</div>
              {sortedOptions.map((option) => (
                <div key={option.id} style={tableDataCellStyle}>
                  <span style={eligibilityStyle}>{option.eligibility}</span>
                </div>
              ))}
            </div>

            {/* Features Row */}
            <div style={{ ...tableRowStyle, alignItems: 'flex-start' }}>
              <div style={tableLabelCellStyle}>Key Features</div>
              {sortedOptions.map((option) => (
                <div key={option.id} style={featuresCellStyle}>
                  <ul style={featuresListStyle}>
                    {option.features.map((feature, idx) => (
                      <li key={idx} style={featureItemStyle}>
                        <CheckCircle size={16} color="#14b8a6" style={{ marginRight: '0.5rem', flexShrink: 0 }} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Action Row */}
            <div style={tableActionRowStyle}>
              <div style={tableLabelCellStyle}></div>
              {sortedOptions.map((option) => (
                <div key={option.id} style={tableActionCellStyle}>
                  <button
                    onClick={() => {
                      const wizard = document.getElementById('eligibility-wizard');
                      if (wizard) {
                        wizard.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        navigate('/');
                        setTimeout(() => {
                          const wizardBtn = document.querySelector('[aria-label*="eligibility"]');
                          if (wizardBtn) wizardBtn.click();
                        }, 500);
                      }
                    }}
                    style={{
                      ...applyButtonStyle,
                      ...(option.highlight ? highlightApplyButtonStyle : {})
                    }}
                  >
                    Apply Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section style={infoSectionStyle}>
        <div style={infoCardStyle}>
          <div style={infoIconStyle}>
            <Shield size={32} color="#0891b2" />
          </div>
          <div>
            <h3 style={infoTitleStyle}>Need Help Choosing?</h3>
            <p style={infoTextStyle}>
              Our loan experts can help you compare options and find the best fit based on your profile, destination, and requirements.
            </p>
            <button
              onClick={() => navigate('/login')}
              style={infoButtonStyle}
            >
              Speak with an Expert
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// Top Navigation Styles
const topNavStyle = {
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e2e8f0',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
};

const topNavContainerStyle = {
  maxWidth: '1400px',
  margin: '0 auto',
  padding: '1rem 2rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '2rem'
};

const topNavLeftStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem'
};

const topNavLogoStyle = {
  fontSize: '1.5rem',
  fontWeight: 700,
  color: '#0891b2',
  letterSpacing: '-0.02em'
};

const topNavMenuStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  flex: 1,
  justifyContent: 'center'
};

const topNavMenuItemStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: 'transparent',
  border: 'none',
  color: '#64748b',
  fontSize: '0.95rem',
  fontWeight: 500,
  cursor: 'pointer',
  borderRadius: '0.5rem',
  transition: 'all 0.2s ease'
};

const topNavRightStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem'
};

const topNavButtonStyle = {
  padding: '0.5rem 1.25rem',
  backgroundColor: 'transparent',
  border: '1px solid #e2e8f0',
  color: '#64748b',
  fontSize: '0.95rem',
  fontWeight: 500,
  cursor: 'pointer',
  borderRadius: '0.5rem',
  transition: 'all 0.2s ease'
};

const topNavPrimaryButtonStyle = {
  padding: '0.5rem 1.25rem',
  backgroundColor: '#0891b2',
  border: 'none',
  color: '#ffffff',
  fontSize: '0.95rem',
  fontWeight: 600,
  cursor: 'pointer',
  borderRadius: '0.5rem',
  transition: 'all 0.2s ease',
  boxShadow: '0 4px 12px rgba(8, 145, 178, 0.2)'
};

// Header Styles
const comparisonHeaderStyle = {
  background: 'linear-gradient(135deg, #0891b2 0%, #0ea5e9 50%, #06b6d4 100%)',
  padding: '3rem 2rem',
  color: 'white',
  textAlign: 'center'
};

const backButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginBottom: '2rem',
  padding: '0.5rem 1rem',
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '0.5rem',
  color: 'white',
  fontSize: '0.9rem',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const comparisonHeaderContentStyle = {
  maxWidth: '800px',
  margin: '0 auto'
};

const comparisonTitleStyle = {
  fontSize: '2.5rem',
  fontWeight: 700,
  marginBottom: '1rem',
  lineHeight: 1.2
};

const comparisonSubtitleStyle = {
  fontSize: '1.1rem',
  opacity: 0.9,
  lineHeight: 1.6
};

// Filters Section Styles
const filtersSectionStyle = {
  padding: '2rem',
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e2e8f0'
};

const filtersContainerStyle = {
  maxWidth: '1400px',
  margin: '0 auto',
  display: 'flex',
  gap: '1rem',
  alignItems: 'center',
  flexWrap: 'wrap'
};

const searchWrapperStyle = {
  position: 'relative',
  flex: 1,
  minWidth: '250px'
};

const searchInputStyle = {
  width: '100%',
  padding: '0.75rem 1rem 0.75rem 2.75rem',
  border: '1px solid #e2e8f0',
  borderRadius: '0.75rem',
  fontSize: '0.95rem',
  outline: 'none',
  transition: 'all 0.2s ease'
};

const sortWrapperStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '0.75rem 1rem',
  border: '1px solid #e2e8f0',
  borderRadius: '0.75rem',
  backgroundColor: '#f8fafc'
};

const sortSelectStyle = {
  border: 'none',
  backgroundColor: 'transparent',
  fontSize: '0.95rem',
  color: '#1f2937',
  fontWeight: 500,
  cursor: 'pointer',
  outline: 'none'
};

// Comparison Table Styles
const comparisonTableSectionStyle = {
  padding: '2rem',
  maxWidth: '1400px',
  margin: '0 auto'
};

const comparisonTableWrapperStyle = {
  overflowX: 'auto',
  backgroundColor: '#ffffff',
  borderRadius: '1rem',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  border: '1px solid #e2e8f0'
};

const comparisonTableStyle = {
  minWidth: '1000px',
  width: '100%'
};

const tableHeaderStyle = {
  display: 'grid',
  gridTemplateColumns: '200px repeat(4, 1fr)',
  gap: '1rem',
  padding: '1.5rem',
  backgroundColor: '#f8fafc',
  borderBottom: '2px solid #e2e8f0',
  borderTopLeftRadius: '1rem',
  borderTopRightRadius: '1rem'
};

const tableHeaderCellStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  padding: '1rem',
  textAlign: 'center'
};

const highlightHeaderCellStyle = {
  backgroundColor: '#cffafe',
  borderRadius: '0.75rem',
  border: '2px solid #0891b2'
};

const popularBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0.25rem 0.75rem',
  backgroundColor: '#0891b2',
  color: 'white',
  borderRadius: '999px',
  fontSize: '0.75rem',
  fontWeight: 600
};

const lenderNameStyle = {
  fontSize: '1.25rem',
  fontWeight: 700,
  color: '#0f172a',
  margin: 0
};

const tableRowStyle = {
  display: 'grid',
  gridTemplateColumns: '200px repeat(4, 1fr)',
  gap: '1rem',
  padding: '1.25rem 1.5rem',
  borderBottom: '1px solid #e2e8f0',
  alignItems: 'center'
};

const tableLabelCellStyle = {
  fontWeight: 600,
  color: '#1f2937',
  fontSize: '0.95rem',
  display: 'flex',
  alignItems: 'center'
};

const tableDataCellStyle = {
  color: '#475569',
  fontSize: '0.95rem',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.25rem'
};

const interestRateStyle = {
  fontSize: '1.5rem',
  fontWeight: 700,
  color: '#0891b2'
};

const rateSubtextStyle = {
  fontSize: '0.75rem',
  color: '#64748b'
};

const amountStyle = {
  fontSize: '1.25rem',
  fontWeight: 700,
  color: '#0f172a'
};

const subtextStyle = {
  fontSize: '0.75rem',
  color: '#64748b'
};

const eligibilityStyle = {
  padding: '0.375rem 0.75rem',
  backgroundColor: '#cffafe',
  color: '#0891b2',
  borderRadius: '999px',
  fontSize: '0.875rem',
  fontWeight: 600
};

const featuresCellStyle = {
  padding: '0.5rem 0',
  textAlign: 'left'
};

const featuresListStyle = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem'
};

const featureItemStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  fontSize: '0.875rem',
  color: '#475569',
  lineHeight: 1.5
};

const tableActionRowStyle = {
  display: 'grid',
  gridTemplateColumns: '200px repeat(4, 1fr)',
  gap: '1rem',
  padding: '1.5rem',
  borderTop: '2px solid #e2e8f0',
  borderBottomLeftRadius: '1rem',
  borderBottomRightRadius: '1rem'
};

const tableActionCellStyle = {
  display: 'flex',
  justifyContent: 'center'
};

const applyButtonStyle = {
  padding: '0.75rem 2rem',
  backgroundColor: '#0891b2',
  color: 'white',
  border: 'none',
  borderRadius: '0.75rem',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  width: '100%',
  maxWidth: '200px',
  boxShadow: '0 4px 12px rgba(8, 145, 178, 0.2)'
};

const highlightApplyButtonStyle = {
  backgroundColor: '#06b6d4',
  boxShadow: '0 6px 16px rgba(6, 182, 212, 0.3)'
};

// Info Section Styles
const infoSectionStyle = {
  padding: '3rem 2rem',
  backgroundColor: '#f8fafc'
};

const infoCardStyle = {
  maxWidth: '800px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '1rem',
  padding: '2rem',
  display: 'flex',
  gap: '1.5rem',
  alignItems: 'flex-start',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  border: '1px solid #e2e8f0'
};

const infoIconStyle = {
  width: '64px',
  height: '64px',
  borderRadius: '1rem',
  backgroundColor: '#cffafe',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
};

const infoTitleStyle = {
  fontSize: '1.5rem',
  fontWeight: 700,
  color: '#0f172a',
  marginBottom: '0.5rem'
};

const infoTextStyle = {
  color: '#64748b',
  lineHeight: 1.6,
  marginBottom: '1.5rem'
};

const infoButtonStyle = {
  padding: '0.75rem 1.5rem',
  backgroundColor: '#0891b2',
  color: 'white',
  border: 'none',
  borderRadius: '0.75rem',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: '0 4px 12px rgba(8, 145, 178, 0.2)'
};

export default Comparison;

