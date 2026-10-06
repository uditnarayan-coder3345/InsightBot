import { FileText } from 'lucide-react';

export default function DocumentLibrary({ documents }) {
  return <section className="document-library" aria-label="Uploaded documents">
    <p className="pixel-label library-heading">YOUR DOCUMENTS</p>
    {documents.length ? <ul>{documents.slice(0, 4).map((document) => <li key={document.id} title={document.file_name}><FileText size={14} /><span>{document.file_name}</span></li>)}</ul> : <p className="library-empty">No documents uploaded yet.</p>}
    {documents.length > 4 && <span className="library-count">+{documents.length - 4} more</span>}
  </section>;
}
