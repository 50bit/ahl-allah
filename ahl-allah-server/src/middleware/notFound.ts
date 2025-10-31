import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const response: ApiResponse = {
    status: 404,
    message: `Route ${req.originalUrl} not found`,
    data: {}
  };

  res.status(404).json(response);
};
