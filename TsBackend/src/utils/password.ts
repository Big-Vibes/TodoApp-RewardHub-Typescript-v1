import bcrypt from 'bcryptjs';

// ============================================
// PASSWORD HASHING
// ============================================

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// ============================================
// PASSWORD VALIDATION
// ============================================

export type PasswordStrength = 'weak' | 'medium' | 'strong';

export type PasswordValidationResult = Readonly<{
  isValid: boolean;
  errors: string[];
  strength: PasswordStrength;
  score: number;
}>;

export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];
  let score = 0;

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score += 1;
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else {
    score += 1;
  }

  const strength: PasswordStrength = score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong';

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score,
  };
};

