import { Router } from 'express';
import { uploadDocument, listDocuments, getDocumentChunks, deleteDocument } from '../controllers/document.controller.js';

const router = Router();

router.post('/', uploadDocument);
router.get('/', listDocuments);
router.get('/:id/chunks', getDocumentChunks);
router.delete('/:id', deleteDocument);

export default router;
