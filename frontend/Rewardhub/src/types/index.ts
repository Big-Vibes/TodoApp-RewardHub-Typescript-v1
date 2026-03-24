// User types
export interface User {
  id: string;
  email: string;
  username: string | null;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  totalPoints: number;
  currentLevel: number;
  isActive: boolean;
  createdAt: string;
}



export interface AuthResponse {
  user: User;
  accessToken: string;
}

// Task types
export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  pointValue: number;
  isCompleted: boolean;
  completedAt: string | null;
  cooldownUntil: string | null;
  completionCount: number;
  canComplete?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  remaining: number;
  completionRate: number;
}

export interface TaskHistory {
  id: string;
  action: 'CREATED' | 'COMPLETED' | 'RESET' | 'DELETED';
  pointsAwarded: number;
  timestamp: string;
}
// Streak types
export interface Streak {
  currentStreak: number;
  longestStreak: number;
  weekStartDate: string;
  weekEndDate: string;
  lastCompletedAt: string | null;
  daysCompleted: number;
  daysRemaining: number;
}

// Milestone/Progress types
export interface Milestone {
  level: number;
  name: string;
  requiredPoints: number;
  color: string;
}

export interface Progress {
  current: Milestone;
  next: Milestone | null;
  progress: number;
  pointsToNext: number;
  isMaxLevel: boolean;
}

// Dashboard types
export interface DashboardData {
  user: User;
  tasks: TaskStats;
  streak: Streak;
  progress: Progress;
  recentActivity: TaskHistory[];
}

// Leaderboard types
export interface LeaderboardEntry {
  rank: number;
  id: string;
  email: string;
  username: string | null;
  totalPoints: number;
  currentLevel: number;
  currentStreak: number;
}

export interface LeaderboardResponse {
  success: boolean;
  data: LeaderboardEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  username?: string;
}

export interface CreateTaskForm {
  title: string;
  description?: string;
  pointValue?: number;
}
