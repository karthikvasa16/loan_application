import React from 'react';

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        marginTop: '2rem',
        padding: '1.5rem 1rem',
        borderTop: '1px solid rgba(148, 163, 184, 0.3)',
        color: '#475569',
        fontSize: '0.85rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <span>© {year} LoanFlow. All rights reserved.</span>
      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
        <span style={{ color: '#94a3b8' }}>Follow us</span>
        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: '#ec4899', textDecoration: 'none', fontWeight: 600 }}>Instagram</a>
        <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>LinkedIn</a>
        <a href="mailto:support@loanflow.io" style={{ color: '#0ea5e9', textDecoration: 'none', fontWeight: 600 }}>support@loanflow.io</a>
      </div>
    </footer>
  );
}

export default Footer;

