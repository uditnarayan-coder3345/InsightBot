import { supabase } from '../config/supabase.js';
import { ensureProfile } from './profileService.js';

export async function listConversations(user) {
  const { data, error } = await supabase.from('conversations').select('id,title,created_at,updated_at').eq('user_id', user.id).order('updated_at', { ascending: false });
  if (error) throw new Error(`Could not load conversations: ${error.message}`);
  return data;
}

export async function createConversation(user, title) {
  await ensureProfile(user);
  const { data, error } = await supabase.from('conversations').insert({ user_id: user.id, title: title?.trim().slice(0, 120) || 'New conversation' }).select('id,title,created_at,updated_at').single();
  if (error) throw new Error(`Could not create conversation: ${error.message}`);
  return data;
}

export async function renameConversation(user, conversationId, title) {
  const { data, error } = await supabase.from('conversations').update({ title, updated_at: new Date().toISOString() }).eq('id', conversationId).eq('user_id', user.id).select('id,title,created_at,updated_at').maybeSingle();
  if (error) throw new Error(`Could not rename conversation: ${error.message}`);
  return data;
}

export async function getConversation(user, conversationId) {
  const { data: conversation, error } = await supabase.from('conversations').select('id,title,created_at,updated_at').eq('id', conversationId).eq('user_id', user.id).maybeSingle();
  if (error) throw new Error(`Could not load conversation: ${error.message}`);
  if (!conversation) return null;
  const { data: messages, error: messageError } = await supabase.from('messages').select('id,conversation_id,user_id,role,content,created_at').eq('conversation_id', conversationId).eq('user_id', user.id).order('created_at', { ascending: true });
  if (messageError) throw new Error(`Could not load messages: ${messageError.message}`);
  return { ...conversation, messages };
}

export async function deleteConversation(user, conversationId) {
  const { data, error: lookupError } = await supabase.from('conversations').select('id').eq('id', conversationId).eq('user_id', user.id).maybeSingle();
  if (lookupError) throw new Error(`Could not find conversation: ${lookupError.message}`);
  if (!data) return false;
  const { error } = await supabase.from('conversations').delete().eq('id', conversationId).eq('user_id', user.id);
  if (error) throw new Error(`Could not delete conversation: ${error.message}`);
  return true;
}

export async function addMessage(user, conversationId, content) {
  await ensureProfile(user);
  const conversation = await getConversation(user, conversationId);
  if (!conversation) return null;
  const { data: userMessage, error: userError } = await supabase.from('messages').insert({ conversation_id: conversationId, user_id: user.id, role: 'user', content: content.trim() }).select('id,role,content,created_at').single();
  if (userError) throw new Error(`Could not save the user message: ${userError.message}`);
  const generatedTitle = content.trim().split(/\s+/).slice(0, 7).join(' ');
  const shortTitle = content.trim().split(/\s+/).length > 7 ? `${generatedTitle}…` : generatedTitle;
  const { error: conversationUpdateError } = await supabase.from('conversations').update({ ...(conversation.title === 'New conversation' ? { title: shortTitle.slice(0, 120) } : {}), updated_at: new Date().toISOString() }).eq('id', conversationId).eq('user_id', user.id);
  if (conversationUpdateError) throw new Error(`The message was saved, but the conversation could not be updated: ${conversationUpdateError.message}`);
  const placeholder = 'AI response will be connected after the RAG and Gemini integration.';
  const { data: assistantMessage, error: assistantError } = await supabase.from('messages').insert({ conversation_id: conversationId, user_id: user.id, role: 'assistant', content: placeholder }).select('id,role,content,created_at').single();
  if (assistantError) throw new Error(`The user message was saved, but the placeholder response could not be saved: ${assistantError.message}`);
  return { userMessage, message: assistantMessage };
}

export async function regenerateAssistantMessage(user, conversationId, messageId) {
  const conversation = await getConversation(user, conversationId);
  if (!conversation) return null;
  const messageIndex = conversation.messages.findIndex((message) => message.id === messageId && message.role === 'assistant');
  if (messageIndex < 0) return null;
  const previousUserMessage = [...conversation.messages.slice(0, messageIndex)].reverse().find((message) => message.role === 'user');
  if (!previousUserMessage) return null;
  const content = 'AI response will be connected after the RAG and Gemini integration.';
  const { data, error } = await supabase.from('messages').update({ content }).eq('id', messageId).eq('conversation_id', conversationId).eq('user_id', user.id).select('id,role,content,created_at').single();
  if (error) throw new Error(`Could not regenerate the response: ${error.message}`);
  return data;
}
