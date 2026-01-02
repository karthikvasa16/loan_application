import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Send,
  Trash2,
  Sparkles,
  Compass,
  Calendar,
  BookOpen,
  CheckCircle,
  ArrowRight,
  Clock,
  RefreshCcw,
  Phone,
  ShieldCheck
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DeleteAccountModal from '../components/DeleteAccountModal';
import LoanDocumentsSection from '../components/LoanDocumentsSection';
import VerificationStatus from '../components/VerificationStatus';
import StudentDocumentsUpload from '../components/StudentDocumentsUpload';

function CibilScoreCheck({ onScoreFetched, onClose }) {
  const [panNumber, setPanNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cibilScore, setCibilScore] = useState(null);

  const validatePAN = (pan) => {
    // PAN format: ABCDE1234F (5 letters, 4 digits, 1 letter)
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!panNumber.trim()) {
      setError('Please enter your PAN number');
      return;
    }

    const panUpper = panNumber.trim().toUpperCase();
    if (!validatePAN(panUpper)) {
      setError('Invalid PAN format. Format: ABCDE1234F');
      return;
    }

    setLoading(true);
    
    try {
      // Call backend API to fetch CIBIL score
      const response = await axios.post('/api/cibil/check', {
        pan: panUpper
      });
      
      if (response.data.success) {
        setCibilScore({
          score: response.data.score,
          pan: response.data.pan,
          status: response.data.status,
          eligibility: response.data.eligibility
        });
        
        if (onScoreFetched) {
          onScoreFetched({
            score: response.data.score,
            pan: response.data.pan,
            status: response.data.status,
            eligibility: response.data.eligibility
          });
        }
      } else {
        setError(response.data.error || 'Failed to fetch CIBIL score');
      }
    } catch (err) {
      console.error('CIBIL score fetch error:', err);
      setError(err.response?.data?.error || 'Failed to fetch CIBIL score. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cibilScore) {
    const scoreColor = cibilScore.score >= 750 ? '#22c55e' : cibilScore.score >= 650 ? '#22c55e' : cibilScore.score >= 550 ? '#f59e0b' : '#ef4444';
    
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
        padding: '2rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: `${scoreColor}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <TrendingUp size={40} style={{ color: scoreColor }} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
              Your CIBIL Score
            </h2>
            <div style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: scoreColor,
              marginBottom: '0.5rem'
            }}>
              {cibilScore.score}
            </div>
            <p style={{
              padding: '0.5rem 1rem',
              backgroundColor: `${scoreColor}15`,
              color: scoreColor,
              borderRadius: '0.5rem',
              display: 'inline-block',
              fontWeight: '600',
              marginBottom: '1rem'
            }}>
              {cibilScore.status}
            </p>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              PAN: {cibilScore.pan}
            </p>
          </div>
          
          {cibilScore.eligibility ? (
            <div style={{
              padding: '1rem',
              backgroundColor: '#d1fae5',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              border: '1px solid #6ee7b7'
            }}>
              <p style={{ color: '#065f46', fontWeight: '600', marginBottom: '0.25rem' }}>
                ✓ You are eligible for educational loans!
              </p>
              <p style={{ color: '#047857', fontSize: '0.875rem' }}>
                Proceed to select your loan amount.
              </p>
            </div>
          ) : (
            <div style={{
              padding: '1rem',
              backgroundColor: '#fef3c7',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              border: '1px solid #fde68a'
            }}>
              <p style={{ color: '#92400e', fontWeight: '600' }}>
                ⚠ Your CIBIL score needs improvement for loan eligibility.
              </p>
            </div>
          )}
          
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '0.875rem',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#5568d3'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

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
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '1rem',
        padding: '2rem',
        maxWidth: '450px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
          Check Your CIBIL Score
        </h2>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Enter your PAN number to check your credit score and loan eligibility.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>
              PAN Number
            </label>
            <input
              type="text"
              value={panNumber}
              onChange={(e) => {
                const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10);
                setPanNumber(value);
                setError('');
              }}
              placeholder="ABCDE1234F"
              style={{
                width: '100%',
                padding: '0.875rem',
                border: error ? '2px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                textTransform: 'uppercase',
                fontFamily: 'monospace',
                letterSpacing: '0.1em'
              }}
            />
            {error && (
              <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>{error}</p>
            )}
            <p style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              Format: ABCDE1234F (5 letters, 4 digits, 1 letter)
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.875rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                backgroundColor: 'white',
                color: '#374151',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.875rem',
                    backgroundColor: loading ? '#9ca3af' : '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Checking...' : 'Check Score'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LoanApplicationModal({
  isOpen,
  onClose,
  loanIntent,
  onSubmit,
  documentsConfig
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formValues, setFormValues] = useState({
    fullName: '',
    university: '',
    course: '',
    studyCountry: '',
    contactNumber: '',
    coApplicantName: '',
    coApplicantRelation: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [documentMetadata, setDocumentMetadata] = useState({});
  const [documentFiles, setDocumentFiles] = useState({});
  const [documentErrors, setDocumentErrors] = useState({});

  useEffect(() => {
    if (!isOpen) {
      setActiveStep(0);
      setSubmitting(false);
      setFormValues({
        fullName: '',
        university: '',
        course: '',
        studyCountry: '',
        contactNumber: '',
        coApplicantName: '',
        coApplicantRelation: ''
      });
      setFormErrors({});
      setDocumentMetadata({});
      setDocumentFiles({});
      setDocumentErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Profile & admit details',
      description: 'Share your admit facts so we can evaluate your eligibility.',
      validator: () => {
        const errors = {};
        if (!formValues.fullName.trim()) errors.fullName = 'Full name is required';
        if (!formValues.university.trim()) errors.university = 'University is required';
        if (!formValues.course.trim()) errors.course = 'Program name is required';
        if (!formValues.studyCountry.trim()) errors.studyCountry = 'Destination country is required';
        if (!formValues.contactNumber.trim()) {
          errors.contactNumber = 'Contact number is required';
        } else if (!/^\d{10}$/.test(formValues.contactNumber.trim())) {
          errors.contactNumber = 'Enter a valid 10-digit number';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
      },
      content: (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#1e293b', marginBottom: '0.45rem' }}>
              Full name *
            </label>
            <input
              type="text"
              value={formValues.fullName}
              onChange={(e) =>
                setFormValues((prev) => ({ ...prev, fullName: e.target.value }))
              }
              placeholder="Enter your full legal name"
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                borderRadius: '0.85rem',
                border: formErrors.fullName ? '2px solid #ef4444' : '1px solid #cbd5f5',
                fontSize: '1rem'
              }}
            />
            {formErrors.fullName && (
              <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                {formErrors.fullName}
              </p>
            )}
          </div>

          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#1e293b', marginBottom: '0.45rem' }}>
                University *
              </label>
              <input
                type="text"
                value={formValues.university}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, university: e.target.value }))
                }
                placeholder="Target university or institute"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '0.85rem',
                  border: formErrors.university ? '2px solid #ef4444' : '1px solid #cbd5f5',
                  fontSize: '1rem'
                }}
              />
              {formErrors.university && (
                <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                  {formErrors.university}
                </p>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#1e293b', marginBottom: '0.45rem' }}>
                Program / course *
              </label>
              <input
                type="text"
                value={formValues.course}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, course: e.target.value }))
                }
                placeholder="e.g., MS in Computer Science"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '0.85rem',
                  border: formErrors.course ? '2px solid #ef4444' : '1px solid #cbd5f5',
                  fontSize: '1rem'
                }}
              />
              {formErrors.course && (
                <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                  {formErrors.course}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#1e293b', marginBottom: '0.45rem' }}>
                Destination country *
              </label>
              <input
                type="text"
                value={formValues.studyCountry}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, studyCountry: e.target.value }))
                }
                placeholder="Where will you be studying?"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '0.85rem',
                  border: formErrors.studyCountry ? '2px solid #ef4444' : '1px solid #cbd5f5',
                  fontSize: '1rem'
                }}
              />
              {formErrors.studyCountry && (
                <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                  {formErrors.studyCountry}
                </p>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#1e293b', marginBottom: '0.45rem' }}>
                Contact number *
              </label>
              <input
                type="tel"
                value={formValues.contactNumber}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, contactNumber: e.target.value }))
                }
                placeholder="10-digit mobile number"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '0.85rem',
                  border: formErrors.contactNumber ? '2px solid #ef4444' : '1px solid #cbd5f5',
                  fontSize: '1rem'
                }}
              />
              {formErrors.contactNumber && (
                <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                  {formErrors.contactNumber}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#1e293b', marginBottom: '0.45rem' }}>
                Co-applicant name (optional)
              </label>
              <input
                type="text"
                value={formValues.coApplicantName}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, coApplicantName: e.target.value }))
                }
                placeholder="Parent / guardian / spouse"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '0.85rem',
                  border: '1px solid #cbd5f5',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#1e293b', marginBottom: '0.45rem' }}>
                Relationship with co-applicant
              </label>
              <input
                type="text"
                value={formValues.coApplicantRelation}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, coApplicantRelation: e.target.value }))
                }
                placeholder="e.g., Father, Mother, Spouse"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '0.85rem',
                  border: '1px solid #cbd5f5',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Verify & upload documents',
      description: 'Submit mandatory documents with key details for quicker verification.',
      validator: () => {
        const errors = {};
        documentsConfig.forEach((doc) => {
          const metadata = documentMetadata[doc.id] || {};
          const file = documentFiles[doc.id];
          const docErrors = {};

          doc.fields?.forEach((field) => {
            const value = metadata[field.name]?.trim();
            if (field.required && !value) {
              docErrors[field.name] = `${field.label} is required`;
            } else if (field.pattern && value && !field.pattern.test(value)) {
              docErrors[field.name] = field.validationMessage;
            }
          });

          if (doc.mandatory && !file) {
            docErrors.file = 'File upload is required';
          } else if (
            file &&
            doc.maxSizeMb &&
            file.size > doc.maxSizeMb * 1024 * 1024
          ) {
            docErrors.file = `File must be under ${doc.maxSizeMb}MB`;
          }

          if (Object.keys(docErrors).length > 0) {
            errors[doc.id] = docErrors;
          }
        });

        setDocumentErrors(errors);
        return Object.keys(errors).length === 0;
      },
      content: (
        <LoanDocumentsSection
          documents={documentsConfig}
          metadata={documentMetadata}
          files={documentFiles}
          errors={documentErrors}
          onMetadataChange={(docId, key, value) => {
            setDocumentMetadata((prev) => ({
              ...prev,
              [docId]: { ...(prev[docId] || {}), [key]: value }
            }));
            setDocumentErrors((prev) => ({
              ...prev,
              [docId]: { ...(prev[docId] || {}), [key]: '' }
            }));
          }}
          onFileChange={(docId, file) => {
            setDocumentFiles((prev) => ({ ...prev, [docId]: file }));
            setDocumentErrors((prev) => ({
              ...prev,
              [docId]: { ...(prev[docId] || {}), file: '' }
            }));
          }}
        />
      )
    }
  ];

  const handleNext = async () => {
    const isValid = steps[activeStep].validator();
    if (!isValid) return;

    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
      return;
    }

    setSubmitting(true);
    try {
      const success = await onSubmit({
        loanIntent,
        profile: formValues,
        documents: {
          metadata: documentMetadata,
          files: documentFiles
        }
      });

      if (success !== false) {
        onClose();
      }
    } catch (error) {
      console.error('Loan submission failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const progress = ((activeStep + 1) / steps.length) * 100;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15,23,42,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1050,
        padding: '2rem'
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '1.25rem',
          padding: '2rem',
          maxWidth: '760px',
          width: '100%',
          boxShadow: '0 30px 60px -24px rgba(15, 23, 42, 0.35)',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: '#64748b',
            fontSize: '1.5rem',
            lineHeight: 1
          }}
          aria-label="Close"
        >
          ×
        </button>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                Complete your application
              </h2>
              <p style={{ color: '#475569', fontSize: '0.95rem' }}>
                Step {activeStep + 1} of {steps.length} · {steps[activeStep].description}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.85rem', color: '#475569' }}>Loan amount</p>
              <p style={{ fontWeight: 600, color: '#4338ca' }}>
                {loanIntent ? loanIntent.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }) : '—'}
              </p>
            </div>
          </div>
          <div style={{ height: '6px', borderRadius: '999px', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)', height: '100%' }} />
          </div>
        </div>

        <div style={{ marginBottom: '1.75rem' }}>
          {steps[activeStep].content}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => {
              if (submitting) return;
              if (activeStep === 0) {
                onClose();
              } else {
                setActiveStep((prev) => Math.max(0, prev - 1));
              }
            }}
            style={{
              padding: '0.9rem 1.5rem',
              borderRadius: '0.9rem',
              border: '1px solid #cbd5f5',
              backgroundColor: '#f8fafc',
              color: '#475569',
              fontWeight: 600,
              cursor: 'pointer',
              minWidth: '160px'
            }}
          >
            {activeStep === 0 ? 'Cancel' : 'Back'}
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={submitting}
            style={{
              padding: '0.9rem 1.8rem',
              borderRadius: '0.9rem',
              border: 'none',
              background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
              color: 'white',
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
              minWidth: '200px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 20px 35px -25px rgba(79, 70, 229, 0.7)'
            }}
          >
            {submitting ? 'Submitting...' : activeStep === steps.length - 1 ? 'Submit application' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DocumentChecklist({ documents, onToggle }) {
  const completed = useMemo(
    () => documents.filter((doc) => doc.ready).length,
    [documents]
  );

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '1.5rem',
      padding: '1.75rem',
      boxShadow: '0 20px 40px -28px rgba(15, 23, 42, 0.25)',
      border: '1px solid rgba(226,232,240,0.6)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 600, color: '#0f172a' }}>Documents checklist</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Mark the documents you already have ready. We’ll guide you through the rest.</p>
        </div>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
          {completed}/{documents.length} ready
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {documents.map((doc) => (
          <label key={doc.id} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.9rem',
            padding: '1rem',
            borderRadius: '1rem',
            border: doc.ready ? '1px solid #bbf7d0' : '1px solid rgba(226,232,240,0.8)',
            backgroundColor: doc.ready ? '#f0fdf4' : '#f8fafc',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={doc.ready}
              onChange={() => onToggle(doc.id)}
              style={{ marginTop: '0.3rem', transform: 'scale(1.2)' }}
            />
            <div>
              <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.3rem' }}>{doc.title}</p>
              <p style={{ color: '#475569', fontSize: '0.9rem' }}>{doc.description}</p>
              {doc.mandatory && (
                <span style={{
                  marginTop: '0.5rem',
                  display: 'inline-block',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '999px',
                  backgroundColor: '#e0f2fe',
                  color: '#0369a1',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  Mandatory
                </span>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

function StudentDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const [showCibilCheck, setShowCibilCheck] = useState(false);
  const [showBasicDetailsForm, setShowBasicDetailsForm] = useState(false);
  const [cibilScore, setCibilScore] = useState(null);
  const [selectedLoanOffer, setSelectedLoanOffer] = useState(null);
  const [loanIntent, setLoanIntent] = useState(null);
  const [plannerAmount, setPlannerAmount] = useState(500000);
  const [plannerDuration, setPlannerDuration] = useState(24);
  const [plannerPurpose, setPlannerPurpose] = useState('Tuition & living expenses');
  const [plannerMessage, setPlannerMessage] = useState('');
  const [basicDetails, setBasicDetails] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const requiredDocuments = useMemo(() => [
    {
      id: 'personalDetails',
      step: 1,
      title: 'Personal Details',
      description: 'Basic personal information as per official documents.',
      mandatory: true,
      fields: [
        {
          name: 'givenName',
          label: 'Given Name',
          placeholder: 'First Name + Middle Name',
          required: true
        },
        {
          name: 'surname',
          label: 'Surname',
          placeholder: 'Last Name',
          required: true
        },
        {
          name: 'gender',
          label: 'Gender',
          type: 'select',
          options: ['Male', 'Female', 'Transgender'],
          required: true
        },
        {
          name: 'dateOfBirth',
          label: 'Date of Birth',
          type: 'date',
          required: true
        }
      ]
    },
    {
      id: 'identityDocuments',
      step: 2,
      title: 'Identity Documents',
      description: 'Upload identity proof documents.',
      mandatory: true,
      accept: '.pdf,.jpg,.jpeg,.png',
      maxSizeMb: 5,
      fields: [
        {
          name: 'documentType',
          label: 'Document Type',
          type: 'select',
          options: ['Aadhaar Card', 'Passport', 'Voter ID'],
          required: true
        },
        {
          name: 'documentNumber',
          label: 'Document Number',
          placeholder: 'Enter document number',
          required: true
        },
        {
          name: 'nameOnDocument',
          label: 'Name as per Document',
          placeholder: 'Enter name as printed',
          required: true
        }
      ]
    },
    {
      id: 'addressDetails',
      step: 3,
      title: 'Address Details',
      description: 'Current and permanent address information.',
      mandatory: true,
      fields: [
        {
          name: 'currentAddress',
          label: 'Current Address',
          type: 'textarea',
          placeholder: 'House No., Street, Area',
          required: true
        },
        {
          name: 'city',
          label: 'City',
          placeholder: 'Enter city',
          required: true
        },
        {
          name: 'state',
          label: 'State',
          placeholder: 'Enter state',
          required: true
        },
        {
          name: 'pincode',
          label: 'PIN Code',
          placeholder: '6-digit PIN code',
          pattern: /^[0-9]{6}$/,
          validationMessage: 'Enter valid 6-digit PIN code',
          required: true
        }
      ]
    },
    {
      id: 'educationDetails',
      step: 4,
      title: 'Education Details',
      description: 'Academic qualifications and admission information.',
      mandatory: true,
      fields: [
        {
          name: 'qualification',
          label: 'Highest Qualification',
          placeholder: 'e.g., B.Tech in Computer Science',
          required: true
        },
        {
          name: 'institution',
          label: 'Target Institution',
          placeholder: 'University / College name',
          required: true
        },
        {
          name: 'course',
          label: 'Course/Program',
          placeholder: 'e.g., MS in Computer Science',
          required: true
        },
        {
          name: 'intake',
          label: 'Intake/Semester',
          placeholder: 'e.g., Fall 2025',
          required: true
        }
      ]
    },
    {
      id: 'financialDetails',
      step: 5,
      title: 'Financial Details',
      description: 'Income and financial information.',
      mandatory: true,
      fields: [
        {
          name: 'annualIncome',
          label: 'Annual Family Income',
          placeholder: 'Enter amount in INR',
          required: true
        },
        {
          name: 'loanAmount',
          label: 'Required Loan Amount',
          placeholder: 'Enter amount in INR',
          required: true
        },
        {
          name: 'coApplicantName',
          label: 'Co-applicant Name',
          placeholder: 'Parent/Guardian name',
          required: false
        },
        {
          name: 'coApplicantRelation',
          label: 'Relationship',
          placeholder: 'Father/Mother/Guardian',
          required: false
        }
      ]
    },
    {
      id: 'documentUploads',
      step: 6,
      title: 'Document Uploads',
      description: 'Upload all required documents.',
      mandatory: true,
      accept: '.pdf,.jpg,.jpeg,.png',
      maxSizeMb: 10,
      fields: [
        {
          name: 'panCard',
          label: 'PAN Card',
          type: 'file',
          required: true
        },
        {
          name: 'admissionLetter',
          label: 'Admission/Offer Letter',
          type: 'file',
          required: true
        },
        {
          name: 'academicTranscripts',
          label: 'Academic Transcripts',
          type: 'file',
          required: true
        },
        {
          name: 'incomeProof',
          label: 'Income Proof',
          type: 'file',
          required: false
        }
      ]
    }
  ], []);
  const [documents, setDocuments] = useState(() =>
    requiredDocuments.map((doc) => ({
      id: doc.id,
      title: doc.title,
      description: doc.description,
      mandatory: doc.mandatory,
      ready: false
    }))
  );
  const [loanApplications, setLoanApplications] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const loanPlannerMaxAmount = useMemo(() => {
    if (!cibilScore) return 2000000;
    if (cibilScore.score >= 750) return 2000000;
    if (cibilScore.score >= 650) return 1000000;
    return 500000;
  }, [cibilScore]);

  useEffect(() => {
    setPlannerAmount((prev) => Math.min(prev, loanPlannerMaxAmount));
  }, [loanPlannerMaxAmount]);

  useEffect(() => {
    setPlannerMessage('');
  }, [selectedLoanOffer, cibilScore]);

  useEffect(() => {
    if (!loanIntent) return;
    if (loanIntent.amount) setPlannerAmount(loanIntent.amount);
    if (loanIntent.duration) setPlannerDuration(loanIntent.duration);
    if (loanIntent.purpose) setPlannerPurpose(loanIntent.purpose);
  }, [loanIntent]);

  const formatCurrency = useCallback((value) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value), []);

  const estimatedEmi = useMemo(() => {
    const principal = plannerAmount;
    const monthlyRate = 11.5 / 12 / 100;
    const tenure = plannerDuration;
    if (!principal || !monthlyRate || !tenure) return 0;
    const power = Math.pow(1 + monthlyRate, tenure);
    const emi = (principal * monthlyRate * power) / (power - 1 || 1);
    return Math.round(emi);
  }, [plannerAmount, plannerDuration]);

  const firstName = useMemo(() => {
    if (!user?.name) return 'Scholar';
    return user.name.split(' ')[0];
  }, [user?.name]);

  const initials = useMemo(() => {
    if (!user?.name) {
      if (!user?.email) return 'KU';
      return user.email.slice(0, 2).toUpperCase();
    }
    const parts = user.name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }, [user?.name, user?.email]);

  const openCibilModal = useCallback(() => setShowCibilCheck(true), []);

  const goToLoanPlanner = useCallback(() => {
    const section = document.getElementById('loan-plan');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const openLoanSelector = useCallback(() => {
    goToLoanPlanner();
  }, [goToLoanPlanner]);

  const handleCibilScoreFetched = useCallback((scoreData) => {
    setCibilScore(scoreData);
    setShowCibilCheck(false);
    if (scoreData.eligibility) {
      goToLoanPlanner();
    }
  }, [goToLoanPlanner]);

  const fetchApplications = useCallback(async () => {
    try {
      const response = await axios.get('/api/loans/my-applications');
      setLoanApplications(response.data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  }, []);

  const handleLoanPlannerSubmit = useCallback(() => {
    if (!selectedLoanOffer) {
      setPlannerMessage('Pick a funding program to unlock the planner.');
      goToLoanPlanner();
      return;
    }

    const intent = {
      amount: plannerAmount,
      purpose: plannerPurpose,
      duration: plannerDuration,
      cibilScore: cibilScore?.score || null,
      pan: cibilScore?.pan || null,
      programId: selectedLoanOffer
    };

    setLoanIntent(intent);
    setPlannerMessage('');
    setShowBasicDetailsForm(true);
  }, [selectedLoanOffer, cibilScore, plannerAmount, plannerPurpose, plannerDuration, goToLoanPlanner]);

  const handleBasicDetailsSubmit = useCallback(async ({ loanIntent: intent, profile, documents }) => {
    try {
      const formData = new FormData();
      formData.append('amount', intent.amount);
      formData.append('purpose', intent.purpose);
      formData.append('duration', intent.duration);
      if (intent.cibilScore) formData.append('cibilScore', intent.cibilScore);
      if (intent.pan) formData.append('pan', intent.pan);
      if (intent.programId) formData.append('programId', intent.programId);

      formData.append('profile[fullName]', profile.fullName);
      formData.append('profile[university]', profile.university);
      formData.append('profile[course]', profile.course);
      formData.append('profile[studyCountry]', profile.studyCountry);
      formData.append('profile[contactNumber]', profile.contactNumber);
      if (profile.coApplicantName) formData.append('profile[coApplicantName]', profile.coApplicantName);
      if (profile.coApplicantRelation) formData.append('profile[coApplicantRelation]', profile.coApplicantRelation);

      Object.entries(documents.metadata || {}).forEach(([docId, meta]) => {
        Object.entries(meta || {}).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(`documents[${docId}][metadata][${key}]`, value);
          }
        });
      });

      Object.entries(documents.files || {}).forEach(([docId, file]) => {
        if (file) {
          formData.append(`documents[${docId}][file]`, file);
        }
      });

      const response = await axios.post('/api/loans/apply', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setBasicDetails(profile);
        setLoanIntent(intent);
        setShowBasicDetailsForm(false);
        fetchApplications();
        return true;
      }
    } catch (error) {
      console.error('Loan application error:', error);
      return false;
    }
    return false;
  }, [fetchApplications]);

  const handleDocumentToggle = useCallback((id) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id ? { ...doc, ready: !doc.ready } : doc
      )
    );
  }, []);

  const openBasicDetails = useCallback(() => {
    if (!loanIntent) {
      setPlannerMessage('Lock your loan amount first to continue.');
      goToLoanPlanner();
      return;
    }
    setShowBasicDetailsForm(true);
  }, [loanIntent, goToLoanPlanner]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [location.hash]);

  const sortedApplications = useMemo(() => {
    if (!loanApplications.length) return [];
    return [...loanApplications].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [loanApplications]);

  const loanPrograms = useMemo(() => ([
    {
      id: 'starter',
      title: 'LaunchPad Loans',
      description: 'Perfect for students starting their journey with flexible EMIs and quick approval.',
      coverage: 'Up to ₹25L · 15 year tenure',
      highlights: ['No pre-payment penalty', 'Dual parent + student co-applicant', 'Grace period up to 12 months'],
      accent: '#22c55e'
    },
    {
      id: 'global',
      title: 'Global Dream Fund',
      description: 'Designed for international admits with zero margin requirements and USD payouts.',
      coverage: 'Up to ₹40L · 20 year tenure',
      highlights: ['Covers tuition + living', 'Multi-currency disbursal', 'Visa assistance desk'],
      accent: '#16a34a'
    },
    {
      id: 'accelerate',
      title: 'Accelerate Pro',
      description: 'For top admits with premium rates, faster disbursal and credit boosters.',
      coverage: 'Up to ₹60L · 20 year tenure',
      highlights: ['Rate drop rewards', 'AI-powered offer comparison', 'Dedicated relationship coach'],
      accent: '#22c55e'
    }
  ]), []);

  const progressHighlights = useMemo(() => {
    return [
      cibilScore
        ? { label: 'Credit check', value: `${cibilScore.score} pts`, accent: cibilScore.score >= 750 ? '#22c55e' : '#f97316' }
        : { label: 'Credit check', value: 'Pending', accent: '#f97316' },
      loanIntent
        ? { label: 'Requested amount', value: `₹${loanIntent.amount?.toLocaleString('en-IN')}`, accent: '#38bdf8' }
        : { label: 'Requested amount', value: 'Awaiting selection', accent: '#38bdf8' },
      basicDetails
        ? { label: 'Profile details', value: 'Submitted', accent: '#a855f7' }
        : { label: 'Profile details', value: 'Pending', accent: '#a855f7' }
    ];
  }, [cibilScore, loanIntent, basicDetails]);

  const journeySteps = useMemo(() => [
    {
      title: 'Explore funding programs',
      description: 'Review our specialised loan programs and pick the one that fits your journey.',
      completed: !!selectedLoanOffer,
      actionLabel: 'View programs',
      onAction: () => {
        document.getElementById('programs')?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      title: 'Choose your loan amount',
      description: 'Check your credit snapshot, then design the amount and tenure that fits your plan.',
      completed: !!loanIntent,
      actionLabel: cibilScore ? 'Design amount' : 'Check CIBIL',
      onAction: cibilScore ? openLoanSelector : openCibilModal
    },
    {
      title: 'Share basic details',
      description: 'Tell us about your admit, course and contact so we can match lending partners.',
      completed: !!basicDetails,
      actionLabel: basicDetails ? 'Update details' : 'Add details',
      onAction: openBasicDetails
    },
    {
      title: 'Prepare documents',
      description: 'Keep your identity, admission and financial proofs ready for quick approval.',
      completed: documents.every((doc) => doc.ready),
      actionLabel: 'View checklist',
      onAction: () => {
        document.getElementById('documents')?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  ], [selectedLoanOffer, loanIntent, basicDetails, documents, cibilScore, openLoanSelector, openCibilModal, openBasicDetails]);

  const recommendedResources = useMemo(() => [
    {
      title: 'Scholarship handbook 2025',
      preview: '40+ verified scholarships curated for STEM, business, and creative programs.',
      icon: BookOpen,
      accent: '#60a5fa'
    },
    {
      title: 'Visa timeline planner',
      preview: 'Plan document submissions, visa slots, and travel with confidence.',
      icon: Calendar,
      accent: '#facc15'
    },
    {
      title: 'Financial wellness toolkit',
      preview: 'Budget templates, credit boosters, and repayment playbooks for students abroad.',
      icon: Compass,
      accent: '#34d399'
    }
  ], []);

  const inspirationQuote = useMemo(() => ({
    quote: '“The future belongs to those who believe in the beauty of their dreams.”',
    author: 'Eleanor Roosevelt',
    context: 'Every application you submit today becomes tomorrow’s success story.'
  }), []);

  const plannerMinAmount = 100000;
  const plannerStep = 50000;

  // Fetch user status on mount
  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const response = await axios.get('/api/auth/me');
        const userData = response.data.user;
        
        // Determine user status - check if profileVerified and documentsSubmitted exist
        // For now, we'll use emailVerified as the main check
        if (userData.emailVerified && !userData.profileVerified) {
          setUserStatus('profile_pending');
        } else if (userData.emailVerified && userData.profileVerified && !userData.documentsSubmitted) {
          setUserStatus('documents_required');
        } else {
          setUserStatus('ready');
        }
      } catch (error) {
        console.error('Error fetching user status:', error);
        // Default to ready if error
        setUserStatus('ready');
      } finally {
        setLoadingStatus(false);
      }
    };

    if (user) {
      fetchUserStatus();
    } else {
      setLoadingStatus(false);
      setUserStatus('ready');
    }
  }, [user]);

  // Show loading state
  if (loadingStatus) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #e2e8f0',
            borderTopColor: '#22c55e',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#64748b' }}>Loading...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Always show documents upload portal for students (streamlined phase)
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    }}>
      <StudentDocumentsUpload />
    </div>
  );

 
}

export default StudentDashboard;
