import React, { useState } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import apiClient from '../config/axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function DeleteAccountModal({ isOpen, onClose, userEmail }) {
  const [step, setStep] = useState(1); // 1 = confirmation, 2 = email-delete input
  const [confirmationText, setConfirmationText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleClose = () => {
    setStep(1);
    setConfirmationText('');
    setError('');
    onClose();
  };

  const handleYes = () => {
    setStep(2);
    setError('');
  };

  const handleNo = () => {
    handleClose();
  };

  const handleDelete = async () => {
    const expectedText = `${userEmail}-delete`;
    if (confirmationText !== expectedText) {
      setError(`Please type "${expectedText}" exactly as shown`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.delete('/api/auth/delete-account', {
        data: {
          email: userEmail,
          confirmationText: confirmationText.trim()
        }
      });

      if (response.data.success) {
        // Logout and redirect to home
        logout();
        navigate('/login', { 
          state: { 
            message: 'Your account has been deleted successfully.' 
          } 
        });
      }
    } catch (err) {
      console.error('Delete account error:', err);
      setError(err.response?.data?.error || 'Failed to delete account. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}
    onClick={handleClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          width: '100%',
          maxWidth: '450px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '0.5rem',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          <X size={20} color="#6b7280" />
        </button>

        {step === 1 ? (
          // Step 1: Confirmation
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#fef2f2',
              margin: '0 auto 1.5rem'
            }}>
              <AlertTriangle size={30} color="#ef4444" />
            </div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              Delete Account?
            </h2>
            <p style={{
              color: '#6b7280',
              marginBottom: '2rem',
              textAlign: 'center',
              lineHeight: '1.6'
            }}>
              Do you really want to delete your account? This action cannot be undone and all your data will be permanently deleted.
            </p>
            <div style={{
              display: 'flex',
              gap: '1rem'
            }}>
              <button
                onClick={handleNo}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#e5e7eb';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#f3f4f6';
                }}
              >
                No
              </button>
              <button
                onClick={handleYes}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#dc2626';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#ef4444';
                }}
              >
                Yes
              </button>
            </div>
          </>
        ) : (
          // Step 2: Email-delete confirmation
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#fef2f2',
              margin: '0 auto 1.5rem'
            }}>
              <Trash2 size={30} color="#ef4444" />
            </div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '0.5rem',
              textAlign: 'center'
            }}>
              Confirm Deletion
            </h2>
            <p style={{
              color: '#6b7280',
              marginBottom: '1.5rem',
              textAlign: 'center',
              fontSize: '0.9rem',
              lineHeight: '1.6'
            }}>
              To confirm, please type <strong style={{ color: '#1f2937' }}>{userEmail}-delete</strong> in the field below:
            </p>
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => {
                  setConfirmationText(e.target.value);
                  setError('');
                }}
                placeholder={`Type: ${userEmail}-delete`}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: error ? '2px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => {
                  if (!error) e.target.style.borderColor = '#667eea';
                }}
                onBlur={(e) => {
                  if (!error) e.target.style.borderColor = '#d1d5db';
                }}
              />
              {error && (
                <p style={{
                  color: '#ef4444',
                  fontSize: '0.875rem',
                  marginTop: '0.5rem'
                }}>
                  {error}
                </p>
              )}
            </div>
            <div style={{
              display: 'flex',
              gap: '1rem'
            }}>
              <button
                onClick={handleClose}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: loading ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.target.style.backgroundColor = '#e5e7eb';
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.target.style.backgroundColor = '#f3f4f6';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading || confirmationText.trim() !== `${userEmail}-delete`}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: confirmationText.trim() === `${userEmail}-delete` && !loading ? '#ef4444' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  cursor: loading || confirmationText.trim() !== 'email-delete' ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  if (!loading && confirmationText.trim() === `${userEmail}-delete`) {
                    e.target.style.backgroundColor = '#dc2626';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && confirmationText.trim() === `${userEmail}-delete`) {
                    e.target.style.backgroundColor = '#ef4444';
                  }
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid white',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Delete
                  </>
                )}
              </button>
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

export default DeleteAccountModal;


