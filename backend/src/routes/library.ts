import { Router } from 'express';
import * as LibraryController from '../controllers/library.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/', LibraryController.getLibraryItems);
router.post('/', LibraryController.createLibraryItem);
router.delete('/:id', LibraryController.deleteLibraryItem);

export default router;
