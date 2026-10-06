import { Bot, X } from 'lucide-react';
import NewChatButton from './NewChatButton';
import ChatHistory from './ChatHistory';
import UserProfile from './UserProfile';
import DocumentLibrary from './DocumentLibrary';
export default function Sidebar({ chats, activeChatId, onSelectChat, onNewChat, onRenameChat, onDeleteChat, documents, creatingChat, loadingHistory, renamingId, isOpen, onClose }) {
  return <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`} aria-label="Chat sidebar">
    <div className="sidebar-topline"><a className="brand-lockup" href="#home" aria-label="InsightBot AI home"><span className="brand-icon"><Bot size={21} strokeWidth={2.2} /></span><span className="pixel-brand">INSIGHTBOT<span> AI</span></span></a><button type="button" className="icon-button sidebar-close" aria-label="Close menu" onClick={onClose}><X size={19} /></button></div>
    <NewChatButton onClick={onNewChat} disabled={creatingChat} /><ChatHistory chats={chats} activeChatId={activeChatId} onSelectChat={onSelectChat} onRenameChat={onRenameChat} onDeleteChat={onDeleteChat} loading={loadingHistory} renamingId={renamingId} /><DocumentLibrary documents={documents} /><UserProfile />
  </aside>;
}
