import api from './axios';

export const toggleFollow = (userId) => api.post(`/users/${userId}/follow`);

export const getFollowSuggestions = () => api.get('/users/suggestions');

export const getFollowers = () => api.get('/users/followers');

export const getFollowing = () => api.get('/users/following');

export const getNotifications = () => api.get('/users/notifications');

export const markNotificationsRead = () => api.patch('/users/notifications/read');

export const getUserProfile = (userId) => api.get(`/users/${userId}`);

export const getUserPosts = (userId, page = 1, limit = 10) =>
  api.get(`/users/${userId}/posts`, { params: { page, limit } });

export const getUserFollowers = (userId) => api.get(`/users/${userId}/followers`);

export const getUserFollowing = (userId) => api.get(`/users/${userId}/following`);
