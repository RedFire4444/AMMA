import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  console.error(`[ErrorHandler] ${req.method} ${req.path} - ${statusCode}: ${err.message}`);

  res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      code,
      message: err.message || 'An unexpected error occurred',
    },
    meta: null,
  });
};
