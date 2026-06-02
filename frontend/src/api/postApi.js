import api from './axios';

export const getPosts = (page = 1, limit = 10) =>
  api.get('/posts', { params: { page, limit } });

export const getProfileCounts = () => api.get('/posts/profile/counts');

export const getProfilePosts = (filter, page = 1, limit = 10) =>
  api.get('/posts/profile', { params: { filter, page, limit } });

export const createPost = (formData) => api.post('/posts', formData);

export const toggleLike = (postId) => api.post(`/posts/${postId}/like`);

export const getComments = (postId) => api.get(`/posts/${postId}/comments`);

export const addComment = (postId, text) =>
  api.post(`/posts/${postId}/comments`, { text });

export const updatePost = (postId, formData) => api.patch(`/posts/${postId}`, formData);

export const deletePost = (postId) => api.delete(`/posts/${postId}`);
