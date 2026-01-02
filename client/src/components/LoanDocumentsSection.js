import React from 'react';
import DocumentUploadItem from './DocumentUploadItem';

function LoanDocumentsSection({
  documents,
  metadata,
  files,
  errors,
  onMetadataChange,
  onFileChange
}) {
  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      {documents.map((doc) => (
        <DocumentUploadItem
          key={doc.id}
          document={doc}
          metadata={metadata[doc.id] || {}}
          error={errors[doc.id] || {}}
          onMetadataChange={onMetadataChange}
          onFileChange={onFileChange}
          file={files[doc.id]}
        />
      ))}
    </div>
  );
}

export default LoanDocumentsSection;





