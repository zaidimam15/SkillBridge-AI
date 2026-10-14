import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: inject token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sb_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sb_token');
      localStorage.removeItem('sb_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  updatePassword: (data) => api.put('/auth/update-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Profile
export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
};

// Resumes
export const resumeAPI = {
  upload: (formData) => api.post('/resumes/upload', formData, {
    headers: { 'Content-Type': undefined },
  }),
  getAll: () => api.get('/resumes'),
  getById: (id) => api.get(`/resumes/${id}`),
  delete: (id) => api.delete(`/resumes/${id}`),
};

// Jobs
export const jobAPI = {
  getAll: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
};

// Analysis
export const analysisAPI = {
  run: (data) => api.post('/analysis', data),
  getById: (id) => api.get(`/analysis/${id}`),
  getHistory: (params) => api.get('/analysis/history', { params }),
};

// Skills
export const skillAPI = {
  getAll: (params) => api.get('/skills', { params }),
  getById: (id) => api.get(`/skills/${id}`),
  create: (data) => api.post('/skills', data),
  update: (id, data) => api.put(`/skills/${id}`, data),
  deactivate: (id) => api.delete(`/skills/${id}`),
};

// Learning Resources
export const resourceAPI = {
  getAll: (params) => api.get('/resources', { params }),
  getBySkill: (skill) => api.get(`/resources/${encodeURIComponent(skill)}`),
  create: (data) => api.post('/resources', data),
};

// Career Roles
export const careerAPI = {
  getAll: () => api.get('/careers'),
  getBySlug: (slug) => api.get(`/careers/${slug}`),
  checkCompatibility: (skills) => api.post('/careers/check-compatibility', { skills }),
};

// Capstone Projects
export const projectAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  getUserProjects: () => api.get('/projects/user/started'),
  getUserProjectById: (id) => api.get(`/projects/user/${id}`),
  start: (id, data) => api.post(`/projects/${id}/start`, data),
  updateUserProject: (id, data) => api.patch(`/projects/user/${id}`, data),
  toggleMilestone: (id, milestoneId, completed) =>
    api.patch(`/projects/user/${id}`, { milestoneId, completed }),
  complete: (id, data) => api.put(`/projects/${id}/complete`, data),
};

// Roadmap
export const roadmapAPI = {
  get: () => api.get('/roadmap'),
  addSkill: (skill) => api.post(`/roadmap/${encodeURIComponent(skill)}`),
  updateStatus: (skill, status) => api.put(`/roadmap/${encodeURIComponent(skill)}/status`, { status }),
};

// Notifications
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Recruiter
export const recruiterAPI = {
  getDashboard: () => api.get('/recruiter/dashboard'),
  getJobs: () => api.get('/recruiter/jobs'),
  getCandidates: (jobId, params) => api.get(`/recruiter/jobs/${jobId}/candidates`, { params }),
  updateCandidateStatus: (analysisId, data) => api.put(`/recruiter/candidates/${analysisId}/status`, data),
};

// Admin / T&P
export const adminAPI = {
  getOverview: () => api.get('/admin/analytics/overview'),
  getRoleAnalytics: () => api.get('/admin/analytics/roles'),
  getSkillAnalytics: () => api.get('/admin/analytics/skills'),
  getTrainingPriorities: () => api.get('/admin/analytics/training-priorities'),
  getStudents: (params) => api.get('/admin/students', { params }),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  updateUserActive: (id, isActive) => api.put(`/admin/users/${id}/active`, { isActive }),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
};

export default api;
