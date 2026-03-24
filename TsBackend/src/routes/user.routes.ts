import { Router } from 'express';
import { LeaderboardController, UserController } from '../controllers/user.controller.js';
import { authenticate, optionalAuthenticate } from '../middleware/authenticate.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const userRouter = Router();
const leaderboardRouter = Router();

userRouter.use(authenticate);

userRouter.get('/dashboard', asyncHandler(UserController.getDashboard));
userRouter.get('/profile', asyncHandler(UserController.getProfile));
userRouter.get('/rank', asyncHandler(UserController.getRank));

leaderboardRouter.get('/', optionalAuthenticate, asyncHandler(LeaderboardController.getLeaderboard));
leaderboardRouter.get('/top', asyncHandler(LeaderboardController.getTopPerformers));
leaderboardRouter.get('/stats', asyncHandler(LeaderboardController.getLeaderboardStats));

export { userRouter, leaderboardRouter };

