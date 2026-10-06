import { useState } from 'react';
import { Check, MessageSquare, MoreHorizontal, Pencil, Trash2, X } from 'lucide-react';

export default function ChatHistoryItem({ chat, active, onClick, onRename, onDelete, renaming }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(chat.title);
  const submitRename = async (event) => {
    event.preventDefault();
    if (!draft.trim() || draft.trim() === chat.title) { setEditing(false); return; }
    const saved = await onRename(chat, draft.trim());
    if (saved) setEditing(false);
  };
  const beginRename = () => { setDraft(chat.title); setEditing(true); setMenuOpen(false); };
  return <div className={`history-item-wrap ${active ? 'history-item-active' : ''}`}>
    <button type="button" className="history-item" onClick={onClick} title={chat.title} aria-current={active ? 'page' : undefined}><MessageSquare size={16} /><span className="history-item-text">{chat.title}</span></button>
    <div className="chat-menu-wrap">
      <button type="button" className="history-menu-trigger" aria-label={`Options for ${chat.title}`} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><MoreHorizontal size={17} /></button>
      {menuOpen && <div className="chat-menu" role="menu"><button type="button" role="menuitem" onClick={beginRename}><Pencil size={14} /> Rename</button><button type="button" role="menuitem" className="delete-menu-item" onClick={() => { setMenuOpen(false); onDelete(chat); }}><Trash2 size={14} /> Delete</button></div>}
    </div>
    {editing && <form className="rename-form" onSubmit={submitRename}><input autoFocus aria-label="New conversation title" value={draft} maxLength={120} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Escape') setEditing(false); }} /><button type="submit" aria-label="Save title" disabled={renaming || !draft.trim()}><Check size={15} /></button><button type="button" aria-label="Cancel rename" onClick={() => setEditing(false)}><X size={15} /></button></form>}
  </div>;
}
