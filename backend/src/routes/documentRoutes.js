import { Router } from 'express';
import multer from 'multer';
import { createDocument, getUserDocument, listUserDocuments, removeDocument } from '../controllers/documentController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireUser } from '../middleware/authMiddleware.js';
const allowedTypes = new Map([
  ['.pdf', new Set(['application/pdf'])], ['.txt', new Set(['text/plain'])],
  ['.doc', new Set(['application/msword'])], ['.docx', new Set(['application/vnd.openxmlformats-officedocument.wordprocessingml.document'])],
]);
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024, files: 1 }, fileFilter: (req, file, callback) => {
  const extension = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();
  const validMimes = allowedTypes.get(extension);
  if (!validMimes || !validMimes.has(file.mimetype)) return callback(Object.assign(new Error('Only PDF, TXT, DOC, and DOCX documents are accepted.'), { status: 400, publicMessage: 'Only PDF, TXT, DOC, and DOCX documents are accepted.' }));
  callback(null, true);
} });
const router = Router();
router.use(requireUser);
router.get('/', asyncHandler(listUserDocuments));
router.post('/', upload.single('file'), asyncHandler(createDocument));
router.get('/:id', asyncHandler(getUserDocument));
router.delete('/:id', asyncHandler(removeDocument));
export default router;
