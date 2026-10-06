import { useCallback, useEffect, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import ChatWindow from '../components/Chat/ChatWindow';
import { checkBackendHealth, createConversation, deleteConversation, getConversation, getConversations, getDocuments, regenerateConversationMessage, renameConversation, sendConversationMessage, uploadDocument } from '../services/api';

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const titleFromQuestion = (question) => {
  const words = question.trim().split(/\s+/);
  return words.length > 7 ? `${words.slice(0, 7).join(' ')}…` : words.join(' ');
};
const dateGroup = (dateValue) => {
  const date = new Date(dateValue);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const age = Math.floor((today - day) / 86400000);
  return age <= 0 ? 'TODAY' : age === 1 ? 'YESTERDAY' : age < 7 ? 'PREVIOUS 7 DAYS' : 'OLDER';
};
const presentConversation = (chat) => ({ ...chat, group: dateGroup(chat.updated_at || chat.created_at), messages: chat.messages || [] });
const allowedFiles = new Map([
  ['.pdf', ['application/pdf']], ['.txt', ['text/plain']], ['.doc', ['application/msword']],
  ['.docx', ['application/vnd.openxmlformats-officedocument.wordprocessingml.document']],
]);

export default function ChatPage() {
  const [chats, setChats] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [feedback, setFeedback] = useState({});
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [regeneratingId, setRegeneratingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedDocument, setUploadedDocument] = useState(null);
  const [uploadError, setUploadError] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [notice, setNotice] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const messageScrollRef = useRef(null);
  const conversationRequestRef = useRef(0);
  const noticeRetryRef = useRef(null);
  const activeChat = chats.find((chat) => chat.id === activeChatId);

  const showError = useCallback((error, retry) => {
    const message = typeof error === 'string' ? error : error?.message;
    setNotice({ message: message || 'Unable to complete that request. Please try again.', isError: true, retry: retry || null });
    noticeRetryRef.current = retry || null;
  }, []);
  const showNotice = useCallback((message) => { setNotice({ message, isError: false, retry: null }); noticeRetryRef.current = null; }, []);
  const dismissNotice = useCallback(() => { setNotice(null); noticeRetryRef.current = null; }, []);

  const loadHistory = useCallback(async (preferCurrent = true) => {
    setLoadingHistory(true);
    try {
      const loaded = (await getConversations()).map(presentConversation);
      setChats(loaded);
      setActiveChatId((current) => preferCurrent && loaded.some((chat) => chat.id === current) ? current : loaded[0]?.id || null);
      dismissNotice();
      return loaded;
    } catch (error) {
      showError(error, () => loadHistory(preferCurrent));
      return null;
    } finally { setLoadingHistory(false); }
  }, [dismissNotice, showError]);

  const loadChat = useCallback(async (id) => {
    if (!id) return;
    const requestId = ++conversationRequestRef.current;
    setLoadingConversation(true);
    try {
      const chat = presentConversation(await getConversation(id));
      if (requestId !== conversationRequestRef.current) return;
      setChats((current) => current.map((item) => item.id === chat.id ? chat : item));
      dismissNotice();
    } catch (error) {
      if (requestId === conversationRequestRef.current) showError(error, () => loadChat(id));
    } finally {
      if (requestId === conversationRequestRef.current) setLoadingConversation(false);
    }
  }, [dismissNotice, showError]);

  useEffect(() => {
    let active = true;
    checkBackendHealth().then(() => { if (active) setBackendStatus('connected'); }).catch((error) => {
      if (active) { setBackendStatus('offline'); showError('Unable to connect to InsightBot AI. Please check the backend and try again.', async () => { try { await checkBackendHealth(); setBackendStatus('connected'); await loadHistory(false); } catch (retryError) { setBackendStatus('offline'); showError(retryError, null); } }); }
    });
    loadHistory(false);
    getDocuments().then((items) => { if (active) setDocuments(items); }).catch((error) => { if (active) showError(error, () => getDocuments().then(setDocuments).catch(showError)); });
    return () => { active = false; conversationRequestRef.current += 1; };
  }, [loadHistory, showError]);

  useEffect(() => { if (activeChatId) loadChat(activeChatId); else { setLoadingConversation(false); conversationRequestRef.current += 1; } }, [activeChatId, loadChat]);
  useEffect(() => { const pane = messageScrollRef.current; if (pane) pane.scrollTo({ top: pane.scrollHeight, behavior: 'smooth' }); }, [activeChat?.messages, sending, loadingConversation, regeneratingId]);
  useEffect(() => { if (!notice) return undefined; const timeout = window.setTimeout(() => { setNotice(null); noticeRetryRef.current = null; }, notice.isError ? 9000 : 4500); return () => window.clearTimeout(timeout); }, [notice]);

  const createChat = async () => {
    if (creatingChat) return;
    setCreatingChat(true); dismissNotice();
    try {
      const chat = presentConversation(await createConversation('New conversation'));
      setChats((current) => [chat, ...current.filter((item) => item.id !== chat.id)]);
      setActiveChatId(chat.id); setInput(''); setSelectedFile(null); setUploadedDocument(null); setUploadError(false); setSidebarOpen(false);
    } catch (error) { showError(error, createChat); }
    finally { setCreatingChat(false); }
  };

  const selectChat = (id) => { setActiveChatId(id); setSidebarOpen(false); setInput(''); setSelectedFile(null); setUploadedDocument(null); setUploadError(false); dismissNotice(); };

  const sendMessage = async (value = input) => {
    const content = value.trim();
    if (!content || sending || uploading || (selectedFile && !uploadedDocument)) return;
    setSending(true); dismissNotice();
    let targetId = activeChatId;
    let optimisticId = null;
    try {
      if (!targetId) {
        const created = presentConversation(await createConversation(titleFromQuestion(content)));
        targetId = created.id;
        setChats((current) => [created, ...current]); setActiveChatId(targetId);
      }
      optimisticId = makeId();
      setChats((current) => current.map((chat) => chat.id === targetId ? { ...chat, title: chat.messages.length ? chat.title : titleFromQuestion(content), messages: [...chat.messages, { id: optimisticId, role: 'user', content }] } : chat));
      const result = await sendConversationMessage(targetId, content);
      setChats((current) => current.map((chat) => {
        if (chat.id !== targetId) return chat;
        const merged = chat.messages.filter((message) => message.id !== optimisticId);
        for (const message of [result.userMessage, result.message]) if (!merged.some((existing) => existing.id === message.id)) merged.push(message);
        merged.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
        return { ...chat, updated_at: new Date().toISOString(), title: chat.title === 'New conversation' ? titleFromQuestion(content) : chat.title, messages: merged };
      }));
      setInput(''); setSelectedFile(null); setUploadedDocument(null); setUploadError(false);
    } catch (error) {
      if (optimisticId) setChats((current) => current.map((chat) => chat.id === targetId ? { ...chat, messages: chat.messages.filter((message) => message.id !== optimisticId) } : chat));
      setInput(content);
      showError(error, () => sendMessage(content));
    } finally { setSending(false); }
  };

  const saveRename = async (chat, title) => {
    setRenamingId(chat.id); dismissNotice();
    try {
      const updated = await renameConversation(chat.id, title);
      setChats((current) => current.map((item) => item.id === chat.id ? presentConversation({ ...item, ...updated }) : item));
      return true;
    } catch (error) { showError(error, () => saveRename(chat, title)); return false; }
    finally { setRenamingId(null); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true); dismissNotice();
    try {
      await deleteConversation(deleteTarget.id);
      const remaining = chats.filter((item) => item.id !== deleteTarget.id);
      setChats(remaining);
      if (activeChatId === deleteTarget.id) setActiveChatId(null);
      setDeleteTarget(null);
    } catch (error) { showError(error, confirmDelete); }
    finally { setDeleting(false); }
  };

  const updateFeedback = (messageId, value) => setFeedback((current) => ({ ...current, [messageId]: value }));
  const regenerateResponse = async (message) => {
    if (!activeChatId || regeneratingId) return;
    setRegeneratingId(message.id); dismissNotice();
    try {
      const { message: updated } = await regenerateConversationMessage(activeChatId, message.id);
      setChats((current) => current.map((chat) => chat.id === activeChatId ? { ...chat, messages: chat.messages.map((item) => item.id === updated.id ? updated : item) } : chat));
    } catch (error) { showError(error, () => regenerateResponse(message)); }
    finally { setRegeneratingId(null); }
  };

  const validateFile = (file) => {
    const extension = `.${file.name.split('.').pop().toLowerCase()}`;
    if (!allowedFiles.has(extension) || !allowedFiles.get(extension).includes(file.type)) return 'Choose a PDF, TXT, DOC, or DOCX document.';
    if (file.size > 25 * 1024 * 1024) return 'Documents must be 25 MB or smaller.';
    return null;
  };
  const uploadForAttachment = async (file) => {
    const validationError = validateFile(file);
    setSelectedFile(file); setUploadedDocument(null); setUploadError(Boolean(validationError));
    if (validationError) { showError(validationError, null); return; }
    setUploading(true); dismissNotice();
    try { const document = await uploadDocument(file); setUploadedDocument(document); setDocuments((current) => [document, ...current.filter((item) => item.id !== document.id)]); showNotice(`${document.file_name} uploaded and ready to attach.`); }
    catch (error) { setUploadError(true); showError(error, () => uploadForAttachment(file)); }
    finally { setUploading(false); }
  };
  const uploadFromHeader = async (file) => {
    const validationError = validateFile(file);
    if (validationError) { showError(validationError, null); return; }
    setUploading(true); dismissNotice();
    try { const document = await uploadDocument(file); setDocuments((current) => [document, ...current.filter((item) => item.id !== document.id)]); showNotice(`${document.file_name} uploaded.`); }
    catch (error) { showError(error, () => uploadFromHeader(file)); }
    finally { setUploading(false); }
  };
  const removeAttachment = () => { setSelectedFile(null); setUploadedDocument(null); setUploadError(false); };

  const copyMessage = async (message) => {
    try {
      const text = [message.content, ...(message.bullets || []), message.outro].filter(Boolean).join('\n');
      await navigator.clipboard.writeText(text);
      setCopiedId(message.id); window.setTimeout(() => setCopiedId(null), 1700);
    } catch { showError('Could not copy this response. Check your clipboard permissions.', null); }
  };
  const addSuggestedPrompt = (prompt) => { setInput(prompt); document.querySelector('.chat-composer textarea')?.focus(); };

  return <main className="app-shell">
    <Sidebar chats={chats} activeChatId={activeChatId} onSelectChat={selectChat} onNewChat={createChat} onRenameChat={saveRename} onDeleteChat={setDeleteTarget} documents={documents} creatingChat={creatingChat} loadingHistory={loadingHistory} renamingId={renamingId} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    {sidebarOpen && <button type="button" aria-label="Close sidebar" className="sidebar-scrim" onClick={() => setSidebarOpen(false)} />}
    <ChatWindow chat={activeChat} input={input} onInputChange={setInput} onSend={sendMessage} onMenuClick={() => setSidebarOpen(true)} onCopy={copyMessage} copiedId={copiedId} feedback={feedback} onFeedback={updateFeedback} onRegenerate={regenerateResponse} regeneratingId={regeneratingId} loading={sending} loadingConversation={loadingConversation} messageScrollRef={messageScrollRef} onSuggestedPrompt={addSuggestedPrompt} backendStatus={backendStatus} onDocumentSelected={uploadFromHeader} notice={notice} onDismissNotice={() => setNotice(null)} onRetryNotice={() => noticeRetryRef.current?.()} selectedFile={selectedFile} uploading={uploading} uploadError={uploadError} onAttachFile={uploadForAttachment} onRemoveAttachment={removeAttachment} onRetryUpload={() => selectedFile && uploadForAttachment(selectedFile)} />
    {deleteTarget && <div className="modal-scrim" role="presentation"><section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-title"><p className="pixel-label">DELETE CHAT</p><h2 id="delete-title">Delete this conversation?</h2><p>“{deleteTarget.title}” and its messages will be permanently deleted.</p><div><button type="button" className="dialog-cancel" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</button><button type="button" className="dialog-delete" onClick={confirmDelete} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete'}</button></div></section></div>}
  </main>;
}
