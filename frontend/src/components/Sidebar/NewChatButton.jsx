import { Plus } from 'lucide-react';
export default function NewChatButton({ onClick, disabled }) { return <button type="button" className="new-chat-button pixel-button" onClick={onClick} disabled={disabled}><Plus size={18} strokeWidth={2.2} /><span>{disabled ? 'CREATING…' : 'NEW CHAT'}</span></button>; }
