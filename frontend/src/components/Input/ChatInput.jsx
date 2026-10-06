import { useEffect, useRef } from 'react';
import { Check, FileText, RotateCcw, X } from 'lucide-react';
import AttachmentButton from './AttachmentButton';
import SendButton from './SendButton';
export default function ChatInput({ value, onChange, onSend, selectedFile, uploading, uploadError, onAttachFile, onRemoveAttachment, onRetryUpload, sending, focusKey }) {
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  useEffect(() => { if (!sending) textareaRef.current?.focus(); }, [focusKey, sending]);
  useEffect(() => { if (!value && textareaRef.current) textareaRef.current.style.height = 'auto'; }, [value]);
  const submit = (event) => { event.preventDefault(); onSend(); };
  const handleKeyDown = (event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit(event); } };
  return <div className="composer-dock"><form className="chat-composer-wrap" onSubmit={submit}>
    {selectedFile && <div className={`attachment-chip ${uploadError ? 'attachment-error' : ''}`}><FileText size={17} /><span className="attachment-name" title={selectedFile.name}>{selectedFile.name}</span>{uploading ? <span className="attachment-status">Uploading…</span> : uploadError ? <button type="button" className="attachment-retry" onClick={onRetryUpload} aria-label="Retry upload"><RotateCcw size={14} /> Retry</button> : <span className="attachment-status uploaded"><Check size={14} /> Uploaded</span>}<button type="button" className="attachment-remove" aria-label="Remove attachment" onClick={onRemoveAttachment}><X size={15} /></button></div>}
    <div className="chat-composer"><AttachmentButton onClick={() => fileInputRef.current?.click()} disabled={sending || uploading} /><input ref={fileInputRef} type="file" accept=".pdf,.txt,.doc,.docx,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) onAttachFile(file); event.target.value = ''; }} /><textarea ref={textareaRef} value={value} onChange={(event) => { onChange(event.target.value); event.target.style.height = 'auto'; event.target.style.height = `${Math.min(event.target.scrollHeight, 160)}px`; }} onKeyDown={handleKeyDown} rows={1} placeholder="ASK ANYTHING ABOUT YOUR DOCUMENTS..." aria-label="Ask anything about your documents" disabled={sending} /><SendButton disabled={!value.trim() || sending || uploading || (selectedFile && uploadError)} /></div>
  </form><p className="disclaimer">InsightBot AI can make mistakes. Verify important information.</p></div>;
}
