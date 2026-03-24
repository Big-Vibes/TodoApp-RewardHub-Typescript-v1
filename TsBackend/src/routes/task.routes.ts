import { Router } from 'express';
import { TaskController } from '../controllers/task.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { createTaskLimiter, taskCompletionLimiter } from '../middleware/rateLimiter.js';
import { validateBody } from '../middleware/validate.js';
import { createTaskSchema, updateTaskSchema } from '../utils/validation.js';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(TaskController.getTasks));
router.get('/stats', asyncHandler(TaskController.getTaskStats));
router.get('/history', asyncHandler(TaskController.getTaskHistory));
router.get('/daily-points', asyncHandler(TaskController.getDailyPoints));
router.get('/:taskId', asyncHandler(TaskController.getTaskById));

router.post('/', createTaskLimiter, validateBody(createTaskSchema), asyncHandler(TaskController.createTask));
router.put('/:taskId', validateBody(updateTaskSchema), asyncHandler(TaskController.updateTask));
router.delete('/:taskId', asyncHandler(TaskController.deleteTask));

router.post('/:taskId/complete', taskCompletionLimiter, asyncHandler(TaskController.completeTask));

export default router;

