import axios from 'axios';

// ✅ Base URL from .env or localhost
const BASE = import.meta.env.VITE_API || 'http://localhost:5000';

// ✅ Auth token header helper
function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ✅ Axios instance
export const api = axios.create({ baseURL: BASE });

// --------------------
// 🔹 AUTH ROUTES
// --------------------
export const login = (payload) => api.post('/api/auth/login', payload);
export const register = (payload) => api.post('/api/auth/register', payload);
export const adminLogin = (payload) => api.post('/api/auth/admin-login', payload); // 🔹 New route for admin login

// --------------------
// 🔹 STUDENT VERIFICATION ROUTES
// --------------------
export const uploadDocs = (formData) =>
  api.post('/api/verify/upload', formData, {
    headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' },
  });

export const getRequests = () =>
  api.get('/api/verify/requests', { headers: authHeaders() });

export const requestVerification = (studentId) =>
  api.post(`/api/verify/request/${studentId}`, {}, { headers: authHeaders() });

// --------------------
// 🔹 ADMIN ROUTES
// --------------------
export const getPendingStudents = () =>
  api.get('/api/admin/pending-students', { headers: authHeaders() });

export const approveStudent = (id) =>
  api.put(`/api/admin/verify-student/${id}`, {}, { headers: authHeaders() });

export const rejectStudent = (id, reason) =>
  api.put(`/api/admin/reject-student/${id}`, { reason }, { headers: authHeaders() });

// 🔹 Approve docs (if your older flow used this)
export const approve = (id) =>
  api.post(`/api/admin/approve/${id}`, {}, { headers: authHeaders() });

// --------------------
// 🔹 POSTS ROUTES (Jobs, Referrals, Tips)
// --------------------
export const getPosts = (type) => {
  const url = type ? `/api/posts?type=${type}` : '/api/posts';
  return api.get(url);
};

export const createPost = (data) =>
  api.post('/api/posts', data, { headers: authHeaders() });

export const applyToPost = (postId) =>
  api.post(`/api/posts/${postId}/apply`, {}, { headers: authHeaders() });

export const likePost = (postId) =>
  api.post(`/api/posts/${postId}/like`, {}, { headers: authHeaders() });

export const getMyPosts = () =>
  api.get('/api/posts/my-posts', { headers: authHeaders() });

export const getMyApplications = () =>
  api.get('/api/posts/my-applications', { headers: authHeaders() });

export const deletePost = (postId) =>
  api.delete(`/api/posts/${postId}`, { headers: authHeaders() });

export const getApplicants = (postId) =>
  api.get(`/api/posts/${postId}/applicants`, { headers: authHeaders() });

export const updateApplicantStatus = (postId, appId, status) =>
  api.put(`/api/posts/${postId}/applicants/${appId}/status`, { status }, { headers: authHeaders() });

export const getStudentList = (params) =>
  api.get('/api/admin/students', { params, headers: authHeaders() });

// --------------------
// 🔹 COMMENTS ROUTES
// --------------------
export const getComments = (postId) =>
  api.get(`/api/comments/${postId}`);

export const addComment = (postId, content) =>
  api.post(`/api/comments/${postId}`, { content }, { headers: authHeaders() });

export const deleteComment = (commentId) =>
  api.delete(`/api/comments/${commentId}`, { headers: authHeaders() });

// --------------------
// 🔹 MESSAGES ROUTES
// --------------------
export const sendMessage = (receiverId, content) =>
  api.post('/api/messages', { receiverId, content }, { headers: authHeaders() });

export const getConversation = (userId) =>
  api.get(`/api/messages/conversation/${userId}`, { headers: authHeaders() });

export const getInbox = () =>
  api.get('/api/messages/inbox', { headers: authHeaders() });

export const getUnreadCount = () =>
  api.get('/api/messages/unread-count', { headers: authHeaders() });

export const getAlumniList = (search) =>
  api.get('/api/messages/alumni-list', { params: search ? { search } : {}, headers: authHeaders() });

export const canMessageUser = (userId) =>
  api.get(`/api/messages/can-message/${userId}`, { headers: authHeaders() });

// --------------------
// 🔹 PROFILE ROUTES
// --------------------
export const getUserProfile = (id) =>
  api.get(`/api/users/${id}`, { headers: authHeaders() });

export const getMyProfile = () =>
  api.get('/api/auth/me', { headers: authHeaders() });

export const updateProfile = (data) =>
  api.put('/api/auth/profile', data, { headers: authHeaders() });

export const refreshToken = (refreshToken) =>
  api.post('/api/auth/refresh', { refreshToken });

export const logout = () =>
  api.post('/api/auth/logout', {}, { headers: authHeaders() });

export const getNotifications = () =>
  api.get('/api/auth/notifications', { headers: authHeaders() });

export const markNotificationsRead = () =>
  api.put('/api/auth/notifications/read', {}, { headers: authHeaders() });

// --------------------
// 🔹 RECRUITER ROUTES
// --------------------
export const searchStudents = (params) =>
  api.get('/api/recruiter/students', { params, headers: authHeaders() });

export const getStudentById = (id) =>
  api.get(`/api/recruiter/students/${id}`, { headers: authHeaders() });

export const verifyByWallet = (wallet) =>
  api.get(`/api/recruiter/verify/${wallet}`, { headers: authHeaders() });

// --------------------
// 🔹 AI ROUTES
// --------------------
export const getSkillGap = () =>
  api.get('/api/ai/skill-gap', { headers: authHeaders() });

export const getRecommendations = () =>
  api.get('/api/ai/recommendations', { headers: authHeaders() });

export const analyzeResume = (resumeText) =>
  api.post('/api/ai/analyze-resume', { resumeText }, { headers: authHeaders() });
