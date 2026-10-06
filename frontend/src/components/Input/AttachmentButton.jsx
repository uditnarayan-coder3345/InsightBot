import { Paperclip } from 'lucide-react';
export default function AttachmentButton({ onClick, disabled }) { return <button type="button" className="composer-icon-button" aria-label="Attach a document" title="Attach a document" onClick={onClick} disabled={disabled}><Paperclip size={19} /></button>; }
