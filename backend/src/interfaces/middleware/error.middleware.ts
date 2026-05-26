import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/errors';
import { logger } from '../../shared/logger';

export const errorMiddleware = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.code || 'APP_ERROR',
      message: err.message,
      statusCode: err.statusCode,
    });
  }

  logger.error('Error no manejado', err);

  return res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: 'Error interno del servidor',
    statusCode: 500,
  });
};
