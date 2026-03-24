export type Tokens = Readonly<{
  accessToken: string;
  refreshToken: string;
}>;

export type ISODateString = string;

export type UserRole = 'USER' | 'ADMIN' | 'MODERATOR';

export type PublicUser = Readonly<{
  id: string;
  email: string;
  username: string | null;
  role: string;
  totalPoints: number;
  currentLevel: number;
}>;

export type Task = Readonly<{
  id: string;
  userId: string;
  title: string;
  description: string | null;
  pointValue: number;
  isCompleted: boolean;
  completedAt: ISODateString | null;
  cooldownUntil: ISODateString | null;
  completionCount: number;
  canComplete?: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}>;

export type TaskStats = Readonly<{
  total: number;
  completed: number;
  remaining: number;
  completionRate: number;
}>;

export type TaskHistoryAction = 'CREATED' | 'COMPLETED' | 'RESET' | 'DELETED';

export type TaskHistoryEntry = Readonly<{
  id: string;
  action: TaskHistoryAction;
  pointsAwarded: number;
  timestamp: ISODateString;
}>;

export type Streak = Readonly<{
  currentStreak: number;
  longestStreak: number;
}>;

export type Milestone = Readonly<{
  level: number;
  name: string;
  requiredPoints: number;
  color: string;
}>;

export type Progress = Readonly<{
  current: Milestone;
  next: Milestone | null;
  progress: number;
  pointsToNext: number;
  isMaxLevel: boolean;
}>;

export type DashboardStreak = Readonly<{
  currentStreak: number;
  longestStreak: number;
  weekStartDate: ISODateString;
  weekEndDate: ISODateString;
  lastCompletedAt: ISODateString | null;
  daysCompleted: number;
  daysRemaining: number;
}>;

export type UserProfile = Readonly<{
  id: string;
  email: string;
  username: string | null;
  role: UserRole | string;
  totalPoints: number;
  currentLevel: number;
  isActive: boolean;
  createdAt: ISODateString;
}>;

export type UserDashboard = Readonly<{
  user: UserProfile;
  tasks: TaskStats;
  streak: DashboardStreak;
  progress: Progress;
  recentActivity: TaskHistoryEntry[];
}>;

export type LeaderboardEntry = Readonly<{
  rank: number;
  id: string;
  email: string;
  username: string | null;
  totalPoints: number;
  currentLevel: number;
  currentStreak: number;
}>;

export type LeaderboardResult = Readonly<{
  leaderboard: LeaderboardEntry[];
  total: number;
}>;

export type LeaderboardStats = Readonly<{
  totalUsers: number;
  totalPoints: number;
  averagePoints: number;
  topUser: Readonly<{
    id: string;
    username: string | null;
    email: string;
    totalPoints: number;
    currentLevel: number;
  }> | null;
  topStreak: Readonly<{
    userId: string;
    currentStreak: number;
    longestStreak: number;
  }> | null;
}>;
