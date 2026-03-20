import { type Request, type Response, type NextFunction } from 'express';
import { type ZodType, type ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';

/**
 * Generic Zod validation middleware.
 * Pass a Zod schema and the request property to validate ('body', 'query', or 'params').
 */
export function validate(schema: ZodType, property: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[property]);

    if (!result.success) {
      const zodError = result.error as ZodError;
      const errors = zodError.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
      return;
    }

    // Replace raw input with parsed/coerced data
    req[property] = result.data;
    next();
  };
}
