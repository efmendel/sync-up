import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError | ZodError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  // Zod validation errors
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }

  // Custom app errors
  if ('statusCode' in error && error.statusCode) {
    return res.status(error.statusCode).json({
      error: error.message
    });
  }

  // Database errors
  if (error.message.includes('Unique constraint failed')) {
    return res.status(409).json({
      error: 'Resource already exists'
    });
  }

  if (error.message.includes('Record to update not found')) {
    return res.status(404).json({
      error: 'Resource not found'
    });
  }

  // Default server error
  return res.status(500).json({
    error: 'Internal server error'
  });
};

export const createError = (message: string, statusCode: number): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};