import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  let status = 500;
  let message = 'Internal Server Error';
  let data = {};

  // Handle specific error types
  if (error.name === 'ValidationError') {
    status = 400;
    message = 'Validation Error';
    data = error.errors || {};
  } else if (error.name === 'SequelizeValidationError') {
    status = 400;
    message = 'Database Validation Error';
    data = error.errors?.map((err: any) => ({
      field: err.path,
      message: err.message
    })) || {};
  } else if (error.name === 'SequelizeUniqueConstraintError') {
    status = 409;
    message = 'Duplicate Entry';
    data = {
      field: error.errors?.[0]?.path,
      message: 'This value already exists'
    };
  } else if (error.name === 'SequelizeForeignKeyConstraintError') {
    status = 400;
    message = 'Invalid Reference';
    data = {
      field: error.fields?.[0],
      message: 'Referenced record does not exist'
    };
  } else if (error.status) {
    status = error.status;
    message = error.message || message;
    data = error.data || {};
  }

  const response: ApiResponse = {
    status,
    message,
    data
  };

  res.status(status).json(response);
};
