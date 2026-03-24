import type { Request, Response } from 'express';

type RegisterBody = Readonly<{
  name: string;
  email: string;
  password: string;
}>;

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body as Partial<RegisterBody>;
  res.status(501).json({ success: false, message: 'Not implemented', data: { name, email, password } });
};

