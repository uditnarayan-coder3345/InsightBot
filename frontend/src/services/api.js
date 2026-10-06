const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
let accessToken = null;

export function setApiAccessToken(token) { accessToken = token || null; }

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body !== undefined && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error('Could not reach the InsightBot backend. Check that it is running and VITE_API_URL is correct.');
  }
  let payload;
  try { payload = await response.json(); } catch { payload = null; }
  if (!response.ok || !payload?.success) throw new Error(payload?.error || `The backend request failed (${response.status}).`);
  return payload;
}

const json = (method, body) => ({ method, body: JSON.stringify(body) });
export async function checkBackendHealth() { return request('/health'); }
export async function getConversations() { return (await request('/chats')).data; }
export async function createConversation(title) { return (await request('/chats', json('POST', { title }))).data; }
export async function getConversation(id) { return (await request(`/chats/${encodeURIComponent(id)}`)).data; }
export async function renameConversation(id, title) { return (await request(`/chats/${encodeURIComponent(id)}`, json('PATCH', { title }))).data; }
export async function deleteConversation(id) { return request(`/chats/${encodeURIComponent(id)}`, { method: 'DELETE' }); }
export async function sendConversationMessage(id, content) { return (await request(`/chats/${encodeURIComponent(id)}/messages`, json('POST', { content }))).data; }
export async function regenerateConversationMessage(chatId, messageId) { return (await request(`/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}/regenerate`, { method: 'POST' })).data; }
export async function getDocuments() { return (await request('/documents')).data; }
export async function uploadDocument(file) {
  const form = new FormData();
  form.append('file', file);
  return (await request('/documents', { method: 'POST', body: form })).data;
}
