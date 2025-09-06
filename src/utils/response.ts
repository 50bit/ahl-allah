import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../types';

export const sendResponse = <T>(
  res: Response,
  status: number,
  message: string,
  data: T
): void => {
  const response: ApiResponse<T> = {
    status,
    message,
    data
  };
  res.status(status).json(response);
};

export const sendSuccess = <T>(
  res: Response,
  message: string = 'Success',
  data: T = {} as T
): void => {
  sendResponse(res, 200, message, data);
};

export const sendError = (
  res: Response,
  status: number = 500,
  message: string = 'Internal Server Error',
  data: any = {}
): void => {
  sendResponse(res, status, message, data);
};

export const sendPaginatedResponse = <T>(
  res: Response,
  message: string,
  data: T[],
  page: number,
  limit: number,
  total: number
): void => {
  const totalPages = Math.ceil(total / limit);
  
  const response: PaginatedResponse<T> = {
    status: 200,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  };
  
  res.status(200).json(response);
};
