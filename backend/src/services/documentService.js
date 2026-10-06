import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import { supabase, DOCUMENTS_BUCKET, ensureDocumentsBucket } from '../config/supabase.js';
import { ensureProfile } from './profileService.js';

const safeName = (name) => String(name).replace(/\\/g, '/').split('/').pop().replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 255) || 'document';
export async function listDocuments(user) {
  const { data, error } = await supabase.from('documents').select('id,file_name,file_type,file_size,status,created_at,updated_at').eq('user_id', user.id).order('created_at', { ascending: false });
  if (error) throw new Error(`Could not load documents: ${error.message}`);
  return data;
}
export async function getDocument(user, id) {
  const { data, error } = await supabase.from('documents').select('id,file_name,file_type,file_size,status,created_at,updated_at').eq('id', id).eq('user_id', user.id).maybeSingle();
  if (error) throw new Error(`Could not load document: ${error.message}`);
  return data;
}
export async function uploadDocument(user, file) {
  await ensureProfile(user);
  await ensureDocumentsBucket();
  const fileName = safeName(file.originalname);
  const extension = path.extname(fileName).toLowerCase();
  const storagePath = `${user.id}/${uuidv4()}${extension}`;
  const { error: uploadError } = await supabase.storage.from(DOCUMENTS_BUCKET).upload(storagePath, file.buffer, { contentType: file.mimetype, upsert: false });
  if (uploadError) throw new Error(`Could not upload document to Supabase Storage: ${uploadError.message}`);
  const now = new Date().toISOString();
  const { data, error } = await supabase.from('documents').insert({ user_id: user.id, file_name: fileName, file_type: file.mimetype, file_size: file.size, storage_path: storagePath, status: 'uploaded', updated_at: now }).select('id,file_name,file_type,file_size,status,created_at,updated_at').single();
  if (error) {
    await supabase.storage.from(DOCUMENTS_BUCKET).remove([storagePath]);
    throw new Error(`Could not save document metadata: ${error.message}`);
  }
  return data;
}
export async function deleteDocument(user, id) {
  const { data: document, error: lookupError } = await supabase.from('documents').select('id,storage_path').eq('id', id).eq('user_id', user.id).maybeSingle();
  if (lookupError) throw new Error(`Could not locate document for deletion: ${lookupError.message}`);
  if (!document) return false;
  const { error: storageError } = await supabase.storage.from(DOCUMENTS_BUCKET).remove([document.storage_path]);
  if (storageError) throw new Error(`Could not remove document from storage: ${storageError.message}`);
  const { error } = await supabase.from('documents').delete().eq('id', id).eq('user_id', user.id);
  if (error) throw new Error(`Could not delete document metadata: ${error.message}`);
  return true;
}
