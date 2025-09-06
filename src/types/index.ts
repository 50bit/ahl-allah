import { Request } from 'express';

export interface ApiResponse<T = any> {
  status: number;
  message: string;
  data: T;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User Roles
export enum UserRole {
  ADMIN = 1,
  MOHAFEZ = 2,
  NORMAL = 3,
  NOT_ACCEPTED_MOHAFEZ = 10
}

// Age Groups
export enum AgeGroup {
  CHILD = 1,
  TEEN = 2,
  ADULT = 3
}

// Ejaza Types
export enum EjazaEnum {
  QURAN = 1,
  HADITH = 2,
  BOTH = 3
}

// Languages
export enum Language {
  ARABIC = 1,
  ENGLISH = 2,
  ALL = 3
}

// Hefz Methods
export enum HefzMethod {
  VOICE = 1,
  VIDEO = 2,
  REAL = 3
}

// File upload types
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

// Request types

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roleId: number;
  };
}
