import React from 'react';
import { CheckCircle, Clock, FileText, ArrowRight } from 'lucide-react';

function VerificationStatus({ status, onContinue }) {
  // Status: 'email_verified' | 'profile_pending' | 'profile_verified' | 'documents_required'
  
  if (status === 'email_verified') {
    return (
      <div style={statusContainerStyle}>
        <div style={statusCardStyle}>
          <div style={iconWrapperStyle}>
            <CheckCircle size={64} color="#22c55e" />
          </div>
          <h2 style={statusTitleStyle}>Email Successfully Verified!</h2>
          <p style={statusMessageStyle}>
            After successfully verified, you got this one. Your email has been verified and your account is now active.
          </p>
          <p style={statusSubMessageStyle}>
            You can now access your dashboard and start your education loan journey.
          </p>
          {onContinue && (
            <button onClick={onContinue} style={continueButtonStyle}>
              Continue to Dashboard
              <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (status === 'profile_pending') {
    return (
      <div style={statusContainerStyle}>
        <div style={statusCardStyle}>
          <div style={iconWrapperPendingStyle}>
            <Clock size={64} color="#f59e0b" />
          </div>
          <h2 style={statusTitleStyle}>Profile Verification Pending</h2>
          <p style={statusMessageStyle}>
            After the agent verified your profile, you will be there. Our team is currently reviewing your profile.
          </p>
          <p style={statusSubMessageStyle}>
            Once your profile is verified by our agent, you'll be able to proceed with document submission and loan application.
          </p>
          <div style={infoBoxStyle}>
            <FileText size={24} color="#22c55e" />
            <div>
              <p style={infoTitleStyle}>What's Next?</p>
              <p style={infoTextStyle}>
                Our verification team will review your profile and contact you if any additional information is needed.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

const statusContainerStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
};

const statusCardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '1.5rem',
  padding: '3rem',
  maxWidth: '600px',
  width: '100%',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  textAlign: 'center'
};

const iconWrapperStyle = {
  width: '120px',
  height: '120px',
  borderRadius: '50%',
  backgroundColor: '#dcfce7',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 2rem'
};

const iconWrapperPendingStyle = {
  width: '120px',
  height: '120px',
  borderRadius: '50%',
  backgroundColor: '#fef3c7',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 2rem'
};

const statusTitleStyle = {
  fontSize: '2rem',
  fontWeight: 700,
  color: '#0f172a',
  marginBottom: '1rem'
};

const statusMessageStyle = {
  fontSize: '1.125rem',
  color: '#475569',
  lineHeight: 1.7,
  marginBottom: '1rem'
};

const statusSubMessageStyle = {
  fontSize: '1rem',
  color: '#64748b',
  lineHeight: 1.6,
  marginBottom: '2rem'
};

const continueButtonStyle = {
  padding: '0.875rem 2rem',
  backgroundColor: '#22c55e',
  color: 'white',
  border: 'none',
  borderRadius: '0.75rem',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
};

const infoBoxStyle = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: '0.75rem',
  padding: '1.5rem',
  display: 'flex',
  gap: '1rem',
  alignItems: 'flex-start',
  marginTop: '2rem',
  textAlign: 'left'
};

const infoTitleStyle = {
  fontSize: '1rem',
  fontWeight: 600,
  color: '#15803d',
  marginBottom: '0.5rem'
};

const infoTextStyle = {
  fontSize: '0.95rem',
  color: '#166534',
  lineHeight: 1.6
};

export default VerificationStatus;



