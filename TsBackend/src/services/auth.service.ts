import type jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { AuthenticationError, ConflictError, NotFoundError, ValidationError } from '../utils/helpers.js';
import { generateTokens, getTokenExpiration } from '../utils/jwt.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { loginSchema, registerSchema } from '../utils/validation.js';
import type { PublicUser, Tokens } from '../types/service.js';

type RegisterInput = Readonly<{
  email: string;
  password: string;
  username?: string;
}>;

type LoginInput = Readonly<{
  email: string;
  password: string;
}>;

type UserTokenPayload = Readonly<{
  userId: string;
  email: string;
  role: string;
}>;

const toPublicUser = (user: {
  id: string;
  email: string;
  username: string | null;
  role: unknown;
  totalPoints: number;
  currentLevel: number;
}): PublicUser => {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: String(user.role),
    totalPoints: user.totalPoints,
    currentLevel: user.currentLevel,
  };
};

const toPayload = (user: { id: string; email: string; role: unknown }): UserTokenPayload => {
  return {
    userId: user.id,
    email: user.email,
    role: String(user.role),
  };
};

const createAndStoreTokens = async (payload: UserTokenPayload, userId: string): Promise<Tokens> => {
  const tokens = generateTokens(payload);
  const expiresAt = getTokenExpiration(tokens.refreshToken);
  if (!expiresAt) throw new Error('Unable to determine refresh token expiration');

  await prisma.refreshToken.create({
    data: {
      userId,
      token: tokens.refreshToken,
      expiresAt,
      isRevoked: false,
    },
  });

  return tokens;
};

const extractUserIdFromJwtPayload = (payload: jwt.JwtPayload | string): string | null => {
  if (typeof payload === 'string') return null;
  const userId = payload.userId;
  return typeof userId === 'string' && userId.length > 0 ? userId : null;
};

const DEFAULT_DASHBOARD_TASKS = [
  { title: 'Complete Daily Exercise', description: 'Do 30 minutes of physical activity' },
  { title: 'Drink Water', description: 'Drink 8 glasses of water today' },
  { title: 'Learn Something New', description: 'Spend 15 minutes learning' },
  { title: 'Meditate', description: 'Meditate for at least 5 minutes' },
  { title: 'Write in Journal', description: 'Write a short reflection' },
] as const;

export class AuthService {
  static async register(_data: unknown): Promise<{ user: PublicUser; tokens: Tokens }> {
    const parsed = await registerSchema.parseAsync(_data).catch(() => {
      throw new ValidationError('Invalid registration data');
    });

    const data = parsed as RegisterInput;

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          ...(data.username ? [{ username: data.username }] : []),
        ],
      },
      select: { id: true },
    });
    if (existing) throw new ConflictError('A user with this email or username already exists');

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        ...(data.username ? { username: data.username } : {}),
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        totalPoints: true,
        currentLevel: true,
      },
    });

    await prisma.task.createMany({
      data: DEFAULT_DASHBOARD_TASKS.map((t) => ({
        userId: user.id,
        title: t.title,
        description: t.description,
        pointValue: 20,
        isCompleted: false,
        completedAt: null,
        cooldownUntil: null,
        lastResetAt: new Date(),
      })),
    });

    const tokens = await createAndStoreTokens(toPayload(user), user.id);
    return { user: toPublicUser(user), tokens };
  }

  static async login(_data: unknown): Promise<{ user: PublicUser; tokens: Tokens }> {
    const parsed = await loginSchema.parseAsync(_data).catch(() => {
      throw new ValidationError('Invalid login data');
    });

    const data = parsed as LoginInput;

    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        totalPoints: true,
        currentLevel: true,
        passwordHash: true,
        isActive: true,
      },
    });

    if (!user) throw new AuthenticationError('Invalid email or password');
    if (!user.isActive) throw new AuthenticationError('Account is disabled');

    const passwordOk = await comparePassword(data.password, user.passwordHash);
    if (!passwordOk) throw new AuthenticationError('Invalid email or password');

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
      select: { id: true },
    });

    const tokens = await createAndStoreTokens(toPayload(user), user.id);
    return { user: toPublicUser(user), tokens };
  }

  static async refreshAccessToken(
    _refreshToken: string,
    _payload: jwt.JwtPayload | string
  ): Promise<Tokens> {
    if (typeof _refreshToken !== 'string' || _refreshToken.length === 0) {
      throw new AuthenticationError('Refresh token not provided');
    }

    const userId = extractUserIdFromJwtPayload(_payload);
    if (!userId) throw new AuthenticationError('Invalid refresh token');

    const existing = await prisma.refreshToken.findUnique({
      where: { token: _refreshToken },
      select: { id: true, userId: true, expiresAt: true, isRevoked: true },
    });

    if (!existing) throw new AuthenticationError('Invalid refresh token');
    if (existing.isRevoked) throw new AuthenticationError('Refresh token revoked');
    if (existing.expiresAt < new Date()) throw new AuthenticationError('Refresh token expired');
    if (existing.userId !== userId) throw new AuthenticationError('Invalid refresh token');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });
    if (!user) throw new AuthenticationError('Invalid refresh token');
    if (!user.isActive) throw new AuthenticationError('Account is disabled');

    const tokens = generateTokens(toPayload(user));
    const expiresAt = getTokenExpiration(tokens.refreshToken);
    if (!expiresAt) throw new Error('Unable to determine refresh token expiration');

    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: existing.id },
        data: { isRevoked: true },
        select: { id: true },
      }),
      prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: tokens.refreshToken,
          expiresAt,
          isRevoked: false,
        },
      }),
    ]);

    return tokens;
  }

  static async logout(_refreshToken: string): Promise<void> {
    if (!_refreshToken) return;
    await prisma.refreshToken.updateMany({
      where: { token: _refreshToken },
      data: { isRevoked: true },
    });
  }

  static async getUserById(_userId: string): Promise<PublicUser & { isActive: boolean; createdAt: string }> {
    if (!_userId) throw new ValidationError('User ID is required');

    const user = await prisma.user.findUnique({
      where: { id: _userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        totalPoints: true,
        currentLevel: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundError('User not found');

    return {
      ...toPublicUser(user),
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
    };
  }

  static async cleanupExpiredTokens(): Promise<number> {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: new Date() } }, { isRevoked: true }],
      },
    });
    return result.count;
  }
}
