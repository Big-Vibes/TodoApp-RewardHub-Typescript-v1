import { ZodError, type ZodTypeAny } from 'zod';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ValidationError } from '../utils/helpers.js';

type ValidatableRequestKey = 'body' | 'query' | 'params';

export const validate = (schema: ZodTypeAny, type: ValidatableRequestKey = 'body'): RequestHandler => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const dataToValidate = (req as unknown as Record<string, unknown>)[type];
      const validatedData = await schema.parseAsync(dataToValidate);

      (req as unknown as Record<string, unknown>)[type] = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues ?? (error as unknown as { errors?: typeof error.issues }).errors ?? [];
        const errorMessages = issues.map((err) => `${err.path.join('.')}: ${err.message}`);
        next(new ValidationError(errorMessages.join(', ')));
        return;
      }

      next(new ValidationError('Validation failed'));
    }
  };
};

export const validateBody = (schema: ZodTypeAny): RequestHandler => validate(schema, 'body');
export const validateQuery = (schema: ZodTypeAny): RequestHandler => validate(schema, 'query');
export const validateParams = (schema: ZodTypeAny): RequestHandler => validate(schema, 'params');
