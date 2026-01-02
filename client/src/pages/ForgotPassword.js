import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/auth/forgot-password', {
        email: email.trim()
      });

      if (response.data.success) {
        setSuccess(true);
        setError(''); // Clear any previous errors
      } else {
        setError(response.data.error || 'Failed to send reset email');
        setSuccess(false);
      }
    } catch (err) {
      // Check if it's an email not found error
      if (err.response?.data?.emailNotFound) {
        setError(err.response.data.error || 'No account found with this email address. Please check your email and try again.');
      } else {
        setError(err.response?.data?.error || 'Failed to send reset email. Please try again.');
      }
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #f0fdf4 100%)',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.1)',
        top: '-250px',
        right: '-250px',
        filter: 'blur(80px)'
      }} />
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.08)',
        bottom: '-200px',
        left: '-200px',
        filter: 'blur(60px)'
      }} />

      <div style={{
        width: '100%',
        maxWidth: '450px',
        backgroundColor: 'white',
        borderRadius: '1.5rem',
        padding: '3rem',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Logo/Brand */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            marginBottom: '0.5rem'
          }}>
            Kubera
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '0.875rem',
            margin: 0
          }}>
            Reset your password
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#d1fae5',
            color: '#065f46',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            border: '1px solid #6ee7b7'
          }}>
            <CheckCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ margin: 0, fontWeight: '600', marginBottom: '0.5rem' }}>
                Password reset email sent!
              </p>
              <p style={{ margin: 0, fontSize: '0.8125rem' }}>
                Please check your email inbox for the password reset link. The link will expire in 1 hour.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            border: '1px solid #fca5a5'
          }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {!success ? (
          <>
            <p style={{
              color: '#6b7280',
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
              textAlign: 'center',
              lineHeight: '1.6'
            }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit}>
              {/* Email Input */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#374151',
                  fontWeight: '600',
                  fontSize: '0.875rem'
                }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af',
                    zIndex: 1
                  }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    style={{
                      width: '100%',
                      padding: '0.875rem 0.875rem 0.875rem 2.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.75rem',
                      fontSize: '0.9375rem',
                      transition: 'all 0.3s',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  backgroundColor: loading ? '#9ca3af' : '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.15s ease, box-shadow 0.2s ease, transform 0.1s ease',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: loading ? 'none' : '0 4px 12px rgba(34, 197, 94, 0.35)',
                  outline: 'none',
                  textDecoration: 'none',
                  lineHeight: '1.25'
                }}
                onMouseOver={(e) => {
                  if (!loading) e.target.style.backgroundColor = '#16a34a';
                  e.currentTarget.style.textDecoration = 'none';
                }}
                onMouseOut={(e) => {
                  if (!loading) e.target.style.backgroundColor = '#22c55e';
                  e.currentTarget.style.textDecoration = 'none';
                }}
                onFocus={(e) => {
                  if (!loading) e.target.style.boxShadow = '0 0 0 2px rgba(22, 163, 74, 0.25)';
                }}
                onBlur={(e) => {
                  if (!loading) e.target.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.35)';
                }}
              >
                {loading ? (
                  <>
                    <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Sending...</span>
                  </>
                ) : (
                  <span style={{ textDecoration: 'none' }}>Send Reset Link</span>
                )}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                width: '100%',
                padding: '0.875rem',
                backgroundColor: '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                marginBottom: '1rem',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.35)'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#15803d'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#16a34a'}
            >
              Back to Login
            </button>
          </div>
        )}

        {/* Back to Login Link */}
        <div style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          <Link
            to="/login"
            style={{
              color: '#16a34a',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'color 0.3s'
            }}
            onMouseOver={(e) => e.target.style.color = '#15803d'}
            onMouseOut={(e) => e.target.style.color = '#16a34a'}
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>
      </div>

      {/* Add spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default ForgotPassword;

