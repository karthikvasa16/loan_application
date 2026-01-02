import React from 'react';
import { X } from 'lucide-react';

function PrivacyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
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
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          animation: 'slideUp 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #86efac 0%, #34d399 100%)',
            color: 'white'
          }}
        >
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
            Privacy Policy
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.5rem',
              cursor: 'pointer',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            padding: '2rem',
            overflowY: 'auto',
            flex: 1,
            lineHeight: '1.8',
            color: '#374151'
          }}
        >
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>
                1. Information We Collect
              </h3>
              <p style={{ marginBottom: '1rem' }}>
                We collect information that you provide directly to us when you:
              </p>
              <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>Create an account or register for our Service</li>
                <li style={{ marginBottom: '0.5rem' }}>Apply for an educational loan</li>
                <li style={{ marginBottom: '0.5rem' }}>Contact us for support</li>
                <li style={{ marginBottom: '0.5rem' }}>Subscribe to our newsletter or updates</li>
              </ul>
              <p style={{ marginBottom: '1rem' }}>
                <strong>Personal Information:</strong> Name, email address, phone number, date of birth, address, financial information, and educational background.
              </p>
              <p style={{ marginBottom: '1rem' }}>
                <strong>Automatically Collected Information:</strong> IP address, browser type, device information, and usage data.
              </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>
                2. How We Use Your Information
              </h3>
              <p style={{ marginBottom: '1rem' }}>
                We use the information we collect to:
              </p>
              <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>Process and evaluate your loan application</li>
                <li style={{ marginBottom: '0.5rem' }}>Verify your identity and creditworthiness</li>
                <li style={{ marginBottom: '0.5rem' }}>Communicate with you about your account and services</li>
                <li style={{ marginBottom: '0.5rem' }}>Send you important updates and notifications</li>
                <li style={{ marginBottom: '0.5rem' }}>Improve our services and user experience</li>
                <li style={{ marginBottom: '0.5rem' }}>Comply with legal obligations</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>
                3. Information Sharing and Disclosure
              </h3>
              <p style={{ marginBottom: '1rem' }}>
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                <li style={{ marginBottom: '0.5rem' }}><strong>With Lenders:</strong> To process your loan application and facilitate loan approval</li>
                <li style={{ marginBottom: '0.5rem' }}><strong>With Credit Bureaus:</strong> To verify your credit history and CIBIL score</li>
                <li style={{ marginBottom: '0.5rem' }}><strong>With Service Providers:</strong> Third-party companies that help us operate our business</li>
                <li style={{ marginBottom: '0.5rem' }}><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li style={{ marginBottom: '0.5rem' }}><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>
                4. Data Security
              </h3>
              <p style={{ marginBottom: '1rem' }}>
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>Encryption of sensitive data in transit and at rest</li>
                <li style={{ marginBottom: '0.5rem' }}>Regular security assessments and updates</li>
                <li style={{ marginBottom: '0.5rem' }}>Access controls and authentication</li>
                <li style={{ marginBottom: '0.5rem' }}>Secure data storage and backup systems</li>
              </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>
                5. Your Rights and Choices
              </h3>
              <p style={{ marginBottom: '1rem' }}>
                You have the right to:
              </p>
              <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                <li style={{ marginBottom: '0.5rem' }}><strong>Access:</strong> Request a copy of your personal information</li>
                <li style={{ marginBottom: '0.5rem' }}><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li style={{ marginBottom: '0.5rem' }}><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li style={{ marginBottom: '0.5rem' }}><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
                <li style={{ marginBottom: '0.5rem' }}><strong>Data Portability:</strong> Receive your data in a portable format</li>
              </ul>
              <p style={{ marginBottom: '1rem' }}>
                To exercise these rights, please contact us using the information provided in the "Contact Us" section.
              </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>
                6. Cookies and Tracking Technologies
              </h3>
              <p style={{ marginBottom: '1rem' }}>
                We use cookies and similar tracking technologies to track activity on our Service and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>
                7. Children's Privacy
              </h3>
              <p style={{ marginBottom: '1rem' }}>
                Our Service is not intended for children under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
              </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>
                8. Changes to This Privacy Policy
              </h3>
              <p style={{ marginBottom: '1rem' }}>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>
                9. Contact Us
              </h3>
              <p style={{ marginBottom: '1rem' }}>
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <p style={{ marginBottom: '1rem' }}>
                <strong>Email:</strong> privacy@kubera.io<br />
                <strong>Phone:</strong> +1 (555) 123-4567<br />
                <strong>Address:</strong> 123 Education Street, City, State 12345
              </p>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1.5rem',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'flex-end',
            background: '#f9fafb'
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: '#16a34a',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#15803d';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#16a34a';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default PrivacyModal;





