import React from 'react';

function DocumentUploadItem({
  document,
  metadata,
  onMetadataChange,
  onFileChange,
  error
}) {
  const { id, title, description, mandatory, fields = [] } = document;

  return (
    <div
      style={{
        border: '1px solid rgba(226,232,240,0.8)',
        borderRadius: '1.25rem',
        padding: '1.25rem',
        backgroundColor: 'white',
        display: 'grid',
        gap: '0.9rem'
      }}
    >
      <div>
        <h3
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: '#0f172a',
            marginBottom: '0.35rem'
          }}
        >
          {title}
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{description}</p>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {fields.map((field) => (
          <div key={field.name}>
            <label
              style={{
                display: 'block',
                color: '#1e293b',
                fontWeight: 500,
                marginBottom: '0.35rem'
              }}
            >
              {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            <input
              type="text"
              value={metadata[field.name] || ''}
              placeholder={field.placeholder}
              onChange={(e) =>
                onMetadataChange(id, field.name, e.target.value)
              }
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.75rem',
                border: error?.[field.name] ? '2px solid #ef4444' : '1px solid #cbd5f5',
                fontSize: '0.95rem'
              }}
            />
            {error?.[field.name] && (
              <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                {error[field.name]}
              </p>
            )}
          </div>
        ))}
      </div>

      <div>
        <label
          style={{
            display: 'block',
            color: '#1e293b',
            fontWeight: 500,
            marginBottom: '0.35rem'
          }}
        >
          Upload file {mandatory && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
        <input
          type="file"
          onChange={(e) => onFileChange(id, e.target.files?.[0] || null)}
          accept={document.accept || '.pdf,.jpg,.jpeg,.png'}
          style={{
            width: '100%',
            padding: '0.65rem',
            borderRadius: '0.75rem',
            border: error?.file ? '2px solid #ef4444' : '1px solid #cbd5f5',
            fontSize: '0.9rem',
            backgroundColor: '#f8fafc'
          }}
        />
        {error?.file && (
          <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.3rem' }}>
            {error.file}
          </p>
        )}
      </div>
    </div>
  );
}

export default DocumentUploadItem;





