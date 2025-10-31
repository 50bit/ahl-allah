export interface ApiResponse<T = any> {
  status: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export enum UserRole {
  ADMIN = 1,
  MOHAFEZ = 2,
  NORMAL = 3,
  NOT_ACCEPTED_MOHAFEZ = 10
}

export enum OrgRole {
  ADMIN = 1,
  MEMBER = 2
}

export enum AgeGroup {
  CHILD = 1,
  TEEN = 2,
  ADULT = 3
}

export enum EjazaEnum {
  QURAN = 1,
  HADITH = 2,
  BOTH = 3
}

export enum Language {
  ARABIC = 1,
  ENGLISH = 2,
  ALL = 3
}

export enum HefzMethod {
  VOICE = 1,
  VIDEO = 2,
  REAL = 3
}

export interface User {
  id: string;
  email: string;
  name: string;
  country?: string;
  city?: string;
  birthyear?: number;
  age?: number;
  gender?: string;
  roleId: UserRole;
  creationDate?: string;
  lastActivityDate?: string;
  normalUser?: NormalUser;
  mohafezUser?: MohafezUser;
}

export interface NormalUser {
  normalUserId: number;
  availableMinutes: number;
  ageGroup: AgeGroup;
  levelAtQuran: number;
  numberPerWeek: number;
  timeForEverytime: number;
  language: Language;
  methodForHefz: HefzMethod;
  isPaid: boolean;
  isFirstTime: boolean;
}

export interface MohafezUser {
  mohafezId: number;
  arabicName?: string;
  summery?: string;
  ejaza?: string;
  myEjazaEnum: EjazaEnum;
  degree: number;
  isAvailable: boolean;
  freeDaysCount: number;
  totalHoursCount: number;
  language: Language;
  phoneNumber?: string;
  whatsappPhoneNumber?: string;
  getPaid: boolean;
  schedule?: string;
}

export interface Organization {
  organizationId: number;
  name: string;
  description?: string;
  verified: boolean;
  Members?: OrganizationMember[];
}

export interface OrganizationMember {
  organizationId: number;
  userId: string;
  orgRole: OrgRole;
  User?: User;
}

export interface Note {
  noteId: number;
  title: string;
  content: string;
  mohafezId: number;
  studentId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Complaint {
  complaintId: number;
  title: string;
  description: string;
  studentId: number;
  mohafezId: number;
  status: string;
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Call {
  callId: number;
  studentId: number;
  mohafezId: number;
  callDate: string;
  duration: number;
  status: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Session {
  sessionId: number;
  name: string;
  admidUid: number;
  maxMembers: number;
  members: number;
  level: number;
  language: Language;
  timePerSession: number;
  summary?: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isMohafez: boolean;
}

