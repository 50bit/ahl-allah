import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = '/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    return response.data;
  }

  async register(data: any) {
    const response = await this.api.post('/auth/register', data);
    return response.data;
  }

  async registerMohafez(data: any) {
    const response = await this.api.post('/auth/register-mohafez', data);
    return response.data;
  }

  async forgotPassword(email: string) {
    const response = await this.api.post('/auth/forgot-password', { email });
    return response.data;
  }

  async verifyOtp(email: string, otp: string) {
    const response = await this.api.post('/auth/verify-otp', { email, otp });
    return response.data;
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    const response = await this.api.post('/auth/reset-password', { email, otp, newPassword });
    return response.data;
  }

  async requestPhoneOtp(phone: string, purpose?: 'login' | 'link', method?: string) {
    const response = await this.api.post('/auth/phone/request-otp', { phone, purpose, method });
    return response.data;
  }

  async verifyPhoneOtp(phone: string, otp: string, linkToUserId?: string) {
    const response = await this.api.post('/auth/phone/verify-otp', { phone, otp, linkToUserId });
    return response.data;
  }

  async refreshToken(refreshToken: string) {
    const response = await this.api.post('/auth/token/refresh', { refreshToken });
    return response.data;
  }

  // User endpoints
  async getUserByEmail(email: string) {
    const response = await this.api.get(`/users/get_user/${email}`);
    return response.data;
  }

  async getAllUsers(page = 1, limit = 10) {
    const response = await this.api.get('/users/all', { params: { page, limit } });
    return response.data;
  }

  async getMohafezUsers(page = 1, limit = 10) {
    const response = await this.api.get('/users/mohafez', { params: { page, limit } });
    return response.data;
  }

  async getNormalUsers(page = 1, limit = 10) {
    const response = await this.api.get('/users/normal', { params: { page, limit } });
    return response.data;
  }

  async updateUser(data: any) {
    const response = await this.api.put('/users/update', data);
    return response.data;
  }

  async updateNormalUser(data: any) {
    const response = await this.api.put('/users/update-normal', data);
    return response.data;
  }

  async updateMohafezUser(data: any) {
    const response = await this.api.put('/users/update-mohafez', data);
    return response.data;
  }

  async deleteUser(id: string) {
    const response = await this.api.delete(`/users/${id}`);
    return response.data;
  }

  // Organization endpoints
  async getOrganizations() {
    const response = await this.api.get('/organizations');
    return response.data;
  }

  async getOrganization(id: number) {
    const response = await this.api.get(`/organizations/${id}`);
    return response.data;
  }

  async createOrganization(data: any) {
    const response = await this.api.post('/organizations', data);
    return response.data;
  }

  async updateOrganization(id: number, data: any) {
    const response = await this.api.put(`/organizations/${id}`, data);
    return response.data;
  }

  async deleteOrganization(id: number) {
    const response = await this.api.delete(`/organizations/${id}`);
    return response.data;
  }

  // Note endpoints
  async getNotes(page = 1, limit = 10) {
    const response = await this.api.get('/notes', { params: { page, limit } });
    return response.data;
  }

  async getNote(id: number) {
    const response = await this.api.get(`/notes/${id}`);
    return response.data;
  }

  async createNote(data: any) {
    const response = await this.api.post('/notes', data);
    return response.data;
  }

  async updateNote(id: number, data: any) {
    const response = await this.api.put(`/notes/${id}`, data);
    return response.data;
  }

  async deleteNote(id: number) {
    const response = await this.api.delete(`/notes/${id}`);
    return response.data;
  }

  // Complaint endpoints
  async getComplaints(page = 1, limit = 10) {
    const response = await this.api.get('/complaints', { params: { page, limit } });
    return response.data;
  }

  async getComplaint(id: number) {
    const response = await this.api.get(`/complaints/${id}`);
    return response.data;
  }

  async createComplaint(data: any) {
    const response = await this.api.post('/complaints', data);
    return response.data;
  }

  async updateComplaintStatus(id: number, status: string) {
    const response = await this.api.put(`/complaints/${id}/status`, { status });
    return response.data;
  }

  async updateComplaintRating(id: number, rating: number) {
    const response = await this.api.put(`/complaints/${id}/rating`, { rating });
    return response.data;
  }

  async deleteComplaint(id: number) {
    const response = await this.api.delete(`/complaints/${id}`);
    return response.data;
  }

  // Call endpoints
  async getCalls(page = 1, limit = 10) {
    const response = await this.api.get('/calls', { params: { page, limit } });
    return response.data;
  }

  async getCall(id: number) {
    const response = await this.api.get(`/calls/${id}`);
    return response.data;
  }

  async createCall(data: any) {
    const response = await this.api.post('/calls', data);
    return response.data;
  }

  async updateCall(id: number, data: any) {
    const response = await this.api.put(`/calls/${id}`, data);
    return response.data;
  }

  async deleteCall(id: number) {
    const response = await this.api.delete(`/calls/${id}`);
    return response.data;
  }

  // Session endpoints
  async getSessions(page = 1, limit = 10) {
    const response = await this.api.get('/sessions', { params: { page, limit } });
    return response.data;
  }

  async getSession(id: number) {
    const response = await this.api.get(`/sessions/${id}`);
    return response.data;
  }

  async createSession(data: any) {
    const response = await this.api.post('/sessions', data);
    return response.data;
  }

  async updateSession(id: number, data: any) {
    const response = await this.api.put(`/sessions/${id}`, data);
    return response.data;
  }

  async deleteSession(id: number) {
    const response = await this.api.delete(`/sessions/${id}`);
    return response.data;
  }

  // Admin endpoints
  async approveMohafez(id: string) {
    const response = await this.api.put(`/admin/approve-mohafez/${id}`);
    return response.data;
  }

  async rejectMohafez(id: string) {
    const response = await this.api.put(`/admin/reject-mohafez/${id}`);
    return response.data;
  }

  async getPendingMohafez() {
    const response = await this.api.get('/admin/pending-mohafez');
    return response.data;
  }

  async updateUserRole(id: string, roleId: number) {
    const response = await this.api.put(`/admin/update-role/${id}`, { roleId });
    return response.data;
  }

  async getStatistics() {
    const response = await this.api.get('/admin/statistics');
    return response.data;
  }
}

export const apiService = new ApiService();

