declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role?: string;
      };
      cookies?: Record<string, string | undefined>;
    }
  }
}

export {};

