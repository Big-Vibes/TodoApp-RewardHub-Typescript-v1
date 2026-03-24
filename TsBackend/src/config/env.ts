import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  DATABASE_URL_UNPOOLED: z.string().url().optional(),

  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),

  FRONTEND_URL: z.string().url(),

  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),

  DAILY_RESET_CRON: z.string().default('0 0 * * *'),
  DAILY_RESET_TIMEZONE: z.string().default('UTC'),
}).superRefine((value, ctx) => {
  if (!value.DATABASE_URL && !value.DATABASE_URL_UNPOOLED) {
    ctx.addIssue({
      code: 'custom',
      path: ['DATABASE_URL'],
      message: 'DATABASE_URL or DATABASE_URL_UNPOOLED is required',
    });
  }
});

export type EnvVars = z.infer<typeof envSchema>;

export type AppConfig = Readonly<{
  port: number;
  nodeEnv: EnvVars['NODE_ENV'];
  isDevelopment: boolean;
  isProduction: boolean;

  database: {
    url: string;
  };

  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpiration: string;
    refreshExpiration: string;
  };

  cors: {
    origin: string;
    credentials: true;
  };

  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };

  cron: {
    dailyResetSchedule: string;
    timezone: string;
  };
}>;

const validateEnv = (): EnvVars => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Invalid environment variables:');
      for (const issue of error.issues) {
        console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
      }
    }
    process.exit(1);
  }
};

const env = validateEnv();

export const config: AppConfig = {
  // Server
  port: parseInt(env.PORT, 10),
  nodeEnv: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',

  // Database
  database: {
    url: env.DATABASE_URL ?? env.DATABASE_URL_UNPOOLED!,
  },

  // JWT
  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiration: env.JWT_ACCESS_EXPIRATION,
    refreshExpiration: env.JWT_REFRESH_EXPIRATION,
  },

  // CORS
  cors: {
    origin: env.FRONTEND_URL,
    credentials: true,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS, 10),
    maxRequests: parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10),
  },

  // Cron
  cron: {
    dailyResetSchedule: env.DAILY_RESET_CRON,
    timezone: env.DAILY_RESET_TIMEZONE,
  },
};

export default config;
