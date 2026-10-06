import { addMessage, createConversation, deleteConversation, getConversation, listConversations, regenerateAssistantMessage, renameConversation } from '../services/chatService.js';
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function listChats(req, res) { res.json({ success: true, data: await listConversations(req.user) }); }
export async function createChat(req, res) {
  if (req.body?.title !== undefined && typeof req.body.title !== 'string') return res.status(400).json({ success: false, error: 'title must be a string.' });
  res.status(201).json({ success: true, data: await createConversation(req.user, req.body?.title) });
}
export async function getChat(req, res) {
  if (!uuidPattern.test(req.params.id)) return res.status(400).json({ success: false, error: 'A valid conversation id is required.' });
  const chat = await getConversation(req.user, req.params.id);
  if (!chat) return res.status(404).json({ success: false, error: 'Conversation not found.' });
  return res.json({ success: true, data: chat });
}
export async function updateChat(req, res) {
  if (!uuidPattern.test(req.params.id)) return res.status(400).json({ success: false, error: 'A valid conversation id is required.' });
  if (typeof req.body?.title !== 'string' || !req.body.title.trim() || req.body.title.trim().length > 120) return res.status(400).json({ success: false, error: 'title must be between 1 and 120 characters.' });
  const chat = await renameConversation(req.user, req.params.id, req.body.title.trim());
  if (!chat) return res.status(404).json({ success: false, error: 'Conversation not found.' });
  return res.json({ success: true, data: chat });
}
export async function removeChat(req, res) {
  if (!uuidPattern.test(req.params.id)) return res.status(400).json({ success: false, error: 'A valid conversation id is required.' });
  if (!await deleteConversation(req.user, req.params.id)) return res.status(404).json({ success: false, error: 'Conversation not found.' });
  return res.json({ success: true, data: { deleted: true } });
}
export async function createMessage(req, res) {
  if (!uuidPattern.test(req.params.id)) return res.status(400).json({ success: false, error: 'A valid conversation id is required.' });
  if (typeof req.body?.content !== 'string' || !req.body.content.trim() || req.body.content.length > 10000) return res.status(400).json({ success: false, error: 'content must be a non-empty string of at most 10,000 characters.' });
  const result = await addMessage(req.user, req.params.id, req.body.content);
  if (!result) return res.status(404).json({ success: false, error: 'Conversation not found.' });
  return res.status(201).json({ success: true, data: result });
}
export async function regenerateMessage(req, res) {
  if (!uuidPattern.test(req.params.id) || !uuidPattern.test(req.params.messageId)) return res.status(400).json({ success: false, error: 'Valid conversation and message ids are required.' });
  const message = await regenerateAssistantMessage(req.user, req.params.id, req.params.messageId);
  if (!message) return res.status(404).json({ success: false, error: 'Assistant response not found for this conversation.' });
  return res.json({ success: true, data: { message } });
}
