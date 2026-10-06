import { ArrowUp } from 'lucide-react';
export default function SendButton({ disabled }) { return <button type="submit" className="send-button" aria-label="Send message" disabled={disabled}><ArrowUp size={19} strokeWidth={2.5} /></button>; }
