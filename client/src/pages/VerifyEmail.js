import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import apiClient from '../config/axios';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, XCircle, Mail, Loader, ArrowLeft, Lock, Eye, EyeOff, Check, X } from 'lucide-react';

// Password Strength Indicator Component
function PasswordStrengthIndicator({ password }) {
  const getStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z\d]/.test(pwd)) strength++;
    return strength;
  };

  const strength = getStrength(password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['#ef4444', '#f59e0b', '#eab308', '#3b82f6', '#10b981'];

  if (!password) return null;

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: '4px',
              backgroundColor: i < strength ? strengthColors[Math.min(strength - 1, 4)] : '#e5e7eb',
              borderRadius: '2px',
              transition: 'background-color 0.3s'
            }}
          />
        ))}
      </div>
      <p style={{ fontSize: '0.75rem', color: strengthColors[Math.min(strength - 1, 4)] }}>
        Password strength: {strengthLabels[Math.min(strength - 1, 4)]}
      </p>
    </div>
  );
}

// Password Requirements Component
function PasswordRequirements({ password }) {
  const requirements = [
    { test: (pwd) => pwd.length >= 8, label: 'At least 8 characters' },
    { test: (pwd) => pwd.length >= 12, label: 'At least 12 characters (recommended)' },
    { test: (pwd) => /[a-z]/.test(pwd), label: 'One lowercase letter' },
    { test: (pwd) => /[A-Z]/.test(pwd), label: 'One uppercase letter' },
    { test: (pwd) => /\d/.test(pwd), label: 'One number' },
    { test: (pwd) => /[^a-zA-Z\d]/.test(pwd), label: 'One special character (!@#$%^&*)' }
  ];

  if (!password) return null;

  return (
    <div style={{
      marginTop: '0.75rem',
      padding: '0.75rem',
      backgroundColor: '#f9fafb',
      borderRadius: '0.5rem',
      fontSize: '0.875rem'
    }}>
      <p style={{ marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>Password requirements:</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        {requirements.map((req, index) => {
          const met = req.test(password);
          return (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {met ? (
                <Check size={14} color="#10b981" />
              ) : (
                <X size={14} color="#9ca3af" />
              )}
              <span style={{ color: met ? '#10b981' : '#6b7280' }}>
                {req.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [settingPassword, setSettingPassword] = useState(false);
  const attemptedTokenRef = useRef(null);
  const navigate = useNavigate();
  const { verifyToken } = useAuth();
  const token = searchParams.get('token');

  const verifyEmail = useCallback(async (verificationToken) => {
    try {
      if (!verificationToken) {
        console.error('❌ No verification token provided');
        setError('No verification token found in the link. Please check your email and try again.');
        setVerifying(false);
        return;
      }

      // searchParams.get() automatically decodes URL-encoded parameters
      // But we'll handle it explicitly to be safe
      let decodedToken = verificationToken;
      
      // Always try to decode - the token is URL encoded in the email
      // searchParams.get() should already decode it, but let's be explicit
      try {
        // If token contains % signs, it's still encoded
        if (verificationToken && verificationToken.includes('%')) {
          decodedToken = decodeURIComponent(verificationToken);
          console.log('✅ Token was URL encoded, decoded it');
        } else {
          // Token might already be decoded by searchParams.get()
          decodedToken = verificationToken;
          console.log('✅ Token appears to be already decoded');
        }
      } catch (e) {
        // If decoding fails, use original (might already be decoded)
        console.log('⚠️ Token decoding failed, using original token:', e.message);
        decodedToken = verificationToken;
      }
      
      console.log('🔵 Verifying email with token:', decodedToken ? `${decodedToken.substring(0, 30)}...` : 'NO TOKEN');
      console.log('Decoded token length:', decodedToken?.length);
      console.log('Original token (first 30):', verificationToken ? `${verificationToken.substring(0, 30)}...` : 'NO TOKEN');
      console.log('Original token length:', verificationToken?.length);
      console.log('Tokens are different?', verificationToken !== decodedToken);
      
      const response = await apiClient.post('/api/auth/verify-email', {
        token: decodedToken
      });

      if (response.data.valid && response.data.success) {
        setVerified(true);
        setMessage(response.data.message || 'Email verified successfully!');

        // Auto-login user after verification
        if (response.data.token && response.data.user) {
          // Store token in localStorage
          const jwtToken = response.data.token;
          localStorage.setItem('token', jwtToken);
          setAuthToken(jwtToken);
          console.log('✅ Token stored in localStorage after email verification');
          console.log('Token (first 20 chars):', jwtToken ? `${jwtToken.substring(0, 20)}...` : 'NO TOKEN');
          console.log('Token length:', jwtToken?.length);
          
          // Verify token was stored
          const storedToken = localStorage.getItem('token');
          if (storedToken !== jwtToken) {
            console.error('❌ Token storage verification failed!');
            console.error('Expected:', jwtToken?.substring(0, 20));
            console.error('Stored:', storedToken?.substring(0, 20));
          } else {
            console.log('✅ Token storage verified successfully');
          }
          
          setUserData(response.data.user);
          
          // Update auth context
          try {
            await verifyToken();
            console.log('✅ Auth context updated');
          } catch (authError) {
            console.error('Auth context update error:', authError);
          }

          // Check if user doesn't have a password - show password setup (for both Google and regular users)
          if (!response.data.user.hasPassword) {
            console.log('User has no password, showing password setup screen');
            // Double-check token is still available before showing password setup
            const tokenCheck = localStorage.getItem('token');
            if (!tokenCheck) {
              console.error('❌ Token missing when showing password setup! Re-storing...');
              localStorage.setItem('token', jwtToken);
            }
            console.log('Token available for password setup:', !!localStorage.getItem('token'));
            setShowPasswordSetup(true);
          } else {
            // Regular user or Google user with password - redirect to dashboard
            setTimeout(() => {
              if (response.data.user.role === 'admin') {
                navigate('/admin/dashboard');
              } else {
                navigate('/dashboard');
              }
            }, 2000);
          }
        } else {
          // Fallback: redirect to login if no token provided
          setTimeout(() => {
            navigate('/login', { 
              state: { 
                message: 'Email verified successfully! Please login to access your dashboard.',
                verified: true
              } 
            });
          }, 2000);
        }
      } else {
        setVerified(false);
        const errorMsg = response.data.error || 'Verification failed';
        console.error('Verification failed:', errorMsg);
        console.error('Response data:', response.data);
        setError(errorMsg);
      }
    } catch (err) {
      setVerified(false);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to verify email. The link may have expired.';
      console.error('Verification error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      setError(errorMsg);
    } finally {
      setVerifying(false);
    }
  }, [navigate, verifyToken]);

  useEffect(() => {
    if (!token) {
      console.error('No token found in URL');
      setVerifying(false);
      setError('No verification token provided');
      return;
    }

    if (attemptedTokenRef.current === token) {
      return;
    }

    attemptedTokenRef.current = token;
    console.log('Token from URL:', token ? `${token.substring(0, 30)}...` : 'NO TOKEN');
    verifyEmail(token);
  }, [token, verifyEmail]);

  // Ensure token is available when password setup screen is shown
  useEffect(() => {
    if (showPasswordSetup) {
      const tokenCheck = authToken || localStorage.getItem('token');
      console.log('Password setup screen shown. Token check:', tokenCheck ? 'Token exists' : 'No token');
      if (!tokenCheck && userData) {
        console.error('❌ Token missing on password setup screen but userData exists');
        console.log('User data:', userData);
        // The token should have been stored during verification
        // If it's missing, we need to handle this gracefully
        setPasswordError('Session expired. Please verify your email again.');
      } else if (tokenCheck) {
        console.log('✅ Token is available for password setup');
      }
    }
  }, [showPasswordSetup, userData, authToken]);

  const handleResendEmail = async () => {
    setMessage('Please log in to resend verification email.');
  };

  const validatePassword = (pwd) => {
    const errors = [];
    
    if (!pwd) {
      return ['Password is required'];
    }
    
    if (pwd.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[a-z]/.test(pwd)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[A-Z]/.test(pwd)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/\d/.test(pwd)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[^a-zA-Z\d]/.test(pwd)) {
      errors.push('Password must contain at least one special character (!@#$%^&*)');
    }
    
    return errors;
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setSettingPassword(true);

    // Validation
    if (!password) {
      setPasswordError('Password is required');
      setSettingPassword(false);
      return;
    }

    // Check password requirements
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setPasswordError(passwordErrors[0]);
      setSettingPassword(false);
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      setSettingPassword(false);
      return;
    }

    try {
      // Check if token exists before making request
      const tokenFromStorage = localStorage.getItem('token');
      const tokenToUse = authToken || tokenFromStorage;

      console.log('Checking for token before password set:', tokenToUse ? 'Token available' : 'No token');
      console.log('Token source:', authToken ? 'component state' : tokenFromStorage ? 'localStorage' : 'none');
      console.log('Token value (first 20 chars):', tokenToUse ? `${tokenToUse.substring(0, 20)}...` : 'NO TOKEN');

      if (!tokenToUse) {
        console.error('❌ No token found in localStorage. User data:', userData);
        // If we have userData but no token, try to get token from the verification response
        // This might happen if the page was refreshed or token wasn't stored properly
        setPasswordError('Authentication required. Please verify your email again. If you just verified, please wait a moment and try again.');
        setSettingPassword(false);
        return;
      }

      // If token is only in component state, ensure Authorization header is set
      if (!tokenFromStorage && authToken) {
        apiClient.defaults.headers.common.Authorization = `Bearer ${authToken}`;
      }

      console.log('Setting password for user with token...');
      console.log('User data:', userData);
      const response = await apiClient.post('/api/auth/set-password', { password });
      
      if (response.data.success) {
        setMessage('Password set successfully!');
        setShowPasswordSetup(false);
        
        // Redirect to dashboard with justVerified flag
        // The dashboard will show the verification status page
        setTimeout(() => {
          if (userData?.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/dashboard', { state: { justVerified: true } });
          }
        }, 1500);
      }
    } catch (err) {
      console.error('Set password error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });

      const errorData = err.response?.data;
      let errorMessage = 'Failed to set password. Please try again.';
      
      // Handle authentication errors
      if (err.response?.status === 401 || err.response?.status === 403) {
        errorMessage = 'Authentication failed. Please verify your email again.';
      } else if (errorData?.error) {
        errorMessage = errorData.error;
      } else if (errorData?.allErrors && Array.isArray(errorData.allErrors)) {
        // Show all password validation errors
        errorMessage = errorData.allErrors.join('. ');
      } else if (err.message?.includes('Network') || !err.response) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setPasswordError(errorMessage);
    } finally {
      setSettingPassword(false);
    }
  };


  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #f0fdf4 100%)',
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '1.5rem',
        padding: '3rem',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        textAlign: 'center'
      }}>
        {verifying ? (
          <>
            <Loader size={60} style={{ margin: '0 auto 2rem', color: '#16a34a', animation: 'spin 2s linear infinite' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1rem' }}>
              Verifying Your Email...
            </h2>
            <p style={{ color: '#64748b' }}>
              Please wait while we verify your email address.
            </p>
          </>
        ) : verified && showPasswordSetup ? (
          <>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem'
            }}>
              <CheckCircle size={40} color="white" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
              Email Verified!
            </h2>
            <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.95rem' }}>
              Please set a password to complete your account setup. This will allow you to log in with your email and password in the future.
            </p>

            <form onSubmit={handleSetPassword} style={{ textAlign: 'left' }}>
              {passwordError && (
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  fontSize: '0.875rem'
                }}>
                  {passwordError}
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500', fontSize: '0.875rem' }}>
                  Password <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', zIndex: 1 }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError(''); // Clear error when user types
                    }}
                    placeholder="Enter a strong password"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                      paddingRight: '3rem',
                      border: passwordError ? '2px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '0.95rem',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      if (!passwordError) e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = passwordError ? '#ef4444' : '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6b7280',
                      padding: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      zIndex: 1
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#374151'}
                    onMouseLeave={(e) => e.target.style.color = '#6b7280'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {password && <PasswordStrengthIndicator password={password} />}
                {password && <PasswordRequirements password={password} />}
                {passwordError && password && (
                  <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.5rem' }}>{passwordError}</p>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500', fontSize: '0.875rem' }}>
                  Confirm Password <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', zIndex: 1 }} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordError(''); // Clear error when user types
                    }}
                    placeholder="Confirm your password"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                      paddingRight: '3rem',
                      border: passwordError && confirmPassword ? '2px solid #ef4444' : (confirmPassword && password === confirmPassword ? '2px solid #10b981' : '1px solid #d1d5db'),
                      borderRadius: '0.5rem',
                      fontSize: '0.95rem',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      if (!passwordError) e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      if (confirmPassword && password === confirmPassword) {
                        e.target.style.borderColor = '#10b981';
                      } else {
                        e.target.style.borderColor = passwordError ? '#ef4444' : '#d1d5db';
                      }
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6b7280',
                      padding: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      zIndex: 1
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#374151'}
                    onMouseLeave={(e) => e.target.style.color = '#6b7280'}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {confirmPassword && password === confirmPassword && (
                  <p style={{ color: '#10b981', fontSize: '0.75rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Check size={14} /> Passwords match
                  </p>
                )}
                {confirmPassword && password !== confirmPassword && (
                  <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <X size={14} /> Passwords do not match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={settingPassword}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: settingPassword ? '#9ca3af' : '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: settingPassword ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.15s ease, box-shadow 0.2s ease',
                  boxShadow: settingPassword ? 'none' : '0 4px 12px rgba(34, 197, 94, 0.35)'
                }}
                onMouseEnter={(e) => {
                  if (!settingPassword) {
                    e.target.style.backgroundColor = '#16a34a';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 6px 12px -2px rgba(34, 197, 94, 0.45)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!settingPassword) {
                    e.target.style.backgroundColor = '#22c55e';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.35)';
                  }
                }}
              >
                {settingPassword ? 'Setting Password...' : 'Set Password & Continue'}
              </button>
            </form>
          </>
        ) : verified ? (
          <>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem'
            }}>
              <CheckCircle size={40} color="white" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1rem' }}>
              Email Verified!
            </h2>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>
              {message || 'Your email has been successfully verified. Redirecting to your dashboard...'}
            </p>
            <Link
              to="/dashboard"
              style={{
                display: 'inline-block',
                padding: '0.75rem 2rem',
                backgroundColor: '#22c55e',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#22c55e'}
            >
              Go to Dashboard
            </Link>
          </>
        ) : (
          <>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem'
            }}>
              <XCircle size={40} color="white" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1rem' }}>
              Verification Failed
            </h2>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>
              {error || 'The verification link is invalid or has expired.'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              <button
                onClick={handleResendEmail}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#22c55e'}
              >
                <Mail size={20} />
                Resend Verification Email
              </button>
              <Link
                to="/login"
                style={{
                  color: '#16a34a',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#15803d'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#16a34a'}
              >
                <ArrowLeft size={18} />
                Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default VerifyEmail;
