import { Copy, RotateCcw, ThumbsDown, ThumbsUp } from 'lucide-react';
export default function MessageActions({ onCopy, copied, feedback, onFeedback, onRegenerate, regenerating }) {
  return <div className="message-actions">
    <button type="button" className="action-button" aria-label={copied ? 'Copied' : 'Copy response'} onClick={onCopy}><Copy size={15} /><span>{copied ? 'Copied ✓' : 'Copy'}</span></button>
    <button type="button" className={`action-button ${feedback === 'up' ? 'action-selected' : ''}`} aria-label="Helpful response" aria-pressed={feedback === 'up'} onClick={() => onFeedback(feedback === 'up' ? null : 'up')}><ThumbsUp size={15} /></button>
    <button type="button" className={`action-button ${feedback === 'down' ? 'action-selected' : ''}`} aria-label="Unhelpful response" aria-pressed={feedback === 'down'} onClick={() => onFeedback(feedback === 'down' ? null : 'down')}><ThumbsDown size={15} /></button>
    <button type="button" className="action-button" aria-label="Regenerate response" onClick={onRegenerate} disabled={regenerating}><RotateCcw size={15} /><span>{regenerating ? 'Retrying…' : 'Regenerate'}</span></button>
  </div>;
}
