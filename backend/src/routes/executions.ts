import { Router } from 'express';
import * as ExecutionController from '../controllers/execution.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/', ExecutionController.getExecutions);
router.post('/', ExecutionController.createExecution);
router.put('/:id', ExecutionController.updateExecution);
router.delete('/:id', ExecutionController.deleteExecution);

export default router;
