import axios from 'axios';

const api = axios.create({
  baseURL: '/',                          // Inertia routes are root-relative
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// ─── Request Interceptor: CSRF Token ─────────────────────────────────

api.interceptors.request.use((config) => {
  const meta = document.head.querySelector('meta[name="csrf-token"]');
  if (meta?.content) {
    config.headers['X-CSRF-TOKEN'] = meta.content;
  }
  return config;
});

// ─── Response Interceptor: Auth & CSRF Errors ────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 419) {
      // CSRF token expired — reload para ma-refresh ang session
      window.location.reload();
    }

    if (status === 401) {
      // Unauthenticated — i-redirect sa login
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// ─── Profile ─────────────────────────────────────────────────────────

export const getProfile = () =>
  api.get('/api/profile').then((r) => r.data);

export const uploadAvatar = (file) => {
  const form = new FormData();
  form.append('avatar', file);
  return api
    .post('/api/profile/avatar', form) // Tanggalin ang manual Content-Type header
    .then((r) => r.data);
};

export const changePassword = (data) =>
  api.put('/api/profile/password', data).then((r) => r.data);

// ─── Notifications ────────────────────────────────────────────────────

export const getNotifications = () =>
  api.get('/api/notifications').then((r) => r.data);

export const markAllRead = () =>
  api.patch('/api/notifications/read-all').then((r) => r.data);

export const markOneRead = (id) =>
  api.patch(`/api/notifications/${id}/read`).then((r) => r.data);

export default api;