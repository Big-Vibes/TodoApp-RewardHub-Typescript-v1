import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { AuthenticationError } from './helpers.js';

export type TokenPayload = string | object | Buffer;

// ============================================
// GENERATE TOKENS
// ============================================

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiration as Exclude<jwt.SignOptions['expiresIn'], undefined>,
    issuer: 'rewardhub-api',
    audience: 'rewardhub-client',
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiration as Exclude<jwt.SignOptions['expiresIn'], undefined>,
    issuer: 'rewardhub-api',
    audience: 'rewardhub-client',
  });
};

export const generateTokens = (payload: TokenPayload): { accessToken: string; refreshToken: string } => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

// ============================================
// VERIFY TOKENS
// ============================================

export const verifyAccessToken = (token: string): jwt.JwtPayload | string => {
  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret, {
      issuer: 'rewardhub-api',
      audience: 'rewardhub-client',
    });
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('Access token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError('Invalid access token');
    }
    throw new AuthenticationError('Token verification failed');
  }
};

export const verifyRefreshToken = (token: string): jwt.JwtPayload | string => {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret, {
      issuer: 'rewardhub-api',
      audience: 'rewardhub-client',
    });
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('Refresh token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError('Invalid refresh token');
    }
    throw new AuthenticationError('Token verification failed');
  }
};

// ============================================
// DECODE TOKEN (WITHOUT VERIFICATION)
// ============================================

export const decodeToken = (token: string): jwt.JwtPayload | string | null => {
  try {
    return jwt.decode(token);
  } catch {
    return null;
  }
};

// ============================================
// GET TOKEN EXPIRATION
// ============================================

export const getTokenExpiration = (token: string): Date | null => {
  const decoded = decodeToken(token);
  if (!decoded || typeof decoded === 'string' || typeof decoded.exp !== 'number') return null;
  return new Date(decoded.exp * 1000);
};

// ============================================
// CHECK IF TOKEN IS EXPIRED
// ============================================

export const isTokenExpired = (token: string): boolean => {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;
  return expiration < new Date();
};
