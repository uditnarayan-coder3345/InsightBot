import { deleteDocument, getDocument, listDocuments, uploadDocument } from '../services/documentService.js';
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function listUserDocuments(req, res) { res.json({ success: true, data: await listDocuments(req.user) }); }
export async function getUserDocument(req, res) {
  if (!uuidPattern.test(req.params.id)) return res.status(400).json({ success: false, error: 'A valid document id is required.' });
  const document = await getDocument(req.user, req.params.id);
  if (!document) return res.status(404).json({ success: false, error: 'Document not found.' });
  return res.json({ success: true, data: document });
}
export async function createDocument(req, res) {
  if (!req.file) return res.status(400).json({ success: false, error: 'Choose a document file to upload.' });
  res.status(201).json({ success: true, data: await uploadDocument(req.user, req.file) });
}
export async function removeDocument(req, res) {
  if (!uuidPattern.test(req.params.id)) return res.status(400).json({ success: false, error: 'A valid document id is required.' });
  if (!await deleteDocument(req.user, req.params.id)) return res.status(404).json({ success: false, error: 'Document not found.' });
  return res.json({ success: true, data: { deleted: true } });
}
